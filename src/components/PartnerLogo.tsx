import { useState } from "react";

import maikaiLogo from "@/assets/maikai-pets.png";

// Logos de partners (marcas reales). `chipBg` permite un fondo de marca cuando el
// logo es blanco (Maikai). Si un logo no carga, el onError cae al monograma de
// color — cero riesgo de imagen rota en directo.
type LogoCfg = { src: string; chipBg?: string; fill?: boolean };

const PARTNER_LOGOS: Record<string, LogoCfg> = {
  kiwoko: { src: "https://www.google.com/s2/favicons?domain=kiwoko.com&sz=128" },
  drbimix: { src: "https://www.google.com/s2/favicons?domain=drbimix.com&sz=128" },
  // Logo real de Maikai (wordmark blanco) sobre su teal de marca, bundleado local.
  maikai: { src: maikaiLogo, chipBg: "#3a8d88", fill: true },
};

type PartnerLite = { id: string; nombre: string };

export function PartnerLogo({
  partner,
  className = "h-12 w-12",
  textClassName = "text-base",
}: {
  partner: PartnerLite;
  className?: string;
  textClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const logo = PARTNER_LOGOS[partner.id];

  if (logo && !failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${className}`}
        style={{ background: logo.chipBg ?? "#fff" }}
      >
        <img
          src={logo.src}
          alt={partner.nombre}
          onError={() => setFailed(true)}
          className={`object-contain ${logo.fill ? "w-[82%]" : "h-3/5 w-3/5"}`}
          loading="lazy"
        />
      </span>
    );
  }

  // Fallback: monograma sobre fondo translúcido (sobre el color de la marca).
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-white/15 font-black tracking-tight ${className} ${textClassName}`}
    >
      {partner.nombre.slice(0, 2).toLowerCase()}
    </span>
  );
}
