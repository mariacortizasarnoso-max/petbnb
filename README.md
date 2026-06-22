# petbnb

Conecta a dueños de perros con paseadores y cuidadores vecinos del barrio, con recomendación por IA (modo planificado + modo SOS), reservas de paseo y estancia, chat, y un sistema de "treats" (moneda de fidelización).

> 🤖 ¿Trabajas con Claude Code o eres nuevo en el repo? Lee primero [`CLAUDE.md`](CLAUDE.md) — tiene el contexto completo (stack, comandos, deploy, convenciones).

## Estado actual

**Funcional y desplegado en producción** (Vercel): `https://petbnb-ashy.vercel.app/`.

- **EPIC 0 (Fundación): completa.** Persistencia real en Supabase (esquema con RLS, transacción de treats con saldo materializado, seed de paseadores).
- **EPIC 1 (Matching con Claude): completa.** Recomendación real vía server function, con fallback determinista.
- **EPIC 2 (Identidad y paseadores): completa.** Sesión anónima sin login, perfil + perro, paseadores y reseñas desde la base de datos.
- **EPIC 3 (Reservas y chat): completa.** Reservas que persisten con cierre del paseo por el cuidador, y chat persistente con auto-respuesta. Verificadas de extremo a extremo en producción.
- **EPIC 4 (Treats): pendiente** — saldo real de la moneda de fidelización. Único bloque del MVP por construir.

Nació como prototipo con datos mock (Lovable); ese estado quedó atrás. Lo que aún use mock (p. ej. el agradecimiento con treats) se cablea en EPIC 4.

## Cómo construirlo (lee esto antes de empezar)

- **Contexto para Claude Code / colaboradores:** [`CLAUDE.md`](CLAUDE.md)
- **Plan técnico:** [`docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md`](docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md)
  Alcance v1 = MVP demostrable: **persistencia real + matching real con Claude** sobre Supabase + server functions de TanStack Start. Incluye el informe de revisión CEO al final.
- **Reparto de trabajo (EPICs + casillas):** [`TODOS.md`](TODOS.md)

## Ramas y despliegue

- **`main` — producción.** La despliega **Vercel** automáticamente en cada merge.
- **`development`** — rama de sincronización con **Lovable** (prototipado). No se empuja aquí el trabajo de producción.
- **Flujo:** rama de feature → Pull Request contra **`main`** → merge → Vercel redespliega.

El build de Vercel depende de `nitro: { preset: "vercel" }` (en `vite.config.ts`) y del Framework Preset `Other` en el dashboard. Detalles en [`CLAUDE.md`](CLAUDE.md).

## Desarrollo local

```bash
bun install
bun run dev      # desarrollo
bun run test     # tests (vitest)
bun run build    # build de producción
```

Copia [`.env.example`](.env.example) a `.env` y rellena las variables (las secretas, como `SUPABASE_SERVICE_ROLE_KEY` y `ANTHROPIC_API_KEY`, nunca con prefijo `VITE_`).

Stack: TanStack Start, React 19, Tailwind v4, shadcn/ui, Leaflet, Framer Motion. Backend: Supabase (Postgres + RLS, Auth, Storage) + server functions para la IA y el saldo de treats.
