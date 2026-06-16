import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, BadgeCheck, MapPin, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";
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

type Tipo = "paseo" | "estancia";
type Franja = "manana" | "mediodia" | "tarde";
const FRANJAS: { id: Franja; label: string; hora: string }[] = [
  { id: "manana", label: "Mañana", hora: "10:00" },
  { id: "mediodia", label: "Mediodía", hora: "13:30" },
  { id: "tarde", label: "Tarde", hora: "18:30" },
];

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS_CORTOS = ["L","M","X","J","V","S","D"];

function Confirmar() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { q, modo } = Route.useSearch();
  const navigate = useNavigate();

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [tipo, setTipo] = useState<Tipo>("paseo");
  const [perro, setPerro] = useState("Nala");
  const [confirming, setConfirming] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  // paseo
  const [diaPaseo, setDiaPaseo] = useState<number | null>(new Date().getDate());
  const [franja, setFranja] = useState<Franja>("tarde");
  const [duracion, setDuracion] = useState<30 | 45 | 60>(45);

  // estancia
  const [rangoInicio, setRangoInicio] = useState<number | null>(null);
  const [rangoFin, setRangoFin] = useState<number | null>(null);

  const ahora = new Date();
  const [mesOffset, setMesOffset] = useState(0);
  const mesActual = new Date(ahora.getFullYear(), ahora.getMonth() + mesOffset, 1);
  const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
  // L=0..D=6 (siempre semana iniciada en lunes)
  const primerDow = (new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay() + 6) % 7;
  const hoyDia = ahora.getDate();
  const esMesActual = mesOffset === 0;
  const noDisponibles = new Set(walker.dias_no_disponibles ?? []);

  const noches = useMemo(() => {
    if (rangoInicio == null || rangoFin == null) return 0;
    return Math.max(1, rangoFin - rangoInicio);
  }, [rangoInicio, rangoFin]);

  const pickDia = (d: number) => {
    if (tipo === "paseo") {
      setDiaPaseo(d);
    } else {
      if (rangoInicio == null || (rangoInicio != null && rangoFin != null)) {
        setRangoInicio(d); setRangoFin(null);
      } else if (d <= rangoInicio) {
        setRangoInicio(d);
      } else {
        setRangoFin(d);
      }
    }
  };

  const puedeAvanzar2 = tipo === "paseo"
    ? diaPaseo != null
    : rangoInicio != null && rangoFin != null;

  const esHoyPaseo = tipo === "paseo" && esMesActual && diaPaseo === hoyDia;
  const fechaPaseoLabel = diaPaseo != null
    ? `${diaPaseo} de ${MESES[mesActual.getMonth()]} · ${FRANJAS.find(f => f.id === franja)!.hora}`
    : "—";
  const fechaEstanciaLabel = rangoInicio != null && rangoFin != null
    ? `${rangoInicio}–${rangoFin} de ${MESES[mesActual.getMonth()]}`
    : "—";

  const confirmar = () => {
    setConfirming(true);
    setTimeout(() => {
      if (tipo === "paseo" && esHoyPaseo) {
        navigate({ to: "/paseo/$id", params: { id: walker.id }, search: { perro, duracion } });
      } else {
        setConfirming(false);
        setConfirmado(true);
      }
    }, 1300);
  };

  return (
    <div className="pb-32">
      <Header back title={paso === 1 ? "Reservar" : paso === 2 ? "Elige fecha" : "Resumen"} />
      <main className="mx-auto max-w-md px-5">
        <Pasos paso={paso} />

        {/* PASO 1: Tipo */}
        {paso === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-black text-ink">¿Qué necesitas?</h2>
            <p className="mt-1 text-sm text-ink-soft">Puedes contratar un paseo por horas o una estancia con noches.</p>

            <div className="mt-4 space-y-3">
              <TipoCard
                emoji="🦮"
                title="Paseo"
                sub="Por horas. 30, 45 o 60 minutos."
                active={tipo === "paseo"}
                onClick={() => setTipo("paseo")}
              />
              <TipoCard
                emoji="🏠"
                title="Estancia"
                sub={walker.ofrece_estancia
                  ? `Tu perro se queda a dormir en su casa. Desde ${walker.precio_estancia_noche ?? 25} treats por noche.`
                  : `${walker.nombre.split(" ")[0]} no ofrece estancia ahora mismo.`}
                disabled={!walker.ofrece_estancia}
                active={tipo === "estancia"}
                onClick={() => walker.ofrece_estancia && setTipo("estancia")}
              />
            </div>

            <button
              onClick={() => setPaso(2)}
              className="mt-6 w-full rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] active:scale-[0.98]"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* PASO 2: Calendario */}
        {paso === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => mesOffset > 0 && setMesOffset(mesOffset - 1)}
                  disabled={mesOffset === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-deep text-ink disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-extrabold capitalize text-ink">
                  {MESES[mesActual.getMonth()]} {mesActual.getFullYear()}
                </div>
                <button
                  onClick={() => mesOffset < 2 && setMesOffset(mesOffset + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-deep text-ink"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-ink-soft">
                {DIAS_CORTOS.map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: primerDow }).map((_, i) => <div key={`b${i}`} />)}
                {Array.from({ length: diasEnMes }).map((_, i) => {
                  const d = i + 1;
                  const pasado = esMesActual && d < hoyDia;
                  const noDisp = noDisponibles.has(d);
                  const disabled = pasado || noDisp;
                  let sel = false;
                  let enRango = false;
                  if (tipo === "paseo") {
                    sel = diaPaseo === d;
                  } else {
                    sel = rangoInicio === d || rangoFin === d;
                    enRango = rangoInicio != null && rangoFin != null && d > rangoInicio && d < rangoFin;
                  }
                  return (
                    <button
                      key={d}
                      disabled={disabled}
                      onClick={() => pickDia(d)}
                      className={`relative h-10 rounded-xl text-sm font-bold transition ${
                        sel
                          ? "bg-brand text-white shadow"
                          : enRango
                            ? "bg-brand-soft text-brand"
                            : disabled
                              ? "text-ink-soft/30 line-through"
                              : "bg-cream-deep/60 text-ink hover:bg-brand-soft"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-soft">
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-brand" /> Seleccionado</span>
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-cream-deep" /> Disponible</span>
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-ink-soft/20" /> Ocupado</span>
              </div>
            </div>

            {tipo === "paseo" && diaPaseo != null && (
              <div className="card-soft mt-4 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">Franja horaria</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {FRANJAS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFranja(f.id)}
                      className={`rounded-2xl py-2 text-center text-sm font-bold transition ${
                        franja === f.id ? "bg-brand text-white" : "bg-cream-deep text-ink"
                      }`}
                    >
                      <div>{f.label}</div>
                      <div className="text-[10px] opacity-80">{f.hora}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-ink-soft">Duración</p>
                <div className="mt-2 flex gap-1.5">
                  {([30, 45, 60] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuracion(d)}
                      className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                        duracion === d ? "bg-brand text-white" : "bg-cream-deep text-ink"
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tipo === "estancia" && (
              <div className="card-soft mt-4 p-4 text-sm">
                {rangoInicio == null && (
                  <p className="text-ink-soft">Selecciona el día de entrada.</p>
                )}
                {rangoInicio != null && rangoFin == null && (
                  <p className="text-ink-soft">Ahora selecciona el día de salida.</p>
                )}
                {rangoInicio != null && rangoFin != null && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-ink-soft">Tu estancia</div>
                      <div className="font-extrabold text-ink">{noches} {noches === 1 ? "noche" : "noches"}</div>
                    </div>
                    <button
                      onClick={() => { setRangoInicio(null); setRangoFin(null); }}
                      className="text-xs font-bold text-brand"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPaso(1)}
                className="rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-ink"
              >
                Atrás
              </button>
              <button
                onClick={() => puedeAvanzar2 && setPaso(3)}
                disabled={!puedeAvanzar2}
                className="flex-1 rounded-full bg-brand py-3 text-sm font-extrabold text-white disabled:bg-brand/30"
              >
                Ver resumen
              </button>
            </div>
          </motion.div>
        )}

        {/* PASO 3: Resumen */}
        {paso === 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-1 overflow-hidden">
            <div className="bg-brand-soft/50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-brand">
              {tipo === "paseo" ? "Reserva de paseo" : "Reserva de estancia"}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
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
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <Row label="Servicio" value={tipo === "paseo" ? "Paseo 🦮" : "Estancia 🏠"} />
                {tipo === "paseo" ? (
                  <>
                    <Row label="Cuándo" value={fechaPaseoLabel} />
                    <Row label="Duración" value={`${duracion} min`} />
                  </>
                ) : (
                  <>
                    <Row label="Entrada / salida" value={fechaEstanciaLabel} />
                    <Row label="Noches" value={`${noches}`} />
                    <Row label="A cambio de" value={`${(walker.precio_estancia_noche ?? 25) * noches} treats 🦴`} />
                  </>
                )}
                <Row label="Recogida" value={`Tu portal · ${walker.barrio}`} icon={<MapPin className="h-3.5 w-3.5" />} />
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
                  {tipo === "paseo"
                    ? `¡Perfecto! Bajo a por ${perro} a la hora acordada y te aviso en cuanto salgamos. 🐾`
                    : `Genial, tendremos la casa lista para ${perro}. Mándame su comida y juguete favorito y os mando foto cada día. 🏡`}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <button
                onClick={confirmar}
                disabled={confirming}
                className="w-full rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] active:scale-[0.98] disabled:opacity-80"
              >
                {confirming ? "Confirmando…" : "Confirmar reserva"}
              </button>
              <button
                onClick={() => setPaso(2)}
                className="mt-2 w-full text-center text-xs font-bold text-ink-soft"
              >
                Cambiar fecha
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Animación éxito */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cream/90 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white text-5xl shadow-xl">
                <Check className="h-10 w-10" strokeWidth={3} />
              </div>
              <div className="mt-4 flex gap-1 text-3xl">
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>🐾</motion.span>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}>🐾</motion.span>
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}>🐾</motion.span>
              </div>
              <p className="mt-4 font-extrabold text-ink">¡Reserva confirmada!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pantalla confirmación futura (estancia o paseo no-hoy) */}
      <AnimatePresence>
        {confirmado && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-cream"
          >
            <Header title="Reserva confirmada" />
            <div className="mx-auto max-w-md px-5 pt-2">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-xl"
              >
                <Check className="h-9 w-9" strokeWidth={3} />
              </motion.div>
              <h1 className="mt-4 text-center text-2xl font-black text-ink">¡Todo listo!</h1>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Te llegará un recordatorio el día antes. {walker.nombre.split(" ")[0]} te escribirá si necesita algo.
              </p>

              <div className="card-soft mt-5 p-4">
                <div className="flex items-center gap-3">
                  <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-12 w-12 ring-2 ring-white" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-extrabold text-ink">{walker.nombre}</div>
                    <div className="text-xs text-ink-soft">{walker.barrio} · {walker.distancia_km} km de ti</div>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <Row label="Servicio" value={tipo === "paseo" ? "Paseo 🦮" : "Estancia 🏠"} />
                  <Row label={tipo === "paseo" ? "Cuándo" : "Entrada / salida"} value={tipo === "paseo" ? fechaPaseoLabel : fechaEstanciaLabel} icon={<Clock className="h-3.5 w-3.5" />} />
                  <Row label="Perro" value={perro} />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  to="/chat/$id"
                  params={{ id: walker.id }}
                  search={{ q, modo }}
                  className="block w-full rounded-full bg-brand py-3.5 text-center text-sm font-extrabold text-white"
                >
                  Escribir a {walker.nombre.split(" ")[0]}
                </Link>
                <button
                  onClick={() => navigate({ to: "/" })}
                  className="block w-full rounded-full border border-border bg-white py-3.5 text-center text-sm font-bold text-ink"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pasos({ paso }: { paso: 1 | 2 | 3 }) {
  return (
    <div className="mb-4 mt-1 flex items-center gap-1.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition ${n <= paso ? "bg-brand" : "bg-cream-deep"}`}
        />
      ))}
    </div>
  );
}

function TipoCard({
  emoji, title, sub, active, disabled, onClick,
}: { emoji: string; title: string; sub: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-3xl border-2 p-4 text-left transition ${
        active
          ? "border-brand bg-brand-soft/40"
          : disabled
            ? "border-border bg-cream-deep/40 opacity-60"
            : "border-border bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-ink">{title}</span>
            {active && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold text-white">Elegido</span>}
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{sub}</p>
        </div>
      </div>
    </button>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">{label}</span>
      <span className="inline-flex items-center gap-1 text-right font-bold text-ink">{icon}{value}</span>
    </div>
  );
}
