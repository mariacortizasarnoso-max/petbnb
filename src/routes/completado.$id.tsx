import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { TreatButton } from "@/components/TreatButton";
import { WalkMapClient } from "@/components/WalkMapClient";
import { getWalker, type Walker } from "@/data/walkers";

const search = z.object({
  perro: z.string().default("Nala"),
  duracion: z.coerce.number().default(45),
  km: z.string().default("1.80"),
});

export const Route = createFileRoute("/completado/$id")({
  validateSearch: (s) => search.parse(s),
  loader: ({ params }) => {
    const w = getWalker(params.id);
    if (!w) throw notFound();
    return { walker: w };
  },
  component: Completado,
});

function Completado() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { perro, duracion, km } = Route.useSearch();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const endTime = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="pb-16 bg-cream min-h-screen">
      <Header back title="Paseo completado" />
      <main className="mx-auto max-w-md px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-soft mt-2 overflow-hidden"
        >
          <div className="bg-brand p-5 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 16 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-brand shadow-lg"
            >
              ✓
            </motion.div>
            <h1 className="mt-3 text-xl font-black">¡Paseo completado!</h1>
            <p className="mt-1 text-sm opacity-90">{perro} ha vuelto sana y salva.</p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <Stat label="Duración" value={`${duracion} min`} />
            <Stat label="Distancia" value={`${km} km`} />
            <Stat label="Hora fin" value={endTime} />
          </div>

          <div className="h-44 w-full">
            <WalkMapClient walker={walker} progress={1} showFullRoute />
          </div>

          <div className="flex items-start gap-3 p-4">
            <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-10 w-10 shrink-0" />
            <div className="rounded-2xl bg-cream-deep/60 p-3 text-[14px] leading-snug text-ink">
              <span className="font-bold">{walker.nombre.split(" ")[0]}: </span>
              {perro} ha vuelto feliz y agotada. ¡Un encanto de perra! 🥰
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-soft mt-4 p-5"
        >
          <div className="text-center">
            <div className="text-3xl">🦴</div>
            <h2 className="mt-1 text-lg font-extrabold">Dale las gracias con un treat</h2>
            <p className="mt-1 text-sm text-ink-soft">Aquí no se paga: se agradece. {walker.nombre.split(" ")[0]} lo recibirá al instante.</p>
          </div>
          <div className="mt-4">
            <TreatButton variant="large" label="Dale las gracias con un treat 🦴" onSent={() => {/* */}} />
          </div>
          <p className="mt-2 text-center text-xs text-ink-soft">{walker.nombre.split(" ")[0]} ha recibido tu treat 🦴</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-soft mt-4 p-5 text-center"
        >
          <h3 className="font-extrabold text-ink">Valora el paseo</h3>
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)} className="p-1">
                <Star
                  className={`h-8 w-8 transition ${n <= stars ? "fill-coral text-coral" : "text-cream-deep"}`}
                />
              </button>
            ))}
          </div>
          {stars > 0 && <p className="mt-2 text-xs font-bold text-brand">¡Gracias por tu valoración!</p>}
        </motion.div>

        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-5 w-full rounded-full border border-border bg-white py-3 text-sm font-bold text-ink"
        >
          Volver al inicio
        </button>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3 text-center">
      <div className="text-base font-extrabold text-ink">{value}</div>
      <div className="text-[10px] text-ink-soft">{label}</div>
    </div>
  );
}
