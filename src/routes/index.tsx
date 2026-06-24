import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { useWalkers } from "@/hooks/useWalkers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "petbnb · Paseadores vecinos para tu perro" },
      { name: "description", content: "Cuéntanos cómo es tu perro y te emparejamos con un vecino de confianza del barrio." },
    ],
  }),
  component: Home,
});

const PLACEHOLDER =
  "Golden de 3 años, se pone nerviosa con otros perros. Busco paseo tranquilo de 1 hora, mañana por la mañana...";

function Home() {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const enabled = text.trim().length >= 10;

  const goSearch = (mode: "planificado" | "sos") => {
    const q = text.trim() || "Mi perro necesita salir un rato";
    navigate({ to: "/buscando", search: { q, modo: mode } });
  };

  // Dictado por voz (Web Speech API). Aditivo: si el navegador no lo soporta,
  // el botón no aparece y se escribe con normalidad.
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
    return () => recognitionRef.current?.abort?.();
  }, []);

  const toggleVoz = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      recognitionRef.current?.stop?.();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = "es-ES";
    rec.interimResults = true;
    rec.continuous = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setText(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setText("");
    setListening(true);
    rec.start();
  };

  const { data: walkers = [], isPending } = useWalkers();
  const vecinos = walkers.slice(0, 8);

  return (
    <div className="pb-24">
      <Header />
      <main className="mx-auto max-w-md px-5">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-4"
        >
          <h1 className="text-[34px] leading-[1.05] font-black tracking-tight text-ink">
            Tu perro, en manos<br />de un <span className="text-brand">vecino</span> de confianza.
          </h1>
          <p className="mt-3 text-[15px] text-ink-soft">
            Cuéntanos cómo es y te lo emparejamos con la persona del barrio que mejor encaja con él.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-soft mt-6 p-4"
        >
          <div className="flex items-center justify-between">
            <label htmlFor="dog" className="text-sm font-bold text-ink">
              Cuéntame sobre tu perro y qué necesitas
            </label>
            {listening && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-coral">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" /> Escuchando…
              </span>
            )}
          </div>
          <div className="relative mt-2">
            <textarea
              id="dog"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={5}
              className="w-full resize-none rounded-2xl border border-border bg-cream/60 p-3 pr-16 text-[15px] leading-snug text-ink placeholder:text-ink-soft/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoz}
                aria-label={listening ? "Detener dictado" : "Dictar por voz"}
                className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition active:scale-95 ${
                  listening ? "animate-pulse bg-coral text-white" : "bg-brand text-white"
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-ink-soft">
            <span>
              {voiceSupported
                ? "Escríbelo, o pulsa 🎤 y descríbelo hablando."
                : "Incluye: raza, carácter, qué necesitas y cuándo."}
            </span>
            <span className={text.length >= 10 ? "text-brand font-bold" : ""}>{text.length}/10</span>
          </div>
          <button
            disabled={!enabled}
            onClick={() => goSearch("planificado")}
            className="mt-4 w-full rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(46,125,91,0.6)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand/30 disabled:shadow-none"
          >
            Buscar paseador
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-4"
        >
          <button
            onClick={() => goSearch("sos")}
            className="pulse-coral flex w-full items-center justify-center gap-2 rounded-full bg-coral py-4 text-base font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] transition active:scale-[0.98]"
          >
            <span className="text-xl">🚨</span> Necesito ayuda ahora
          </button>
          <p className="mt-2 text-center text-xs text-ink-soft">
            Te buscamos vecinos disponibles a menos de 2 km.
          </p>
        </motion.section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold text-ink">Vecinos cerca de ti</h2>
            <span className="text-xs text-ink-soft">Madrid centro</span>
          </div>
          <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-2">
            <div className="flex gap-3">
              {isPending &&
                [0, 1, 2, 3, 4].map((k) => (
                  <div key={k} className="flex w-[110px] shrink-0 flex-col items-center gap-2">
                    <div className="shimmer h-[72px] w-[72px] rounded-full" />
                    <div className="shimmer h-3 w-12 rounded" />
                    <div className="shimmer h-2.5 w-16 rounded" />
                  </div>
                ))}
              {vecinos.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex w-[110px] shrink-0 flex-col items-center text-center"
                >
                  <div className="relative">
                    <SafeImage
                      src={w.foto}
                      alt={w.nombre}
                      rounded
                      fallbackText={w.nombre}
                      className="h-[72px] w-[72px] ring-2 ring-white shadow-[0_4px_12px_-4px_rgba(31,36,33,0.2)]"
                    />
                    {w.disponible_ahora && (
                      <span className="absolute bottom-0 right-1 block h-3.5 w-3.5 rounded-full border-2 border-white bg-brand" />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-bold text-ink truncate w-full">{w.nombre.split(" ")[0]}</div>
                  <div className="text-[11px] text-ink-soft truncate w-full">{w.barrio}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-brand-soft/60 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦴</span>
            <div>
              <h3 className="font-extrabold text-ink">Sin dinero, con treats.</h3>
              <p className="mt-1 text-sm text-ink-soft">
                En petbnb no se paga: das las gracias con un treat. Aquí los paseadores son vecinos, no profesionales fríos.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
