import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { motion } from "framer-motion";
import { Star, MapPin, BadgeCheck, Clock, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { ScoreRing } from "@/components/ScoreRing";
import { TreatButton } from "@/components/TreatButton";
import { matchWalkers } from "@/lib/matching";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/resultados")({
  validateSearch: (s) => search.parse(s),
  component: Resultados,
});

function Resultados() {
  const { q, modo } = Route.useSearch();
  const navigate = useNavigate();
  const matches = matchWalkers(q, modo);
  const isSos = modo === "sos";

  return (
    <div className="pb-28">
      <Header back />
      <main className="mx-auto max-w-md px-5">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-1"
        >
          {isSos ? (
            <div className="rounded-2xl bg-coral-soft p-3">
              <div className="flex items-center gap-2 text-coral font-extrabold">
                <span>🚨</span> Modo SOS
              </div>
              <p className="mt-1 text-sm text-ink">
                {matches.length} {matches.length === 1 ? "vecino disponible" : "vecinos disponibles"} ahora mismo, a menos de 2 km.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-ink">Estos vecinos encajan con tu peludo</h1>
              <p className="mt-1 text-sm text-ink-soft">Ordenados por compatibilidad con lo que nos has contado.</p>
            </>
          )}
        </motion.section>

        <div className="mt-5 space-y-4">
          {matches.length === 0 && (
            <div className="card-soft p-6 text-center">
              <div className="text-4xl">🐾</div>
              <p className="mt-3 font-bold">No encontramos vecinos para esa búsqueda.</p>
              <button onClick={() => navigate({ to: "/" })} className="mt-4 rounded-full bg-brand px-5 py-3 font-bold text-white">
                Volver al inicio
              </button>
            </div>
          )}
          {matches.map((m, i) => (
            <motion.article
              key={m.walker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isSos ? 0.4 + i * 0.5 : i * 0.08, duration: 0.45 }}
              className="card-soft relative overflow-hidden"
            >
              {i === 0 && !isSos && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-brand px-3 py-1 text-[11px] font-extrabold text-white shadow">
                  ⭐ Mejor match
                </div>
              )}
              {isSos && (
                <div className="flex items-center gap-1.5 bg-coral px-4 py-1.5 text-[11px] font-extrabold text-white">
                  <span className="block h-2 w-2 animate-pulse rounded-full bg-white" />
                  Disponible ahora · a {Math.round(m.walker.distancia_km * 12)} min de ti
                </div>
              )}
              <Link
                to="/paseador/$id"
                params={{ id: m.walker.id }}
                search={{ q, modo }}
                className="block p-4"
              >
                <div className="flex items-start gap-3">
                  <SafeImage
                    src={m.walker.foto}
                    alt={m.walker.nombre}
                    rounded
                    fallbackText={m.walker.nombre}
                    className="h-16 w-16 shrink-0 ring-2 ring-white shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="truncate font-extrabold text-ink">{m.walker.nombre}</h3>
                      {m.walker.verificado && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" fill="#d6ebe0" />}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{m.walker.barrio} · {m.walker.distancia_km} km</span>
                      <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-coral text-coral" />{m.walker.rating} ({m.walker.num_resenas})</span>
                    </div>
                    {m.walker.verificado && (
                      <span className="mt-1.5 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
                        Vecino verificado ✓
                      </span>
                    )}
                  </div>
                  <ScoreRing score={m.score} />
                </div>

                <p className="mt-3 rounded-2xl bg-cream-deep/60 p-3 text-[13px] leading-snug text-ink">
                  <span className="mr-1 font-bold text-brand">IA:</span>{m.explicacion}
                </p>
              </Link>

              <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                <div className="flex-1">
                  <TreatButton />
                </div>
                <Link
                  to="/paseador/$id"
                  params={{ id: m.walker.id }}
                  search={{ q, modo }}
                  className="inline-flex items-center gap-0.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white"
                >
                  Ver perfil <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full rounded-full border border-border bg-white py-3 text-sm font-bold text-ink"
          >
            Buscar de nuevo
          </button>
          {!isSos && (
            <button
              onClick={() => navigate({ to: "/buscando", search: { q, modo: "sos" } })}
              className="w-full rounded-full bg-coral py-3 text-sm font-extrabold text-white"
            >
              🚨 Necesito ayuda ahora
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
