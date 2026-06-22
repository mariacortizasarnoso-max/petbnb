# CLAUDE.md

Guía para Claude Code (y para cualquier colaborador) al trabajar en **petbnb**. Léela antes de empezar.

## Qué es petbnb

App que conecta dueños de perros con **paseadores/cuidadores vecinos del barrio**, con recomendación por IA (modo **planificado** + modo **SOS**), reservas de paseo y estancia, chat, y un sistema de **"treats"** (moneda de fidelización canjeable con partners: Kiwoko, Dr Bimix, Maikai).

Repo: `mariacortizasarnoso-max/petbnb`. Colaboradores: **María** (dueña) y **Jorge** (`JorgeHernaPairazaman`), ambos admin.

## Stack

- **Framework: TanStack Start** (React 19 + Vite 8 + Nitro). ⚠️ **NO es Next.js** — si ves restos de `.next/` o `next-env.d.ts` son artefactos espurios, están ignorados; no los uses ni los recrees.
- **Router:** TanStack Router (rutas en `src/routes/`, basadas en archivos).
- **UI:** Tailwind v4 + shadcn/ui (`src/components/ui/`). Mapas con Leaflet/react-leaflet.
- **Backend:** **Supabase** (proyecto "Petbnb", ref `nwgusratfhenvlwnprpn`) — Postgres + RLS. Lógica con secretos vía **server functions de TanStack** (`createServerFn` / archivos `*.server.ts`).
- **IA:** SDK de Anthropic (`@anthropic-ai/sdk`) para el matching, desde el servidor.
- **Gestor de paquetes: bun** (hay `bun.lock`).

## Comandos

```bash
bun install          # instalar dependencias
bun run dev          # desarrollo (vite dev)
bun run build        # build de producción (genera .vercel/output)
bun run test         # tests (vitest, una pasada)
bun run test:watch   # tests en watch
bun run lint         # eslint
bun run format       # prettier --write
```

## Ramas y despliegue (IMPORTANTE)

- **`main` = producción.** Lo despliega **Vercel** automáticamente en cada merge. Todo lo que llegue aquí sale a producción.
- **`development`** = sincronización con **Lovable** (se usó para prototipar). No empujes aquí el trabajo de código de producción.
- **Flujo de trabajo:** rama de feature → PR contra **`main`** → merge → Vercel redespliega.
- Nunca hago `git push` ni toco `main` sin que el usuario lo pida explícitamente.

> Nota: el `README.md` es de la fase de prototipo y describe los roles de las ramas al revés (dice que `main` es "referencia"). La realidad operativa actual es la de aquí: **`main` es producción desplegada por Vercel**.

> El repo `mariacortizasarnoso-max/paseo-confiado-bnb` está **archivado** (lo creó Lovable). NO usarlo y NO borrarlo (rompería Lovable irreversiblemente). El producto real se construye con Claude Code en este repo.

## Despliegue en Vercel (config crítica)

El build sale a `.vercel/output` (Build Output API) gracias a:
- `vite.config.ts` → `nitro: { preset: "vercel" }` (el wrapper de Lovable apunta a Cloudflare por defecto; este override lo redirige a Vercel).
- En el dashboard de Vercel: **Framework Preset = `Other`** (NO Next.js), Build Command `npm run build`, Output Directory por defecto.

Si el deploy falla con `No Next.js version detected`, es que el Framework Preset volvió a `Next.js` — cámbialo a `Other`.

## Variables de entorno y secretos

Patrón de acceso (ver `.env.example` y `src/lib/config.server.ts`):
- **Públicas** → prefijo `VITE_` (ej. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Van al navegador; protegidas por RLS.
- **Secretas** → **NUNCA** con prefijo `VITE_` (eso las filtraría al cliente). Se leen solo desde server functions / `*.server.ts`:
  - `SUPABASE_SERVICE_ROLE_KEY` (omite RLS; solo servidor)
  - `ANTHROPIC_API_KEY` (matching con Claude)
- Configúralas en `.env` (gitignored) **y** en Vercel → Environment Variables.

## Convenciones de código

- **Alias de imports:** `@/*` → `./src/*` (ej. `import { matchWalkers } from "@/lib/matching"`).
- **Server functions:** lógica con secretos en `*.server.ts` usando `createServerFn`. Importa el SDK pesado/los secretos con **import dinámico dentro del handler** para que TanStack Start lo elimine del bundle de cliente (ver `src/lib/api/matching.server.ts` como referencia).
- **Secretos en server config:** léelos **dentro de una función** (`getServerConfig()`), no en scope de módulo (en Workers el env se enlaza por request).
- **Tests:** vitest, junto al código (`*.test.ts`). Los tests que necesitan service-role key se auto-omiten si no está.
- No añadir manualmente plugins de Vite que el wrapper `@lovable.dev/vite-tanstack-config` ya incluye (tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro…) — romperían por duplicado.

## Estructura

```
src/
  routes/        # rutas TanStack Router (index, resultados, chat.$id, treats.$id, reservas…)
  components/    # componentes; ui/ = shadcn/ui
  lib/
    api/         # server functions (matching.server.ts)
    supabase/    # client.ts (browser) + server.ts (service-role)
    config.server.ts   # lectura de secretos del servidor
    matching.ts        # matching determinista (fallback de la IA)
    database.types.ts   # tipos generados de Supabase
  data/          # datos/seed (walkers)
  hooks/
  server.ts      # entry SSR (wrapper de errores)
docs/plans/      # planes técnicos por EPIC
TODOS.md         # reparto de trabajo por EPICs
```

## Estado del proyecto

Al **2026-06-22**. Producción en `https://petbnb-ashy.vercel.app/`.

- **EPIC 0 (Fundación): COMPLETA.** Esquema en Supabase (13 tablas, RLS, `apply_treat_tx` con saldo materializado en `treat_balances`, seed de 12 paseadores). Vitest montado.
- **EPIC 1 (Matching con Claude): COMPLETA.** Server function `matchWalkers` con fallback determinista (`src/lib/matching.ts`). Usa Claude si `ANTHROPIC_API_KEY` está en Vercel; si no, cae al determinista.
- **EPIC 2 (Identidad y paseadores): COMPLETA y verificada en producción.** Sesión anónima silenciosa (`useAuth`/`AuthProvider`), perfil + perro (`/perfil`), paseadores y reseñas desde Postgres (`useWalkers`/`useWalker`).
- **EPIC 3 (Reservas y chat): COMPLETA y verificada en producción.** Reservas persistentes + `closeWalk` (cierre server-side con mensaje del cuidador), chat persistente + auto-respuesta (`sendMessage`). Hooks `useBookings`/`useChat`.
- **EPIC 4 (Economía de treats): pendiente.** Único bloque del MVP sin hacer; ahí se migrará `src/data/chatStore.ts` (aún usado por `treats.$id`).
- **Deploy en Vercel: funcionando** (producción + preview). Requiere en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (la usan los server fns) y `ANTHROPIC_API_KEY`. Las **sesiones anónimas** deben estar activadas en Supabase (Authentication → Allow anonymous sign-ins). Deployment Protection **desactivada** para que la app sea pública.
- Planes y reparto: `docs/plans/` y `TODOS.md`.
