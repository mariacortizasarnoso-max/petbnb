import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getBalanceServer, getTransactionsServer } from "@/lib/api/treats.server";

// Constantes de conversión (reexportadas aquí para que las rutas no importen de treatsHistory.ts)
export const TREATS_POR_EUR = 10;
export const EUR_POR_TREAT = 0.1;
export const TREATS_POR_PASEO = 50;

// ─── Query keys ─────────────────────────────────────────────────────────────

export function balanceQueryKey(userId: string | undefined) {
  return ["treats", "balance", userId] as const;
}

export function transactionsQueryKey(userId: string | undefined) {
  return ["treats", "transactions", userId] as const;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useBalance(userId: string | undefined) {
  return useQuery({
    queryKey: balanceQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async () => {
      const result = await getBalanceServer({ data: { userId: userId! } });
      return result.saldo;
    },
  });
}

export function useTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: transactionsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async () => {
      const result = await getTransactionsServer({ data: { userId: userId! } });
      return result;
    },
  });
}

// ─── Invalidation helper ─────────────────────────────────────────────────────

export function useInvalidateTreats() {
  const queryClient = useQueryClient();
  return (userId: string) => {
    queryClient.invalidateQueries({ queryKey: balanceQueryKey(userId) });
    queryClient.invalidateQueries({ queryKey: transactionsQueryKey(userId) });
  };
}
