import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// sendMessage (EPIC 3 · U7). Guarda el mensaje del dueño y genera la respuesta
// del cuidador (simulado server-side, decisión D-A) con la lógica de palabras
// clave que antes vivía en el cliente. Va por servidor (service-role) porque
// `chat_messages` no tiene policy de INSERT para el cliente.
// Requiere SUPABASE_SERVICE_ROLE_KEY (ver walk.server.ts / closeWalk).

const inputSchema = z.object({
  userId: z.string().uuid(),
  walkerId: z.string(),
  texto: z.string().min(1).max(1000),
});

// Respuesta contextual del cuidador por palabras clave (movida desde chat.$id.tsx).
function respuestaCuidador(texto: string): string {
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (/(reactiv|ansios|miedos|nervios|tira|asustad)/.test(t))
    return "Sin problema. Con perros así prefiero salir en solitario y por calles tranquilas, sin cruzarnos con otros peludos. En dos o tres paseos coge confianza 🐾";
  if (/(precio|cuesta|cuanto vale|cobr|pago|dinero|euros|€)/.test(t))
    return "Aquí no se paga con dinero — se agradece con un treat al final. Tú decides cuál y cuándo, sin presión.";
  if (/(disponib|hueco|hora|cuando|hoy|manana|esta semana|finde)/.test(t))
    return "Esta semana tengo libres las tardes a partir de las 18:00 y los sábados por la mañana. ¿Qué hueco te encaja?";
  if (/(estancia|dormir|noche|fin de semana|vacacion|viaje|finde fuera)/.test(t))
    return "Sí, ofrezco estancia en casa. Tengo espacio tranquilo y mando foto cada día. Dime las fechas y te confirmo el hueco 🏡";
  if (/(medica|pastilla|enferm|cuidad|insulina|gota)/.test(t))
    return "Estoy acostumbrada a darles su medicación a su hora. Mándame las indicaciones por escrito y lo llevo controlado.";
  if (/(foto|video|ver|enseñ|mandar)/.test(t))
    return "Por supuesto, te mando foto a mitad del paseo siempre. Verás lo bien que lo pasa 📸";
  if (/(primer dia|conocer|probar|prueba)/.test(t))
    return "Lo suyo para el primer día es algo cortito, 20-30 min, para que me coja confianza y vea su ritmo. ¿Te parece?";
  if (/(grupo|otros perros|solitari)/.test(t))
    return "Suelo pasear en solitario salvo que el perro sea muy sociable y lo pidáis. Así me concentro en él.";
  if (/(gracias|genial|perfecto|vale|ok|estupendo|guay)/.test(t))
    return "¡A ti! Cualquier cosa me escribes por aquí 🐾";
  if (/(hola|buenas|saludos)/.test(t))
    return "¡Hola! Cuéntame un poco sobre tu peludo: edad, raza y cómo es con otros perros y con la calle.";
  return "¡Anotado! Cuéntame algún detalle más y te confirmo, así me organizo bien.";
}

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const admin = getSupabaseAdmin();

    // Hilo de (dueño, paseador): buscar o crear.
    let threadId: string | null = null;
    const { data: thread } = await admin
      .from("chat_threads")
      .select("id")
      .eq("user_id", data.userId)
      .eq("walker_id", data.walkerId)
      .maybeSingle();
    threadId = thread?.id ?? null;
    if (!threadId) {
      const { data: created, error } = await admin
        .from("chat_threads")
        .insert({ user_id: data.userId, walker_id: data.walkerId })
        .select("id")
        .single();
      if (error) throw error;
      threadId = created.id;
    }

    // Mensaje del dueño + respuesta del cuidador.
    const { error: e1 } = await admin
      .from("chat_messages")
      .insert({ thread_id: threadId, de: "yo", texto: data.texto });
    if (e1) throw e1;

    const reply = respuestaCuidador(data.texto);
    const { error: e2 } = await admin
      .from("chat_messages")
      .insert({ thread_id: threadId, de: "ellos", texto: reply });
    if (e2) throw e2;

    return { reply };
  });
