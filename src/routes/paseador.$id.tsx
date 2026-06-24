import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Star, BadgeCheck, MapPin, MessageCircle, CalendarDays, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { useWalker } from "@/hooks/useWalker";

const search = z.object({
  q: z.string().default(""),
  modo: z.enum(["planificado", "sos"]).default("planificado"),
});

export const Route = createFileRoute("/paseador/$id")({
  validateSearch: (s) => search.parse(s),
  component: Detalle,
});

function Detalle() {
  const { id } = Route.useParams();
  const { q, modo } = Route.useSearch();
  const { data: walker, isPending } = useWalker(id);

  if (isPending) return <DetalleSkeleton />;
  if (!walker) return <NoEncontrado />;

  return (
    <div className="pb-32 bg-cream">
      <Header back title={walker.nombre} />
      <main className="mx-auto max-w-md">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand to-brand-dark">
            {walker.galeria[0] && (
              <img
                src={walker.galeria[0]}
                alt={`${walker.nombre} paseando`}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
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

        <div className="mt-4 px-5">
          <div className={`flex items-start gap-2.5 rounded-2xl border p-3 ${walker.tiene_perros ? "border-brand/20 bg-brand-soft/40" : "border-coral/20 bg-coral-soft/40"}`}>
            <span className="text-xl leading-none">🐕</span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">¿Tiene perros?</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink">{walker.texto_perros}</p>
            </div>
          </div>
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

        <div className="mt-6 px-5">
          <Link
            to="/treats/$id"
            params={{ id: walker.id }}
            search={{ perro: "tu peludo" }}
            className="flex items-center gap-3 rounded-2xl border border-coral/25 bg-coral-soft/50 p-4 active:scale-[0.99] transition"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🦴</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-ink">Enviar un treat a {walker.nombre.split(" ")[0]}</div>
              <div className="text-[12px] leading-snug text-ink-soft">Un detalle de agradecimiento, en cualquier momento.</div>
            </div>
            <Gift className="h-5 w-5 shrink-0 text-coral" />
          </Link>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 px-5 py-3">
          <Link
            to="/chat/$id"
            params={{ id: walker.id }}
            search={{ q, modo }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-brand bg-white py-3 font-extrabold text-brand active:scale-[0.98] transition"
          >
            <MessageCircle className="h-4 w-4" /> Enviar mensaje
          </Link>
          <Link
            to="/confirmar/$id"
            params={{ id: walker.id }}
            search={{ q, modo }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand py-3 font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(46,125,91,0.6)] active:scale-[0.98] transition"
          >
            <CalendarDays className="h-4 w-4" /> Reservar
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

function DetalleSkeleton() {
  return (
    <div className="min-h-screen bg-cream pb-32">
      <Header back />
      <div className="h-48 shimmer rounded-none" />
      <main className="mx-auto max-w-md px-5">
        <div className="-mt-12 flex items-end gap-3">
          <div className="shimmer h-24 w-24 rounded-full ring-4 ring-cream" />
          <div className="space-y-2 pb-2">
            <div className="shimmer h-4 w-32 rounded" />
            <div className="shimmer h-3 w-24 rounded" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-4/5 rounded" />
          <div className="shimmer h-3 w-3/5 rounded" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((k) => (
            <div key={k} className="shimmer h-16 rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  );
}

function NoEncontrado() {
  return (
    <div className="min-h-screen bg-cream">
      <Header back />
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <div className="text-5xl">🐾</div>
        <h1 className="mt-4 text-xl font-black text-ink">No encontramos a este paseador</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Puede que ya no esté disponible. Prueba a buscar de nuevo.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
