# UI Kit v3.2.0 — DataTable `fillHeight` + scroll-edge shadows por estado

**Origen:** auditoría de scrolls del reporte "Detalle de despachos" (despachos-ferreteria, 2026-09-04). Solo las piezas del kit.
**Branch:** `feat/datatable-fill-scroll-edges` (desde main; local, push/PR/release con OK explícito).

## Decisiones aprobadas
- **Fix sombras de scroll:** el patrón Lea Verou (background-attachment local) muere cuando el scroll vive en `.table-wrap__scroll` (modo `maxHeight` y overlay) y falla con 2 ejes. Reemplazo: hook interno `useScrollEdges` (scroll pasivo + ResizeObserver) → clases `has-more-{left,right,down}` en el wrap → `::after` overlay con gradientes por variable. Aplica a los 3 modos.
- **`fillHeight`:** prop booleana; activa el modo acotado sin valor. Wrap = columna flex `height:100%; flex:1; min-height:0`; scroller `flex:1; min-height:0`. Con toolbar, `.table-surface--fill`. `virtualizeRows` lo acepta. Contrato: el padre tiene alto definido.
- Hook NO exportado del barrel (sin tocar smoke/gallery).

## Tareas
- [x] T1 — Tests rojos: `DataTable.test` (estructura fill, sin max-height inline, surface fill), `DataTableVirtual.test` (virtual con fill), `DataTableScrollEdges.test.tsx` (clases por scroll/overflow en bounded y unbounded, edge inferior).
- [x] T2 — `src/hooks/useScrollEdges.ts` + wiring en `DataTable.tsx` (scrollRef siempre en el scroller real; `bounded = maxHeight != null || fillHeight`).
- [x] T3 — CSS: quitar capas de fondo del wrap; `::after` con `--edge-l/r/b`; `.table-wrap--fill` / `.table-surface--fill`.
- [x] T4 — Story `DataTable` "Fill height (scroll region)": contenedor 520px, 16 columnas anchas, paginación abajo. Verificar también "Virtualizado" (maxHeight).
- [x] T5 — Suite + lint + build; Storybook + Playwright: capturas en scroll 0 / medio / final (H y V).
- [x] T6 — DESIGN.md + CHANGELOG 3.2.0 + bump. Commit local. Reportar stories a revisar.

## Review
**Tests:** 1112 unit (nuevos: `DataTableScrollEdges.test.tsx` ×6, `fillHeight` ×3 en DataTable.test, virtual+fill ×1), eslint sin errores (5 warnings preexistentes en las stories), tsc limpio, `npm run build` verde.
**Chromium (Storybook + Playwright):** story Fill height: `has-more-right`+`has-more-down` al inicio, `has-more-left` al final, sin `max-height` inline, scroller 417px en contenedor 520; al angostar el viewport el ResizeObserver recalcula (left+right). Ancha acotada con toolbar y Virtualizada (maxHeight) también muestran pistas. Recortes 2x light/dark: sombras visibles, intensidad = token `--edge-shadow`.
**Hallazgo de paso:** el scroll horizontal máximo de la story es 414px (los anchos de columna se compactan), no un bug.
**Status:** commit local en `feat/datatable-fill-scroll-edges`. PENDIENTE push + PR + release 3.2.0, aguardando OK explícito.
