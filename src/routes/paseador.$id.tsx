import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { Star, BadgeCheck, MapPin, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { TreatButton } from "@/components/TreatButton";
import { getWalker, type Walker, type Review } from "@/data/walkers";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/paseador/$id")({
  validateSearch: (s) => search.parse(s),
  loader: ({ params }) => {
    const w = getWalker(params.id);
    if (!w) throw notFound();
    return { walker: w };
  },
  component: Detalle,
  notFoundComponent: () => (
    <div className="p-10 text-center">No encontramos a este paseador.</div>
  ),
});

function Detalle() {
  const { walker } = Route.useLoaderData();
  const { q, modo } = Route.useSearch();

  return (
    <div className="pb-32 bg-cream">
      <Header back title={walker.nombre} />
      <main className="mx-auto max-w-md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="relative h-48 overflow-hidden">
            <SafeImage
              src={walker.galeria[0]}
              alt={`${walker.nombre} paseando`}
              fallbackText={walker.nombre}
              className="h-full w-full rounded-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cream" />
          </div>
          <div className="-mt-12 px-5">
            <div className="flex items-end gap-3">
              <SafeImage
                src={walker.foto}
                alt={walker.nombre}
                rounded
                fallbackText={walker.nombre}
                className="h-24 w-24 shrink-0 ring-4 ring-cream shadow-lg"
              />
              <div className="pb-2">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-black text-ink">{walker.nombre}</h1>
                  {walker.verificado && <BadgeCheck className="h-5 w-5 text-brand" fill="#d6ebe0" />}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{walker.barrio} · {walker.distancia_km} km</span>
                  <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-coral text-coral" />{walker.rating} ({walker.num_resenas})</span>
                </div>
                {walker.verificado && (
                  <span className="mt-1 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
                    Vecino verificado ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-5 px-5">
          <p className="text-[15px] leading-relaxed text-ink">{walker.bio}</p>
        </div>

        <div className="mt-5 px-5">
          <div className="flex flex-wrap gap-1.5">
            {walker.especialidades.map((s) => (
              <span key={s} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 px-5">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Paseos" value={walker.paseos_completados.toString()} />
            <Stat label="Experiencia" value={`${walker.anios_experiencia} años`} />
            <Stat label="Respuesta" value={walker.tiempo_respuesta.replace("responde en ", "")} />
          </div>
        </div>

        <div className="mt-6 px-5">
          <h2 className="font-extrabold text-ink">Paseos recientes</h2>
          <div className="-mx-5 mt-3 overflow-x-auto px-5">
            <div className="flex gap-2">
              {walker.galeria.map((g, i) => (
                <SafeImage
                  key={i}
                  src={g}
                  alt={`Paseo ${i + 1}`}
                  className="h-32 w-44 shrink-0"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 px-5">
          <h2 className="font-extrabold text-ink">Qué dicen sus vecinos</h2>
          <div className="mt-3 space-y-2">
            {walker.resenas.map((r, i) => (
              <div key={i} className="card-soft p-4">
                <div className="flex gap-0.5 text-coral">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 fill-coral text-coral" />
                  ))}
                </div>
                <p className="mt-1.5 text-[14px] leading-snug text-ink">"{r.texto}"</p>
                <p className="mt-1 text-xs font-bold text-ink-soft">— {r.autor}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 px-5 py-3">
          <div className="w-32">
            <TreatButton />
          </div>
          <Link
            to="/confirmar/$id"
            params={{ id: walker.id }}
            search={{ q, modo }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand py-3 font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(46,125,91,0.6)] active:scale-[0.98] transition"
          >
            <MessageCircle className="h-4 w-4" /> Contactar
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-3 text-center">
      <div className="text-base font-extrabold text-ink">{value}</div>
      <div className="text-[11px] text-ink-soft">{label}</div>
    </div>
  );
}
