import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, BadgeCheck, MapPin, ChevronLeft, ChevronRight, Check, Clock, Home, Utensils, Pill, PhoneCall, MessageCircle } from "lucide-react";
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
const DOW = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function Confirmar() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { q, modo } = Route.useSearch();
  const navigate = useNavigate();
  const first = walker.nombre.split(" ")[0];

  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [tipo, setTipo] = useState<Tipo>("paseo");
  const [perro, setPerro] = useState("Nala");
  const [confirming, setConfirming] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  // PASEO
  const [diaPaseo, setDiaPaseo] = useState<number | null>(new Date().getDate());
  const [franja, setFranja] = useState<Franja>("tarde");
  const [horaPaseo, setHoraPaseo] = useState("18:30");
  const [duracion, setDuracion] = useState<30 | 45 | 60>(45);
  const [frecuencia, setFrecuencia] = useState<"puntual" | "recurrente">("puntual");
  const [diasSemana, setDiasSemana] = useState<number[]>([0, 2, 4]); // L,X,V
  const [recogidaPaseo, setRecogidaPaseo] = useState("Tu portal");

  // ESTANCIA
  const [rangoInicio, setRangoInicio] = useState<number | null>(null);
  const [rangoFin, setRangoFin] = useState<number | null>(null);
  const [horaEntrega, setHoraEntrega] = useState("18:00");
  const [horaRecogida, setHoraRecogida] = useState("19:00");
  const [pautaComida, setPautaComida] = useState("Dos veces al día, 80g de su pienso de siempre.");
  const [tomaMedicacion, setTomaMedicacion] = useState(false);
  const [notaMedicacion, setNotaMedicacion] = useState("");
  const [contactoUrgencia, setContactoUrgencia] = useState("Marta · 644 12 34 56");

  const ahora = new Date();
  const [mesOffset, setMesOffset] = useState(0);
  const mesActual = new Date(ahora.getFullYear(), ahora.getMonth() + mesOffset, 1);
  const diasEnMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate();
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
  const puedeAvanzar3 = tipo === "paseo"
    ? Boolean(horaPaseo && recogidaPaseo)
    : Boolean(horaEntrega && horaRecogida);

  const esHoyPaseo = tipo === "paseo" && esMesActual && diaPaseo === hoyDia;
  const fechaPaseoLabel = diaPaseo != null
    ? `${diaPaseo} de ${MESES[mesActual.getMonth()]} · ${horaPaseo}`
    : "—";
  const fechaEstanciaLabel = rangoInicio != null && rangoFin != null
    ? `${rangoInicio}–${rangoFin} de ${MESES[mesActual.getMonth()]}`
    : "—";
  const fechaPaseoCorta = diaPaseo != null
    ? `${diaPaseo} ${MESES[mesActual.getMonth()].slice(0, 3)}`
    : "";
  const frecLabel = frecuencia === "puntual"
    ? "Puntual"
    : `Recurrente · ${diasSemana.sort((a, b) => a - b).map(i => DOW[i]).join("·")}`;

  const titulos: Record<1|2|3|4, string> = {
    1: "Reservar",
    2: tipo === "paseo" ? "Elige el día" : "Elige las fechas",
    3: tipo === "paseo" ? "Detalles del paseo" : "Detalles de la estancia",
    4: tipo === "paseo" ? "Resumen del paseo" : "Resumen de la estancia",
  };

  const confirmar = () => {
    setConfirming(true);
    setTimeout(() => {
      if (tipo === "paseo" && esHoyPaseo && frecuencia === "puntual") {
        navigate({ to: "/paseo/$id", params: { id: walker.id }, search: { perro, duracion } });
      } else {
        setConfirming(false);
        setConfirmado(true);
      }
    }, 1300);
  };

  return (
    <div className="pb-32">
      <Header back title={titulos[paso]} />
      <main className="mx-auto max-w-md px-5">
        <Pasos paso={paso} />

        {/* PASO 1 */}
        {paso === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-black text-ink">¿Qué necesitas?</h2>
            <p className="mt-1 text-sm text-ink-soft">El paseo va por horas. La estancia es para cuando tu perro se queda a dormir.</p>

            <div className="mt-4 space-y-3">
              <TipoCard
                emoji="🦮"
                title="Paseo"
                sub="Por horas · 30, 45 o 60 min · puntual o recurrente."
                active={tipo === "paseo"}
                onClick={() => setTipo("paseo")}
              />
              <TipoCard
                emoji="🏠"
                title="Estancia"
                sub={walker.ofrece_estancia
                  ? `Tu perro se queda a dormir en su casa, por noches.`
                  : `${first} no ofrece estancia ahora mismo.`}
                disabled={!walker.ofrece_estancia}
                active={tipo === "estancia"}
                onClick={() => walker.ofrece_estancia && setTipo("estancia")}
              />
            </div>

            <button
              onClick={() => setPaso(2)}
              className="mt-6 w-full rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] active:scale-[0.98]"
            >
              {tipo === "paseo" ? "Continuar con paseo 🦮" : "Continuar con estancia 🏠"}
            </button>
          </motion.div>
        )}

        {/* PASO 2: Calendario */}
        {paso === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand">
              <span>{tipo === "paseo" ? "🦮 Paseo" : "🏠 Estancia"}</span>
            </div>
            <div className="card-soft p-4">
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
                {DOW.map((d) => <div key={d}>{d}</div>)}
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

            {tipo === "estancia" && (
              <div className="card-soft mt-4 p-4 text-sm">
                {rangoInicio == null && (
                  <p className="text-ink-soft">📅 Toca el día de <strong>entrada</strong>.</p>
                )}
                {rangoInicio != null && rangoFin == null && (
                  <p className="text-ink-soft">📅 Ahora toca el día de <strong>salida</strong>.</p>
                )}
                {rangoInicio != null && rangoFin != null && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-ink-soft">Tu estancia</div>
                      <div className="font-extrabold text-ink">{noches} {noches === 1 ? "noche" : "noches"} en casa de {first}</div>
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

            <NavButtons
              onBack={() => setPaso(1)}
              onNext={() => puedeAvanzar2 && setPaso(3)}
              nextDisabled={!puedeAvanzar2}
              nextLabel="Continuar"
            />
          </motion.div>
        )}

        {/* PASO 3: Detalles distintos por tipo */}
        {paso === 3 && tipo === "paseo" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="card-soft p-4">
              <SectionLabel icon={<Clock className="h-3.5 w-3.5" />} text="Franja horaria" />
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {FRANJAS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setFranja(f.id); setHoraPaseo(f.hora); }}
                    className={`rounded-2xl py-2 text-center text-sm font-bold transition ${
                      franja === f.id ? "bg-brand text-white" : "bg-cream-deep text-ink"
                    }`}
                  >
                    <div>{f.label}</div>
                    <div className="text-[10px] opacity-80">{f.hora}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Hora concreta</label>
                <input
                  type="time"
                  value={horaPaseo}
                  onChange={(e) => setHoraPaseo(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div className="card-soft p-4">
              <SectionLabel text="Duración" />
              <div className="mt-2 flex gap-1.5">
                {([30, 45, 60] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuracion(d)}
                    className={`flex-1 rounded-full py-2.5 text-sm font-bold transition ${
                      duracion === d ? "bg-brand text-white" : "bg-cream-deep text-ink"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div className="card-soft p-4">
              <SectionLabel text="Frecuencia" />
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button onClick={() => setFrecuencia("puntual")}
                  className={`rounded-full py-2.5 text-sm font-bold ${frecuencia === "puntual" ? "bg-brand text-white" : "bg-cream-deep text-ink"}`}>
                  Puntual
                </button>
                <button onClick={() => setFrecuencia("recurrente")}
                  className={`rounded-full py-2.5 text-sm font-bold ${frecuencia === "recurrente" ? "bg-brand text-white" : "bg-cream-deep text-ink"}`}>
                  Recurrente
                </button>
              </div>
              {frecuencia === "recurrente" && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Días de la semana</p>
                  <div className="mt-2 flex gap-1.5">
                    {DOW.map((d, i) => {
                      const sel = diasSemana.includes(i);
                      return (
                        <button
                          key={d}
                          onClick={() => setDiasSemana((s) => sel ? s.filter(x => x !== i) : [...s, i])}
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold transition ${
                            sel ? "bg-brand text-white" : "bg-cream-deep text-ink"
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="card-soft p-4">
              <SectionLabel icon={<MapPin className="h-3.5 w-3.5" />} text="Punto de recogida" />
              <input
                value={recogidaPaseo}
                onChange={(e) => setRecogidaPaseo(e.target.value)}
                placeholder="Tu portal, dirección…"
                className="mt-2 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-1.5 text-[11px] text-ink-soft">{first} pasará a buscar a {perro} en este punto.</p>
            </div>

            <NavButtons onBack={() => setPaso(2)} onNext={() => puedeAvanzar3 && setPaso(4)} nextDisabled={!puedeAvanzar3} nextLabel="Ver resumen" />
          </motion.div>
        )}

        {paso === 3 && tipo === "estancia" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="card-soft p-4">
              <SectionLabel icon={<Clock className="h-3.5 w-3.5" />} text="Horas de entrega y recogida" />
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Entrega</label>
                  <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Recogida</label>
                  <input type="time" value={horaRecogida} onChange={(e) => setHoraRecogida(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
                </div>
              </div>
            </div>

            <div className="card-soft overflow-hidden">
              <div className="flex items-center gap-2 bg-brand-soft/50 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-brand">
                <Home className="h-4 w-4" /> Dónde se queda
              </div>
              <SafeImage src={walker.galeria[1] ?? walker.galeria[0]} alt={`Casa de ${first}`} className="h-44 w-full rounded-none" />
              <div className="p-4 text-sm">
                <div className="font-extrabold text-ink">Casa de {first} · {walker.barrio}</div>
                <p className="mt-1 text-ink-soft">Piso tranquilo a pie de calle, con terraza pequeña. {perro} dormirá en su propia camita en la zona de día.</p>
              </div>
            </div>

            <div className="card-soft p-4">
              <SectionLabel icon={<Utensils className="h-3.5 w-3.5" />} text="Pauta de comida" />
              <textarea
                value={pautaComida}
                onChange={(e) => setPautaComida(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="card-soft p-4">
              <SectionLabel icon={<Pill className="h-3.5 w-3.5" />} text="¿Toma medicación?" />
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => setTomaMedicacion(false)}
                  className={`flex-1 rounded-full py-2.5 text-sm font-bold ${!tomaMedicacion ? "bg-brand text-white" : "bg-cream-deep text-ink"}`}>
                  No
                </button>
                <button onClick={() => setTomaMedicacion(true)}
                  className={`flex-1 rounded-full py-2.5 text-sm font-bold ${tomaMedicacion ? "bg-brand text-white" : "bg-cream-deep text-ink"}`}>
                  Sí
                </button>
              </div>
              {tomaMedicacion && (
                <textarea
                  value={notaMedicacion}
                  onChange={(e) => setNotaMedicacion(e.target.value)}
                  rows={2}
                  placeholder="Nombre, dosis y horario."
                  className="mt-3 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              )}
            </div>

            <div className="card-soft p-4">
              <SectionLabel icon={<PhoneCall className="h-3.5 w-3.5" />} text="Contacto de urgencia" />
              <input
                value={contactoUrgencia}
                onChange={(e) => setContactoUrgencia(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-1.5 text-[11px] text-ink-soft">A quién avisar si pasara algo durante la estancia.</p>
            </div>

            <NavButtons onBack={() => setPaso(2)} onNext={() => puedeAvanzar3 && setPaso(4)} nextDisabled={!puedeAvanzar3} nextLabel="Ver resumen" />
          </motion.div>
        )}

        {/* PASO 4: Resumen */}
        {paso === 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-1 overflow-hidden">
            <div className={`px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-white ${tipo === "paseo" ? "bg-brand" : "bg-coral"}`}>
              {tipo === "paseo" ? "🦮 Resumen de tu paseo" : "🏠 Resumen de tu estancia"}
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
                {tipo === "paseo" ? (
                  <>
                    <Row label="Día" value={fechaPaseoLabel} />
                    <Row label="Duración" value={`${duracion} min`} />
                    <Row label="Frecuencia" value={frecLabel} />
                    <Row label="Recogida" value={recogidaPaseo} icon={<MapPin className="h-3.5 w-3.5" />} />
                  </>
                ) : (
                  <>
                    <Row label="Fechas" value={fechaEstanciaLabel} />
                    <Row label="Noches" value={`${noches}`} />
                    <Row label="Entrega" value={horaEntrega} icon={<Clock className="h-3.5 w-3.5" />} />
                    <Row label="Recogida" value={horaRecogida} icon={<Clock className="h-3.5 w-3.5" />} />
                    <Row label="Dónde" value={`Casa de ${first} · ${walker.barrio}`} icon={<Home className="h-3.5 w-3.5" />} />
                  </>
                )}
              </div>

              {tipo === "estancia" && (
                <div className="mt-4 space-y-2 rounded-2xl bg-cream-deep/50 p-3 text-[13px]">
                  <div><span className="font-extrabold text-ink">Comida: </span><span className="text-ink-soft">{pautaComida}</span></div>
                  <div><span className="font-extrabold text-ink">Medicación: </span><span className="text-ink-soft">{tomaMedicacion ? (notaMedicacion || "Sí") : "No"}</span></div>
                  <div><span className="font-extrabold text-ink">Urgencia: </span><span className="text-ink-soft">{contactoUrgencia}</span></div>
                </div>
              )}

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
                  <span className="font-bold">{first}: </span>
                  {tipo === "paseo"
                    ? `¡Perfecto! Bajo a por ${perro} a la hora acordada y te aviso en cuanto salgamos. 🐾`
                    : `Genial, tendremos la casa lista para ${perro}. Mándame su comida y su juguete favorito, y os mando foto cada día. 🏡`}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <button
                onClick={confirmar}
                disabled={confirming}
                className={`w-full rounded-full py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] active:scale-[0.98] disabled:opacity-80 ${tipo === "paseo" ? "bg-brand" : "bg-coral"}`}
              >
                {confirming ? "Confirmando…" : tipo === "paseo" ? "Confirmar paseo" : "Confirmar estancia"}
              </button>
              <button
                onClick={() => setPaso(3)}
                className="mt-2 w-full text-center text-xs font-bold text-ink-soft"
              >
                Cambiar detalles
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Animación éxito (overlay) */}
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
              <p className="mt-4 font-extrabold text-ink">Reserva confirmada</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pantalla confirmación futura */}
      <AnimatePresence>
        {confirmado && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-cream"
          >
            <Header title="Reserva confirmada" />
            <div className="mx-auto max-w-md px-5 pt-2 pb-10">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-xl"
              >
                <Check className="h-9 w-9" strokeWidth={3} />
              </motion.div>
              <h1 className="mt-4 text-center text-2xl font-black text-ink">¡Todo listo!</h1>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Te llegará un recordatorio el día antes. {first} te escribirá si necesita algo.
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
                  <Row label={tipo === "paseo" ? "Cuándo" : "Fechas"} value={tipo === "paseo" ? `${fechaPaseoCorta} · ${horaPaseo}` : fechaEstanciaLabel} icon={<Clock className="h-3.5 w-3.5" />} />
                  <Row label="Perro" value={perro} />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  to="/chat/$id"
                  params={{ id: walker.id }}
                  search={{ q, modo }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-3.5 text-sm font-extrabold text-white"
                >
                  <MessageCircle className="h-4 w-4" /> Escribir a {first}
                </Link>
                <button
                  onClick={() => navigate({ to: "/reservas" })}
                  className="block w-full rounded-full border border-border bg-white py-3.5 text-center text-sm font-bold text-ink"
                >
                  Ir a mis reservas
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pasos({ paso }: { paso: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-4 mt-1 flex items-center gap-1.5">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition ${n <= paso ? "bg-brand" : "bg-cream-deep"}`}
        />
      ))}
    </div>
  );
}

function SectionLabel({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
      {icon}{text}
    </p>
  );
}

function NavButtons({ onBack, onNext, nextDisabled, nextLabel }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel: string }) {
  return (
    <div className="mt-5 flex gap-2">
      <button onClick={onBack} className="rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-ink">
        Atrás
      </button>
      <button onClick={onNext} disabled={nextDisabled} className="flex-1 rounded-full bg-brand py-3 text-sm font-extrabold text-white disabled:bg-brand/30">
        {nextLabel}
      </button>
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
