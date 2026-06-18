# feat: EPIC 0 — Fundación (Supabase + esquema + RLS + seed)

**Target repo:** `petbnb` (rama `development`) · **Construcción:** Claude Code · **Despliegue:** Vercel
**Fecha:** 2026-06-18
**Tipo:** feat
**Profundidad:** Standard
**Origen:** `docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md` (plan maestro, unidades U1 + U2) y `TODOS.md` (EPIC 0)

---

## Summary

EPIC 0 es la fundación: deja Supabase enchufado a `petbnb` y todo el modelo de datos vivo en Postgres, con seguridad (RLS), la función transaccional del saldo de treats y los datos sembrados desde los mocks actuales. No cambia ninguna pantalla ni añade comportamiento visible; su entrega es **desbloquear** las demás EPICs dándoles un backend real sobre el que construir. Las claves sensibles viven solo en el servidor (módulos `*.server.ts` y, en producción, en las Environment Variables de Vercel), nunca en el bundle del cliente.

Tres decisiones confirmadas: (1) se **crea el proyecto Supabase real** como parte de esta EPIC; (2) el saldo de treats es una columna **materializada** (`treat_balances`) que actualiza la función `apply_treat_tx`; (3) las migraciones se desarrollan con el **Supabase CLI en local** y se versionan en `supabase/migrations/`.

---

## Problem Frame

Hoy todo el dato es mock en memoria (`src/data/*.ts`, observables `chatStore.ts`/`treatsHistory.ts`) y no persiste. No hay proyecto Supabase, ni clientes, ni claves, ni esquema. Sin esta base, ninguna otra EPIC (matching real, reservas, chat, treats) puede persistir nada ni autorizar a un usuario. La restricción dominante: las *shapes* de los mocks ya están bien definidas y se mapean casi 1:1 a tablas, así que el esquema debe reflejarlas fielmente (campos en español incluidos) para que el cableado posterior sea un cambio de origen de datos, no un rediseño.

---

## Scope Boundaries

### En alcance (EPIC 0)
- Crear el proyecto Supabase real y conectarlo a `petbnb`.
- Clientes Supabase: browser (anon) y servidor (service-role, solo server-side).
- Gestión de secretos y `.env` (local + Vercel), sin fugas al cliente.
- Esquema completo en Postgres reflejando las shapes mock.
- RLS: lectura pública del catálogo; acceso por-usuario al resto; mutación de treats solo en servidor.
- Función `apply_treat_tx` (atómica, idempotente, sin saldo negativo) + columna materializada `treat_balances`.
- Seed con los datos del prototipo (12 paseadores, partners, productos, treats, reseñas).
- Verificación: advisors de seguridad, generación de tipos TS, comprobación de que el bundle cliente no lleva secretos.

### Decisiones confirmadas
- **DC-1.** Se provisiona el proyecto Supabase real en esta EPIC (no solo dejar migraciones en frío).
- **DC-2.** Saldo materializado en `treat_balances`, actualizado por `apply_treat_tx` con bloqueo de fila (no derivado por agregación en cada lectura).
- **DC-3.** Migraciones con Supabase CLI local + carpeta versionada `supabase/migrations/`.

### Fuera de alcance (otras EPICs)
- Matching con Claude (EPIC 1), pantallas/hooks de auth y perfil (EPIC 2), reservas y chat funcionales (EPIC 3), pantallas y server functions de treats (EPIC 4).
- Este plan crea las **tablas y la función** de treats, pero **no** las server functions que las consumen (`sendGift`/`redeem`/`earn`) — eso es EPIC 4.

---

## Requirements

- **R1.** Existe un proyecto Supabase y `petbnb` se conecta a él por variables de entorno; las claves sensibles no aparecen en el bundle del cliente.
- **R2.** El modelo de datos completo existe en Postgres y refleja las shapes de `src/data/*.ts`.
- **R3.** RLS aplicada: catálogo (`walkers`, `reviews`, `partners`, `products`, `treats`) de lectura pública; `bookings`, `chat_*`, `treat_transactions`, `treat_balances`, `redemptions` accesibles solo por su dueño; escritura de treats denegada al cliente.
- **R4.** `apply_treat_tx` aplica un delta de forma atómica e idempotente y nunca deja el saldo en negativo.
- **R5.** `treat_balances.saldo` queda siempre consistente con la suma de `treat_transactions` del usuario.
- **R6.** Los datos sembrados cargan correctamente: 12 paseadores (≥3 con `disponible_ahora=true` y `distancia_km<2`), 3 partners, 10 productos, 5 treats, reseñas.
- **R7.** La verificación pasa: advisors sin warnings críticos de RLS, tipos TS generados, y `bun run build` no incluye secretos en el cliente.

