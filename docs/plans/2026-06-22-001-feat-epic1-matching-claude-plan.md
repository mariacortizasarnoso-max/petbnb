---
title: "EPIC 1 — Matching inteligente con Claude"
date: 2026-06-22
type: feat
depth: Standard
origin: docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md
epic: EPIC 1 · U5
---

# feat: EPIC 1 — Matching inteligente con Claude

**Target repo:** `petbnb` (rama `epic/0-fundacion-cierre`) · **Construcción:** Claude Code · **Despliegue:** Vercel
**Fecha:** 2026-06-22
**Tipo:** feat
**Profundidad:** Standard
**Origen:** `docs/plans/2026-06-17-001-feat-petbnb-funcional-supabase-plan.md` (plan maestro, unidad U5) y `TODOS.md` (EPIC 1)

---

## Summary

EPIC 1 convierte el matching en algo real: sustituye la llamada determinista de palabras clave en `src/routes/resultados.tsx` por una server function que llama a Claude con salida estructurada (tool use), aplica el filtro SOS en servidor, valida los IDs devueltos contra el pool real, y cae al fallback determinista (`matching.ts`) si Claude tarda más de 12 s o falla. El pool de paseadores en esta EPIC es el array mock `WALKERS` (`src/data/walkers.ts`); la migración a Supabase es EPIC 2.

La estrategia de concurrencia es **Option B**: `buscando.tsx` llama a la server function directamente (reemplazando el `setTimeout` hardcoded), inyecta el resultado en React Query con `setQueryData`, y después navega. `resultados.tsx` lee del caché de forma síncrona; si alguien llega directo por URL, el `queryFn` vuelve a llamar a la server function (degraded pero funcional).

---

## Problem Frame

Hoy `resultados.tsx` llama a `matchWalkers` del lado del cliente (`src/lib/matching.ts`): determinista por palabras clave, ejecuta en el browser, y la clave de Anthropic nunca se usa. El matching actual produce resultados aceptables pero genéricos; Claude puede generar explicaciones específicas al texto del dueño ("tienes un golden ansioso con artritis, aquí explico por qué Sofía encaja") que son la diferencia visible en una demo.

El riesgo principal: **latencia variable**. Claude puede tardar 1–12 s según la carga. La pantalla `buscando.tsx` ya tiene una animación de espera con microcopy (hoy termina en un `setTimeout` hardcoded de 2000–2400 ms); esta EPIC la convierte en una espera real que termina cuando llega la respuesta.

Segunda restricción: **la clave `ANTHROPIC_API_KEY` nunca llega al cliente**. La llamada a Claude vive en una `createServerFn`, que TanStack Start tree-shakes del bundle del cliente (patrón ya establecido en `src/lib/api/example.functions.ts` y `src/lib/config.server.ts`).

---

## Scope Boundaries

### En alcance (EPIC 1 · U5)
- Instalar `@anthropic-ai/sdk`.
- Crear `src/lib/server/matching.server.ts` con la server function `matchWalkersServer`:
  - Input: `{ q: string, modo: "planificado" | "sos" }`.
  - Pool: `WALKERS` mock (no Supabase — eso es EPIC 2).
  - Filtro SOS en servidor: `disponible_ahora && distancia_km < 2`, cap 3 resultados.
  - Llamada a Claude con tool use (structured output): `[{ walkerId, puntuacion, explicacion }]`.
  - Validación de IDs: descartar cualquier `walkerId` que no exista en el pool filtrado.
  - Timeout 12 s: `Promise.race([claudeCall, timeout(12000)])`.
  - Fallback: si Claude lanza error o timeout, llamar `matchWalkers(q, mode)` de `matching.ts` y devolver su resultado.
- Modificar `src/routes/buscando.tsx`: reemplazar `setTimeout` → llamar a `matchWalkersServer`, inyectar resultado en RQ con `queryClient.setQueryData(['match', q, modo], result)`, luego `navigate`.
- Modificar `src/routes/resultados.tsx`: reemplazar la llamada síncrona a `matchWalkers` por `useQuery({ queryKey: ['match', q, modo], queryFn: () => matchWalkersServer({ data: { q, modo } }) })`.
- Añadir test unitario `src/lib/server/matching.server.test.ts` (ver escenarios de prueba).

