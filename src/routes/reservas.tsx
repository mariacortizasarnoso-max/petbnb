import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, ChevronRight, MessageCircle, MapPin, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { reservasProximas, reservasPasadas, type Reserva } from "@/data/reservas";
import { getWalker } from "@/data/walkers";

export const Route = createFileRoute("/reservas")({
  head: () => ({
    meta: [
      { title: "Mis reservas · petbnb" },
      { name: "description", content: "Tus paseos y estancias con tus vecinos paseadores." },
    ],
  }),
  component: Reservas,
});

type Tab = "proximas" | "pasadas";

function Reservas() {
  const [tab, setTab] = useState<Tab>("proximas");
  const lista = tab === "proximas" ? reservasProximas() : reservasPasadas();

  return (
    <div className="pb-28">
      <Header title="Mis reservas" />
      <main className="mx-auto max-w-md px-5">
        <h1 className="sr-only">Mis reservas</h1>

        <div className="mt-1 flex items-center gap-1.5 rounded-full bg-cream-deep/70 p-1">
          {(["proximas", "pasadas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 rounded-full py-2 text-sm font-extrabold transition ${
                tab === t ? "bg-white text-ink shadow-sm" : "text-ink-soft"
              }`}
            >
              {t === "proximas" ? "Próximas" : "Pasadas"}
              {t === "proximas" && reservasProximas().some((r) => r.estado === "en_curso") && (
                <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-coral" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-3"
          >
            {lista.length === 0 && <Empty tab={tab} />}
            {lista.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ReservaCard reserva={r} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Empty({ tab }: { tab: Tab }) {
  return (
    <div className="card-soft p-8 text-center">
      <div className="text-5xl">🐾</div>
      <h2 className="mt-3 font-extrabold text-ink">
        {tab === "proximas" ? "Aún no tienes paseos en agenda" : "Aquí aparecerá tu historial"}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {tab === "proximas"
          ? "Cuando reserves un paseo o una estancia, los verás aquí."
          : "Cada paseo o estancia que completes se guardará aquí."}
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white"
      >
        Buscar un paseador
      </Link>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: Reserva["estado"] }) {
  if (estado === "en_curso") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        En curso
      </span>
    );
  }
  if (estado === "confirmada") {
    return <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand">Confirmada</span>;
  }
  if (estado === "completada") {
    return <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Completada</span>;
  }
  return <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/70 line-through">Cancelada</span>;
}

function ReservaCard({ reserva }: { reserva: Reserva }) {
  const navigate = useNavigate();
  const walker = getWalker(reserva.walkerId)!;
  const first = walker.nombre.split(" ")[0];
  const tipoLabel = reserva.tipo === "paseo" ? "Paseo 🦮" : "Estancia 🏠";

  const goSeguimiento = () =>
    navigate({
      to: "/paseo/$id",
      params: { id: walker.id },
      search: { perro: reserva.perro, duracion: reserva.duracion ?? 45 },
    });

  return (
    <article className="card-soft overflow-hidden">
      <Link
        to="/reservas/$id"
        params={{ id: reserva.id }}
        className="block p-4"
      >
        <div className="flex items-start gap-3">
          <SafeImage
            src={walker.foto}
            alt={walker.nombre}
            rounded
            fallbackText={walker.nombre}
            className="h-14 w-14 shrink-0 ring-2 ring-white shadow"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">{tipoLabel}</span>
              <EstadoBadge estado={reserva.estado} />
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <h3 className="truncate font-extrabold text-ink">{first} con {reserva.perro}</h3>
              {walker.verificado && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" fill="#d6ebe0" />}
            </div>
            <p className="text-xs text-ink-soft">{reserva.fechaLabel}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" />
        </div>

        {reserva.estado === "en_curso" && reserva.nota && (
          <p className="mt-3 rounded-2xl bg-coral-soft/60 px-3 py-2 text-[12px] leading-snug text-ink">
            <span className="font-bold text-coral">●</span> {reserva.nota}
          </p>
        )}
        {reserva.estado === "completada" && reserva.valoracion && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream-deep/60 px-3 py-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < reserva.valoracion! ? "fill-coral text-coral" : "text-ink-soft/30"}`} />
              ))}
            </div>
            {reserva.treatEnviado && <span className="text-[11px] font-bold text-brand">Treat enviado 🦴 ✓</span>}
          </div>
        )}
      </Link>

      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        {reserva.estado === "en_curso" && (
          <>
            <button onClick={goSeguimiento} className="flex-1 rounded-full bg-brand py-2.5 text-sm font-extrabold text-white">
              Ver seguimiento en vivo
            </button>
            <Link to="/chat/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
              className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-bold text-ink inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
            </Link>
          </>
        )}
        {reserva.estado === "confirmada" && (
          <>
            <Link to="/reservas/$id" params={{ id: reserva.id }}
              className="flex-1 rounded-full bg-brand py-2.5 text-center text-sm font-extrabold text-white">
              Ver detalle
            </Link>
            <Link to="/chat/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
              className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-bold text-ink inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
            </Link>
          </>
        )}
        {reserva.estado === "completada" && !reserva.valoracion && (
          <Link to="/reservas/$id" params={{ id: reserva.id }}
            className="flex-1 rounded-full bg-coral py-2.5 text-center text-sm font-extrabold text-white">
            Valorar paseo
          </Link>
        )}
        {reserva.estado === "completada" && reserva.valoracion && (
          <Link to="/confirmar/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
            className="flex-1 rounded-full border-2 border-brand bg-white py-2.5 text-center text-sm font-extrabold text-brand">
            Repetir reserva
          </Link>
        )}
        {reserva.estado === "cancelada" && (
          <Link to="/confirmar/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
            className="flex-1 rounded-full bg-brand py-2.5 text-center text-sm font-extrabold text-white">
            Reservar de nuevo
          </Link>
        )}
      </div>
    </article>
  );
}

// suppress unused warning if MapPin not referenced
void MapPin;
