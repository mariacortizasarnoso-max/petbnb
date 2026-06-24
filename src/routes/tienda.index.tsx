import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useTreats";
import { usePartners, useProducts, type Partner } from "@/hooks/useProducts";

export const Route = createFileRoute("/tienda/")({
  component: Tienda,
});

function Tienda() {
  const { user } = useAuth();
  const { data: saldo = 0 } = useBalance(user?.id);
  const { data: partners = [], isPending: loadingPartners } = usePartners();
  const { data: allProducts = [], isPending: loadingProducts } = useProducts();

  const loading = loadingPartners || loadingProducts;

  return (
    <div className="min-h-screen pb-24 bg-cream">
      <Header back title="Tienda de treats" />
      <main className="mx-auto max-w-md px-5">
        {/* Saldo */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 flex items-center justify-between rounded-2xl bg-ink p-4 text-white shadow-md"
        >
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">
              Tu saldo
            </div>
            <div className="mt-0.5 text-2xl font-black">{saldo} 🦴</div>
          </div>
          <Link
            to="/mis-treats"
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur"
          >
            Ver mis treats
          </Link>
        </motion.div>

        <p className="mt-4 text-[13px] leading-snug text-ink-soft">
          Elige una marca partner y canjea tus treats por sus productos. Llegan a casa sin coste de
          envío.
        </p>

        {loading && (
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer h-24 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-5 space-y-3">
            {partners.map((partner, i) => {
              const numProductos = allProducts.filter((p) => p.partnerId === partner.id).length;
              if (numProductos === 0) return null;
              return (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  numProductos={numProductos}
                  index={i}
                />
              );
            })}
          </div>
        )}

        {!loading && partners.length === 0 && (
          <div className="card-soft mt-6 py-10 text-center">
            <div className="text-4xl">🛍️</div>
            <p className="mt-3 text-sm text-ink-soft">La tienda estará disponible pronto.</p>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-ink-soft">
          ¿Te falta saldo? Completa reservas y gana treats 🐾
        </p>
      </main>
    </div>
  );
}

function PartnerCard({
  partner,
  numProductos,
  index,
}: {
  partner: Partner;
  numProductos: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Link
        to="/tienda/$partnerId"
        params={{ partnerId: partner.id }}
        className="flex items-center gap-3 overflow-hidden rounded-2xl p-4 shadow-sm transition active:scale-[0.99]"
        style={{ background: partner.color, color: partner.textColor }}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-base font-black tracking-tight">
          {partner.nombre.slice(0, 2).toLowerCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
            Partner
          </div>
          <div className="truncate text-lg font-black leading-tight">{partner.nombre}</div>
          <div className="truncate text-[11px] opacity-90">{partner.tagline}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[12px] font-extrabold opacity-90">
          {numProductos} {numProductos === 1 ? "producto" : "productos"}
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}
