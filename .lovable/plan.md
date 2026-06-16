# Plan: petbnb — prototipo de demo

App web móvil-first en español que conecta dueños con paseadores vecinos. Sin login, sin BD, sin pagos. Datos sembrados, matching simulado, mapa real con Leaflet. Foco absoluto en confianza y calidad visual.

## Stack y dependencias

- TanStack Start (ya en el template), TypeScript, Tailwind v4.
- `leaflet` + `react-leaflet` para el mapa real (OpenStreetMap, sin API key). Fallback SVG si fallara.
- `framer-motion` para microinteracciones (hueso que rebota, confeti, aparición de tarjetas, transiciones).
- Tipografía Nunito vía `<link>` en `__root.tsx` + token `--font-display` en `src/styles.css`.

## Sistema de diseño

En `src/styles.css` (`@theme`):
- `--color-cream: #FBF7F0` (fondo)
- `--color-brand: #2E7D5B` (verde)
- `--color-coral: #FF7A59` (SOS, treats)
- `--color-ink: #1F2421` (texto)
- Tokens semánticos shadcn mapeados (`--background`, `--primary`, etc.).
- Radius 16px, sombras suaves, espaciado generoso.
- Animaciones custom: `bone-drop`, `confetti`, `shimmer`, `paw-trail`.

## Datos sembrados

`src/data/walkers.ts` con 12 paseadores. Cada uno:
- id, nombre, foto (`https://i.pravatar.cc/300?img=N`), barrio, bio cálida en 1ª persona (2-3 frases, tono natural sin clichés), especialidades (tags: ansiosos, razas-grandes, cachorros, mayores, medicación, sin-correa, reactivos, etc.), distancia_km, disponible_ahora, tiempo_respuesta, rating (4.6-5.0), num_resenas, paseos_completados, verificado, anios_experiencia, galería (2-3 URLs de Unsplash dog-walking), 2 reseñas con nombre+inicial.
- ≥3 paseadores con `disponible_ahora=true` Y `distancia_km<2` para que SOS nunca salga vacío.
- Perfiles diversos cubriendo los casos del brief.

Bios y reseñas escritas al nivel de los ejemplos del brief (replicando tono, no copiando).

## Motor de matching (`src/lib/matching.ts`)

- Diccionario de keywords español → tags (golden, ansioso, nervioso, reactivo, cachorro, mayor, grande, medicación, etc.).
- Normaliza el texto del dueño (lowercase, sin tildes), extrae tags coincidentes.
- Puntúa cada paseador: suma por tag coincidente + rating + cercanía + verificado.
- Devuelve top 5 con `score 0-100` y `explicacion` generada por plantilla mencionando los atributos detectados ("Tu golden ansioso encaja con Ana porque...").
- Modo SOS: filtra `disponible_ahora && distancia_km<2`, luego ordena, máx 3.

## Rutas (TanStack file-based)

```
src/routes/
  __root.tsx              (shell, fuente Nunito, fondo cream)
  index.tsx               (Home)
  buscando.tsx            (Loading con skeleton + microcopy rotando)
  resultados.tsx          (Lista rankeada, lee query del search param)
  paseador.$id.tsx        (Detalle)
  confirmar.$id.tsx       (Confirmar paseo)
  paseo.$id.tsx           (Seguimiento en vivo, mapa Leaflet)
  completado.$id.tsx      (Resumen + treat estrella)
```

Estado entre pantallas via search params (texto del dueño, modo sos/planificado, duración).

## Pantallas (detalle)

**Home** (`index.tsx`): logo 🐾 petbnb, claim cálido, textarea grande con placeholder de ejemplo, contador, botón verde "Buscar paseador" (activo ≥10 chars) que navega a `/buscando?q=...`, botón coral grande "🚨 Necesito ayuda ahora" → `/buscando?q=...&modo=sos` (si textarea vacía, query genérica). Bajo el fold: fila horizontal de avatares de "vecinos cerca de ti" con nombre+barrio.

