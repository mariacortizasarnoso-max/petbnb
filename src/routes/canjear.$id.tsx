import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Truck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useBalance, useInvalidateTreats } from "@/hooks/useTreats";
import { useProduct, usePartners } from "@/hooks/useProducts";
import { redeemProductServer } from "@/lib/api/treats.server";

export const Route = createFileRoute("/canjear/$id")({
  component: Canjear,
});

type Paso = "confirmar" | "procesando" | "exito" | "sin_saldo";

function Canjear() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: producto, isPending: loadingProducto } = useProduct(id);
  const { data: partners = [] } = usePartners();
  const { data: saldo = 0 } = useBalance(user?.id);
  const invalidateTreats = useInvalidateTreats();

  const partner = partners.find((p) => p.id === producto?.partnerId);

  const [paso, setPaso] = useState<Paso>("confirmar");
  const [direccion] = useState("Calle Fuencarral 42, 3.º B · 28004 Madrid");
  // Clave de idempotencia estable: se genera una vez por intento de canje (al
  // montar la pantalla), no por clic. Así un doble-clic o reintento NO cobra dos
  // veces (apply_treat_tx ignora la repetición de la misma clave).
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const costoTreats = producto?.costoTreats ?? 0;
  const puede = saldo >= costoTreats;

  if (loadingProducto) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Confirmar canje" />
        <main className="mx-auto max-w-md px-5 pt-6 space-y-4">
          <div className="shimmer h-28 w-full rounded-3xl" />
          <div className="shimmer h-16 w-full rounded-2xl" />
          <div className="shimmer h-28 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Confirmar canje" />
        <div className="mx-auto max-w-md px-5 pt-20 text-center">
          <p className="text-ink-soft">Producto no encontrado.</p>
        </div>
      </div>
    );
  }

  const confirmar = async () => {
    if (!user?.id) {
      toast.error("Necesitas una cuenta para canjear");
      return;
    }
    setPaso("procesando");
    // Solo treats. No mandamos el coste: lo valida el servidor leyéndolo de `products`.
    const result = await redeemProductServer({
      data: {
        userId: user.id,
        productId: producto.id,
        direccion,
        idempotencyKey,
      },
    });
    if (!result.ok) {
      setPaso("sin_saldo");
      return;
    }
    invalidateTreats(user.id);
    setPaso("exito");
  };

  return (
    <div className="min-h-screen pb-20 bg-cream">
      <Header
        back
        title={
          paso === "exito" ? "¡Canjeado!" : paso === "procesando" ? "Procesando" : "Confirmar canje"
        }
      />
      <main className="mx-auto max-w-md px-5">
        {(paso === "confirmar" || paso === "sin_saldo") && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 overflow-hidden">
              {partner && (
                <div
                  className="flex items-center gap-3 p-4"
                  style={{ background: partner.color, color: partner.textColor }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black">
                    {partner.nombre.slice(0, 2).toLowerCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                      Partner
                    </div>
                    <div className="truncate font-black">{partner.nombre}</div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 p-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-5xl">
                  {producto.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-ink">{producto.nombre}</div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-soft">
                    {producto.descripcion}
                  </p>
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
              <p className="mt-1 text-[11px] text-ink-soft">
                Envío gratuito · llega en 3-5 días laborables.
              </p>
            </div>

            {/* Resumen en treats — en petbnb solo se canjea con treats */}
            <div className="card-soft mt-4 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Coste</span>
                <span className="font-extrabold text-ink">{producto.costoTreats} 🦴</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-ink-soft">Tu saldo</span>
                <span className={`font-extrabold ${puede ? "text-ink" : "text-coral"}`}>
                  {saldo} 🦴
                </span>
              </div>
            </div>

            {(paso === "sin_saldo" || !puede) && (
              <p className="mt-3 text-center text-sm font-bold text-coral">
                {puede
                  ? "Saldo insuficiente para este canje."
                  : `Te faltan ${producto.costoTreats - saldo} 🦴. Completa reservas para ganar treats.`}
              </p>
            )}

            <button
              onClick={confirmar}
              disabled={!puede}
              className="mt-5 w-full rounded-full bg-coral py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98] disabled:bg-coral/40 disabled:shadow-none"
            >
              Canjear por {producto.costoTreats} 🦴
            </button>
            <p className="mt-2 text-center text-[11px] text-ink-soft">
              {partner
                ? `Recibirás un email de ${partner.nombre} con el seguimiento.`
                : "Envío confirmado por email."}
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
            <p className="mt-1 text-sm text-ink-soft">
              {partner?.nombre ?? "Tu partner"} ya está preparando tu pedido.
            </p>
          </div>
        )}

        {paso === "exito" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative mt-6 overflow-visible"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-visible">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -10, x: (i - 9) * 14, opacity: 0, rotate: 0 }}
                  animate={{
                    y: 300 + Math.random() * 80,
                    opacity: [0, 1, 1, 0],
                    rotate: (Math.random() - 0.5) * 720,
                  }}
                  transition={{
                    duration: 1.7 + Math.random() * 0.6,
                    delay: Math.random() * 0.3,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 text-2xl"
                  style={{ translate: "-50% 0" }}
                >
                  🦴
                </motion.span>
              ))}
            </div>
            <div className="card-soft p-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-xl"
              >
                <Check className="h-10 w-10" strokeWidth={3} />
              </motion.div>
              <h1 className="mt-4 text-xl font-black text-ink">¡Canjeado! 📦</h1>
              <p className="mt-1 text-sm text-ink-soft">
                <span className="font-bold text-ink">{producto.nombre}</span>
                {partner ? ` (${partner.nombre})` : ""} te llegará a casa en unos días.
              </p>
              <div className="mt-4 rounded-2xl bg-cream-deep p-3 text-left">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                  Enviado a
                </div>
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
