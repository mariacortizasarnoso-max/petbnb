import { CreditCard, Lock } from "lucide-react";

export type Metodo = "tarjeta" | "treats";

export function PaymentMethodSelector({
  metodo, onMetodo, costoTreats, costoEuros, saldo,
}: {
  metodo: Metodo;
  onMetodo: (m: Metodo) => void;
  costoTreats: number;
  costoEuros: number;
  saldo: number;
}) {
  const treatsOk = saldo >= costoTreats;
  const faltan = costoTreats - saldo;
  return (
    <div className="card-soft mt-4 overflow-hidden">
      <div className="border-b border-border px-4 pt-4 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
        Método de pago
      </div>
      <div className="divide-y divide-border">
        <Opcion
          activo={metodo === "tarjeta"}
          onClick={() => onMetodo("tarjeta")}
          icon={<CreditCard className="h-5 w-5" />}
          titulo="Pagar con tarjeta"
          sub="Visa · Mastercard · Apple Pay"
          right={<span className="text-sm font-extrabold text-ink">{costoEuros.toFixed(2)} €</span>}
        />
        <Opcion
          activo={metodo === "treats"}
          disabled={!treatsOk}
          onClick={() => treatsOk && onMetodo("treats")}
          icon={<span className="text-xl leading-none">🦴</span>}
          titulo="Pagar con treats"
          sub={treatsOk ? `Tu saldo: ${saldo} 🦴` : `Te faltan ${faltan} 🦴 · completa reservas para conseguir más`}
          right={
            <span className={`text-sm font-extrabold ${treatsOk ? "text-brand" : "text-ink-soft/60"}`}>
              {costoTreats} 🦴
            </span>
          }
        />
      </div>
      <p className="flex items-center gap-1 border-t border-border px-4 py-2 text-[11px] text-ink-soft">
        <Lock className="h-3 w-3" /> Pago simulado, no se cobra nada.
      </p>
    </div>
  );
}

function Opcion({
  activo, disabled, onClick, icon, titulo, sub, right,
}: {
  activo: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  sub: string;
  right: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
        disabled ? "opacity-55" : "active:bg-cream/60"
      }`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        activo ? "border-brand bg-brand" : "border-border bg-white"
      }`}>
        {activo && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        activo ? "bg-brand-soft text-brand" : "bg-cream-deep text-ink-soft"
      }`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-ink">{titulo}</span>
        <span className="block truncate text-[11px] text-ink-soft">{sub}</span>
      </span>
      {right}
    </button>
  );
}
