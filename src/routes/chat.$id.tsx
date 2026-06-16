import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BadgeCheck, CalendarDays, Gift } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import {
  getWalker,
  type Walker,
  RESPUESTAS_RAPIDAS,
} from "@/data/walkers";
import {
  CHAT_STORE,
  ahora,
  getChat,
  setChat,
  subscribeChat,
  type ChatMsg,
} from "@/data/chatStore";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/chat/$id")({
  validateSearch: (s) => search.parse(s),
  loader: ({ params }) => {
    const w = getWalker(params.id);
    if (!w) throw notFound();
    return { walker: w };
  },
  component: Chat,
});

function respuestaContextual(texto: string, _first: string): string {
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/(reactiv|ansios|miedos|nervios|tira|asustad)/.test(t))
    return `Sin problema. Con perros así prefiero salir en solitario y por calles tranquilas, sin cruzarnos con otros peludos. En dos o tres paseos coge confianza 🐾`;
  if (/(precio|cuesta|cuanto vale|cobr|pago|dinero|euros|€)/.test(t))
    return `Aquí no se paga con dinero — se agradece con un treat al final. Tú decides cuál y cuándo, sin presión.`;
  if (/(disponib|hueco|hora|cuando|hoy|manana|esta semana|finde)/.test(t))
    return `Esta semana tengo libres las tardes a partir de las 18:00 y los sábados por la mañana. ¿Qué hueco te encaja?`;
  if (/(estancia|dormir|noche|fin de semana|vacacion|viaje|finde fuera)/.test(t))
    return `Sí, ofrezco estancia en casa. Tengo espacio tranquilo y mando foto cada día. Dime las fechas y te confirmo el hueco 🏡`;
  if (/(medica|pastilla|enferm|cuidad|insulina|gota)/.test(t))
    return `Estoy acostumbrada a darles su medicación a su hora. Mándame las indicaciones por escrito y lo llevo controlado.`;
  if (/(foto|video|ver|enseñ|mandar)/.test(t))
    return `Por supuesto, te mando foto a mitad del paseo siempre. Verás lo bien que lo pasa 📸`;
  if (/(primer dia|conocer|probar|prueba)/.test(t))
    return `Lo suyo para el primer día es algo cortito, 20-30 min, para que me coja confianza y vea su ritmo. ¿Te parece?`;
  if (/(grupo|otros perros|solitari)/.test(t))
    return `Suelo pasear en solitario salvo que el perro sea muy sociable y lo pidáis. Así me concentro en él.`;
  if (/(gracias|genial|perfecto|vale|ok|estupendo|guay)/.test(t))
    return `¡A ti! Cualquier cosa me escribes por aquí 🐾`;
  if (/(hola|buenas|saludos)/.test(t))
    return `¡Hola! Cuéntame un poco sobre tu peludo: edad, raza y cómo es con otros perros y con la calle.`;
  return `¡Anotado! Cuéntame algún detalle más y te confirmo, así me organizo bien.`;
}

function Chat() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { q, modo } = Route.useSearch();
  const first = walker.nombre.split(" ")[0];

  const [mensajes, setMensajes] = useState<ChatMsg[]>(() => {
    const cached = CHAT_STORE.get(walker.id);
    if (cached && cached.length) return cached;
    const base = walker.chat_inicial ?? [
      { de: "ellos" as const, texto: `¡Hola! Soy ${first}. Cuéntame qué necesitas para tu peludo.` },
    ];
    const initial: ChatMsg[] = base.map((m, i) => {
      const d = new Date(Date.now() - (base.length - i) * 60_000);
      return {
        de: m.de,
        texto: m.texto,
        hora: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      };
    });
    CHAT_STORE.set(walker.id, initial);
    return initial;
  });
  const [draft, setDraft] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from external updates (e.g. treat thank-you message)
  useEffect(() => {
    const unsub = subscribeChat((id) => {
      if (id === walker.id) setMensajes(getChat(walker.id));
    });
    return unsub;
  }, [walker.id]);

  useEffect(() => {
    setChat(walker.id, mensajes);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensajes.length]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [escribiendo]);

  const responder = (texto: string) => {
    setEscribiendo(true);
    const respuesta = respuestaContextual(texto, first);
    const delay = 1100 + Math.min(1200, respuesta.length * 18) + Math.random() * 400;
    setTimeout(() => {
      setEscribiendo(false);
      setMensajes((m) => [...m, { de: "ellos", texto: respuesta, hora: ahora() }]);
    }, delay);
  };

  const enviar = (texto: string) => {
    const t = texto.trim();
    if (!t) return;
    setMensajes((m) => [...m, { de: "yo", texto: t, hora: ahora() }]);
    setDraft("");
    responder(t);
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
              {walker.verificado && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" fill="#d6ebe0" />}
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
              <div className={`max-w-[78%] ${m.de === "yo" ? "items-end" : "items-start"} flex flex-col`}>
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
                <span className="mt-1 px-1 text-[10px] text-ink-soft">{m.hora}</span>
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
                  <Dot d={0} /><Dot d={0.15} /><Dot d={0.3} />
                  <span className="ml-1 text-[11px] font-bold text-ink-soft">{first} está escribiendo</span>
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
            className="flex-1 rounded-full border border-border bg-cream px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            onClick={() => enviar(draft)}
            disabled={!draft.trim()}
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
