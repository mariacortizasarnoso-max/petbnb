import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Walker } from "@/data/walkers";
import { matchWalkers, type Match } from "@/lib/matching";

// Exported as mutable config object so tests can override without fake timers
export const matchingConfig = { timeoutMs: 12_000 };

const inputSchema = z.object({
  q: z.string(),
  modo: z.enum(["planificado", "sos"]),
});

function buildPrompt(pool: Walker[], q: string, modo: "planificado" | "sos"): string {
  const lines = pool.map(
    (w) =>
      `- id:${w.id} | ${w.nombre} | ${w.barrio} | rating:${w.rating} | tags:[${w.tags.join(", ")}]${w.disponible_ahora ? " | disponible ahora" : ""}`
  );

  const cap = modo === "sos" ? 3 : 5;
  const modeNote =
    modo === "sos"
      ? "Modo SOS: solo incluye paseadores muy cercanos y disponibles. Máximo 3."
      : `Selecciona los ${cap} paseadores más compatibles con el texto.`;

  return [
    `Eres el asistente de matching de petbnb. ${modeNote}`,
    "",
    "Pool de paseadores disponibles:",
    ...lines,
    "",
    `Descripción del dueño sobre su perro: "${q}"`,
    "",
    "Llama a la herramienta rankWalkers con tu selección ordenada. Usa los IDs exactos del pool. Las explicaciones deben ser específicas al texto del dueño.",
  ].join("\n");
}

async function claudeMatch(pool: Walker[], q: string, modo: "planificado" | "sos"): Promise<Match[]> {
  // Dynamic imports → TanStack Start strips these from the client bundle along with the handler body
  const [{ default: Anthropic }, { getServerConfig }] = await Promise.all([
    import("@anthropic-ai/sdk"),
    import("@/lib/config.server"),
  ]);

  const config = getServerConfig();
  const apiKey = config.anthropicApiKey;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada");

  const client = new Anthropic({ apiKey });

  const rankWalkersTool = {
    name: "rankWalkers",
    description:
      "Devuelve los paseadores más compatibles con la descripción del dueño, ordenados de mayor a menor puntuación.",
    input_schema: {
      type: "object" as const,
      properties: {
        rankings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              walkerId: { type: "string", description: "ID exacto del paseador del pool." },
              puntuacion: { type: "number", description: "Compatibilidad 0–100." },
              explicacion: {
                type: "string",
                description: "1–2 frases específicas al texto del dueño sobre por qué este paseador encaja.",
              },
            },
            required: ["walkerId", "puntuacion", "explicacion"],
          },
          maxItems: 5,
        },
      },
      required: ["rankings"],
    },
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), matchingConfig.timeoutMs)
  );

  const claudePromise = client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [rankWalkersTool as any],
    tool_choice: { type: "any" },
    messages: [{ role: "user", content: buildPrompt(pool, q, modo) }],
  });

  const response = await Promise.race([claudePromise, timeoutPromise]);

  const toolBlock = response.content.find(
    (b) => b.type === "tool_use" && (b as { name: string }).name === "rankWalkers"
  ) as { type: "tool_use"; name: string; input: unknown } | undefined;
  if (!toolBlock) throw new Error("No tool_use block in response");

  const { rankings } = toolBlock.input as {
    rankings: Array<{ walkerId: string; puntuacion: number; explicacion: string }>;
  };

  const poolById = new Map(pool.map((w) => [w.id, w]));
  const cap = modo === "sos" ? 3 : 5;

  return rankings
    .filter((r) => poolById.has(r.walkerId))
    .slice(0, cap)
    .map((r) => ({
      walker: poolById.get(r.walkerId)!,
      score: Math.round(Math.min(100, Math.max(0, r.puntuacion))),
      matchedTags: [],
      explicacion: r.explicacion,
    }));
}

async function loadWalkersPool(): Promise<Walker[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");

  const client = createClient(url, anonKey);
  const { data, error } = await client
    .from("walkers")
    .select("id, nombre, barrio, rating, tags, disponible_ahora, distancia_km, foto, bio, especialidades, verificado, anios_experiencia, num_resenas, paseos_completados, galeria, nota_recogida, tiene_perros, texto_perros, dias_no_disponibles, ofrece_estancia, precio_estancia_noche, tiempo_respuesta");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    barrio: row.barrio ?? "",
    rating: row.rating,
    tags: row.tags ?? [],
    disponible_ahora: row.disponible_ahora,
    distancia_km: row.distancia_km,
    foto: row.foto ?? "",
    bio: row.bio ?? "",
    especialidades: row.especialidades ?? [],
    verificado: row.verificado,
    anios_experiencia: row.anios_experiencia,
    num_resenas: row.num_resenas,
    paseos_completados: row.paseos_completados,
    galeria: row.galeria ?? [],
    nota_recogida: row.nota_recogida ?? "",
    tiene_perros: row.tiene_perros ?? false,
    texto_perros: row.texto_perros ?? "",
    dias_no_disponibles: row.dias_no_disponibles ?? [],
    ofrece_estancia: row.ofrece_estancia ?? false,
    precio_estancia_noche: row.precio_estancia_noche ?? undefined,
    tiempo_respuesta: row.tiempo_respuesta ?? "",
    resenas: [],
  }));
}

export async function handleMatchWalkers(q: string, modo: "planificado" | "sos"): Promise<Match[]> {
  let pool: Walker[];
  try {
    pool = await loadWalkersPool();
  } catch {
    const { WALKERS } = await import("@/data/walkers");
    pool = WALKERS;
  }

  if (modo === "sos") {
    pool = pool.filter((w) => w.disponible_ahora && w.distancia_km < 2);
  }

  if (pool.length === 0) {
    return matchWalkers(q, modo);
  }

  try {
    return await claudeMatch(pool, q, modo);
  } catch {
    return matchWalkers(q, modo);
  }
}

export const matchWalkersServer = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }): Promise<Match[]> => handleMatchWalkers(data.q, data.modo));
