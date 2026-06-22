import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import type { EstadoReserva, Reserva, TipoReserva } from "@/data/reservas";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];

// Mapea una fila de `bookings` al tipo `Reserva` que ya usa la UI. Los campos
// de treats/valoración no viven en bookings (llegan en U8/reseñas) → undefined.
export function mapBooking(row: BookingRow): Reserva {
  return {
    id: row.id,
    walkerId: row.walker_id,
    tipo: row.tipo as TipoReserva,
    perro: row.perro ?? "",
    fechaLabel: row.fecha_label ?? "",
    fechaCorta: row.fecha_label ?? "",
    hora: row.hora ?? undefined,
    duracion: row.duracion ?? undefined,
    noches: row.noches ?? undefined,
    estado: row.estado as EstadoReserva,
    nota: row.nota ?? undefined,
    recogida: row.recogida ?? undefined,
    inicioISO: row.inicio_iso ?? undefined,
  };
}

const PROXIMAS: EstadoReserva[] = ["en_curso", "confirmada"];

export function bookingsQueryKey(userId: string | undefined) {
  return ["bookings", userId] as const;
}

// Todas las reservas del usuario (RLS: solo las suyas), más recientes primero.
export function useBookings(userId: string | undefined) {
  const query = useQuery({
    queryKey: bookingsQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Reserva[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBooking);
    },
  });

  const all = query.data ?? [];
  return {
    ...query,
    proximas: all.filter((r) => PROXIMAS.includes(r.estado)),
    pasadas: all.filter((r) => !PROXIMAS.includes(r.estado)),
  };
}

// Una reserva por id (RLS: devuelve null si no es del usuario o no existe).
export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async (): Promise<Reserva | null> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapBooking(data) : null;
    },
  });
}

// Crea una reserva (paseo o estancia). user_id lo exige la RLS (= auth.uid()).
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<BookingInsert, "user_id"> & { user_id: string }) => {
      const { data, error } = await supabase.from("bookings").insert(input).select().single();
      if (error) throw error;
      return mapBooking(data);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: bookingsQueryKey(vars.user_id) });
    },
  });
}

// Cancela una reserva propia (update permitido por RLS al dueño).
export function useCancelBooking(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ estado: "cancelada" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: bookingsQueryKey(userId) });
      qc.invalidateQueries({ queryKey: ["booking", id] });
    },
  });
}
