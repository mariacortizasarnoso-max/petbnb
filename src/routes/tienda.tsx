import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useTreats";
import { usePartners, useProducts, type Partner, type Product } from "@/hooks/useProducts";

export const Route = createFileRoute("/tienda")({
  component: Tienda,
});

function Tienda() {
  const navigate = useNavigate();
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
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1 flex items-center justify-between rounded-2xl bg-ink p-4 text-white shadow-md"
        >
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">Tu saldo</div>
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
          Canjea tus treats por productos de nuestras marcas partner. Te llegan a casa sin coste de envío.
        </p>

        {loading && (
          <div className="mt-6 space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="shimmer h-14 w-full rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="shimmer h-40 rounded-2xl" />
                  <div className="shimmer h-40 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && partners.map((partner, i) => {
          const productos = allProducts.filter((p) => p.partnerId === partner.id);
          if (productos.length === 0) return null;
          return (
            <BrandSection
              key={partner.id}
              partner={partner}
              products={productos}
              index={i}
              saldo={saldo}
              onCanjear={(p) => navigate({ to: "/canjear/$id", params: { id: p.id } })}
            />
          );
        })}

        {!loading && partners.length === 0 && (
          <div className="card-soft mt-6 py-10 text-center">
            <div className="text-4xl">🛍️</div>
            <p className="mt-3 text-sm text-ink-soft">La tienda estará disponible pronto.</p>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-ink-soft">
          ¿Te falta saldo? Completa reservas y recibe treats de regalo 🐾
        </p>
      </main>
    </div>
  );
}

function BrandSection({
  partner, products, index, saldo, onCanjear,
}: { partner: Partner; index: number; products: Product[]; saldo: number; onCanjear: (p: Product) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}
      className="mt-6"
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm"
        style={{ background: partner.color, color: partner.textColor }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-base font-black tracking-tight">
          {partner.nombre.slice(0, 2).toLowerCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Partner</div>
          <div className="truncate text-lg font-black leading-tight">{partner.nombre}</div>
          <div className="truncate text-[11px] opacity-90">{partner.tagline}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {products.map((p) => {
          const puede = saldo >= p.costoTreats;
          return (
            <button
              key={p.id}
              onClick={() => onCanjear(p)}
              className="card-soft flex flex-col items-start p-3 text-left transition active:scale-[0.98]"
            >
              <div className="mb-2 flex h-16 w-full items-center justify-center rounded-xl bg-cream-deep text-4xl">
                {p.emoji}
              </div>
              <div className="text-[13px] font-extrabold leading-tight text-ink">{p.nombre}</div>
              <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-soft">{p.descripcion}</div>
              <div className="mt-2 flex w-full items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                  puede ? "bg-brand-soft text-brand" : "bg-cream-deep text-ink-soft"
                }`}>
                  {p.costoTreats} 🦴
                </span>
                <span className={`text-[11px] font-extrabold ${puede ? "text-brand" : "text-ink-soft/70"}`}>
                  {puede ? "Canjear →" : "Te faltan"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
