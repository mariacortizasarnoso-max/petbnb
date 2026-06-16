import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import {
  getEnviados,
  getRecibidos,
  subscribeTreats,
  totales,
  type TreatEnviado,
  type TreatRecibido,
} from "@/data/treatsHistory";
import { getWalker } from "@/data/walkers";

export const Route = createFileRoute("/treats")({
  component: MisTreats,
});

type Tab = "enviados" | "recibidos";

function MisTreats() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("enviados");
  const [, force] = useState(0);
  useEffect(() => subscribeTreats(() => force((n) => n + 1)), []);

  const enviados = getEnviados();
  const recibidos = getRecibidos();
  const t = totales();

  return (
    <div className="min-h-screen pb-24 bg-cream">
      <Header back title="Mis treats" />
      <main className="mx-auto max-w-md px-5">
        {/* Resumen */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand/85 p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-white/85">
            🦴 Tu monedero de treats
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Resumen
              cifra={t.enviados}
              etiqueta="Enviados"
              sub={`${t.importeEnviado} € en agradecimientos`}
            />
            <Resumen
              cifra={t.recibidos}
              etiqueta="Recibidos"
              sub="Para tu peludo"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-5 inline-flex w-full rounded-full bg-cream-deep p-1">
          {(["enviados", "recibidos"] as Tab[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-full py-2 text-sm font-extrabold transition ${
                tab === k ? "bg-white text-ink shadow-sm" : "text-ink-soft"
              }`}
            >
              {k === "enviados" ? `Enviados (${enviados.length})` : `Recibidos (${recibidos.length})`}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="mt-4 space-y-3">
          {tab === "enviados" ? (
            enviados.length === 0 ? (
              <EmptyState
                titulo="Aún no has enviado ningún treat"
                texto="Cuando un paseo te emocione, agradéceselo con un detalle 🦴"
                cta="Explorar el catálogo de treats"
                onCta={() => navigate({ to: "/" })}
              />
            ) : (
              enviados.map((e) => <CardEnviado key={e.id} item={e} />)
            )
          ) : recibidos.length === 0 ? (
            <EmptyState
              titulo="Aún no has recibido ningún treat"
              texto="Los regalos de bienvenida y promociones aparecerán aquí 🐾"
              cta="Volver a buscar paseadores"
              onCta={() => navigate({ to: "/" })}
            />
          ) : (
            recibidos.map((r) => <CardRecibido key={r.id} item={r} />)
          )}
        </div>
      </main>
    </div>
  );
}

function Resumen({ cifra, etiqueta, sub }: { cifra: number; etiqueta: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
      <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">{etiqueta}</div>
      <div className="mt-1 text-3xl font-black leading-none">{cifra}</div>
      <div className="mt-1 text-[11px] text-white/85">{sub}</div>
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
            <span className="shrink-0 rounded-full bg-coral-soft px-2 py-0.5 text-[11px] font-extrabold text-coral">
              {item.precio} €
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
        <div className="truncate font-extrabold text-ink">{item.nombre}</div>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{item.descripcion}</p>
        <div className="mt-1 text-[11px] text-ink-soft">
          De <span className="font-bold text-ink">{item.deNombre}</span> · {item.fechaLabel}
        </div>
      </div>
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
