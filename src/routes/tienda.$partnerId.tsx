import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useTreats";
import { usePartners, useProducts } from "@/hooks/useProducts";
import { PartnerLogo } from "@/components/PartnerLogo";

export const Route = createFileRoute("/tienda/$partnerId")({
  component: PartnerLanding,
});

function PartnerLanding() {
  const { partnerId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: saldo = 0 } = useBalance(user?.id);
  const { data: partners = [], isPending: loadingPartners } = usePartners();
  const { data: allProducts = [], isPending: loadingProducts } = useProducts();

  const partner = partners.find((p) => p.id === partnerId);
  const productos = allProducts.filter((p) => p.partnerId === partnerId);
  const loading = loadingPartners || loadingProducts;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-24">
        <div className="h-40 w-full shimmer" />
        <main className="mx-auto max-w-md px-5">
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-44 rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-md px-5 pt-20 text-center">
          <div className="text-5xl">🛍️</div>
          <h1 className="mt-4 text-xl font-black text-ink">Partner no encontrado</h1>
          <Link
            to="/tienda"
            className="mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Hero con la marca del partner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative px-5 pb-6 pt-4"
        style={{ background: partner.color, color: partner.textColor }}
      >
        <div className="mx-auto max-w-md">
          <Link
            to="/tienda"
            aria-label="Volver a la tienda"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <PartnerLogo partner={partner} className="h-14 w-14" textClassName="text-xl" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                Partner de petbnb
              </div>
              <h1 className="truncate text-2xl font-black leading-tight">{partner.nombre}</h1>
              <p className="truncate text-[12px] opacity-90">{partner.tagline}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="mx-auto max-w-md px-5">
        {/* Saldo */}
        <div className="-mt-4 flex items-center justify-between rounded-2xl bg-ink p-3.5 text-white shadow-md">
          <div className="text-[13px] font-bold">
            Canjea con tus treats
            <span className="ml-2 text-white/60">·</span>
            <span className="ml-2 font-black">{saldo} 🦴</span>
          </div>
          <Link to="/mis-treats" className="text-[11px] font-extrabold text-white/80 underline">
            Mis treats
          </Link>
        </div>

        {productos.length === 0 ? (
          <div className="card-soft mt-6 py-10 text-center">
            <div className="text-4xl">🦴</div>
            <p className="mt-3 text-sm text-ink-soft">
              {partner.nombre} aún no tiene productos disponibles.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {productos.map((p, i) => {
              const puede = saldo >= p.costoTreats;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() => navigate({ to: "/canjear/$id", params: { id: p.id } })}
                  className="card-soft flex flex-col items-start p-3 text-left transition active:scale-[0.98]"
                >
                  <div className="mb-2 flex h-16 w-full items-center justify-center rounded-xl bg-cream-deep text-4xl">
                    {p.emoji}
                  </div>
                  <div className="text-[13px] font-extrabold leading-tight text-ink">
                    {p.nombre}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-soft">
                    {p.descripcion}
                  </div>
                  <div className="mt-2 flex w-full items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        puede ? "bg-brand-soft text-brand" : "bg-cream-deep text-ink-soft"
                      }`}
                    >
                      {p.costoTreats} 🦴
                    </span>
                    <span
                      className={`text-[11px] font-extrabold ${puede ? "text-brand" : "text-ink-soft/70"}`}
                    >
                      {puede ? "Canjear →" : "Te faltan"}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-ink-soft">
          ¿Te falta saldo? Completa reservas y gana treats 🐾
        </p>
      </main>
    </div>
  );
}