### Decisiones confirmadas
- **DC-1. Option B (async en buscando).** La server function se llama en `buscando.tsx`, no en `resultados.tsx`. El usuario ve la animación de espera real hasta que Claude responde (o el fallback dispara). Razón MVP: sin skeleton en `resultados.tsx`, UX más limpia, la pantalla de resultados siempre tiene datos al montar.
- **DC-2. Pool mock para EPIC 1.** `WALKERS` de `src/data/walkers.ts`. Migración a Supabase → EPIC 2. Permite implementar EPIC 1 de forma completamente independiente.
- **DC-3. Modelo `claude-sonnet-4-6`.** Velocidad suficiente para una demo; escalar a `claude-opus-4-8` solo si la calidad de las explicaciones es insatisfactoria tras las pruebas.
- **DC-4. Tool use para structured output.** Claude recibe la herramienta `rankWalkers` con esquema estricto y devuelve una llamada a esa herramienta. El handler extrae `tool_use` del primer bloque de tipo `tool_use`. Si no hay bloque de ese tipo, se trata como fallo → fallback.
- **DC-5. `staleTime: Infinity` en resultados.** El `useQuery` en `resultados.tsx` nunca refetcha si el caché ya está poblado desde `buscando.tsx`. Un reload manual limpia el caché y fuerza un nuevo fetch.

### Fuera de alcance
- Supabase como pool de paseadores (EPIC 2).
- Auth / filtro por ubicación real del usuario (necesita EPIC 2).
- Streaming de la respuesta de Claude (latencia ya resuelta con el fallback).
- Pantalla de error explícita en `resultados.tsx` (el fallback garantiza que siempre hay resultados).

---

## Requirements

- **R1.** La clave `ANTHROPIC_API_KEY` nunca aparece en el bundle del cliente ni en los logs del browser.
- **R2.** En modo `planificado`, la server function devuelve ≤5 paseadores ordenados por compatibilidad con el texto libre del dueño, con una `explicacion` específica generada por Claude.
- **R3.** En modo `sos`, solo se incluyen paseadores con `disponible_ahora=true` y `distancia_km < 2`; el cap es 3.
- **R4.** Ningún `walkerId` alucinado por Claude llega a la UI; los IDs no encontrados en el pool se descartan silenciosamente.
- **R5.** Si Claude tarda >12 s o lanza un error, la función devuelve el resultado del fallback determinista; el usuario no ve ningún error.
- **R6.** El tiempo de espera percibido en `buscando.tsx` es el tiempo real de la llamada a Claude (o el fallback si dispara antes de 12 s).
- **R7.** `resultados.tsx` muestra los resultados sin skeleton cuando llega desde `buscando.tsx`; si el usuario navega directo a `/resultados`, la pantalla hace la llamada y muestra un estado de carga breve.
- **R8.** El tipo de datos devuelto por la server function es compatible con el tipo `Match` que ya consume `resultados.tsx` (`{ walker: Walker, score: number, matchedTags: string[], explicacion: string }`).

---

## Key Technical Decisions

- **KTD1 — `createServerFn` con `method: "POST"`.** Patrón ya establecido en `src/lib/api/example.functions.ts`. El handler body corre server-only; imports dentro del handler (como `@anthropic-ai/sdk`) se tree-shaken del cliente. Secretos leídos con `getServerConfig()` de `src/lib/config.server.ts` (R1).

- **KTD2 — Tool use para structured output.** Anthropic recomienda tool use (en lugar de `output_config.format`) para extraer arrays tipados con alta fiabilidad. El tool `rankWalkers` tiene el esquema:
  ```
  {
    rankings: Array<{
      walkerId: string,   // debe ser un ID existente en el pool
      puntuacion: number, // 0–100
      explicacion: string // 1–2 frases específicas al texto del dueño
    }>
  }
  ```
  El handler extrae el bloque `tool_use` y parsea `rankings`. Si el bloque no existe o el parse falla → fallback.

- **KTD3 — Prompt de sistema conciso.** El prompt enumera los paseadores del pool (id, nombre, barrio, tags, rating, disponible) y pide a Claude que seleccione y ordene los más compatibles con el texto del dueño, explicando por qué encaja cada uno con el perro descrito. Máx. 5 paseadores para planificado, 3 para SOS. El pool SOS ya llega pre-filtrado al prompt.

- **KTD4 — Timeout con `Promise.race`.** `new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))` corriendo en paralelo a la llamada a Claude. Si el timeout gana, el `catch` llama al fallback.

