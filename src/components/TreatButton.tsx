import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { variant?: "small" | "large"; onSent?: () => void; label?: string };

export function TreatButton({ variant = "small", onSent, label }: Props) {
  const [sent, setSent] = useState(false);
  const [bones, setBones] = useState<number[]>([]);

  const click = () => {
    if (sent) return;
    const ids = Array.from({ length: variant === "large" ? 14 : 6 }, (_, i) => Date.now() + i);
    setBones(ids);
    setTimeout(() => setSent(true), 350);
    setTimeout(() => setBones([]), 1400);
    onSent?.();
  };

  const base =
    variant === "large"
      ? "w-full rounded-full bg-coral text-white font-extrabold text-lg py-4 shadow-[0_10px_24px_-10px_rgba(255,122,89,0.7)] active:scale-[0.98] transition"
      : "rounded-full bg-coral-soft text-coral font-bold px-4 py-2 text-sm active:scale-95 transition";

  const sentClass =
    variant === "large"
      ? "w-full rounded-full bg-brand-soft text-brand font-extrabold text-lg py-4"
      : "rounded-full bg-brand-soft text-brand font-bold px-4 py-2 text-sm";

  return (
    <div className="relative inline-block w-full">
      <button onClick={click} className={sent ? sentClass : base} type="button">
        {sent ? "Gracias enviado 🦴 ✓" : label ?? "Gracias 🦴"}
      </button>
      <AnimatePresence>
        {bones.map((id, i) => (
          <motion.span
            key={id}
            initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
            animate={{
              opacity: 0,
              y: -60 - Math.random() * 40,
              x: (i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 50),
              rotate: (Math.random() - 0.5) * 360,
              scale: 1.2,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 text-2xl"
            style={{ translate: "-50% -50%" }}
          >
            🦴
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
