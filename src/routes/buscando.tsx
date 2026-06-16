import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/buscando")({
  validateSearch: (s) => search.parse(s),
  component: Buscando,
});

const MICROCOPY_PLAN = [
  "Leyendo el carácter de tu perro…",
  "Buscando vecinos compatibles…",
  "Cruzando barrios y horarios…",
  "Eligiendo a los mejores matches…",
];
const MICROCOPY_SOS = [
  "Buscando vecinos disponibles ahora…",
  "Filtrando a menos de 2 km de ti…",
  "Avisando a los paseadores cercanos…",
];

function Buscando() {
  const { q, modo } = Route.useSearch();
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const msgs = modo === "sos" ? MICROCOPY_SOS : MICROCOPY_PLAN;

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % msgs.length), 800);
    const go = setTimeout(() => navigate({ to: "/resultados", search: { q, modo } }), modo === "sos" ? 2400 : 2000);
    return () => { clearInterval(t); clearTimeout(go); };
  }, [navigate, q, modo, msgs.length]);

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-md px-5 pt-12">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="text-5xl"
          >
            {modo === "sos" ? "🚨" : "🐾"}
          </motion.div>
          <div className="mt-4 h-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={msgs[i]}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-bold text-ink-soft"
              >
                {msgs[i]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="card-soft p-4">
              <div className="flex items-center gap-3">
                <div className="shimmer h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-3 w-3/5 rounded" />
                  <div className="shimmer h-3 w-2/5 rounded" />
                </div>
                <div className="shimmer h-12 w-12 rounded-full" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
