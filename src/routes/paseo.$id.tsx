import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { WalkMapClient } from "@/components/WalkMapClient";
import { getWalker, type Walker } from "@/data/walkers";

const search = z.object({
  perro: z.string().default("Nala"),
  duracion: z.coerce.number().default(45),
});

export const Route = createFileRoute("/paseo/$id")({
  validateSearch: (s) => search.parse(s),
  loader: ({ params }) => {
    const w = getWalker(params.id);
    if (!w) throw notFound();
    return { walker: w };
  },
  component: Paseo,
});

const ESTADOS = [
  { at: 0, text: "Han salido del portal" },
  { at: 0.2, text: "Caminando hacia el parque" },
  { at: 0.45, text: "Paseando tranquilos por el parque" },
  { at: 0.7, text: "Saludando a otros peludos" },
  { at: 0.85, text: "De vuelta a casa" },
];

const TOTAL_MS = 25000;
const CHECKIN_AT = 0.4;

function Paseo() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { perro, duracion } = Route.useSearch();
  const navigate = useNavigate();
  const startRef = useRef<number>(Date.now());
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [checkin, setCheckin] = useState(false);
  const checkinShown = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      const dt = Date.now() - startRef.current;
      const p = Math.min(1, dt / TOTAL_MS);
      setProgress(p);
      setElapsed(Math.floor((p * duracion * 60)));
      if (!checkinShown.current && p > CHECKIN_AT) {
        checkinShown.current = true;
        setCheckin(true);
        toast(`${walker.nombre.split(" ")[0]} te ha enviado una foto 📸`, {
          description: "'¡Todo perfecto!'",
        });
      }
    }, 200);
    return () => clearInterval(t);
  }, [duracion, walker.nombre]);

  const estado = [...ESTADOS].reverse().find((e) => progress >= e.at)?.text ?? ESTADOS[0].text;
  const km = (progress * (duracion / 45) * 1.8).toFixed(2);
  const etaMin = Math.max(0, Math.round((1 - progress) * duracion));

  const finish = () => navigate({ to: "/completado/$id", params: { id: walker.id }, search: { perro, duracion, km } });

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="min-h-screen bg-cream">
      <Header back title="Paseo en curso" />

      <div className="mx-auto max-w-md px-3 pt-1">
        <div className="card-soft flex items-center gap-3 p-3">
          <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-soft">Paseo en curso</div>
            <div className="truncate text-sm font-extrabold">{perro} con {walker.nombre.split(" ")[0]}</div>
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
        <div className="relative h-[360px] overflow-hidden rounded-3xl border border-border bg-cream-deep shadow-inner">
          <WalkMapClient walker={walker} progress={progress} />
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-md px-5">
        <AnimatePresence>
          {checkin && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card-soft mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-brand-soft px-3 py-2 text-xs font-extrabold text-brand">
                <span>📸</span> {walker.nombre.split(" ")[0]} te ha enviado una foto
              </div>
              <SafeImage
                src={walker.galeria[0]}
                alt="Check-in"
                className="h-44 w-full rounded-none"
              />
              <div className="p-3 text-sm">
                <span className="font-bold">{walker.nombre.split(" ")[0]}:</span> «¡{perro} está disfrutando como nunca! 🥰»
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="mt-3 flex gap-2">
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-cream-deep py-2.5 text-sm font-bold text-ink">
              <MessageCircle className="h-4 w-4" /> Mensaje
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-cream-deep py-2.5 text-sm font-bold text-ink">
              <Phone className="h-4 w-4" /> Llamar
            </button>
          </div>
        </div>

        <button
          onClick={finish}
          className="mt-5 mb-8 w-full rounded-full bg-ink py-3.5 text-sm font-extrabold text-white active:scale-[0.98] transition"
        >
          {progress >= 1 ? "Ver resumen del paseo" : "Finalizar paseo"}
        </button>
      </div>
    </div>
  );
}
