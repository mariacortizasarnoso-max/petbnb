import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import type { Review, Walker } from "@/data/walkers";

type WalkerRow = Database["public"]["Tables"]["walkers"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

// Mapea una fila de la tabla `walkers` (+ sus reseñas, si se cargan) al tipo
// `Walker` que ya usa toda la UI. La tabla guarda los nulos donde el tipo
// espera string; aquí los colapsamos para conservar el contrato no-nulo.
// `chat_inicial` no vive en la BD (es mock); se queda fuera hasta U7.
export function mapWalker(row: WalkerRow, reviews: ReviewRow[] = []): Walker {
  return {
    id: row.id,
    nombre: row.nombre,
    foto: row.foto ?? "",
    barrio: row.barrio ?? "",
    bio: row.bio ?? "",
    especialidades: row.especialidades,
    tags: row.tags,
    distancia_km: row.distancia_km,
    disponible_ahora: row.disponible_ahora,
    tiempo_respuesta: row.tiempo_respuesta ?? "",
    rating: row.rating,
    num_resenas: row.num_resenas,
    paseos_completados: row.paseos_completados,
    verificado: row.verificado,
    anios_experiencia: row.anios_experiencia,
    galeria: row.galeria,
    resenas: reviews.map((r): Review => ({ autor: r.autor, texto: r.texto })),
    nota_recogida: row.nota_recogida ?? "",
    tiene_perros: row.tiene_perros ?? undefined,
    texto_perros: row.texto_perros ?? undefined,
    dias_no_disponibles: row.dias_no_disponibles,
    ofrece_estancia: row.ofrece_estancia,
    precio_estancia_noche: row.precio_estancia_noche ?? undefined,
  };
}

export const walkersQueryKey = ["walkers"] as const;

async function fetchWalkers(): Promise<Walker[]> {
  const { data, error } = await supabase
    .from("walkers")
    .select("*")
    .order("distancia_km", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapWalker(row));
}

// Lista de paseadores desde Postgres. Las reseñas no se cargan aquí (la lista
// no las pinta); el detalle las trae con `useWalker`.
export function useWalkers() {
  return useQuery({
    queryKey: walkersQueryKey,
    queryFn: fetchWalkers,
    staleTime: 5 * 60 * 1000,
  });
}
