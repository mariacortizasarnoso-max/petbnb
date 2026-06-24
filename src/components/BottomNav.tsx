import { Link, useRouterState } from "@tanstack/react-router";
import { Search, CalendarDays, MessageCircle, Gift, ShoppingBag } from "lucide-react";

const ITEMS = [
  { to: "/" as const, label: "Buscar", icon: Search, match: (p: string) => p === "/" },
  { to: "/reservas" as const, label: "Reservas", icon: CalendarDays, match: (p: string) => p.startsWith("/reservas") },
  { to: "/mensajes" as const, label: "Mensajes", icon: MessageCircle, match: (p: string) => p.startsWith("/mensajes") || p.startsWith("/chat") },
  { to: "/tienda" as const, label: "Tienda", icon: ShoppingBag, match: (p: string) => p.startsWith("/tienda") || p.startsWith("/canjear") },
  { to: "/mis-treats" as const, label: "Mis treats", icon: Gift, match: (p: string) => p.startsWith("/mis-treats") },
];

const HIDE_ON = ["/chat/", "/paseo/", "/buscando", "/confirmar/", "/completado/", "/treats/", "/canjear/", "/paseador/"];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-md pb-[max(env(safe-area-inset-bottom),0.25rem)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1 pt-1.5">
        {ITEMS.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-full transition ${
                  active ? "bg-brand-soft text-brand" : "text-ink-soft"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span
                className={`text-[10px] font-extrabold transition ${
                  active ? "text-brand" : "text-ink-soft"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
