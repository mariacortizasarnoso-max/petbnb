import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { getProducto, getMarca, type Producto, type Marca } from "@/data/partners";
import {
  getSaldo, gastarSaldo, addCanje, subscribeTreats,
  EUR_POR_TREAT,
} from "@/data/treatsHistory";
import { PaymentMethodSelector, type Metodo } from "@/components/PaymentMethodSelector";

export const Route = createFileRoute("/canjear/$id")({
  loader: ({ params }) => {
    const p = getProducto(params.id);
    if (!p) throw notFound();
    const marca = getMarca(p.marcaId)!;
    return { producto: p, marca };
  },
  component: Canjear,
});

type Paso = "confirmar" | "procesando" | "exito" | "sin_saldo";

function Canjear() {
  const { producto, marca } = Route.useLoaderData() as { producto: Producto; marca: Marca };
  const navigate = useNavigate();

  const [, force] = useState(0);
  useEffect(() => subscribeTreats(() => force((n) => n + 1)), []);
  const saldo = getSaldo();

  const [paso, setPaso] = useState<Paso>("confirmar");
  const [metodo, setMetodo] = useState<Metodo>(saldo >= producto.costoTreats ? "treats" : "tarjeta");
  const [direccion] = useState("Calle Fuencarral 42, 3.º B · 28004 Madrid");

  const costoEuros = +(producto.costoTreats * EUR_POR_TREAT).toFixed(2);

  const confirmar = () => {
    if (metodo === "treats") {
      const ok = gastarSaldo(producto.costoTreats);
      if (!ok) { setPaso("sin_saldo"); return; }
    }
    setPaso("procesando");
    setTimeout(() => {
      addCanje({
        productoId: producto.id,
        productoNombre: producto.nombre,
        marca: marca.nombre,
        emoji: producto.emoji,
        costoTreats: producto.costoTreats,
        direccion,
      });
      setPaso("exito");
    }, 1400);
  };

  return (
    <div className="min-h-screen pb-20 bg-cream">
      <Header
        back
        title={
          paso === "exito" ? "¡Canjeado!" :
          paso === "procesando" ? "Procesando" :
          "Confirmar canje"
        }
      />
      <main className="mx-auto max-w-md px-5">
        {(paso === "confirmar" || paso === "sin_saldo") && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 overflow-hidden">
              <div
                className="flex items-center gap-3 p-4"
                style={{ background: marca.color, color: marca.textColor }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black">
                  {marca.nombre.slice(0, 2).toLowerCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Partner</div>
                  <div className="truncate font-black">{marca.nombre}</div>
                </div>
              </div>
              <div className="flex gap-3 p-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-5xl">
                  {producto.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-ink">{producto.nombre}</div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-soft">{producto.descripcion}</p>
                  <div className="mt-2 inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-extrabold text-brand">
                    {producto.costoTreats} 🦴
                  </div>
                </div>
              </div>
            </div>

            <div className="card-soft mt-4 p-4">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                <Truck className="h-4 w-4" /> Dirección de envío
              </div>
              <p className="mt-1.5 text-sm font-bold text-ink">{direccion}</p>
              <p className="mt-1 text-[11px] text-ink-soft">Envío gratuito · llega en 3-5 días laborables.</p>
            </div>

            <PaymentMethodSelector
              metodo={metodo}
              onMetodo={setMetodo}
              costoTreats={producto.costoTreats}
              costoEuros={costoEuros}
              saldo={saldo}
            />

            <button
              onClick={confirmar}
              className="mt-5 w-full rounded-full bg-coral py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98]"
            >
              {metodo === "treats" ? `Canjear por ${producto.costoTreats} 🦴` : `Pagar ${costoEuros.toFixed(2)} €`}
            </button>
            <p className="mt-2 text-center text-[11px] text-ink-soft">
              Recibirás un email de {marca.nombre} con el seguimiento.
            </p>
          </motion.div>
        )}

        {paso === "procesando" && (
          <div className="mt-24 flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-12 w-12 rounded-full border-4 border-brand/20 border-t-brand"
            />
            <p className="mt-4 font-extrabold text-ink">Procesando canje…</p>
            <p className="mt-1 text-sm text-ink-soft">{marca.nombre} ya está preparando tu pedido.</p>
          </div>
        )}

        {paso === "exito" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mt-6 overflow-visible">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-visible">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -10, x: (i - 9) * 14, opacity: 0, rotate: 0 }}
                  animate={{ y: 300 + Math.random() * 80, opacity: [0, 1, 1, 0], rotate: (Math.random() - 0.5) * 720 }}
                  transition={{ duration: 1.7 + Math.random() * 0.6, delay: Math.random() * 0.3, ease: "easeOut" }}
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
              <h1 className="mt-4 text-xl font-black text-ink">¡Canjeado! 📦</h1>
              <p className="mt-1 text-sm text-ink-soft">
                <span className="font-bold text-ink">{producto.nombre}</span> ({marca.nombre}) te llegará a casa en unos días.
              </p>
              <div className="mt-4 rounded-2xl bg-cream-deep p-3 text-left">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Enviado a</div>
                <p className="mt-0.5 text-sm font-bold text-ink">{direccion}</p>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => navigate({ to: "/mis-treats" })}
                  className="w-full rounded-full bg-brand py-3.5 text-sm font-extrabold text-white"
                >
                  Ver mis canjes
                </button>
                <button
                  onClick={() => navigate({ to: "/tienda" })}
                  className="w-full rounded-full border border-border bg-white py-3.5 text-sm font-bold text-ink"
                >
                  Seguir en la tienda
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
