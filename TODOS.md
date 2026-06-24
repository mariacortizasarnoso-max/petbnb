# petbnb — Reparto de trabajo (EPICs)

Alcance **medio** (MVP demostrable): persistencia real + matching real con Claude.
Plan completo: `docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md`.

**Cómo usar:** marca tu nombre en `Responsable`, marca `[x]` cuando termines cada unidad,
y cierra la EPIC cuando todas sus unidades estén hechas y subidas a `development`.

**Regla de oro:** EPIC 0 se cierra y se sube **primero**. Hasta entonces, el resto trabaja
contra los datos mock que ya existen (`src/data/*`).

---

## EPIC 0 — Fundación · Responsable: María + Jorge

Crear Supabase, conectar clientes, claves en servidor, esquema + seguridad + seed.

- [x] **U1** — Proyecto Supabase + clientes (browser/anon y server/service-role) + secretos (`ANTHROPIC_API_KEY`, claves Supabase) en `.server.ts`, nunca con prefijo `VITE_`
- [x] **U2** — Esquema Postgres + RLS básica ("filas propias") + funciones SQL (`apply_treat_tx`) + seed (12 paseadores, partners, treats, reservas)

> ✔ Verificado 2026-06-22: 12 walkers, 5 treats, 3 partners, 10 products en Supabase `nwgusratfhenvlwnprpn`. RLS activa. `apply_treat_tx` desplegada. `.env` configurado localmente (DB password pendiente de añadir para `supabase db push`).

Estado EPIC: [x] Cerrada y en `development`

---

## EPIC 1 — Matching inteligente ⭐ · Responsable: Jorge

La llamada real a Claude. Es el "whoa" de la demo. Puede empezar **ya** contra mock.

- [x] **U5** — Server function `matchWalkersServer` (`src/lib/api/matching.server.ts`): structured output (tool use), filtro SOS en servidor, validación de IDs, timeout 12s, fallback determinista con `matching.ts`; cableado en `buscando.tsx` (setQueryData) y `resultados.tsx` (useQuery). Pool: WALKERS mock. Tests T1–T8 pasando.

> ✔ Verificado 2026-06-22: build limpio, SDK de Anthropic tree-shakeado del cliente (stub RPC 4.4 KB), ANTHROPIC_API_KEY nunca llega al browser. 14/14 tests verdes.

Estado EPIC: [x] Cerrada y en `feat/epic1-matching-claude`

---

## EPIC 2 — Identidad y paseadores · Responsable: María

Login ligero (sin muro), perfil del dueño + perro, paseadores desde la BD.

- [x] **U3** — Auth ligera (sesión silenciosa/anónima; magic link opcional al reservar; el login NUNCA bloquea el flujo de búsqueda) + perfil + perro
- [x] **U4** — Paseadores y reseñas desde Postgres (hooks React Query); estados de carga y vacío

> U3 (en PR): `AuthProvider`/`useAuth` abren sesión anónima al cargar (sin pantalla de login), exponen `linkEmail` (magic link, conserva el user_id) y `signOut`. Ruta `/perfil` (nombre + perro) accesible desde el icono del `Header`. RLS de `profiles`/`dogs` ya es de "filas propias" (rol `authenticated`, que las sesiones anónimas también reciben); el trigger `handle_new_user` crea profile+treat_balances sin asumir email.
> 🔴 PRERREQUISITO DE DASHBOARD: activar **Authentication → Sign In/Providers → Allow anonymous sign-ins** en Supabase. Está DESHABILITADO ahora; sin él no se crea sesión (la búsqueda sigue funcionando, pero no se guardan perfil/reservas/treats).

> U4 (en PR): `useWalkers`/`useWalker` leen `walkers`+`reviews` con anon key (RLS pública). Cableados `index.tsx` (home) y `paseador.$id.tsx` (detalle, con skeleton + "no encontrado"). `resultados.tsx` no cambia: recibe los walkers vía el server fn de matching.
> ⚠️ Handoff a Jorge (U5): el pool de `matching.server.ts` sigue usando el array `WALKERS` mock. Cuando se quiera, cambiarlo a leer de `walkers` (DB) para alinear con U4. Por ahora son datos idénticos (la BD se sembró del mock), así que no hay divergencia.

Estado EPIC: [x] **Cerrada y en `main` (producción). Verificada e2e en `petbnb-ashy.vercel.app` el 2026-06-22** (paseadores desde DB + sesión anónima sin errores de consola).

---

## EPIC 3 — Reservas y chat · Responsable: María

Reservas (paseo y estancia) que persisten; chat persistente; cierre por el cuidador.

- [x] **U6** — Persistencia de reservas (paseo + estancia) + `closeWalk` (el cuidador cierra el paseo, server-side) + listados en "Mis reservas"
- [x] **U7** — Persistencia de chat + auto-respuesta del cuidador (server-side); lista de mensajes

