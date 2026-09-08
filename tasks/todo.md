# UI Kit v3.8.0 — `FilterBar layout` (inline · collapse · drawer) + chips de aplicados

**Origen:** `visibleCount` colapsaba aunque el set cupiera en una línea (captura 2026-09-08); y el "cómo se muestran los campos" estaba repartido en props implícitas (`visibleCount`, `mobile`, `activeCount`). Decisión: modos de primera clase, general (no para un consumidor).
**Branch:** `feat/filterbar-layouts` desde main (3.7.0). Push/PR/release con OK explícito.

## Tareas
- [x] T1 — Medición de capacidad: hook interno `useFilterCapacity` (ResizeObserver sobre la barra + grupo final; `floor((bar − end + gap) / (min + gap))`). Tests con RO stubeado.
- [x] T2 — `layout: 'inline' | 'collapse' | 'drawer'` (default inline) y `mobileLayout` (default drawer). `collapse`: `visibleCount` número | `'auto'`, colapsa SOLO si el set no cabe; con número, `min(visibleCount, capacidad)`. `drawer`: campos tras el embudo; slot `pinned` siempre visible.
- [x] T3 — `applied: AppliedFilter[]` ({ key, label, value, onRemove }) → fila de `Chip`s descartables bajo los campos; badge del embudo y del toggle derivados de `applied` (fallback a `activeCount`/`hiddenActiveCount` deprecados). Dev warning: `layout="drawer"` sin `applied`.
- [x] T4 — Deprecaciones compatibles: `visibleCount` sin `layout` ⇒ `collapse`; `mobile` ⇒ `mobileLayout`; `activeCount`/`hiddenActiveCount` si no hay `applied`. Tests de compat.
- [x] T5 — Playground de listado: controls `layout`, `mobileLayout`, `visibleCount` (auto | 1–7), `applied` (chips). Story compuesta sin cambios de forma.
- [x] T6 — DESIGN.md (escala "cuánto escondes": inline → collapse → drawer+pinned; drawer exige applied), CHANGELOG 3.8.0, bump package.json, tests, tsc, lint, build, Chromium 320/390/1100.

## Review
1197 tests, tsc 0, lint 0 errores. Chromium 1100/700/1600/320: inline envuelve; collapse auto muestra los que caben y re-mide al redimensionar (4 → 1 → 6 campos); collapse con tope 2 y 4 campos que caben muestra los 4 sin toggle (el caso reportado); drawer con Buscar pinned + embudo badgeado + chips; móvil drawer con chips. Chips en registro neutro (el azul sólido competía con la primaria). Pendiente OK para push/PR/release 3.8.0.
