import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BadgeCheck, CalendarDays, Gift } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { type Walker, RESPUESTAS_RAPIDAS } from "@/data/walkers";
import { useWalker } from "@/hooks/useWalker";
import { useAuth } from "@/hooks/useAuth";
import { useChat, useSendMessage, type ChatMsg } from "@/hooks/useChat";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/chat/$id")({
  validateSearch: (s) => search.parse(s),
  component: Chat,
});

function ahora(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function Chat() {
  const { id } = Route.useParams();
  const { data: walker, isPending } = useWalker(id);

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Chat" />
        <main className="mx-auto max-w-md px-4 pt-4">
          <div className="shimmer h-16 w-full rounded-2xl" />
          <div className="mt-4 space-y-3">
            <div className="shimmer h-12 w-2/3 rounded-2xl" />
            <div className="shimmer ml-auto h-12 w-1/2 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }
  if (!walker) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Chat" />
        <div className="mx-auto max-w-md px-5 pt-20 text-center">
          <div className="text-5xl">🐾</div>
          <Link
            to="/mensajes"
            className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
          >
            Ir a mensajes
          </Link>
        </div>
      </div>
    );
  }
  return <ChatView walker={walker} />;
}

function ChatView({ walker }: { walker: Walker }) {
  const { q, modo } = Route.useSearch();
  const { user } = useAuth();
  const first = walker.nombre.split(" ")[0];

  const { data: dbMensajes = [], refetch } = useChat(user?.id, walker.id);
  const sendMutation = useSendMessage(user?.id, walker.id);

  const [draft, setDraft] = useState("");
  const [optimista, setOptimista] = useState<ChatMsg[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Saludo inicial del cuidador mientras el hilo está vacío (no se persiste).
  const intro: ChatMsg[] =
    dbMensajes.length === 0 && optimista.length === 0
      ? [
          {
            de: "ellos",
            texto: `¡Hola! Soy ${first}. Cuéntame qué necesitas para tu peludo.`,
            hora: "",
          },
        ]
      : [];
  const mensajes = [...intro, ...dbMensajes, ...optimista];

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [mensajes.length, escribiendo]);

  const enviar = async (texto: string) => {
    const t = texto.trim();
    if (!t || enviando) return;
    if (!user?.id) {
      toast.error("Aún no hay sesión. Recarga e inténtalo.");
      return;
    }
    setDraft("");
    setEnviando(true);
    setOptimista([{ de: "yo", texto: t, hora: ahora() }]);
    setEscribiendo(true);
    try {
      await sendMutation.mutateAsync(t);
      // Pausa breve para que se sienta la respuesta "escribiendo…".
      await new Promise((r) => setTimeout(r, 900));
      await refetch();
    } catch {
      toast.error("No se pudo enviar el mensaje.");
    } finally {
      setEscribiendo(false);
      setOptimista([]);
      setEnviando(false);
    }
  };

  const sugerir = (texto: string) => {
    setDraft(texto);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen flex-col bg-cream">
      <Header back title={first} />
      <div className="mx-auto w-full max-w-md border-b border-border bg-white/80 px-5 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <SafeImage
            src={walker.foto}
            alt={walker.nombre}
            rounded
            fallbackText={walker.nombre}
            className="h-10 w-10 ring-2 ring-white"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-extrabold text-ink">{walker.nombre}</span>
              {walker.verificado && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" fill="#d6ebe0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Activa hoy · {walker.tiempo_respuesta}
            </div>
          </div>
        </div>
      </div>

      <div ref={scroller} className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {mensajes.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.de === "yo" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] ${m.de === "yo" ? "items-end" : "items-start"} flex flex-col`}
              >
                <div
                  className={`overflow-hidden rounded-2xl text-[14px] leading-snug ${
                    m.de === "yo"
                      ? "rounded-br-md bg-brand text-white"
                      : "rounded-bl-md bg-white text-ink shadow-sm"
                  }`}
                >
                  {m.foto && (
                    <SafeImage
                      src={m.foto}
                      alt="Foto de tu peludo"
                      className="h-44 w-60 rounded-none"
                    />
                  )}
                  <div className="px-3.5 py-2">{m.texto}</div>
                </div>
                {m.hora && <span className="mt-1 px-1 text-[10px] text-ink-soft">{m.hora}</span>}
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {escribiendo && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                  <Dot d={0} />
                  <Dot d={0.15} />
                  <Dot d={0.3} />
                  <span className="ml-1 text-[11px] font-bold text-ink-soft">
                    {first} está escribiendo
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md border-t border-border bg-white">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-4 pt-2.5 pb-1">
          {RESPUESTAS_RAPIDAS.map((r) => (
            <button
              key={r}
              onClick={() => sugerir(r)}
              className="shrink-0 rounded-full border border-border bg-cream px-3 py-1.5 text-[12px] font-bold text-ink active:scale-95"
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Link
            to="/treats/$id"
            params={{ id: walker.id }}
            search={{ perro: "tu peludo" }}
            aria-label="Enviar treat"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-soft text-coral active:scale-95"
          >
            <Gift className="h-5 w-5" />
          </Link>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar(draft)}
            placeholder="Escribe un mensaje…"
            className="flex-1 rounded-full border border-border bg-cream px-4 py-2.5 text-base text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            onClick={() => enviar(draft)}
            disabled={!draft.trim() || enviando}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t border-border px-4 py-2.5">
          <Link
            to="/confirmar/$id"
            params={{ id: walker.id }}
            search={{ q, modo }}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-coral py-3 text-sm font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(255,122,89,0.6)] active:scale-[0.98] transition"
          >
            <CalendarDays className="h-4 w-4" /> Reservar paseo o estancia
          </Link>
        </div>
      </div>
    </div>
  );
}

function Dot({ d }: { d: number }) {
  return (
    <motion.span
      className="block h-1.5 w-1.5 rounded-full bg-ink-soft"
      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.9, repeat: Infinity, delay: d }}
    />
  );
}
