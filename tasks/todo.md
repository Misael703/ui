# UI Kit v3.7.0 — `FilterBar summary` + receta de página de listado

**Origen:** estandarizar filtros de las 7 páginas CRUD de despachos (Card + `.app-filter-grid` + `FormField` hechos a mano). Decisión con revisión de un segundo agente: `summary` para el conteo (no es acción); switcher en `TableToolbar` arriba ("cómo veo") y `FilterBar` abajo ("qué veo"); conteo SIEMPRE en `summary`.
**Branch:** `feat/filterbar-summary` (local; push/PR/release con OK explícito).

## Tareas
- [x] T1 — Test rojo: slot `summary` (orden fields → summary → actions; solo si se provee); CSS `margin-left:auto` + `min-height: var(--field-min-h)`; padding de `.table-surface__bar > .filter-bar`.
- [x] T2 — `FilterBar summary` + CSS; padding dentro del toolbar del DataTable.
- [x] T3 — Story `Playground · página de listado` (Patterns/Filters) con controls (switcher, campos 2–7, conteo, filtros aplicados).
- [x] T3b — REGLA nueva del usuario: stories genéricas, nunca calcadas de capturas del consumidor. Reemplazadas "Fill height" + "Ancha acotada con toolbar" → `Playground · región de scroll`, "Página sin cards" → `Playground · superficies en una página`. Lección en tasks/lessons.md.
- [x] T4 — DESIGN.md (List-page recipe) + CHANGELOG 3.7.0 + bump.
- [x] T5 — Suite + build + tsc; Storybook a 1280 y 760: summary a 16px del borde y centrado en la banda de controles (36px) en ambos; a 760 los campos envuelven a 2 filas y el summary sigue alineado con la última.

- [x] T6 — Revisión pre-auditoría: summary+actions envuelven juntos (`.filter-bar__end`), `role="status"`, tests de nombre accesible (Select/Combobox/DatePicker/DateRangePicker), regla Select vs Combobox, Combobox null = sin filtro, puntero DESIGN.md, tipo preexistente en Comments.stories.
- [x] T7 — `Playground · CRUD` (Patterns/CRUD) con estado local real; destapó `.form-field` sin `min-width: 0` (overflow en Drawer de 480px) → fix + test.
- [x] T8 — Cards mobile bien hechas (decisión 2026-09-08: "para mobile prefiero cards, siempre"). `Column.mobile: 'title'|'status'|'field'|'actions'|'hidden'` reemplaza `hideOnMobile` (no publicado); `mobileLayout` default → `'cards'`; tarjeta = cabecera (título con caption + estado + checkbox) / cuerpo (label izq · valor der, hairlines) / pie (acciones a lo ancho); mismo DOM, `data-mobile` por celda + CSS grid/flex bajo 600px; surface y wrap sueltan el chrome (cards sobre canvas). Gate de virtualización pasa a `isMobile && cards` (antes `cards` a secas: con el default nuevo mataba la virtualización siempre). Tests, stories (listado, CRUD, CardLayoutMobile, playground), DESIGN.md, CHANGELOG. Fuera: "Ordenar por" en móvil (follow-up).

## Review
**Tests:** 1167 (T8: +14). tsc: 0 errores en los archivos de la rama (hay 1 error PREEXISTENTE en main en `Comments.stories.tsx`, fuera de esta rama); lint: 0 errores en la rama (2 errores preexistentes en el untracked `AppShellExplorations.stories.tsx`). Build exit 0.
**T8 verificado:** Chromium 390/320 light+dark en CardLayoutMobile, listado y CRUD: 0 overflow, zonas en orden, wrap y surface sin borde bajo 600px; label de campo numérico en DM Sans. Hallazgo: `--border-subtle` NO existe como token (las hairlines de las cards viejas nunca se pintaron); las nuevas usan `--border-default`. `.desc-list__value` también lo usa (preexistente, sin tocar). El ajuste `--table-cell-max` rechazado había quedado en 6186738 → removido aquí.
**Status:** commit local. PENDIENTE push + PR + release 3.7.0, aguardando OK. Después: migración de despachos (7 páginas) como PR aparte.