---

## Key Technical Decisions

- **KTD1 — Secretos server-only + Vercel.** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` pueden ir al cliente (anon + RLS las protege). `SUPABASE_SERVICE_ROLE_KEY` y (en EPICs siguientes) `ANTHROPIC_API_KEY` **nunca** llevan prefijo `VITE_` y solo se leen desde `config.server.ts` / módulos `*.server.ts`. En producción van en *Environment Variables* de Vercel.
- **KTD2 — Saldo materializado (DC-2).** `treat_balances(user_id PK, saldo int CHECK >= 0)` actualizado dentro de `apply_treat_tx`. Evita recomputar el saldo en cada lectura y centraliza el guard de no-negativo en la base de datos.
- **KTD3 — Mutación de treats solo en servidor.** RLS deniega `INSERT`/`UPDATE` de `treat_transactions` y `treat_balances` al rol cliente; solo `service_role` (desde server functions de EPIC 4) puede mutar, vía `apply_treat_tx`. El cliente solo lee su saldo e historial.
- **KTD4 — Nombres fieles al mock.** Tablas y columnas reflejan los campos en español de `src/data/*.ts` (`distancia_km`, `disponible_ahora`, `nota_recogida`, etc.) para que el cableado posterior sea sustitución de origen, no traducción.

---

## High-Level Technical Design

### Modelo de datos

```mermaid
erDiagram
  profiles ||--o{ dogs : tiene
  profiles ||--o{ bookings : crea
  profiles ||--o{ chat_threads : participa
  profiles ||--o{ treat_transactions : registra
  profiles ||--|| treat_balances : tiene
  profiles ||--o{ redemptions : realiza
  walkers ||--o{ reviews : recibe
  walkers ||--o{ bookings : atiende
  walkers ||--o{ chat_threads : conversa
  chat_threads ||--o{ chat_messages : contiene
  partners ||--o{ products : ofrece
  products ||--o{ redemptions : canjeado_en

  profiles { uuid id PK }
  walkers { text id PK }
  bookings { uuid id PK; text tipo; text estado }
  treat_transactions { uuid id PK; int delta; text kind; text idempotency_key }
  treat_balances { uuid user_id PK; int saldo }
```

**Tablas y campos clave** (reflejan `src/data/*.ts`):
- `profiles` — `id` (uuid, = `auth.users.id`), `nombre`, `created_at`.
- `dogs` — `id`, `owner_id`→profiles, `nombre`, `notas`.
- `walkers` (catálogo, `id` text) — `nombre`, `foto`, `barrio`, `bio`, `especialidades` text[], `tags` text[], `distancia_km`, `disponible_ahora`, `tiempo_respuesta`, `rating`, `num_resenas`, `paseos_completados`, `verificado`, `anios_experiencia`, `galeria` text[], `nota_recogida`, `tiene_perros`, `texto_perros`, `dias_no_disponibles` int[], `ofrece_estancia`, `precio_estancia_noche`.
- `reviews` — `id`, `walker_id`→walkers, `autor`, `texto`.
- `bookings` — `id`, `user_id`→profiles, `walker_id`→walkers, `tipo` (`paseo`|`estancia`), `perro`, `estado` (`confirmada`|`en_curso`|`completada`|`cancelada`), `fecha_label`, `hora`, `duracion`, `noches`, `nota`, `recogida`, `inicio_iso`, `created_at`.
- `chat_threads` — `id`, `user_id`, `walker_id`, único por (`user_id`,`walker_id`).
- `chat_messages` — `id`, `thread_id`→chat_threads, `de` (`yo`|`ellos`), `texto`, `foto`, `created_at`.
- `treat_transactions` (ledger append-only) — `id`, `user_id`, `delta` int, `kind` (`earn`|`gift`|`redeem`), `label`, `emoji`, `counterparty`, `walker_id`, `note`, `photo_url`, `ref`, `idempotency_key` (único), `created_at`.
- `treat_balances` — `user_id` PK→profiles, `saldo` int `CHECK (saldo >= 0)`, `updated_at`.
- `partners` — `id` text, `nombre`, `tagline`, `color`, `text_color`.
- `products` — `id` text, `partner_id`→partners, `nombre`, `descripcion`, `emoji`, `costo_treats`.
- `redemptions` — `id`, `user_id`, `product_id`→products, `costo_treats`, `estado` (`en_camino`|`entregado`), `direccion`, `created_at`.

### Lógica de `apply_treat_tx` (guía direccional, no implementación)

```
apply_treat_tx(p_user, p_delta, p_kind, p_ref, p_idempotency_key, ...metadata):
  if existe tx con p_idempotency_key:           # idempotencia
      return saldo actual                       # no-op, no duplica
  bloquear fila de treat_balances del usuario   # SELECT ... FOR UPDATE (o upsert a 0)
  nuevo = saldo_actual + p_delta
  if nuevo < 0: RAISE 'saldo insuficiente'      # guard no-negativo
  INSERT en treat_transactions(...)
  UPDATE treat_balances SET saldo = nuevo
  return nuevo
```

Se ejecuta con privilegios de `service_role` desde server functions (EPIC 4). El guard de no-negativo y la idempotencia viven en la base de datos, no en el cliente.

---

## Output Structure (nuevos ficheros)

```
supabase/
  config.toml
  migrations/
    0001_schema.sql          # tablas + índices + constraints
    0002_rls.sql             # habilitar RLS + políticas por tabla
    0003_treats_fn.sql       # treat_balances + apply_treat_tx (+ trigger profiles)
    0004_seed.sql            # datos sembrados desde src/data/*
src/lib/supabase/
  client.ts                  # browser (anon)
  server.ts                  # service-role (server-only)
src/lib/
  database.types.ts          # tipos TS generados por el CLI
  config.server.ts           # (editar) añadir supabaseServiceRoleKey
.env.example                 # (nuevo/editar) documentar vars
```

---

## Implementation Units

### U1. Proyecto Supabase, CLI local y secretos

**Goal:** Tener el proyecto Supabase creado, el CLI local funcionando y las variables de entorno definidas (local + Vercel), sin fugas de secretos.
**Requirements:** R1
**Dependencies:** —
**Files:**
- `supabase/config.toml` (init del CLI)
- `.env.example` (documentar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- `.gitignore` (verificar que `.env*` está ignorado, salvo `.env.example`)
- `package.json` (añadir `@supabase/supabase-js`; scripts de migración del CLI)
**Approach:** Crear el proyecto Supabase real (DC-1) y obtener URL + anon key + service-role key. `supabase init` para el stack local; `supabase link` al proyecto remoto. Documentar todas las vars en `.env.example`. Definir las mismas vars en Vercel (las `VITE_` como públicas; la service-role como secreta, sin prefijo). No commitear `.env` con valores reales.
**Patterns to follow:** `src/lib/config.server.ts` (lectura de config server-only) y la nota de `src/lib/api/example.functions.ts`.
**Test scenarios:** Test expectation: none — provisión/infraestructura. Se valida en U6 (advisors + grep del build).
**Verification:** `supabase status` (local) responde; `supabase db pull`/`link` conecta al proyecto remoto; `.env.example` lista todas las vars; ninguna clave sensible lleva prefijo `VITE_`.

### U2. Clientes Supabase (browser anon + servidor service-role)

**Goal:** Exponer un cliente de lectura para el navegador y un cliente privilegiado solo-servidor.
**Requirements:** R1
**Dependencies:** U1
**Files:**
- `src/lib/supabase/client.ts` (browser, anon)
- `src/lib/supabase/server.ts` (service-role, server-only)
- `src/lib/config.server.ts` (editar: añadir `supabaseServiceRoleKey`)
**Approach:** `client.ts` usa `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. `server.ts` usa la service-role y solo se importa desde módulos `*.server.ts` / handlers de `createServerFn`, de modo que se tree-shake del bundle cliente (ver `example.functions.ts`). Sin consumidores aún (las EPICs siguientes los usarán).
**Patterns to follow:** `src/lib/api/example.functions.ts`, `src/lib/config.server.ts`.
**Test scenarios:**
- Importar `server.ts` desde un módulo cliente debe ser detectable como error de frontera (revisión/lint) — no debe acabar en el bundle. *(R1)*
- `client.ts` se instancia con la anon key y expone solo lectura efectiva (verificado en U6 vía RLS).
**Verification:** El proyecto compila; un server fn de prueba puede leer con `server.ts`; el cliente browser se crea sin la service-role.

### U3. Migración de esquema (tablas, índices, constraints)

**Goal:** Crear todas las tablas del modelo con sus tipos, claves y constraints.
**Requirements:** R2
**Dependencies:** U1
**Files:**
- `supabase/migrations/0001_schema.sql`
**Approach:** Modelar las tablas del HTD reflejando 1:1 las shapes de `src/data/*.ts` (nombres en español). `estado`/`tipo`/`kind` como `CHECK` o enums. `idempotency_key` con índice `UNIQUE` en `treat_transactions`. FKs con `on delete` razonable. Índices en `bookings(user_id)`, `chat_messages(thread_id)`, `treat_transactions(user_id)`, `reviews(walker_id)`, `products(partner_id)`.
**Patterns to follow:** tipos de `src/data/walkers.ts`, `reservas.ts`, `treatsHistory.ts`, `partners.ts`.
**Test scenarios:**
- Insertar un `booking` de tipo no permitido → rechazado por el `CHECK` de `tipo`/`estado`. *(R2)*
- `treat_transactions` con `idempotency_key` duplicado → viola el `UNIQUE`. *(R4)*
- `treat_balances.saldo` negativo → rechazado por el `CHECK (saldo >= 0)`. *(R4)*
**Verification:** `supabase db reset` aplica la migración limpio; las tablas existen con las columnas esperadas.

### U4. RLS y políticas

**Goal:** Habilitar RLS y definir el acceso: catálogo público, datos de usuario privados, treats no mutables por el cliente.
**Requirements:** R3
**Dependencies:** U3
**Files:**
- `supabase/migrations/0002_rls.sql`
**Approach:** `ENABLE ROW LEVEL SECURITY` en todas las tablas. `walkers`/`reviews`/`partners`/`products`/`treats`: política `SELECT` para `anon` y `authenticated`. `bookings`/`chat_threads`/`chat_messages`/`treat_transactions`/`treat_balances`/`redemptions`: `SELECT`/`INSERT`/`UPDATE` solo cuando `auth.uid() = user_id` (chat por pertenencia al thread). Treats: **sin** política de `INSERT`/`UPDATE` para el cliente (solo `service_role`, que omite RLS).
**Patterns to follow:** convención `auth.uid() = user_id` de Supabase.
**Test scenarios:**
- Usuario A consulta `bookings` de B → 0 filas. *(R3)*
- Cliente autenticado intenta `INSERT` en `treat_transactions` → denegado por RLS. *(R3)*
- `anon` puede leer `walkers` y `products`. *(R3)*
- Usuario lee mensajes de un thread que no es suyo → 0 filas. *(R3)*
**Verification:** `supabase db reset` aplica; `get_advisors` (Supabase) sin warnings críticos de RLS; pruebas manuales de las políticas con tokens de dos usuarios.

### U5. Función `apply_treat_tx` + saldo materializado

**Goal:** Función transaccional que mueve el saldo de forma atómica, idempotente y sin negativos, manteniendo `treat_balances`. Más trigger que crea `profiles`+`treat_balances` al alta de usuario.
**Requirements:** R4, R5
**Dependencies:** U3
**Files:**
- `supabase/migrations/0003_treats_fn.sql`
**Approach:** Implementar `apply_treat_tx` según la guía direccional del HTD: idempotencia por `idempotency_key`, bloqueo de fila de `treat_balances`, guard de no-negativo, inserción en el ledger y actualización del saldo, todo en una transacción. `SECURITY DEFINER` para que la ejecuten las server functions con service-role. Trigger `on_auth_user_created` → crea `profiles` y `treat_balances(saldo=0)`.
**Execution note:** Implementar con pruebas primero: el comportamiento (idempotencia, no-negativo, atomicidad) es la parte de mayor riesgo de la EPIC.
**Patterns to follow:** funciones PL/pgSQL `SECURITY DEFINER` de Supabase.
**Test scenarios:**
- Delta positivo (`earn`) sube el saldo exactamente. *(R5)*
- Delta negativo que dejaría saldo <0 → `RAISE`, no inserta tx, saldo intacto. *(R4)*
- Mismo `idempotency_key` dos veces → segunda es no-op; saldo cambia una sola vez. *(R4)*
- Dos llamadas concurrentes sobre el mismo usuario → serializan por el lock; saldo final correcto. *(R4)*
- Alta de usuario crea `profiles` y `treat_balances(0)` por trigger. *(R5)*
- Tras N transacciones, `treat_balances.saldo` == suma de `delta` en `treat_transactions`. *(R5)*
**Verification:** Suite de la función pasa; el saldo cuadra con el ledger en todos los casos.

### U6. Seed + verificación

**Goal:** Cargar los datos del prototipo y verificar seguridad, tipos y ausencia de secretos en el cliente.
**Requirements:** R6, R7
**Dependencies:** U3, U4, U5
**Files:**
- `supabase/migrations/0004_seed.sql`
- `src/lib/database.types.ts` (generado por el CLI)
**Approach:** Portar `src/data/walkers.ts` (12), `partners.ts` (3 marcas + 10 productos), `treats.ts` (5) y las reseñas a `INSERT`s de seed, garantizando ≥3 paseadores con `disponible_ahora=true` y `distancia_km<2`. Generar tipos TS con `supabase gen types`. Verificar el build.
**Patterns to follow:** valores exactos de `src/data/*.ts`.
**Test scenarios:**
- Conteos de seed: 12 walkers, 3 partners, 10 products, 5 treats. *(R6)*
- ≥3 walkers cumplen `disponible_ahora=true && distancia_km<2`. *(R6)*
- `bun run build`: el bundle cliente (`dist`) no contiene `SERVICE_ROLE` ni la service-role key (grep). *(R7)*
- `database.types.ts` refleja todas las tablas. *(R7)*
**Verification:** `supabase db reset` deja la BD sembrada; advisors sin críticos; tipos generados; grep del build limpio.

---

## Risks & Dependencies

- **Ledger de treats (alto).** Idempotencia, no-negativo y concurrencia. Mitigación: KTD2/KTD3 + suite de U5 con caso concurrente; función `SECURITY DEFINER` y mutación solo server-side.
- **Fuga de secretos (alto).** Una var con prefijo `VITE_` acaba en el cliente. Mitigación: separación `*.server.ts`, grep del build (U6), service-role solo en `server.ts`.
- **Deriva esquema↔mock (medio).** Si el esquema no refleja las shapes, el cableado posterior se complica. Mitigación: KTD4 (nombres fieles) y revisión contra `src/data/*.ts`.
- **Dependencias externas:** cuenta/organización Supabase para crear el proyecto; Supabase CLI instalado; acceso a las Environment Variables de Vercel.

---

## Open Questions (diferidas a implementación)

- `kind`/`estado`/`tipo` como `CHECK` de texto o como `ENUM` de Postgres: decidir en U3 según comodidad de evolución.
- Política exacta de `on delete` en las FKs (cascade vs restrict) para `bookings`/`chat`: ajustar en U3.
- Si conviene una vista `mis_treats` (enviados/recibidos/canjes) ya en EPIC 0 o dejarla para EPIC 4: por defecto, dejarla para EPIC 4 (consumo), aquí solo las tablas.

---

## Sources & Research

- Plan maestro `docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md` (U1, U2, ERD, KTDs) y `TODOS.md` (EPIC 0).
- Exploración del repo: stack TanStack Start + React 19 + Vite + Tailwind v4; datos mock en `src/data/*` con shapes `Walker`/`Reserva`/`ChatMsg`/`Treat`/`Canje`; patrón `createServerFn` en `src/lib/api/example.functions.ts`; sin Supabase/auth/tests previos.
- Sin base de aprendizajes institucional (`docs/solutions/` ausente). Candidatos a capturar tras esta EPIC: contrato server-only de secretos, diseño del ledger con saldo materializado, políticas RLS de catálogo-público / datos-privados.
