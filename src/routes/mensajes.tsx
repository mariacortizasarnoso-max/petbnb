import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, ChevronRight } from "lucide-react";

import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { useAuth } from "@/hooks/useAuth";
import { useThreads } from "@/hooks/useChat";
import { useWalkers } from "@/hooks/useWalkers";

export const Route = createFileRoute("/mensajes")({
  head: () => ({
    meta: [{ title: "Mensajes · petbnb" }],
  }),
  component: Mensajes,
});

function Mensajes() {
  const { user } = useAuth();
  const { data: threads = [], isPending } = useThreads(user?.id);
  const { data: walkers = [] } = useWalkers();
  const walkerById = new Map(walkers.map((w) => [w.id, w]));

  return (
    <div className="pb-28">
      <Header title="Mensajes" />
      <main className="mx-auto max-w-md px-5">
        <h1 className="sr-only">Mensajes</h1>

        {isPending ? (
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((k) => (
              <div key={k} className="card-soft h-16 shimmer" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="card-soft mt-4 p-8 text-center">
            <div className="text-5xl">💬</div>
            <h2 className="mt-3 font-extrabold text-ink">Aún no has hablado con nadie</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Escribe a un paseador antes de reservar y rompe el hielo.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white"
            >
              Buscar un paseador
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {threads.map((th, i) => {
              const w = walkerById.get(th.walkerId);
              if (!w) return null;
              return (
                <motion.div
                  key={th.threadId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to="/chat/$id"
                    params={{ id: w.id }}
                    search={{ q: "", modo: "planificado" }}
                    className="card-soft flex items-center gap-3 p-3"
                  >
                    <div className="relative">
                      <SafeImage
                        src={w.foto}
                        alt={w.nombre}
                        rounded
                        fallbackText={w.nombre}
                        className="h-12 w-12 ring-2 ring-white"
                      />
                      {w.disponible_ahora && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-brand" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1">
                          <span className="truncate font-extrabold text-ink">{w.nombre}</span>
                          {w.verificado && (
                            <BadgeCheck
                              className="h-3.5 w-3.5 shrink-0 text-brand"
                              fill="#d6ebe0"
                            />
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] text-ink-soft">{th.last?.hora}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-ink-soft">
                        {th.last?.de === "yo" ? "Tú: " : ""}
                        {th.last?.texto}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
