import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { Walker } from "@/data/walkers";
import { mapWalker } from "@/hooks/useWalkers";

async function fetchWalker(id: string): Promise<Walker | null> {
  const [walkerRes, reviewsRes] = await Promise.all([
    supabase.from("walkers").select("*").eq("id", id).maybeSingle(),
    supabase.from("reviews").select("*").eq("walker_id", id),
  ]);
  if (walkerRes.error) throw walkerRes.error;
  if (!walkerRes.data) return null; // id inexistente → "no encontrado", sin crash
  if (reviewsRes.error) throw reviewsRes.error;
  return mapWalker(walkerRes.data, reviewsRes.data ?? []);
}

// Un paseador con sus reseñas desde Postgres. Devuelve `null` si el id no existe.
export function useWalker(id: string) {
  return useQuery({
    queryKey: ["walker", id],
    queryFn: () => fetchWalker(id),
    staleTime: 5 * 60 * 1000,
  });
}
