import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, MapPin, Clock, Star, X, MessageCircle, Gift } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { getReserva, RESERVAS, type Reserva } from "@/data/reservas";
import { getWalker } from "@/data/walkers";

export const Route = createFileRoute("/reservas/$id")({
  loader: ({ params }) => {
    const r = getReserva(params.id);
    if (!r) throw notFound();
    return { reserva: r };
  },
  component: Detalle,
});

function Detalle() {
  const { reserva: initial } = Route.useLoaderData() as { reserva: Reserva };
  const navigate = useNavigate();

  // Estado local mutable simulado (sin backend)
  const [reserva, setReserva] = useState<Reserva>(initial);
  const walker = getWalker(reserva.walkerId)!;
  const first = walker.nombre.split(" ")[0];
  const tipoLabel = reserva.tipo === "paseo" ? "Paseo 🦮" : "Estancia 🏠";

  const [confirmCancelar, setConfirmCancelar] = useState(false);
  const [tempStars, setTempStars] = useState(0);

  // Refrescar desde RESERVAS por si volvemos del flujo de treats
  const fresh = RESERVAS.find((r) => r.id === reserva.id);
  if (fresh && (fresh.treatEnviado !== reserva.treatEnviado || fresh.treatNombre !== reserva.treatNombre)) {
    setReserva(fresh);
  }

  const cancelar = () => {
    setReserva({ ...reserva, estado: "cancelada", cancelTexto: "Cancelaste esta reserva.", nota: undefined });
    setConfirmCancelar(false);
    const idx = RESERVAS.findIndex((r) => r.id === reserva.id);
    if (idx >= 0) RESERVAS[idx] = { ...RESERVAS[idx], estado: "cancelada", cancelTexto: "Cancelaste esta reserva." };
  };

  const valorar = (n: number) => {
    setTempStars(n);
    const updated = { ...reserva, valoracion: n };
    setReserva(updated);
    const idx = RESERVAS.findIndex((r) => r.id === reserva.id);
    if (idx >= 0) RESERVAS[idx] = updated;
  };

  const goSeguimiento = () =>
    navigate({
      to: "/paseo/$id",
      params: { id: walker.id },
      search: { perro: reserva.perro, duracion: reserva.duracion ?? 45 },
    });

  return (
    <div className="pb-32">
      <Header back title="Detalle de reserva" />
      <main className="mx-auto max-w-md px-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-1 overflow-hidden">
          <div className={`px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-white ${
            reserva.estado === "en_curso" ? "bg-coral" :
            reserva.estado === "confirmada" ? "bg-brand" :
            reserva.estado === "completada" ? "bg-ink" : "bg-ink-soft"
          }`}>
            {reserva.estado === "en_curso" && <><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white align-middle" /> Paseo en curso</>}
            {reserva.estado === "confirmada" && "Reserva confirmada"}
            {reserva.estado === "completada" && "Reserva completada"}
            {reserva.estado === "cancelada" && "Reserva cancelada"}
          </div>
          <div className="p-4">
            <Link to="/paseador/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }} className="flex items-center gap-3">
              <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-14 w-14 ring-2 ring-white shadow" />
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
            </Link>

            <div className="mt-4 space-y-2.5 text-sm">
              <Row label="Servicio" value={tipoLabel} />
              <Row label={reserva.tipo === "paseo" ? "Cuándo" : "Fechas"} value={reserva.fechaLabel} icon={<Clock className="h-3.5 w-3.5" />} />
              {reserva.tipo === "paseo" && reserva.duracion && (
                <Row label="Duración" value={`${reserva.duracion} min`} />
              )}
              {reserva.tipo === "estancia" && reserva.noches && (
                <Row label="Noches" value={`${reserva.noches}`} />
              )}
              <Row label="Perro" value={reserva.perro} />
              {reserva.recogida && (
                <Row label="Recogida" value={reserva.recogida} icon={<MapPin className="h-3.5 w-3.5" />} />
              )}
              {reserva.treatEnviado && reserva.treatNombre && (
                <Row label="Treat enviado" value={`${reserva.treatNombre} 🦴`} />
              )}
            </div>

            {reserva.nota && reserva.estado !== "cancelada" && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-cream-deep/60 p-3">
                <SafeImage src={walker.foto} alt="" rounded fallbackText={walker.nombre} className="h-8 w-8 shrink-0" />
                <div className="text-[13px] leading-snug text-ink">
                  <span className="font-bold">{first}: </span>
                  {reserva.nota}
                </div>
              </div>
            )}

            {reserva.estado === "cancelada" && reserva.cancelTexto && (
              <div className="mt-4 rounded-2xl border border-border bg-cream-deep/40 p-3 text-[13px] text-ink-soft">
                {reserva.cancelTexto}
              </div>
            )}
          </div>
        </motion.div>

        {/* Valoración (completada sin valorar) */}
        {reserva.estado === "completada" && !reserva.valoracion && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-4 p-5 text-center">
            <h3 className="font-extrabold text-ink">¿Cómo fue el paseo con {first}?</h3>
            <p className="mt-1 text-sm text-ink-soft">Tu valoración ayuda a otros vecinos.</p>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => valorar(n)} className="p-1">
                  <Star className={`h-8 w-8 transition ${n <= tempStars ? "fill-coral text-coral" : "text-cream-deep"}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Treat (completada) */}
        {reserva.estado === "completada" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-4 p-5 text-center">
            <div className="text-3xl">🦴</div>
            <h3 className="mt-1 font-extrabold text-ink">
              {reserva.treatEnviado ? `Le enviaste: ${reserva.treatNombre}` : "Envíale un treat a " + first}
            </h3>
            {!reserva.treatEnviado ? (
              <>
                <p className="mt-1 text-sm text-ink-soft">Un detalle para agradecer su cariño con {reserva.perro}.</p>
                <Link
                  to="/treats/$id"
                  params={{ id: walker.id }}
                  search={{ reserva: reserva.id, perro: reserva.perro }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-coral py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98]"
                >
                  <Gift className="h-4 w-4" /> Elegir un treat
                </Link>
              </>
            ) : (
              <p className="mt-1 text-sm text-brand font-bold">{first} ha recibido tu treat 🦴 ✓</p>
            )}
          </motion.div>
        )}

        {/* CTAs principales */}
        <div className="mt-5 space-y-2">
          {reserva.estado === "en_curso" && (
            <>
              <button onClick={goSeguimiento} className="w-full rounded-full bg-brand py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)]">
                Ver seguimiento en vivo
              </button>
              <Link to="/chat/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-white py-3.5 text-sm font-bold text-ink">
                <MessageCircle className="h-4 w-4" /> Mensaje a {first}
              </Link>
            </>
          )}
          {reserva.estado === "confirmada" && (
            <>
              <Link to="/chat/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-3.5 text-sm font-extrabold text-white">
                <MessageCircle className="h-4 w-4" /> Escribir a {first}
              </Link>
              <button onClick={() => setConfirmCancelar(true)}
                className="w-full rounded-full border border-border bg-white py-3.5 text-sm font-bold text-coral">
                Cancelar reserva
              </button>
            </>
          )}
          {reserva.estado === "completada" && (
            <Link to="/confirmar/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
              className="block w-full rounded-full border-2 border-brand bg-white py-3.5 text-center text-sm font-extrabold text-brand">
              Repetir reserva con {first}
            </Link>
          )}
          {reserva.estado === "cancelada" && (
            <Link to="/confirmar/$id" params={{ id: walker.id }} search={{ q: "", modo: "planificado" }}
              className="block w-full rounded-full bg-brand py-3.5 text-center text-sm font-extrabold text-white">
              Reservar de nuevo
            </Link>
          )}
        </div>
      </main>

      <AnimatePresence>
        {confirmCancelar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
            onClick={() => setConfirmCancelar(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl"
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-extrabold text-ink">¿Cancelar la reserva?</h3>
                <button onClick={() => setConfirmCancelar(false)} className="p-1 text-ink-soft"><X className="h-5 w-5" /></button>
              </div>
              <p className="text-sm text-ink-soft">
                Si la cancelas, avisaremos a {first} para que pueda organizarse. Puedes volver a reservar cuando quieras.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setConfirmCancelar(false)} className="flex-1 rounded-full border border-border bg-white py-3 text-sm font-bold text-ink">
                  Volver
                </button>
                <button onClick={cancelar} className="flex-1 rounded-full bg-coral py-3 text-sm font-extrabold text-white">
                  Sí, cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">{label}</span>
      <span className="inline-flex items-center gap-1 text-right font-bold text-ink">{icon}{value}</span>
    </div>
  );
}
