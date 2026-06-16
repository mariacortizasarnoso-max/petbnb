import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { WALKERS } from "@/data/walkers";

export const Route = createFileRoute("/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes · petbnb" },
    ],
  }),
  component: Mensajes,
});

function Mensajes() {
  // Conversaciones simuladas: paseadores con chat_inicial
  const convos = WALKERS.filter((w) => w.chat_inicial && w.chat_inicial.length > 0).slice(0, 6);

  return (
    <div className="pb-28">
      <Header title="Mensajes" />
      <main className="mx-auto max-w-md px-5">
        <h1 className="sr-only">Mensajes</h1>

        {convos.length === 0 ? (
          <div className="card-soft mt-4 p-8 text-center">
            <div className="text-5xl">💬</div>
            <h2 className="mt-3 font-extrabold text-ink">Aún no has hablado con nadie</h2>
            <p className="mt-1 text-sm text-ink-soft">Escribe a un paseador antes de reservar y rompe el hielo.</p>
            <Link to="/" className="mt-5 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white">
              Buscar un paseador
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {convos.map((w, i) => {
              const ultimo = w.chat_inicial![w.chat_inicial!.length - 1];
              const hora = new Date(Date.now() - (i + 1) * 17 * 60_000)
                .toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
              const noLeido = i < 2;
              return (
                <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    to="/chat/$id"
                    params={{ id: w.id }}
                    search={{ q: "", modo: "planificado" }}
                    className="card-soft flex items-center gap-3 p-3"
                  >
                    <div className="relative">
                      <SafeImage src={w.foto} alt={w.nombre} rounded fallbackText={w.nombre} className="h-12 w-12 ring-2 ring-white" />
                      {w.disponible_ahora && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-brand" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1">
                          <span className="truncate font-extrabold text-ink">{w.nombre}</span>
                          {w.verificado && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" fill="#d6ebe0" />}
                        </div>
                        <span className={`shrink-0 text-[11px] ${noLeido ? "font-extrabold text-brand" : "text-ink-soft"}`}>{hora}</span>
                      </div>
                      <p className={`mt-0.5 truncate text-[13px] ${noLeido ? "font-bold text-ink" : "text-ink-soft"}`}>
                        {ultimo.de === "yo" ? "Tú: " : ""}{ultimo.texto}
                      </p>
                    </div>
                    {noLeido ? (
                      <span className="ml-1 h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" />
                    )}
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