- **KTD5 — `queryClient.setQueryData` en buscando.tsx.** React Query v5: `queryClient.setQueryData(['match', q, modo], result)` antes de `navigate`. En `resultados.tsx`, `useQuery({ queryKey: ['match', q, modo], queryFn: ..., staleTime: Infinity })` devuelve el dato sincronamente desde el caché.

- **KTD6 — Compatibilidad de tipo `Match`.** La server function construye objetos `Match` completos: busca el `Walker` en `WALKERS` por ID, asigna `score: puntuacion`, `matchedTags: []` (Claude no devuelve tags, la UI no los muestra), `explicacion` del ranking de Claude. El tipo importado en `resultados.tsx` sigue siendo `Match` de `src/lib/matching.ts`.

---

## Implementation Units

### U1 — Server function `matchWalkersServer`

**Archivos a crear:**
- `src/lib/server/matching.server.ts` — server function principal

**Archivos a modificar:**
- `package.json` — añadir `@anthropic-ai/sdk`

**Patrón a seguir:**
- `src/lib/api/example.functions.ts` — estructura de `createServerFn` + `.inputValidator` + `.handler`
- `src/lib/config.server.ts` — acceso a `anthropicApiKey`
- `src/lib/matching.ts` — fallback: llamar `matchWalkers(q, mode)` directamente

**Estructura lógica del handler** (orientación, no código prescrito):
1. Leer `anthropicApiKey` de `getServerConfig()`.
2. Filtrar `WALKERS` según el modo (SOS: `disponible_ahora && distancia_km < 2`; planificado: pool completo).
3. Si el pool SOS queda vacío → devolver `matchWalkers(q, 'sos')` inmediatamente (fallback, no error).
4. Construir el prompt de sistema listando los paseadores del pool y el texto del dueño.
5. Llamar a `anthropic.messages.create` con tool `rankWalkers`, modelo `claude-sonnet-4-6`, `max_tokens: 1024`.
6. `Promise.race` contra un timeout de 12000 ms.
7. Extraer el bloque `tool_use` con name `rankWalkers`; parsear `input.rankings`.
8. Filtrar rankings cuyo `walkerId` no esté en el pool (IDs alucinados).
9. Mapear a `Match[]`: `{ walker: WALKERS.find(w => w.id === r.walkerId)!, score: r.puntuacion, matchedTags: [], explicacion: r.explicacion }`.
10. Si cualquier paso 5–9 lanza → `catch` → `matchWalkers(q, mode)` como fallback.

**Dependencia:** ninguna EPIC previa (usa solo `WALKERS` mock y la clave de Anthropic ya en `.env`).

---

### U2 — Cablear buscando.tsx y resultados.tsx

**Archivos a modificar:**
- `src/routes/buscando.tsx`
- `src/routes/resultados.tsx`

**buscando.tsx — cambios:**
- Importar `matchWalkersServer` de `@/lib/server/matching.server`.
- Importar `useQueryClient` de `@tanstack/react-query`.
- Reemplazar el `useEffect` actual por uno async que:
  1. Arranca el intervalo del microcopy (igual que hoy).
  2. Llama `await matchWalkersServer({ data: { q, modo } })`.
  3. `queryClient.setQueryData(['match', q, modo], result)`.
  4. `navigate({ to: '/resultados', search: { q, modo } })`.
- Gestionar el estado de error (si la server function lanza, navegar igualmente; `resultados.tsx` llamará de nuevo).
- Limpiar el intervalo en el cleanup de useEffect (igual que hoy).

**resultados.tsx — cambios:**
- Eliminar `import { matchWalkers } from "@/lib/matching"` y la llamada síncrona.
- Añadir `import { matchWalkersServer } from "@/lib/server/matching.server"`.
- Añadir `import { useQuery } from "@tanstack/react-query"`.
- Reemplazar `const matches = matchWalkers(q, modo)` por:
  ```tsx
  const { data: matches = [], isPending } = useQuery({
    queryKey: ['match', q, modo],
    queryFn: () => matchWalkersServer({ data: { q, modo } }),
    staleTime: Infinity,
  });
  ```
- Añadir un guard mínimo: si `isPending`, mostrar el mismo skeleton de `buscando.tsx` o un spinner inline (solo visible en navegación directa por URL).

---

## Test Scenarios

