# UI Kit v3.6.0 — `--border-on-canvas`: canto legible para el inset sobre el canvas F

**Origen:** despachos migró a 3.5.0 y adoptó `Card variant="inset"`; el inset casi no se distingue del canvas (1.09:1, ΔL .028, sin borde ni sombra). Medición del consumidor en El Alba light. Pedido consumer-driven, minor.
**Branch:** `feat/border-on-canvas` (local; PR/push solo con OK explícito).

## Decisiones
- Token `--border-on-canvas` DERIVADO: `color-mix(in oklab, var(--color-primary) P%, var(--bg-canvas))` — light P=18%, dark P=30% (en dark el inset es más claro que el canvas y un 14% cae en la luminancia del inset: 1.02:1). Definido en el base (light + dark); El Alba lo hereda resolviendo contra su propio primary/canvas (sin override = sin trampa de cascada). Pinneado en los 4 mapas.
- `.card--inset`: `border-color: var(--border-on-canvas)`; header/footer del inset también usan el token (un solo tinte de hairline por panel; border-default sobre subtle era 1.18:1).
- Umbral del test: ≥ 1.3:1 vs canvas y ≥ 1.2:1 vs subtle (el canto separa ambos lados); justificado en el test.

## Tareas
- [x] T0 — Capturas ANTES (main) de `Card · inset vs card` y `Página sin cards`, 4 combos.
- [x] T1 — Test rojo en `ContrastDark.test` (tiene evalColor con color-mix; mapas light+dark, ambos presets).
- [x] T2 — Tokens base light+dark; CSS `.card--inset` + header/footer.
- [x] T3 — Stories (notas), DESIGN.md (semantic tokens + When to card), CHANGELOG 3.6.0 + bump.
- [x] T4 — Suite + build; capturas DESPUÉS; comparativa para el usuario. Commit local. Sin push.

## Review
**Desvío respecto al pedido, justificado:** el token NO se duplica en el preset El Alba. Es derivado (`color-mix` de `--color-primary` sobre `--bg-canvas`), así que El Alba lo resuelve contra su propio navy y canvas sin override; al no tocarlo en su `:root` light, tampoco hay trampa de cascada con el bloque dark del base. Pinneado en los 4 mapas (base/El Alba × light/dark).
**Medición final (WCAG vs canvas / vs inset):** genérico light `#ccc1af` 1.37 / 1.63; El Alba light `#bccce7` 1.41 / 1.53; genérico dark `#49423b` 1.80 / 1.47; El Alba dark `#323e55` 1.71 / 1.38. Umbrales del test: ≥ 1.3 / ≥ 1.2.
**Header/footer del inset:** pasan a `--border-on-canvas` (border-default sobre subtle era 1.18:1; un solo tinte por panel).
**Tests:** suite completa verde; `CardElevation.test` re-apuntado (pineaba `transparent` desde 3.4.0). Build exit 0, token presente en dist.
**Visual:** capturas antes/después en scratch (inset + página, El Alba y genérico, light y dark).
**Status:** commit local en `feat/border-on-canvas`. SIN push ni PR hasta OK explícito (cuerpo de PR listo en scratch).
