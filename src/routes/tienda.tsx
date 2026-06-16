import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { MARCAS, productosPorMarca, type Marca, type Producto } from "@/data/partners";
import { getSaldo, subscribeTreats } from "@/data/treatsHistory";

export const Route = createFileRoute("/tienda")({
  component: Tienda,
});

function Tienda() {
  const navigate = useNavigate();
  const [, force] = useState(0);
  useEffect(() => subscribeTreats(() => force((n) => n + 1)), []);
  const saldo = getSaldo();

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

        {MARCAS.map((m, i) => (
          <BrandSection key={m.id} marca={m} index={i} saldo={saldo} onCanjear={(p) => navigate({ to: "/canjear/$id", params: { id: p.id } })} />
        ))}

        <p className="mt-8 text-center text-[11px] text-ink-soft">
          ¿Te falta saldo? Completa reservas y recibe treats de regalo 🐾
        </p>
      </main>
    </div>
  );
}

function BrandSection({
  marca, index, saldo, onCanjear,
}: { marca: Marca; index: number; saldo: number; onCanjear: (p: Producto) => void }) {
  const productos = productosPorMarca(marca.id);
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}
      className="mt-6"
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm"
        style={{ background: marca.color, color: marca.textColor }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-base font-black tracking-tight">
          {marca.nombre.slice(0, 2).toLowerCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Partner</div>
          <div className="truncate text-lg font-black leading-tight">{marca.nombre}</div>
          <div className="truncate text-[11px] opacity-90">{marca.tagline}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {productos.map((p) => {
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
