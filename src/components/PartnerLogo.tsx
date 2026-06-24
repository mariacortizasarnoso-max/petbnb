import { useState } from "react";

// Logos de partners (marcas reales). Si un logo no cargara, el onError cae al
// monograma de marca — cero riesgo de imagen rota en directo.
const PARTNER_LOGOS: Record<string, string> = {
  kiwoko: "https://www.google.com/s2/favicons?domain=kiwoko.com&sz=128",
  drbimix: "https://www.google.com/s2/favicons?domain=drbimix.com&sz=128",
  maikai: "https://www.google.com/s2/favicons?domain=maikaipets.com&sz=128",
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
  const url = PARTNER_LOGOS[partner.id];

  if (url && !failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ${className}`}
      >
        <img
          src={url}
          alt={partner.nombre}
          onError={() => setFailed(true)}
          className="h-3/5 w-3/5 object-contain"
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
