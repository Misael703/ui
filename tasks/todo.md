# DataTable Column.truncate (consumer-driven: despachos) — 2026-07-02

## Problema
`table-layout:auto` + celda con string largo (peor sin espacios) → la columna se
estira y revienta el ancho de la tabla (scroll horizontal, layout roto). El
`width` del `<td>` es solo hint en auto-layout; el ellipsis base ya estaba pero
es inerte para acotar ancho.

## Solución
`Column.truncate?: boolean | number`. Cap DURO en un wrapper interno con
`max-width` (var `--table-cell-max`, del `width` o 240px default). true=1 línea
ellipsis, n=clamp n líneas. overflow-wrap:anywhere rompe tokens sin espacios.
title nativo en celdas string; JSX = consumer pone el suyo. No aplica en cards.

## Done
- [x] `Column.truncate` + JSDoc
- [x] Render: title en td + wrapper `.table__cell-clip[--line|--clamp]`, helper clipStyle (var inline)
- [x] CSS: clip classes + reset en @media cards
- [x] Story `TruncadoPorColumna` (true, string sin espacios, clamp 2)
- [x] 5 tests unit (line, clamp, title string vs JSX, sin-truncate regresión, CSS guards)
- [x] tsc + suite 813 verde + build (truncate en d.ts) + smoke:ci exit 0
- [x] Headless: CON feature tabla 638≤640 sin overflow; PRE-feature 1554 (blowout). Clamp 2 líneas. Screenshot OK.

## Review
Shipeado en rama feat/datatable-column-truncate, v1.68.0. API aditiva, cero
regresión (columnas sin truncate byte-idénticas). Smoke gate: truncate es campo
del Column existente, no export nuevo → no toca ENTRIES. Pendiente: PR + review;
release solo con OK explícito.
