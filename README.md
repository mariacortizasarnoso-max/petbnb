# petbnb

Conecta a dueños de perros con paseadores y cuidadores vecinos del barrio, con recomendación por IA (modo planificado + modo SOS), reservas de paseo y estancia, chat, y un sistema de "treats" (moneda de fidelización).

## ⚠️ Estado actual: PROTOTIPO

Lo que hay en este repo es un **prototipo** generado con Lovable (TanStack Start + React + Tailwind + shadcn/ui). Las pantallas están construidas y navegables, **pero todos los datos son mock en memoria**: no persisten al recargar, no hay base de datos, ni autenticación, ni llamada real a la IA.

**El backend y el frontend reales están por construir.** Este prototipo sirve como referencia visual y de flujo, no como base de producción intocable: durante la construcción real se rehará/conectará lo que haga falta.

## Cómo construirlo (lee esto antes de empezar)

- **Plan técnico:** [`docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md`](docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md)
  Alcance v1 = MVP demostrable: **persistencia real + matching real con Claude** sobre Supabase + server functions de TanStack Start. Incluye el informe de revisión CEO al final.
- **Reparto de trabajo (EPICs + casillas):** [`TODOS.md`](TODOS.md)

## Ramas

- `main` — proyecto de referencia (este prototipo). 
- `development` — rama de trabajo del día a día. **Lovable sincroniza aquí.** Los Pull Requests van de `development` → `main`.

## Desarrollo local

```bash
bun install
bun run dev
```

Stack: TanStack Start, React 19, Tailwind v4, shadcn/ui, Leaflet, Framer Motion. Backend objetivo: Supabase (Postgres + RLS, Auth, Storage) + server functions para la IA y el saldo de treats.
