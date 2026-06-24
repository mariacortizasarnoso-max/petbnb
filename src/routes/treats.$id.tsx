import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { useWalker } from "@/hooks/useWalker";
import { useAuth } from "@/hooks/useAuth";
import { useBalance, useInvalidateTreats, TREATS_POR_EUR } from "@/hooks/useTreats";
import { sendGiftServer } from "@/lib/api/treats.server";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { pushMessage, ahora } from "@/data/chatStore";
import { fotoAleatoria, mensajeAgradecimiento } from "@/data/treatsHistory";

const search = z.object({
  reserva: z.string().optional(),
  perro: z.string().default("tu peludo"),
});

export const Route = createFileRoute("/treats/$id")({
  validateSearch: (s) => search.parse(s),
  component: TreatsCatalogo,
});

type Paso = "catalogo" | "pago" | "procesando" | "exito";

type TreatItem = { id: string; nombre: string; emoji: string; descripcion: string; precio: number };

function useTreatsDB() {
  return useQuery({
    queryKey: ["treats-catalog"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<TreatItem[]> => {
      const { data, error } = await supabase.from("treats").select("*");
      if (error) throw error;
      return (data ?? []).map((t) => ({
        id: t.id,
        nombre: t.nombre,
        emoji: t.emoji ?? "🦴",
        descripcion: t.descripcion ?? "",
        precio: t.precio,
      }));
    },
  });
}

function TreatsCatalogo() {
  const { id } = Route.useParams();
  const { perro } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: walker, isPending: loadingWalker } = useWalker(id);
  const { data: treats = [], isPending: loadingTreats } = useTreatsDB();
  const { data: saldo = 0 } = useBalance(user?.id);
  const invalidateTreats = useInvalidateTreats();

  const [paso, setPaso] = useState<Paso>("catalogo");
  const [seleccion, setSeleccion] = useState<TreatItem | null>(null);
  // Clave de idempotencia: se refresca al elegir un treat (un envío = una clave),
  // estable ante doble-clic/reintento. No lleva Date.now() para no cobrar dos veces.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  if (loadingWalker || loadingTreats) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Treats" />
        <main className="mx-auto max-w-md px-5 pt-6 space-y-4">
          <div className="shimmer h-20 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-36 rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!walker) {
    return (
      <div className="min-h-screen bg-cream">
        <Header back title="Treats" />
        <div className="mx-auto max-w-md px-5 pt-20 text-center">
          <p className="text-ink-soft">Paseador no encontrado.</p>
        </div>
      </div>
    );
  }

  const first = walker.nombre.split(" ")[0];
  const costoTreats = seleccion ? seleccion.precio * TREATS_POR_EUR : 0;
  const puede = saldo >= costoTreats;

  const elegir = (t: TreatItem) => {
    setSeleccion(t);
    setIdempotencyKey(crypto.randomUUID()); // nueva intención de envío
    setPaso("pago");
  };

  // En petbnb los treats se envían SOLO con tu saldo de treats (sin tarjeta).
  const pagar = async () => {
    if (!seleccion || !user?.id) {
      if (!user?.id) toast.error("Necesitas una cuenta para enviar treats");
      return;
    }
    const sel = seleccion;
    setPaso("procesando");
    const result = await sendGiftServer({
      data: {
        userId: user.id,
        walkerId: walker.id,
        delta: costoTreats,
        idempotencyKey,
        label: `Treat: ${sel.nombre}`,
        emoji: sel.emoji,
      },
    });

    if (!result.ok) {
      setPaso("pago");
      toast.error("Saldo insuficiente. Te faltan " + (costoTreats - saldo) + " 🦴");
      return;
    }
    invalidateTreats(user.id);

    setTimeout(() => {
      setPaso("exito");
      // Mensaje de agradecimiento del cuidador en el chat (sigue usando chatStore)
      setTimeout(() => {
        const foto = fotoAleatoria();
        const texto = mensajeAgradecimiento(first, sel.nombre, perro);
        pushMessage(walker.id, { de: "ellos", texto, hora: ahora(), foto });
        toast.success(`${first} ha recibido tu treat 🦴`, {
          description: texto,
          duration: 5500,
        });
      }, 1600);
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-20 bg-cream">
      <Header
        back
        title={
          paso === "catalogo" ? "Treats para " + first : paso === "pago" ? "Pago" : "Enviando treat"
        }
      />
      <main className="mx-auto max-w-md px-5">
        {paso === "catalogo" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 flex items-center gap-3 p-4">
              <SafeImage
                src={walker.foto}
                alt={walker.nombre}
                rounded
                fallbackText={walker.nombre}
                className="h-12 w-12 ring-2 ring-white shadow"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-extrabold text-ink">Enviar treat a {first}</div>
                <div className="text-xs text-ink-soft">
                  Un detalle para agradecer su cariño con {perro}.
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {treats.map((t) => (
                <button
                  key={t.id}
                  onClick={() => elegir(t)}
                  className="card-soft flex flex-col items-start p-4 text-left transition active:scale-[0.98] hover:border-brand/40"
                >
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep text-3xl">
                    {t.emoji}
                  </div>
                  <div className="font-extrabold text-ink leading-tight">{t.nombre}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                    {t.descripcion}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2">
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-extrabold text-brand">
                      {t.precio * TREATS_POR_EUR} 🦴
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream-deep px-4 py-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                Tu saldo
              </span>
              <span className="text-sm font-black text-ink">{saldo} 🦴</span>
            </div>
            <p className="mt-3 text-center text-[11px] text-ink-soft">
              El 100 % se lo lleva {first}.
            </p>
          </motion.div>
        )}

        {paso === "pago" && seleccion && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-soft mt-1 overflow-hidden">
              <div className="flex items-center gap-3 bg-brand-soft/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {seleccion.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-brand">
                    Tu treat
                  </div>
                  <div className="truncate font-extrabold text-ink">{seleccion.nombre}</div>
                  <div className="text-xs text-ink-soft">
                    Para {first} · {costoTreats} 🦴
                  </div>
                </div>
                <button
                  onClick={() => setPaso("catalogo")}
                  className="text-xs font-bold text-brand"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* Solo treats — en petbnb se agradece con treats, sin tarjeta */}
            <div className="card-soft mt-4 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Cuesta</span>
                <span className="font-extrabold text-ink">{costoTreats} 🦴</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-ink-soft">Tu saldo</span>
                <span className={`font-extrabold ${puede ? "text-ink" : "text-coral"}`}>
                  {saldo} 🦴
                </span>
              </div>
            </div>

            {!puede && (
              <p className="mt-3 text-center text-sm font-bold text-coral">
                Te faltan {costoTreats - saldo} 🦴. Completa reservas para ganar treats.
              </p>
            )}

            <button
              onClick={pagar}
              disabled={!puede}
              className="mt-5 w-full rounded-full bg-coral py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98] disabled:bg-coral/40 disabled:shadow-none"
            >
              Enviar treat por {costoTreats} 🦴
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative mt-6 overflow-visible"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-visible">
              {Array.from({ length: 22 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -10, x: (i - 11) * 14, opacity: 0, rotate: 0 }}
                  animate={{
                    y: 320 + Math.random() * 80,
                    opacity: [0, 1, 1, 0],
                    rotate: (Math.random() - 0.5) * 720,
                  }}
                  transition={{
                    duration: 1.8 + Math.random() * 0.7,
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
              <h1 className="mt-4 text-xl font-black text-ink">¡Treat enviado a {first}! 🦴</h1>
              <p className="mt-1 text-sm text-ink-soft">
                Le ha llegado <span className="font-bold text-ink">{seleccion.nombre}</span>.{" "}
                {first} te escribirá en un momento para agradecértelo.
              </p>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() =>
                    navigate({
                      to: "/chat/$id",
                      params: { id: walker.id },
                      search: { q: "", modo: "planificado" },
                    })
                  }
                  className="w-full rounded-full bg-brand py-3.5 text-sm font-extrabold text-white"
                >
                  Ver respuesta en el chat
                </button>
                <button
                  onClick={() => navigate({ to: "/mis-treats" })}
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