Archivo: `src/lib/server/matching.server.test.ts`

Los tests unitarios mockean el SDK de Anthropic (`vi.mock('@anthropic-ai/sdk')`) y prueban el handler directamente.

| ID | Descripción | Entrada | Resultado esperado |
|----|-------------|---------|-------------------|
| T1 | Happy path planificado | `q="golden ansioso"`, `modo="planificado"`, Claude devuelve 3 rankings válidos | Array de 3 `Match` con walker correcto, score ≥ 0, explicacion no vacía |
| T2 | Happy path SOS | `q="ayuda urgente"`, `modo="sos"`, hay walkers con `disponible_ahora=true && distancia_km<2` | Solo walkers SOS-elegibles, ≤3 resultados |
| T3 | Fallback por timeout | Mock de Claude que nunca resuelve, timeout 12 s reducido a 50 ms en test | Devuelve resultados del fallback determinista (≥1 match, no lanza) |
| T4 | Fallback por error de API | Mock de Claude que lanza `Error("API Error")` | Devuelve resultados del fallback, no lanza |
| T5 | IDs alucinados descartados | Claude devuelve `[{ walkerId: "fake-999", puntuacion: 95, ... }, { walkerId: walker real, ... }]` | Solo el walker real aparece en el resultado |
| T6 | Pool SOS vacío | `modo="sos"`, todos los walkers con `disponible_ahora=false` o `distancia_km≥2` | Devuelve fallback (no error, no pantalla vacía) |
| T7 | Respuesta sin bloque tool_use | Claude devuelve un mensaje de texto plano (sin `tool_use`) | Fallback determinista, no lanza |
| T8 | `matchedTags` siempre array vacío en path Claude | Claude devuelve rankings válidos | `m.matchedTags` es `[]` en todos los matches |

---

## Dependencies and Risks

### Dependencias
- **EPIC 0 cerrada** ✔ — `ANTHROPIC_API_KEY` ya está en `.env.` local y en Vercel. `getServerConfig()` ya expone `anthropicApiKey`.
- **`@tanstack/react-query` v5** — ya en `package.json`. `useQueryClient` y `setQueryData` disponibles.
- **`@anthropic-ai/sdk`** — no instalado todavía; paso explícito en U1.

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Claude supera 12 s en producción | Media | Medio | Fallback garantiza resultado; ajustar timeout si se observa en prod |
| Alucinación masiva de IDs | Baja | Alto | Validación en U1 (paso 8); en el peor caso, 0 resultados válidos de Claude → fallback |
| `staleTime: Infinity` sirve resultados obsoletos si el usuario vuelve a buscar | Media | Bajo | El usuario pasa siempre por `buscando.tsx`, que llama `setQueryData` con la nueva búsqueda; el caché se sobreescribe |
| Tamaño del prompt con 12 walkers | Bajo | Bajo | ~600 tokens estimados; bien dentro de `max_tokens: 1024` + contexto del modelo |
| Latencia variable percibida en `buscando.tsx` | Media | Bajo (demo) | Microcopy y animación ya presentes; el usuario sabe que "está pensando" |

---

## Sequencing

```
[U1] Instalar SDK + crear matching.server.ts
       ↓
[U1] Tests unitarios con mock (T1–T8)
       ↓
[U2] Cablear buscando.tsx + resultados.tsx
       ↓
[Smoke test] Búsqueda manual planificado + SOS en localhost
```

U1 puede desarrollarse y testearse completamente antes de tocar las rutas. U2 depende de que U1 compile y los tests pasen.

---

## Verification Checklist

- [ ] `bun add @anthropic-ai/sdk` — sin errores de peer deps.
- [ ] `ANTHROPIC_API_KEY` no aparece en `bun run build` → análisis del bundle.
- [ ] Tests T1–T8 pasan con `bun run test`.
- [ ] Búsqueda planificada en localhost: explicaciones específicas al texto, no genéricas.
- [ ] Búsqueda SOS: solo paseadores con `disponible_ahora=true` y `distancia_km<2`.
- [ ] Simulación de timeout (reducir a 100 ms en dev): `resultados.tsx` muestra resultados del fallback, no pantalla de error.
- [ ] Navegación directa a `/resultados?q=test&modo=planificado`: pantalla carga (fetch nuevo), no falla.
- [ ] `TODOS.md` U5 marcada `[x]`, epic cerrada y subida a `development`.
