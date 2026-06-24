import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// closeWalk (EPIC 3 · U6). El cuidador cierra el paseo en SERVIDOR (decisión D-A:
// el cuidador está simulado server-side). Transiciona la reserva a `completada`
// e inserta el mensaje de cierre en el hilo de chat. Es idempotente: si la
// reserva ya está completada, no vuelve a insertar el mensaje.
//
// Usa la service-role key (omite RLS) porque `chat_messages` no tiene policy de
// INSERT para el cliente: los mensajes del cuidador solo se escriben en servidor.
// Requiere SUPABASE_SERVICE_ROLE_KEY (en .env y en Vercel).

const inputSchema = z.object({ bookingId: z.string().uuid() });

type CloseResult = { ok: true; alreadyClosed?: boolean } | { ok: false; reason: "not_found" };

export const closeWalk = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }): Promise<CloseResult> => {
    // Import dinámico → el cliente service-role se elimina del bundle de cliente.
    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const admin = getSupabaseAdmin();

    const { data: booking, error } = await admin
      .from("bookings")
      .select("id, user_id, walker_id, perro, estado")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw error;
    if (!booking) return { ok: false, reason: "not_found" };

    // Idempotencia: ya cerrada → no duplicamos el mensaje.
    if (booking.estado === "completada") return { ok: true, alreadyClosed: true };

    const { error: updErr } = await admin
      .from("bookings")
      .update({ estado: "completada" })
      .eq("id", booking.id);
    if (updErr) throw updErr;

    // Busca (o crea) el hilo de chat de (dueño, paseador) e inserta el cierre.
    let threadId: string | null = null;
    const { data: thread } = await admin
      .from("chat_threads")
      .select("id")
      .eq("user_id", booking.user_id)
      .eq("walker_id", booking.walker_id)
      .maybeSingle();
    threadId = thread?.id ?? null;
    if (!threadId) {
      const { data: created, error: thErr } = await admin
        .from("chat_threads")
        .insert({ user_id: booking.user_id, walker_id: booking.walker_id })
        .select("id")
        .single();
      if (thErr) throw thErr;
      threadId = created.id;
    }

    const perro = booking.perro ?? "tu perro";
    const { error: msgErr } = await admin.from("chat_messages").insert({
      thread_id: threadId,
      de: "ellos",
      texto: `He dejado a ${perro} en casa sana y salva 🐾 ¡Se ha portado genial!`,
    });
    if (msgErr) throw msgErr;

    // Acreditar treats al dueño por el paseo completado (idempotente con bookingId).
    // Si falla, se loguea pero no propaga: el cierre del paseo no debe depender del ledger.
    try {
      const { TREATS_POR_PASEO } = await import("@/lib/api/treats.server");
      await admin.rpc("apply_treat_tx", {
        p_user: booking.user_id,
        p_delta: TREATS_POR_PASEO,
        p_kind: "paseo",
        p_idempotency_key: `paseo-${booking.id}`,
        p_ref: booking.id,
        p_label: "Paseo completado 🐾",
        p_emoji: "🦴",
      });
    } catch (earnErr) {
      console.warn("petbnb: no se pudieron acreditar treats por el paseo —", earnErr);
    }

    return { ok: true };
  });
