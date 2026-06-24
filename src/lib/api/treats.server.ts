import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Treats earnados por paseo completado (ver también closeWalk en walk.server.ts).
export const TREATS_POR_PASEO = 50;

// ─── Schemas ────────────────────────────────────────────────────────────────

const userSchema = z.object({ userId: z.string().uuid() });

const sendGiftSchema = z.object({
  userId: z.string().uuid(),
  walkerId: z.string(),
  delta: z.number().positive(),
  idempotencyKey: z.string().min(1),
  label: z.string().optional(),
  emoji: z.string().optional(),
  note: z.string().optional(),
});

const redeemSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().min(1),
  // El coste NO se acepta del cliente: lo lee el servidor de `products` (evita
  // que un cliente manipulado canjee un producto caro por menos treats).
  direccion: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

// ─── Server functions ────────────────────────────────────────────────────────

export const getBalanceServer = createServerFn({ method: "GET" })
  .inputValidator(userSchema)
  .handler(async ({ data }): Promise<{ saldo: number }> => {
    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const admin = getSupabaseAdmin();

    const { data: row, error } = await admin
      .from("treat_balances")
      .select("saldo")
      .eq("user_id", data.userId)
      .maybeSingle();

    if (error) throw error;
    return { saldo: row?.saldo ?? 0 };
  });

export const getTransactionsServer = createServerFn({ method: "GET" })
  .inputValidator(userSchema)
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase/server");
    const admin = getSupabaseAdmin();

    const [txResult, redResult] = await Promise.all([
      admin
        .from("treat_transactions")
        .select("*")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(100),
      admin
        .from("redemptions")
        .select("*, products(nombre, emoji, partner_id, partners(nombre, color, text_color))")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (txResult.error) throw txResult.error;
    if (redResult.error) throw redResult.error;

    return {
      transactions: txResult.data ?? [],
      redemptions: redResult.data ?? [],
    };
  });

export const sendGiftServer = createServerFn({ method: "POST" })
  .inputValidator(sendGiftSchema)
  .handler(
    async ({ data }): Promise<{ ok: true; newBalance: number } | { ok: false; reason: string }> => {
      const { getSupabaseAdmin } = await import("@/lib/supabase/server");
      const admin = getSupabaseAdmin();

      const { data: newBalance, error } = await admin.rpc("apply_treat_tx", {
        p_user: data.userId,
        p_delta: -data.delta,
        p_kind: "gift",
        p_idempotency_key: data.idempotencyKey,
        p_walker_id: data.walkerId,
        p_label: data.label ?? "Treat enviado",
        p_emoji: data.emoji ?? "🦴",
        p_note: data.note,
      });

      if (error) {
        // apply_treat_tx lanza 'saldo insuficiente' (errcode check_violation) si
        // el saldo quedaría negativo.
        if (error.message?.includes("saldo insuficiente")) {
          return { ok: false, reason: "insufficient_balance" };
        }
        throw error;
      }

      return { ok: true, newBalance: newBalance as number };
    },
  );

export const redeemProductServer = createServerFn({ method: "POST" })
  .inputValidator(redeemSchema)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; redemptionId: string; newBalance: number } | { ok: false; reason: string }
    > => {
      const { getSupabaseAdmin } = await import("@/lib/supabase/server");
      const admin = getSupabaseAdmin();

      // 0. Coste autoritativo: leerlo del producto en la BD, no del cliente.
      const { data: product, error: prodError } = await admin
        .from("products")
        .select("costo_treats")
        .eq("id", data.productId)
        .maybeSingle();
      if (prodError) throw prodError;
      if (!product) return { ok: false, reason: "product_not_found" };
      const costoTreats = product.costo_treats;

      // 1. Descontar del ledger (guard de no-negativo + idempotencia en apply_treat_tx)
      const { data: newBalance, error: txError } = await admin.rpc("apply_treat_tx", {
        p_user: data.userId,
        p_delta: -costoTreats,
        p_kind: "redeem",
        p_idempotency_key: data.idempotencyKey,
        p_ref: data.productId,
        p_label: "Canje en tienda",
        p_emoji: "🛍️",
      });

      if (txError) {
        if (txError.message?.includes("saldo insuficiente")) {
          return { ok: false, reason: "insufficient_balance" };
        }
        throw txError;
      }

      // 2. Registrar el canje. Si el insert falla, se revierte el cargo
      //    (reembolso compensatorio) para no dejar treats descontados sin canje.
      const { data: redemption, error: redError } = await admin
        .from("redemptions")
        .insert({
          user_id: data.userId,
          product_id: data.productId,
          costo_treats: costoTreats,
          direccion: data.direccion,
          estado: "en_camino",
        })
        .select("id")
        .single();

      if (redError) {
        try {
          await admin.rpc("apply_treat_tx", {
            p_user: data.userId,
            p_delta: costoTreats, // devolver lo descontado
            p_kind: "earn",
            p_idempotency_key: `${data.idempotencyKey}-refund`,
            p_ref: data.productId,
            p_label: "Reembolso de canje no completado",
            p_emoji: "↩️",
          });
        } catch (refundErr) {
          console.warn("petbnb: el canje falló y el reembolso también —", refundErr);
        }
        throw redError;
      }

      return { ok: true, redemptionId: redemption.id, newBalance: newBalance as number };
    },
  );
