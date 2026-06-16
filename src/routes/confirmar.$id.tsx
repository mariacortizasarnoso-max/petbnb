import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, BadgeCheck, MapPin, Calendar, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { getWalker, type Walker } from "@/data/walkers";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/confirmar/$id")({
  validateSearch: (s) => search.parse(s),
  loader: ({ params }) => {
    const w = getWalker(params.id);
    if (!w) throw notFound();
    return { walker: w };
  },
  component: Confirmar,
});

function Confirmar() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { q, modo } = Route.useSearch();
  const navigate = useNavigate();
  const [duracion, setDuracion] = useState<30 | 45 | 60>(45);
  const [perro, setPerro] = useState("Nala");
  const [confirming, setConfirming] = useState(false);

  const confirm = () => {
    setConfirming(true);
    setTimeout(() => navigate({ to: "/paseo/$id", params: { id: walker.id }, search: { perro, duracion } }), 1300);
  };

  return (
    <div className="pb-32">
      <Header back title="Confirmar paseo" />
      <main className="mx-auto max-w-md px-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-2 overflow-hidden">
          <div className="bg-brand-soft/50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-brand">
            Reserva con tu vecino
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <SafeImage
                src={walker.foto}
                alt={walker.nombre}
                rounded
                fallbackText={walker.nombre}
                className="h-14 w-14 ring-2 ring-white shadow"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate font-extrabold text-ink">{walker.nombre}</span>
                  {walker.verificado && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" fill="#d6ebe0" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-coral text-coral" />{walker.rating}</span>
                  <span>·</span>
                  <span>{walker.barrio}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Row icon={<Calendar className="h-4 w-4 text-brand" />} label="Hoy, 18:30" />
              <Row icon={<MapPin className="h-4 w-4 text-brand" />} label={`Recogida en tu portal · ${walker.barrio}`} />
              <Row icon={<Clock className="h-4 w-4 text-brand" />} label={`Duración del paseo`}>
                <div className="flex gap-1">
                  {([30, 45, 60] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuracion(d)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        duracion === d ? "bg-brand text-white" : "bg-cream-deep text-ink-soft"
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </Row>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-ink-soft">Nombre de tu perro</label>
              <input
                value={perro}
                onChange={(e) => setPerro(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-cream-deep/60 p-3">
              <SafeImage src={walker.foto} alt="" rounded fallbackText={walker.nombre} className="h-8 w-8 shrink-0" />
              <div className="text-[13px] leading-snug text-ink">
                <span className="font-bold">{walker.nombre.split(" ")[0]}: </span>
                {walker.nota_recogida.replace(/tu perro|Nala/gi, perro)}
              </div>
            </div>
          </div>
        </motion.div>

        <button
          onClick={confirm}
          disabled={confirming}
          className="mt-5 w-full rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] active:scale-[0.98] disabled:opacity-80"
        >
          {confirming ? "Confirmando…" : "Confirmar paseo"}
        </button>
        <p className="mt-2 text-center text-xs text-ink-soft">
          Sin pagos. Al terminar le mandas un treat 🦴
        </p>
      </main>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cream/90 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white text-5xl shadow-xl">✓</div>
              <div className="mt-4 flex gap-1 text-3xl">
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }}>🐾</motion.span>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}>🐾</motion.span>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}>🐾</motion.span>
              </div>
              <p className="mt-4 font-extrabold text-ink">¡Paseo confirmado!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft">{icon}</span>
        <span className="font-bold">{label}</span>
      </div>
      {children}
    </div>
  );
}
