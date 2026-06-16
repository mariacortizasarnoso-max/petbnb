import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

type Props = { title?: string; back?: boolean };

export function Header({ title, back }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        {back ? (
          <button
            onClick={() => router.history.back()}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-deep"
            aria-label="Volver"
          >
            <ChevronLeft className="h-6 w-6 text-ink" />
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-1.5 text-ink">
            <span className="text-2xl">🐾</span>
            <span className="font-extrabold text-lg tracking-tight">petbnb</span>
          </Link>
        )}
        {title && <div className="text-sm font-bold text-ink truncate max-w-[60%]">{title}</div>}
        <div className="w-10" />
      </div>
    </header>
  );
}
