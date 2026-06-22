import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Gift } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { WalkMapClient } from "@/components/WalkMapClient";
import type { Walker } from "@/data/walkers";
import { useWalker } from "@/hooks/useWalker";

const search = z.object({
  perro: z.string().default("Nala"),
  duracion: z.coerce.number().default(45),
  km: z.string().default("1.80"),
  bookingId: z.string().optional(),
});

export const Route = createFileRoute("/completado/$id")({
  validateSearch: (s) => search.parse(s),
  component: Completado,
});

function Completado() {
  const { id } = Route.useParams();
  const { data: walker, isPending } = useWalker(id);

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Paseo completado" />
        <main className="mx-auto max-w-md px-5 pt-6">
          <div className="shimmer h-56 w-full rounded-3xl" />
        </main>
      </div>
    );
  }
  if (!walker) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Paseo completado" />
        <div className="mx-auto max-w-md px-5 pt-20 text-center">
          <div className="text-5xl">🐾</div>
          <Link to="/reservas" className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-white">
            Ir a mis reservas
          </Link>
        </div>
      </div>
    );
  }
  return <CompletadoView walker={walker} />;
}

function CompletadoView({ walker }: { walker: Walker }) {
  const { perro, duracion, km } = Route.useSearch();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const first = walker.nombre.split(" ")[0];
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
            <p className="mt-1 text-sm opacity-90">{first} ha dejado a {perro} sana y salva.</p>
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
              <span className="font-bold">{first}: </span>
              {perro} ha vuelto feliz y agotada. ¡Un encanto de perra! 🥰
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-soft mt-4 p-5 text-center"
        >
          <div className="text-3xl">🦴</div>
          <h2 className="mt-1 text-lg font-extrabold">Envíale un treat a {first}</h2>
          <p className="mt-1 text-sm text-ink-soft">Un detalle para agradecer su cariño con {perro}.</p>
          <Link
            to="/treats/$id"
            params={{ id: walker.id }}
            search={{ perro }}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-coral py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98] transition"
          >
            <Gift className="h-5 w-5" /> Elegir un treat
          </Link>
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
          onClick={() => navigate({ to: "/reservas" })}
          className="mt-5 w-full rounded-full border border-border bg-white py-3 text-sm font-bold text-ink"
        >
          Ir a mis reservas
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
