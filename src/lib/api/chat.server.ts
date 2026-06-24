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

// Fotos de paseo de respaldo (la columna `walkers.galeria` aún no está sembrada).
// Si el paseador tiene galería propia, se usa esa; si no, una de estas.
const FOTOS_PASEO = [
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=70",
  "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=70",
];

// Respuesta contextual del cuidador por palabras clave (movida desde chat.$id.tsx).
// `conFoto` indica que el cuidador adjunta una foto (se rellena con una imagen
// de su galería en el handler).
function respuestaCuidador(texto: string): { texto: string; conFoto?: boolean } {
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (/(reactiv|ansios|miedos|nervios|tira|asustad)/.test(t))
    return {
      texto:
        "Sin problema. Con perros así prefiero salir en solitario y por calles tranquilas, sin cruzarnos con otros peludos. En dos o tres paseos coge confianza 🐾",
    };
  if (/(precio|cuesta|cuanto vale|cobr|pago|dinero|euros|€)/.test(t))
    return {
      texto:
        "Aquí no se paga con dinero — se agradece con un treat al final. Tú decides cuál y cuándo, sin presión.",
    };
  if (/(disponib|hueco|hora|cuando|hoy|manana|esta semana|finde)/.test(t))
    return {
      texto:
        "Esta semana tengo libres las tardes a partir de las 18:00 y los sábados por la mañana. ¿Qué hueco te encaja?",
    };
  if (/(estancia|dormir|noche|fin de semana|vacacion|viaje|finde fuera)/.test(t))
    return {
      texto:
        "Sí, ofrezco estancia en casa. Tengo espacio tranquilo y mando foto cada día. Dime las fechas y te confirmo el hueco 🏡",
    };
  if (/(medica|pastilla|enferm|cuidad|insulina|gota)/.test(t))
    return {
      texto:
        "Estoy acostumbrada a darles su medicación a su hora. Mándame las indicaciones por escrito y lo llevo controlado.",
    };
  if (/(foto|video|ver|enseñ|mandar)/.test(t))
    return { texto: "¡Claro! Mira qué bien lo está pasando 📸", conFoto: true };
  if (/(primer dia|conocer|probar|prueba)/.test(t))
    return {
      texto:
        "Lo suyo para el primer día es algo cortito, 20-30 min, para que me coja confianza y vea su ritmo. ¿Te parece?",
    };
  if (/(grupo|otros perros|solitari)/.test(t))
    return {
      texto:
        "Suelo pasear en solitario salvo que el perro sea muy sociable y lo pidáis. Así me concentro en él.",
    };
  if (/(gracias|genial|perfecto|vale|ok|estupendo|guay)/.test(t))
    return { texto: "¡A ti! Cualquier cosa me escribes por aquí 🐾" };
  if (/(hola|buenas|saludos)/.test(t))
    return {
      texto:
        "¡Hola! Cuéntame un poco sobre tu peludo: edad, raza y cómo es con otros perros y con la calle.",
    };
  return { texto: "¡Anotado! Cuéntame algún detalle más y te confirmo, así me organizo bien." };
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

    // Si el cuidador "manda una foto", adjunta una imagen real: su galería si la
    // tiene, o una foto de paseo de respaldo. Así se ve siempre.
    let foto: string | null = null;
    if (reply.conFoto) {
      const { data: w } = await admin
        .from("walkers")
        .select("galeria")
        .eq("id", data.walkerId)
        .maybeSingle();
      const galeria = (w?.galeria ?? []).filter(Boolean);
      const pool = galeria.length ? galeria : FOTOS_PASEO;
      foto = pool[data.texto.length % pool.length];
    }

    const { error: e2 } = await admin
      .from("chat_messages")
      .insert({ thread_id: threadId, de: "ellos", texto: reply.texto, foto });
    if (e2) throw e2;

    return { reply: reply.texto };
  });
