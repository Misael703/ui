# UI Kit v3.7.0 — `FilterBar summary` + receta de página de listado

**Origen:** estandarizar filtros de las 7 páginas CRUD de despachos (Card + `.app-filter-grid` + `FormField` hechos a mano). Decisión con revisión de un segundo agente: `summary` para el conteo (no es acción); switcher en `TableToolbar` arriba ("cómo veo") y `FilterBar` abajo ("qué veo"); conteo SIEMPRE en `summary`.
**Branch:** `feat/filterbar-summary` (local; push/PR/release con OK explícito).

## Tareas
- [x] T1 — Test rojo: slot `summary` (orden fields → summary → actions; solo si se provee); CSS `margin-left:auto` + `min-height: var(--field-min-h)`; padding de `.table-surface__bar > .filter-bar`.
- [x] T2 — `FilterBar summary` + CSS; padding dentro del toolbar del DataTable.
- [x] T3 — Story `Receta: página de listado` (Patterns/Filters) con switcher, conteo, Limpiar condicional.
- [x] T4 — DESIGN.md (List-page recipe) + CHANGELOG 3.7.0 + bump.
- [x] T5 — Suite + build + tsc; Storybook a 1280 y 760: summary a 16px del borde y centrado en la banda de controles (36px) en ambos; a 760 los campos envuelven a 2 filas y el summary sigue alineado con la última.

## Review
**Tests:** 1147 (2 nuevos). tsc limpio; lint solo warnings preexistentes (`label-has-for`). Build exit 0.
**Status:** commit local. PENDIENTE push + PR + release 3.7.0, aguardando OK. Después: migración de despachos (7 páginas) como PR aparte.
