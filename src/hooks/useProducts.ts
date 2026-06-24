import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type Partner = {
  id: string;
  nombre: string;
  tagline: string;
  color: string;
  textColor: string;
};

export type Product = {
  id: string;
  partnerId: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  costoTreats: number;
};

export function mapPartner(row: PartnerRow): Partner {
  return {
    id: row.id,
    nombre: row.nombre,
    tagline: row.tagline ?? "",
    color: row.color ?? "#333",
    textColor: row.text_color ?? "#fff",
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    partnerId: row.partner_id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? "",
    emoji: row.emoji ?? "🎁",
    costoTreats: row.costo_treats,
  };
}

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Partner[]> => {
      const { data, error } = await supabase.from("partners").select("*");
      if (error) throw error;
      return (data ?? []).map(mapPartner);
    },
  });
}

export function useProducts(partnerId?: string) {
  return useQuery({
    queryKey: ["products", partnerId ?? "all"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Product[]> => {
      let query = supabase.from("products").select("*");
      if (partnerId) query = query.eq("partner_id", partnerId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["products", "single", productId],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProduct(data) : null;
    },
  });
}
