import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { sendMessage } from "@/lib/api/chat.server";

export type ChatMsg = { de: "yo" | "ellos"; texto: string; hora: string; foto?: string };
export type ThreadSummary = {
  threadId: string;
  walkerId: string;
  last: ChatMsg | null;
  lastAt: string | null;
};

function fmtHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function chatKey(userId: string | undefined, walkerId: string) {
  return ["chat", userId, walkerId] as const;
}

// Mensajes del hilo (dueño, paseador). RLS deja leer solo los hilos propios.
export function useChat(userId: string | undefined, walkerId: string) {
  return useQuery({
    queryKey: chatKey(userId, walkerId),
    enabled: Boolean(userId),
    queryFn: async (): Promise<ChatMsg[]> => {
      const { data: thread, error: tErr } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("walker_id", walkerId)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!thread) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("de, texto, foto, created_at")
        .eq("thread_id", thread.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((m) => ({
        de: m.de as "yo" | "ellos",
        texto: m.texto,
        hora: fmtHora(m.created_at),
        foto: m.foto ?? undefined,
      }));
    },
  });
}

// Envía un mensaje (server-side inserta el del dueño + la respuesta del cuidador).
export function useSendMessage(userId: string | undefined, walkerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (texto: string) => {
      if (!userId) throw new Error("sin sesión");
      return sendMessage({ data: { userId, walkerId, texto } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKey(userId, walkerId) });
      qc.invalidateQueries({ queryKey: ["threads", userId] });
    },
  });
}

// Lista de conversaciones del usuario (para /mensajes), con su último mensaje.
export function useThreads(userId: string | undefined) {
  return useQuery({
    queryKey: ["threads", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ThreadSummary[]> => {
      const { data: threads, error } = await supabase.from("chat_threads").select("id, walker_id");
      if (error) throw error;
      if (!threads?.length) return [];

      const { data: msgs, error: mErr } = await supabase
        .from("chat_messages")
        .select("thread_id, de, texto, created_at")
        .order("created_at", { ascending: false });
      if (mErr) throw mErr;

      // El primero por hilo (orden desc) = el último mensaje.
      const lastByThread = new Map<string, (typeof msgs)[number]>();
      for (const m of msgs ?? []) {
        if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);
      }

      return threads
        .map((t): ThreadSummary => {
          const m = lastByThread.get(t.id);
          return {
            threadId: t.id,
            walkerId: t.walker_id,
            last: m
              ? { de: m.de as "yo" | "ellos", texto: m.texto, hora: fmtHora(m.created_at) }
              : null,
            lastAt: m?.created_at ?? null,
          };
        })
        .filter((t) => t.last !== null)
        .sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
    },
  });
}
