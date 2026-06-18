import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/database.types";

// Test de integración de la función de BD `apply_treat_tx` (EPIC 0 · U5).
// Requiere VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en .env. Si no están,
// el bloque se omite (no falla) para no romper a quien aún no tiene la clave.
const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canRun = Boolean(url && serviceKey);

const d = canRun ? describe : describe.skip;

d("apply_treat_tx (integración con Supabase)", () => {
  const admin: SupabaseClient<Database> = createClient<Database>(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let userId = "";

  beforeAll(async () => {
    const email = `test-treats-${Date.now()}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user!.id;
  });

  afterAll(async () => {
    if (userId) await admin.auth.admin.deleteUser(userId);
  });

  async function saldo(): Promise<number | null> {
    const { data } = await admin
      .from("treat_balances")
      .select("saldo")
      .eq("user_id", userId)
      .single();
    return data?.saldo ?? null;
  }

  function key(suffix: string) {
    return `test-${userId}-${suffix}`;
  }

  function tx(
    delta: number,
    kind: string,
    idem: string,
    extra: Record<string, string> = {},
  ) {
    return admin.rpc("apply_treat_tx", {
      p_user: userId,
      p_delta: delta,
      p_kind: kind,
      p_idempotency_key: idem,
      ...extra,
    });
  }

  it("el trigger crea profile + treat_balances(0) al dar de alta el usuario", async () => {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();
    expect(data?.id).toBe(userId);
    expect(await saldo()).toBe(0);
  });

  it("earn incrementa el saldo de forma exacta", async () => {
    const { data, error } = await tx(200, "earn", key("welcome"));
    expect(error).toBeNull();
    expect(data).toBe(200);
    expect(await saldo()).toBe(200);
  });

  it("idempotencia: la misma idempotency_key no duplica", async () => {
    await tx(50, "earn", key("dup"));
    const before = await saldo();
    const { data } = await tx(50, "earn", key("dup")); // misma clave
    expect(data).toBe(before);
    expect(await saldo()).toBe(before);
  });

  it("gift descuenta el saldo", async () => {
    const before = (await saldo())!;
    const { data, error } = await tx(-3, "gift", key("gift1"), {
      p_walker_id: "ana",
      p_label: "Pack de premios",
    });
    expect(error).toBeNull();
    expect(data).toBe(before - 3);
  });

  it("rechaza una operación que dejaría el saldo en negativo y no muta nada", async () => {
    const before = (await saldo())!;
    const { error } = await tx(-(before + 9999), "redeem", key("toobig"));
    expect(error).not.toBeNull();
    expect(await saldo()).toBe(before);
  });

  it("el saldo materializado cuadra con la suma del ledger", async () => {
    const { data } = await admin
      .from("treat_transactions")
      .select("delta")
      .eq("user_id", userId);
    const suma = (data ?? []).reduce((acc, row) => acc + row.delta, 0);
    expect(await saldo()).toBe(suma);
  });
});
