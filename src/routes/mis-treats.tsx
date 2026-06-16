import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import {
  getEnviados,
  getRecibidos,
  getCanjes,
  getSaldo,
  subscribeTreats,
  totales,
  type TreatEnviado,
  type TreatRecibido,
  type Canje,
} from "@/data/treatsHistory";
import { getWalker } from "@/data/walkers";

export const Route = createFileRoute("/mis-treats")({
  component: MisTreats,
});

type Tab = "enviados" | "recibidos" | "canjes";

function MisTreats() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("enviados");
  const [, force] = useState(0);
  useEffect(() => subscribeTreats(() => force((n) => n + 1)), []);

  const enviados = getEnviados();
  const recibidos = getRecibidos();
  const canjes = getCanjes();
  const saldo = getSaldo();
  const t = totales();

  return (
    <div className="min-h-screen pb-24 bg-cream">
      <Header back title="Mis treats" />
      <main className="mx-auto max-w-md px-5">
        {/* Saldo destacado */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand/85 p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-white/85">
            🦴 Tu monedero de treats
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <div className="text-5xl font-black leading-none">{saldo}</div>
              <div className="mt-1 text-[12px] font-bold text-white/90">treats disponibles</div>
            </div>
            <Link
              to="/tienda"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-extrabold text-brand shadow active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" /> Canjear en tienda
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat valor={t.enviados} etiqueta="Enviados" />
            <Stat valor={t.treatsRecibidos} etiqueta="🦴 ganados" />
            <Stat valor={t.canjes} etiqueta="Canjes" />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-5 inline-flex w-full rounded-full bg-cream-deep p-1">
          {(["enviados", "recibidos", "canjes"] as Tab[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-full py-2 text-[12px] font-extrabold transition ${
                tab === k ? "bg-white text-ink shadow-sm" : "text-ink-soft"
              }`}
            >
              {k === "enviados"
                ? `Enviados (${enviados.length})`
                : k === "recibidos"
                ? `Recibidos (${recibidos.length})`
                : `Canjes (${canjes.length})`}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="mt-4 space-y-3">
          {tab === "enviados" && (
            enviados.length === 0 ? (
              <EmptyState
                titulo="Aún no has enviado ningún treat"
                texto="Cuando un paseo te emocione, agradéceselo con un detalle 🦴"
                cta="Buscar paseadores"
                onCta={() => navigate({ to: "/" })}
              />
            ) : (
              enviados.map((e) => <CardEnviado key={e.id} item={e} />)
            )
          )}
          {tab === "recibidos" && (
            recibidos.length === 0 ? (
              <EmptyState
                titulo="Aún no has recibido ningún treat"
                texto="Los regalos de bienvenida y promociones aparecerán aquí 🐾"
                cta="Volver a buscar"
                onCta={() => navigate({ to: "/" })}
              />
            ) : (
              recibidos.map((r) => <CardRecibido key={r.id} item={r} />)
            )
          )}
          {tab === "canjes" && (
            canjes.length === 0 ? (
              <EmptyState
                titulo="Aún no has canjeado nada"
                texto="Cambia tus treats por productos de nuestras marcas partner 🛍️"
                cta="Ir a la tienda"
                onCta={() => navigate({ to: "/tienda" })}
              />
            ) : (
              canjes.map((c) => <CardCanje key={c.id} item={c} />)
            )
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="rounded-xl bg-white/12 px-2 py-2 backdrop-blur">
      <div className="text-base font-black leading-none">{valor}</div>
      <div className="mt-1 text-[10px] font-bold text-white/85">{etiqueta}</div>
    </div>
  );
}

function CardEnviado({ item }: { item: TreatEnviado }) {
  const walker = getWalker(item.walkerId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-soft overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-3xl">
          {item.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-extrabold text-ink">{item.treatNombre}</div>
            <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-extrabold text-brand">
              {item.precio * 10} 🦴
            </span>
          </div>
          <div className="mt-0.5 text-xs text-ink-soft">
            Para <span className="font-bold text-ink">{item.walkerNombre.split(" ")[0]}</span> · {item.fechaLabel}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold">
            {item.estado === "recibido" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-brand">
                Recibido ✓
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-deep px-2 py-0.5 text-ink-soft">
                Entregado · esperando respuesta
              </span>
            )}
          </div>
        </div>
        {walker && (
          <SafeImage
            src={walker.foto}
            alt={walker.nombre}
            rounded
            fallbackText={walker.nombre}
            className="h-10 w-10 shrink-0 ring-2 ring-white"
          />
        )}
      </div>

      {item.estado === "recibido" && item.fotoConfirmacion && (
        <div className="border-t border-border bg-cream/70 p-3">
          <div className="flex gap-3">
            <SafeImage
              src={item.fotoConfirmacion}
              alt={`Foto enviada por ${item.walkerNombre}`}
              className="h-20 w-20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                {item.walkerNombre.split(" ")[0]} dice
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-ink">"{item.mensajeCuidador}"</p>
            </div>
          </div>
          <Link
            to="/chat/$id"
            params={{ id: item.walkerId }}
            search={{ q: "", modo: "planificado" }}
            className="mt-3 block w-full rounded-full border border-border bg-white py-2 text-center text-xs font-extrabold text-ink"
          >
            Abrir conversación
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function CardRecibido({ item }: { item: TreatRecibido }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-soft flex items-center gap-3 p-4"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-3xl">
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-extrabold text-ink">{item.nombre}</div>
          {item.cantidad ? (
            <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-white">
              +{item.cantidad} 🦴
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{item.descripcion}</p>
        <div className="mt-1 text-[11px] text-ink-soft">
          De <span className="font-bold text-ink">{item.deNombre}</span> · {item.fechaLabel}
        </div>
      </div>
    </motion.div>
  );
}

function CardCanje({ item }: { item: Canje }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-soft p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-3xl">
          {item.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-extrabold text-ink">{item.productoNombre}</div>
            <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-extrabold text-brand">
              –{item.costoTreats} 🦴
            </span>
          </div>
          <div className="mt-0.5 text-xs text-ink-soft">
            <span className="font-bold text-ink">{item.marca}</span> · {item.fechaLabel}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold">
            {item.estado === "entregado" ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">Entregado ✓</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-soft px-2 py-0.5 text-coral">
                <ArrowUpRight className="h-3 w-3" /> En camino
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-ink-soft">📦 {item.direccion}</p>
    </motion.div>
  );
}

function EmptyState({
  titulo, texto, cta, onCta,
}: { titulo: string; texto: string; cta: string; onCta: () => void }) {
  return (
    <div className="card-soft mt-2 flex flex-col items-center px-6 py-10 text-center">
      <div className="text-5xl">🐾</div>
      <h3 className="mt-3 text-base font-extrabold text-ink">{titulo}</h3>
      <p className="mt-1 max-w-xs text-sm text-ink-soft">{texto}</p>
      <button
        onClick={onCta}
        className="mt-5 rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white"
      >
        {cta}
      </button>
    </div>
  );
}