**Buscando** (`buscando.tsx`): skeleton con shimmer 2s, microcopy rotando cada 700ms. Redirige a `/resultados` con los mismos params.

**Resultados** (`resultados.tsx`): tarjetas con foto, nombre, barrio, distancia, ⭐+reseñas, badge "Vecino verificado ✓", anillo SVG de compatibilidad %, explicación IA específica, botón "Gracias 🦴" (animación hueso + estado local "enviado"). Primera tarjeta con badge "Mejor match". Aparición escalonada. Botones flotantes "Buscar de nuevo" y SOS.

**Detalle** (`paseador.$id.tsx`): foto grande arriba, galería horizontal (2-3 fotos), bio, chips de especialidades, stats (paseos, años, tiempo respuesta), reseñas en cards, sticky bottom con CTA "Contactar" (→ `/confirmar/$id`) + "Gracias 🦴".

**Confirmar** (`confirmar.$id.tsx`): tarjeta de reserva con foto+nombre+badge+rating del paseador, nombre del perro (input rápido o derivado del texto), "Hoy, 18:30", selector duración 30/45/60, barrio, punto de recogida, nota cálida del paseador. Botón "Confirmar paseo" → animación check+huellas → `/paseo/$id`.

**Seguimiento** (`paseo.$id.tsx`): la estrella.
- Header sticky: "Paseo en curso · Nala con Ana" + cronómetro + barra de progreso.
- Mapa Leaflet con tiles OSM, centrado en un barrio (coords de Madrid Chamberí ~40.43, -3.70). Polyline con ~20 puntos simulando recorrido por calles. Marcador inicio 🏠. Marcador animado del paseador (DivIcon con foto circular) interpolando por la ruta cada 200ms durante ~25s en bucle.
- Card inferior: ETA, distancia (sube), línea de estado que cambia ("Han salido del portal" → "Paseando tranquilos por el parque" → "De vuelta a casa").
- A los ~10s: toast + card con foto Unsplash del perro y mensaje "Ana te ha enviado una foto 📸 — '¡Todo perfecto!'".
- Botones "Mensaje" y "Llamar" (visuales).
- Componente `<WalkMap />` con dynamic import (Leaflet es client-only); fallback `<WalkMapSVG />` si falla.
- CTA discreto "Finalizar paseo" → `/completado/$id`.

**Completado** (`completado.$id.tsx`): resumen — duración real, distancia total, mini-mapa con la ruta completa, hora fin. Mensaje del paseador. Botón grande coral "Dale las gracias con un treat 🦴" → animación lluvia de huesos destacada → "Gracias enviado 🦴 ✓ · Ana ha recibido tu treat". CTA secundarios "Valorar el paseo" (5 estrellas visuales) y "Volver al inicio".

## Imágenes y fallbacks

- Avatares: `https://i.pravatar.cc/300?img=N` (N único por paseador).
- Galería y check-in: URLs concretas de Unsplash de personas paseando perros / goldens.
- Componente `<SafeImage>` con `onError` → avatar de iniciales con fondo verde marca. Nunca huecos grises.

## Detalles técnicos

- Leaflet CSS importado en `src/styles.css` vía paquete instalado (`leaflet/dist/leaflet.css`).
- `react-leaflet` solo se renderiza tras montar (guard `typeof window`).
- SEO: `head()` por ruta con título y descripción en español.
- Todo el copy revisado para español natural con tildes correctas.

## Orden de implementación

1. Tokens de diseño, fuente, shell `__root.tsx`.
2. Datos sembrados + motor de matching + `<SafeImage>`.
3. Home → Buscando → Resultados → Detalle.
4. Confirmar → Seguimiento (Leaflet) → Completado.
5. Pulido: animaciones (hueso, confeti, huellas), microcopy, transiciones.
