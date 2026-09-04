# UI Kit v3.1.0 — Dataviz semantic tokens (`--chart-*`)

**Pedido:** consumer-driven desde despachos-ferreteria (dashboard de reportes). Cierra el ítem P3 (dark mode) de la auditoría ERP con consumidor real.
**Branch:** `feat/chart-tokens` (local; push/PR solo con OK explícito).

## Decisiones aprobadas (2026-09-02)
- Capa semántica `--chart-*` que **aliasa** primitivos existentes; cero hex nuevo en light.
- `DESIGN.md` manda sobre los seeds: verde → escala green del kit, ámbar → gold (yellow-700), navy → `--color-primary-600`.
- **No** se agrega `--focus-ring` (colisión de tipo con la familia box-shadow `--focus-ring-*`); el consumidor usa `--border-focus`.
- Ambas paletas: base define light + dark; El Alba hereda por alias de escala (sin override).
- Valores planos (hex / alias de escala), sin `color-mix`, para que el test los resuelva y el consumidor los pase a SVG.

## Tareas
- [x] T1 — `tests/ChartTokens.test.tsx` (rojo): 6 tokens definidos en base light + dark; resuelven a hex plano en base y El Alba, ambos temas; ≥ 3:1 vs `--bg-surface` en los 4 mapas.
- [x] T2 — `src/styles/_root.css`: bloque `--chart-*` en `:root` (alias) + override en `:root[data-theme="dark"]`.
- [x] T3 — Test verde; validador dataviz sobre los valores finales (light + dark, ambas paletas).
- [x] T4 — `DESIGN.md` (sección dataviz) + `CHANGELOG.md` 3.1.0 + bump `package.json`.
- [x] T5 — Suite completa + build; verificación visual de swatches light/dark (scratch, no se commitea).
- [x] T6 — Commit local. Reportar. Esperar OK para push/PR.

## Review
**Tests:** 1102 unit (31 nuevos en `ChartTokens.test.tsx`), eslint limpio, `npm run build` verde; tokens presentes en `dist/styles.css` y `dist/tokens.css`.
**Validador dataviz:** contraste ≥ 3:1 vs surface en las 4 combinaciones; banda de luminosidad dark OK (El Alba) — los FAIL de separación adyacente aplican a sets categóricos, no a roles (anotado en el comentario del token).
**Visual:** swatches + mini chart SVG en Chromium (scratch, no commiteado): valores computados coinciden con el diseño; flip de tema re-tinta primary/positive/negative.
**Ajuste de plan:** el test dejó de exigir los 6 roles en el bloque dark (3 se mantienen a propósito); el contrato real lo pinea el mapa fusionado.
**Status:** SHIPPED — PR #150 squash-merged (`528e0d4`), Release v3.1.0, npm latest = 3.1.0 (2026-09-02).
