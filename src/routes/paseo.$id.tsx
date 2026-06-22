import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { WalkMapClient } from "@/components/WalkMapClient";
import type { Walker } from "@/data/walkers";
import { useWalker } from "@/hooks/useWalker";
import { closeWalk } from "@/lib/api/walk.server";

const search = z.object({
  perro: z.string().default("Nala"),
  duracion: z.coerce.number().default(45),
  bookingId: z.string().optional(),
});

export const Route = createFileRoute("/paseo/$id")({
  validateSearch: (s) => search.parse(s),
  component: Paseo,
});

function Paseo() {
  const { id } = Route.useParams();
  const { data: walker, isPending } = useWalker(id);

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Paseo en curso" />
        <main className="mx-auto max-w-md px-3 pt-2">
          <div className="shimmer h-16 w-full rounded-2xl" />
          <div className="shimmer mt-3 h-[300px] w-full rounded-3xl" />
        </main>
      </div>
    );
  }
  if (!walker) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Paseo en curso" />
        <div className="mx-auto max-w-md px-5 pt-20 text-center">
          <div className="text-5xl">🐾</div>
          <h1 className="mt-4 text-xl font-black text-ink">No encontramos este paseo</h1>
          <Link to="/reservas" className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-white">
            Ir a mis reservas
          </Link>
        </div>
      </div>
    );
  }
  return <PaseoView walker={walker} />;
}

const ESTADOS = [
  { at: 0, text: "Han salido del portal" },
  { at: 0.2, text: "Caminando hacia el parque" },
  { at: 0.45, text: "Paseando tranquilos por el parque" },
  { at: 0.7, text: "Saludando a otros peludos" },
  { at: 0.85, text: "De vuelta a casa" },
];

const TOTAL_MS = 25000;
const CHECKIN_AT = 0.4;

function PaseoView({ walker }: { walker: Walker }) {
  const { perro, duracion, bookingId } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const startRef = useRef<number>(Date.now());
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [checkin, setCheckin] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const checkinShown = useRef(false);
  const finishShown = useRef(false);
  const first = walker.nombre.split(" ")[0];

  useEffect(() => {
    const t = setInterval(() => {
      const dt = Date.now() - startRef.current;
      const p = Math.min(1, dt / TOTAL_MS);
      setProgress(p);
      setElapsed(Math.floor((p * duracion * 60)));
      if (!checkinShown.current && p > CHECKIN_AT) {
        checkinShown.current = true;
        setCheckin(true);
        toast(`${first} te ha enviado una foto 📸`, {
          description: "'¡Todo perfecto!'",
        });
      }
      if (!finishShown.current && p >= 1) {
        finishShown.current = true;
        setFinalizado(true);
        toast(`${first} ha terminado el paseo`, {
          description: `He dejado a ${perro} en casa sana y salva 🐾`,
        });
      }
    }, 200);
    return () => clearInterval(t);
  }, [duracion, perro, first]);

  // Al cerrarse el paseo, el cuidador (server-side) lo marca como completado e
  // inserta el mensaje de cierre. Best-effort: la UI no se bloquea si falla.
  useEffect(() => {
    if (!finalizado || !bookingId) return;
    closeWalk({ data: { bookingId } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["bookings"] }))
      .catch((e) => console.warn("petbnb: closeWalk falló —", e));
  }, [finalizado, bookingId, queryClient]);

  const estado = [...ESTADOS].reverse().find((e) => progress >= e.at)?.text ?? ESTADOS[0].text;
  const km = (progress * (duracion / 45) * 1.8).toFixed(2);
  const etaMin = Math.max(0, Math.round((1 - progress) * duracion));

  const verResumen = () =>
    navigate({
      to: "/completado/$id",
      params: { id: walker.id },
      search: { perro, duracion, km, ...(bookingId ? { bookingId } : {}) },
    });

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="min-h-screen bg-cream pb-8">
      <Header back title="Paseo en curso" />

      <div className="mx-auto max-w-md px-3 pt-1">
        <div className="card-soft flex items-center gap-3 p-3">
          <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-soft">Paseo en curso</div>
            <div className="truncate text-sm font-extrabold">{perro} con {first}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-base font-extrabold text-brand tabular-nums">
              {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
            </div>
            <div className="text-[10px] text-ink-soft">de {duracion}:00</div>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-deep">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-md px-3">
        <div className="relative h-[300px] overflow-hidden rounded-3xl border border-border bg-cream-deep shadow-inner">
          <WalkMapClient walker={walker} progress={progress} />
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-md px-5">
        <AnimatePresence>
          {checkin && !finalizado && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card-soft mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-brand-soft px-3 py-2 text-xs font-extrabold text-brand">
                <span>📸</span> {first} te ha enviado una foto
              </div>
              <SafeImage
                src={walker.galeria[0]}
                alt="Check-in"
                className="h-44 w-full rounded-none"
              />
              <div className="p-3 text-sm">
                <span className="font-bold">{first}:</span> «¡{perro} está disfrutando como nunca! 🥰»
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!finalizado && (
          <div className="card-soft p-4">
            <div className="flex items-center gap-2">
              <span className="block h-2 w-2 animate-pulse rounded-full bg-brand" />
              <span className="text-sm font-bold text-ink">{estado}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-cream-deep/60 p-3">
                <div className="text-[11px] text-ink-soft">Distancia</div>
                <div className="text-lg font-extrabold text-ink">{km} km</div>
              </div>
              <div className="rounded-2xl bg-cream-deep/60 p-3">
                <div className="text-[11px] text-ink-soft">Vuelven en</div>
                <div className="text-lg font-extrabold text-ink">~{etaMin} min</div>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => navigate({ to: "/chat/$id", params: { id: walker.id }, search: { q: "", modo: "planificado" } })}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-cream-deep py-2.5 text-sm font-bold text-ink"
              >
                <MessageCircle className="h-4 w-4" /> Escribir a {first}
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-ink-soft">
              {first} cerrará el paseo cuando deje a {perro} en casa.
            </p>
          </div>
        )}

        {/* Mensaje del cuidador al cerrar el paseo */}
        <AnimatePresence>
          {finalizado && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="card-soft overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-brand px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Mensaje de {first}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-11 w-11 shrink-0 ring-2 ring-white" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-ink">{first}</span>
                      {walker.verificado && <BadgeCheck className="h-3.5 w-3.5 text-brand" fill="#d6ebe0" />}
                    </div>
                    <div className="mt-1 rounded-2xl rounded-tl-md bg-cream-deep/60 p-3 text-[14px] leading-snug text-ink">
                      He dejado a {perro} en casa sana y salva 🐾<br />¡Se ha portado genial!
                    </div>
                    <div className="mt-1 text-[10px] text-ink-soft">{new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>

                <button
                  onClick={verResumen}
                  className="mt-5 w-full rounded-full bg-brand py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] active:scale-[0.98] transition"
                >
                  Ver resumen del paseo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
