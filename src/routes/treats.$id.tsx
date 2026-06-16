import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, CreditCard, Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { getWalker, type Walker } from "@/data/walkers";
import { TREATS, type Treat } from "@/data/treats";
import { RESERVAS } from "@/data/reservas";
import {
  addTreatEnviado,
  marcarRecibido,
  fotoAleatoria,
  mensajeAgradecimiento,
} from "@/data/treatsHistory";
import { pushMessage, ahora } from "@/data/chatStore";

const search = z.object({
  reserva: z.string().optional(),
  perro: z.string().default("tu peludo"),
});

export const Route = createFileRoute("/treats/$id")({
  validateSearch: (s) => search.parse(s),
  loader: ({ params }) => {
    const w = getWalker(params.id);
    if (!w) throw notFound();
    return { walker: w };
  },
  component: TreatsCatalogo,
});

type Paso = "catalogo" | "pago" | "procesando" | "exito";

function TreatsCatalogo() {
  const { walker } = Route.useLoaderData() as { walker: Walker };
  const { reserva: reservaId, perro } = Route.useSearch();
  const navigate = useNavigate();
  const first = walker.nombre.split(" ")[0];

  const [paso, setPaso] = useState<Paso>("catalogo");
  const [seleccion, setSeleccion] = useState<Treat | null>(null);

  // tarjeta mock
  const [num, setNum] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12/27");
  const [cvc, setCvc] = useState("123");

  const elegir = (t: Treat) => { setSeleccion(t); setPaso("pago"); };

  const pagar = () => {
    setPaso("procesando");
    setTimeout(() => {
      setPaso("exito");
      if (!seleccion) return;

      // persistir en reserva si viene una
      if (reservaId) {
        const idx = RESERVAS.findIndex((r) => r.id === reservaId);
        if (idx >= 0) RESERVAS[idx] = { ...RESERVAS[idx], treatEnviado: true, treatNombre: seleccion.nombre };
      }

      // registrar en historial
      const enviado = addTreatEnviado({
        treatId: seleccion.id,
        treatNombre: seleccion.nombre,
        emoji: seleccion.emoji,
        precio: seleccion.precio,
        walkerId: walker.id,
        walkerNombre: walker.nombre,
        perro,
      });

      // confirmación del cuidador en el chat + toast tras 1.6s
      setTimeout(() => {
        const foto = fotoAleatoria();
        const texto = mensajeAgradecimiento(first, seleccion.nombre, perro);
        pushMessage(walker.id, { de: "ellos", texto, hora: ahora(), foto });
        marcarRecibido(enviado.id, foto, texto);
        toast.success(`${first} ha recibido tu treat 🦴`, {
          description: texto,
          duration: 5500,
        });
      }, 1600);
    }, 1500);
  };


  return (
    <div className="min-h-screen pb-20 bg-cream">
      <Header back title={paso === "catalogo" ? "Treats para " + first : paso === "pago" ? "Pago" : "Enviando treat"} />
      <main className="mx-auto max-w-md px-5">
        {paso === "catalogo" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 flex items-center gap-3 p-4">
              <SafeImage src={walker.foto} alt={walker.nombre} rounded fallbackText={walker.nombre} className="h-12 w-12 ring-2 ring-white shadow" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-extrabold text-ink">Enviar treat a {first}</div>
                <div className="text-xs text-ink-soft">Un detalle para agradecer su cariño con {perro}.</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {TREATS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => elegir(t)}
                  className="card-soft flex flex-col items-start p-4 text-left transition active:scale-[0.98] hover:border-brand/40"
                >
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep text-3xl">{t.emoji}</div>
                  <div className="font-extrabold text-ink leading-tight">{t.nombre}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-ink-soft">{t.descripcion}</div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-coral-soft px-2.5 py-0.5 text-xs font-extrabold text-coral">
                    {t.precio} €
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-5 text-center text-[11px] text-ink-soft">El 100 % del importe se lo lleva {first}.</p>
          </motion.div>
        )}

        {paso === "pago" && seleccion && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 overflow-hidden">
              <div className="flex items-center gap-3 bg-brand-soft/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{seleccion.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-brand">Tu treat</div>
                  <div className="truncate font-extrabold text-ink">{seleccion.nombre}</div>
                  <div className="text-xs text-ink-soft">Para {first} · {seleccion.precio} €</div>
                </div>
                <button onClick={() => setPaso("catalogo")} className="text-xs font-bold text-brand">Cambiar</button>
              </div>
            </div>

            <div className="card-soft mt-4 p-4">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                <CreditCard className="h-4 w-4" /> Datos de tarjeta
              </div>
              <div className="mt-3 space-y-3">
                <Field label="Número de tarjeta">
                  <input
                    value={num} onChange={(e) => setNum(e.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink tracking-wider focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Caducidad">
                    <input value={exp} onChange={(e) => setExp(e.target.value)} className="w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
                  </Field>
                  <Field label="CVC">
                    <input value={cvc} onChange={(e) => setCvc(e.target.value)} className="w-full rounded-2xl border border-border bg-cream/60 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
                  </Field>
                </div>
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-[11px] text-ink-soft">
                <Lock className="h-3 w-3" /> Pago simulado, no se cobra nada.
              </p>
            </div>

            <button
              onClick={pagar}
              className="mt-5 w-full rounded-full bg-coral py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98]"
            >
              Pagar {seleccion.precio} €
            </button>
          </motion.div>
        )}

        {paso === "procesando" && (
          <div className="mt-24 flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-12 w-12 rounded-full border-4 border-brand/20 border-t-brand"
            />
            <p className="mt-4 font-extrabold text-ink">Procesando pago…</p>
            <p className="mt-1 text-sm text-ink-soft">No cierres la pantalla.</p>
          </div>
        )}

        {paso === "exito" && seleccion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mt-6 overflow-visible">
            {/* confeti de huesos */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-visible">
              {Array.from({ length: 22 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -10, x: (i - 11) * 14, opacity: 0, rotate: 0 }}
                  animate={{ y: 320 + Math.random() * 80, opacity: [0, 1, 1, 0], rotate: (Math.random() - 0.5) * 720 }}
                  transition={{ duration: 1.8 + Math.random() * 0.7, delay: Math.random() * 0.3, ease: "easeOut" }}
                  className="absolute left-1/2 text-2xl"
                  style={{ translate: "-50% 0" }}
                >🦴</motion.span>
              ))}
            </div>

            <div className="card-soft p-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-xl"
              >
                <Check className="h-10 w-10" strokeWidth={3} />
              </motion.div>
              <h1 className="mt-4 text-xl font-black text-ink">¡Treat enviado a {first}! 🦴</h1>
              <p className="mt-1 text-sm text-ink-soft">
                Le ha llegado <span className="font-bold text-ink">{seleccion.nombre}</span>. {first} te escribirá en un momento para agradecértelo.
              </p>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => navigate({ to: "/chat/$id", params: { id: walker.id }, search: { q: "", modo: "planificado" } })}
                  className="w-full rounded-full bg-brand py-3.5 text-sm font-extrabold text-white"
                >
                  Ver respuesta en el chat
                </button>
                <button
                  onClick={() => navigate({ to: "/treats" })}
                  className="w-full rounded-full border border-border bg-white py-3.5 text-sm font-bold text-ink"
                >
                  Ver mis treats
                </button>
                <button
                  onClick={() => setPaso("catalogo")}
                  className="w-full rounded-full py-2 text-sm font-bold text-ink-soft"
                >
                  Enviar otro treat
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
