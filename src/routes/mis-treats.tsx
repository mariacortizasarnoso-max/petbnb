import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBalance, useTransactions } from "@/hooks/useTreats";

export const Route = createFileRoute("/mis-treats")({
  component: MisTreats,
});

type Tab = "enviados" | "recibidos" | "canjes";

// Tipos de transacciones tal como vienen de getTransactionsServer
type TxRow = {
  id: string;
  kind: string;
  delta: number;
  label: string | null;
  emoji: string | null;
  counterparty: string | null;
  walker_id: string | null;
  created_at: string;
  photo_url: string | null;
};

type RedemptionRow = {
  id: string;
  costo_treats: number;
  estado: string;
  direccion: string | null;
  created_at: string;
  products: {
    nombre: string;
    emoji: string | null;
    partner_id: string;
    partners: { nombre: string; color: string | null; text_color: string | null } | null;
  } | null;
};

function formatFecha(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function MisTreats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("enviados");

  const { data: saldo = 0 } = useBalance(user?.id);
  const { data: txData, isPending } = useTransactions(user?.id);

  const transactions: TxRow[] = (txData?.transactions ?? []) as TxRow[];
  const redemptions: RedemptionRow[] = (txData?.redemptions ?? []) as RedemptionRow[];

  const enviados = transactions.filter((t) => t.kind === "gift");
  const recibidos = transactions.filter((t) => t.delta > 0);
  const canjesCount = redemptions.length;

  const totEnviados = enviados.length;
  const totTreatsGanados = recibidos.reduce((s, t) => s + t.delta, 0);

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
            <Stat valor={totEnviados} etiqueta="Enviados" />
            <Stat valor={totTreatsGanados} etiqueta="🦴 ganados" />
            <Stat valor={canjesCount} etiqueta="Canjes" />
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
                : `Canjes (${canjesCount})`}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="mt-4 space-y-3">
          {isPending && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="shimmer h-20 w-full rounded-2xl" />)}
            </div>
          )}

          {!isPending && tab === "enviados" && (
            enviados.length === 0 ? (
              <EmptyState
                titulo="Aún no has enviado ningún treat"
                texto="Cuando un paseo te emocione, agradéceselo con un detalle 🦴"
                cta="Buscar paseadores"
                onCta={() => navigate({ to: "/" })}
              />
            ) : (
              enviados.map((t) => <CardGift key={t.id} tx={t} />)
            )
          )}

          {!isPending && tab === "recibidos" && (
            recibidos.length === 0 ? (
              <EmptyState
                titulo="Aún no has recibido ningún treat"
                texto="Los regalos de bienvenida y promociones aparecerán aquí 🐾"
                cta="Volver a buscar"
                onCta={() => navigate({ to: "/" })}
              />
            ) : (
              recibidos.map((t) => <CardEarned key={t.id} tx={t} />)
            )
          )}

          {!isPending && tab === "canjes" && (
            redemptions.length === 0 ? (
              <EmptyState
                titulo="Aún no has canjeado nada"
                texto="Cambia tus treats por productos de nuestras marcas partner 🛍️"
                cta="Ir a la tienda"
                onCta={() => navigate({ to: "/tienda" })}
              />
            ) : (
              redemptions.map((r) => <CardCanje key={r.id} redemption={r} />)
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

function CardGift({ tx }: { tx: TxRow }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-soft overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-3xl">
          {tx.emoji ?? "🦴"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-extrabold text-ink">{tx.label ?? "Treat enviado"}</div>
            <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-extrabold text-brand">
              {Math.abs(tx.delta)} 🦴
            </span>
          </div>
          {tx.counterparty && (
            <div className="mt-0.5 text-xs text-ink-soft">
              Para <span className="font-bold text-ink">{tx.counterparty}</span>
            </div>
          )}
          <div className="mt-1 text-[11px] text-ink-soft">{formatFecha(tx.created_at)}</div>
        </div>
        {tx.photo_url && (
          <SafeImage src={tx.photo_url} alt="foto" rounded className="h-10 w-10 shrink-0 ring-2 ring-white" />
        )}
      </div>
      {tx.walker_id && (
        <div className="border-t border-border px-4 py-2">
          <Link
            to="/chat/$id"
            params={{ id: tx.walker_id }}
            search={{ q: "", modo: "planificado" }}
            className="block w-full rounded-full border border-border bg-white py-2 text-center text-xs font-extrabold text-ink"
          >
            Abrir conversación
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function CardEarned({ tx }: { tx: TxRow }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-soft flex items-center gap-3 p-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-3xl">
        {tx.emoji ?? "🎁"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-extrabold text-ink">{tx.label ?? "Treats recibidos"}</div>
          <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-white">
            +{tx.delta} 🦴
          </span>
        </div>
        <div className="mt-1 text-[11px] text-ink-soft">{formatFecha(tx.created_at)}</div>
      </div>
    </motion.div>
  );
}

function CardCanje({ redemption }: { redemption: RedemptionRow }) {
  const producto = redemption.products;
  const partner = producto?.partners;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-3xl">
          {producto?.emoji ?? "📦"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-extrabold text-ink">{producto?.nombre ?? "Producto"}</div>
            <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-extrabold text-brand">
              –{redemption.costo_treats} 🦴
            </span>
          </div>
          {partner && (
            <div className="mt-0.5 text-xs text-ink-soft">
              <span className="font-bold text-ink">{partner.nombre}</span>
            </div>
          )}
          <div className="mt-0.5 text-[11px] text-ink-soft">{formatFecha(redemption.created_at)}</div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold">
            {redemption.estado === "entregado" ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">Entregado ✓</span>
            ) : (
              <span className="rounded-full bg-coral-soft px-2 py-0.5 text-coral">En camino 📦</span>
            )}
          </div>
        </div>
      </div>
      {redemption.direccion && (
        <p className="mt-2 text-[11px] text-ink-soft">📦 {redemption.direccion}</p>
      )}
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