> U7 (en PR): `useChat`/`useThreads` leen hilos y mensajes con RLS (solo los propios); `sendMessage` (server fn `src/lib/api/chat.server.ts`, service-role) inserta el mensaje del dueño + la respuesta contextual del cuidador (lógica de palabras clave movida al servidor). `chat.$id` reescrito a DB con mensaje optimista + indicador "escribiendo"; `mensajes` lista conversaciones reales. `chat_messages` no tiene INSERT de cliente (verificado: 403) → todo escrito server-side. Validado e2e: 403 al insertar de cliente, insert server-side, lectura del dueño por RLS. `chatStore.ts` se conserva (lo usa aún `treats.$id` para el agradecimiento, U8).

> U6 (en PR): `useBookings` (crear/listar/cancelar reservas, cliente+RLS) cablea `confirmar.$id` (inserta booking), `reservas` y `reservas.$id` (leen de DB, cancelar). `paseo.$id`/`completado.$id` pasan a leer el paseador con `useWalker` y reciben el `bookingId` por search param. `closeWalk` (server fn en `src/lib/api/walk.server.ts`, service-role) transiciona `en_curso→completada` e inserta el mensaje de cierre del cuidador en el hilo de chat; idempotente. Validado e2e: insert/select de bookings con RLS, y la lógica de closeWalk a nivel de BD.
> 🔴 PRERREQUISITO: `SUPABASE_SERVICE_ROLE_KEY` en Vercel (y en `.env` local para probar). Sin ella, crear/listar/cancelar reservas funciona, pero `closeWalk` no podrá auto-completar el paseo ni escribir el mensaje de cierre. Nota: ⚠️ `**/server/**` está vetado para importar desde cliente por el wrapper de Lovable → los server fns van en `src/lib/api/*.server.ts`.

Estado EPIC: [x] **Cerrada y en `main` (producción). Verificada e2e en producción el 2026-06-22**: reservar paseo de hoy → `closeWalk` marca `completada` + mensaje de cierre (~9 s); enviar chat → el cuidador responde y persiste tras recargar. `SUPABASE_SERVICE_ROLE_KEY` configurada en Vercel.

---

## EPIC 4 — Economía de treats · Responsable: Jorge

Saldo real (ganar/regalar/canjear), sin negativos, pago simulado. Autónoma (solo necesita EPIC 0).

- [x] **U8** — Ledger/saldo de treats server-authoritative (guard de no-negativo, idempotencia); `sendGift`, `redeemProduct`, `earn`, `getBalance`; cableado `treats.$id`, `canjear.$id`, `tienda`, `mis-treats`, `completado.$id`. Pool de matching migrado de array mock a tabla `walkers` de DB (handoff U5).

> U8: `treats.server.ts` expone `getBalanceServer`, `getTransactionsServer`, `sendGiftServer` (kind='gift', guard de no-negativo vía `apply_treat_tx`), `redeemProductServer` (descuento + insert en `redemptions`). `closeWalk` acredita +50 treats al dueño al completar el paseo (idempotente: `paseo-{bookingId}`). Hooks `useTreats` y `useProducts` con React Query. `mis-treats` lee historial real de `treat_transactions` + `redemptions`. Catálogo de treats y partners/products desde DB. Pago con tarjeta sigue simulado (sin cargo en ledger). Secretos verificados: `SERVICE_ROLE_KEY` y `ANTHROPIC_API_KEY` ausentes del bundle estático.

Estado EPIC: [x] **Cerrada y en `main` (producción). PR #12 mergeado el 2026-06-24.**

---

## Reparto sugerido (2 personas)

| Orden | Persona A (backend/IA) | Persona B (flujos de producto) |
|---|---|---|
| 1º | EPIC 0 — Fundación | EPIC 1 — Matching (arranca contra mock) |
| 2º | EPIC 4 — Treats | EPIC 2 — Identidad y paseadores |
| 3º | apoyo / pruebas | EPIC 3 — Reservas y chat |

Alternativa por capas: **A = backend** (EPIC 0 + 1 + 4) · **B = pantallas de usuario** (EPIC 2 + 3).

---

## Fixes UX mobile — 2026-06-24 · PR #13→#14 · Responsable: Jorge

Revisión manual del flujo completo (matching → reserva) en móvil.

- [x] Home: label, placeholder y helper text guían al usuario con los 4 campos clave del matching (raza, carácter, servicio, cuándo)
- [x] Viewport desplazado: `overflow-x: hidden` en `html`/`body`
- [x] Badge "Mejor match": de `absolute` (solapaba ScoreRing) a barra full-width consistente con modo SOS
- [x] Perfil paseador: BottomNav oculta en `/paseador/` → botón Reservar visible; banner con degradado de fallback en lugar de iniciales
- [x] Chat iOS: input `text-base` (16px) para evitar zoom automático de Safari

Estado: [x] **En `main` (producción). PR #14 mergeado el 2026-06-24.**

---

## Recortado de la v1 (no construir ahora)

- [ ] App/rol de cuidador (cuenta propia, disponibilidad, aceptar/rechazar)
- [ ] Auth multiusuario + RLS endurecida
- [ ] Pagos reales (Stripe)
- [ ] Realtime / GPS en vivo
- [ ] Notificaciones push
- [ ] Fulfillment real con partners (Kiwoko / Dr Bimix / Maikai)
