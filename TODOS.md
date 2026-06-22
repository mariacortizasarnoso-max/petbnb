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

## EPIC 2 — Identidad y paseadores · Responsable: ______

Login ligero (sin muro), perfil del dueño + perro, paseadores desde la BD.

- [ ] **U3** — Auth ligera (sesión silenciosa/anónima; magic link opcional al reservar; el login NUNCA bloquea el flujo de búsqueda) + perfil + perro
- [ ] **U4** — Paseadores y reseñas desde Postgres (hooks React Query); estados de carga y vacío

Estado EPIC: [ ] Cerrada y en `development`

---

## EPIC 3 — Reservas y chat · Responsable: ______

Reservas (paseo y estancia) que persisten; chat persistente; cierre por el cuidador.

- [ ] **U6** — Persistencia de reservas (paseo + estancia) + `closeWalk` (el cuidador cierra el paseo, server-side) + listados en "Mis reservas"
- [ ] **U7** — Persistencia de chat + auto-respuesta del cuidador (server-side); lista de mensajes

Estado EPIC: [ ] Cerrada y en `development`

---

## EPIC 4 — Economía de treats · Responsable: ______

Saldo real (ganar/regalar/canjear), sin negativos, pago simulado. Autónoma (solo necesita EPIC 0).

- [ ] **U8** — Ledger/saldo de treats server-authoritative (guard de no-negativo, idempotencia); `sendGift`, `redeemProduct`, `earn`, `getBalance`; cablear `treats.$id`, `canjear.$id`, `tienda`, `mis-treats`, `completado`, `PaymentMethodSelector`

Estado EPIC: [ ] Cerrada y en `development`

---

## Reparto sugerido (2 personas)

| Orden | Persona A (backend/IA) | Persona B (flujos de producto) |
|---|---|---|
| 1º | EPIC 0 — Fundación | EPIC 1 — Matching (arranca contra mock) |
| 2º | EPIC 4 — Treats | EPIC 2 — Identidad y paseadores |
| 3º | apoyo / pruebas | EPIC 3 — Reservas y chat |

Alternativa por capas: **A = backend** (EPIC 0 + 1 + 4) · **B = pantallas de usuario** (EPIC 2 + 3).

---

## Recortado de la v1 (no construir ahora)

- [ ] App/rol de cuidador (cuenta propia, disponibilidad, aceptar/rechazar)
- [ ] Auth multiusuario + RLS endurecida
- [ ] Pagos reales (Stripe)
- [ ] Realtime / GPS en vivo
- [ ] Notificaciones push
- [ ] Fulfillment real con partners (Kiwoko / Dr Bimix / Maikai)
