import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl">🐾</div>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Aquí no hay nadie paseando</h1>
        <p className="mt-2 text-sm text-ink-soft">La página que buscas no existe.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-white">
            Volver a petbnb
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold text-ink">Algo se ha torcido</h1>
        <p className="mt-2 text-sm text-ink-soft">Inténtalo otra vez en un momento.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
          >
            Reintentar
          </button>
          <a href="/" className="rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-ink">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#FBF7F0" },
      { title: "petbnb · Paseadores vecinos para tu perro" },
      { name: "description", content: "Encuentra paseadores de confianza en tu barrio. Vecinos reales, no profesionales fríos." },
      { property: "og:title", content: "petbnb · Paseadores vecinos para tu perro" },
      { property: "og:description", content: "Encuentra paseadores de confianza en tu barrio. Vecinos reales, no profesionales fríos." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-cream text-ink">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors closeButton={false} />
    </QueryClientProvider>
  );
}
