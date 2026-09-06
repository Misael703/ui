# UI Kit v3.3.0 — Retune de paleta (auditoría OKLCH 2026-09-05)

**Origen:** crítica de paleta con `oklch-skill` sobre ambos presets × ambos temas (WCAG 2 + APCA).
**Branch:** `feat/palette-retune` (desde main; local, push/PR/release con OK explícito).

## Cambios aprobados
- Genérico light: surface/subtle/muted tintados al tono del canvas (H≈80), mismo L. Surface deja de ser `#ffffff` puro.
- `--fg-muted` / `--fg-subtle`: abrir el paso (ΔL ≈ .05–.06) en ambos presets light.
- Dark: `--fg-muted` a L 0.80 (APCA ≥ 60 en los 4 tiers); `--fg-subtle` a L 0.75 (rol decorativo, queda 50–58 documentado).
- Nuevo rol `--border-control` (3:1 sobre surface, SC 1.4.11) para límites de controles de formulario; `--border-strong` sigue para lo decorativo.
- NO en scope: story Colors con hex hardcodeados (anotado), escala gris genérica, drift del espresso.

## Tareas
- [x] T1 — Tests: extender Contrast/ContrastDark con APCA (muted ≥ 60 en todos los tiers dark; control border ≥ 3:1 surface light+dark); pinear ΔL muted↔subtle ≥ .04.
- [x] T2 — `_root.css` + `presets/elalba/styles.css`: tokens nuevos/retuneados (light + dark), comentarios actualizados.
- [x] T3 — `index.css`: controles de formulario → `--border-control`.
- [x] T4 — Suite + build; capturas Storybook (Colors, formularios, AppShell) 4 combos.
- [x] T5 — DESIGN.md + CHANGELOG 3.3.0 + bump. Commit local. Reportar.

## Review
**Tests:** 1127 unit; 12 aserciones nuevas (APCA, ΔL de roles, tinte de tiers, `--border-control` 3:1) en Contrast/ContrastDark; `DatePickerDisabled.test` re-apuntado a `--border-control` (único test que pineaba el token viejo). Lint limpio, build verde.
**Visual (Storybook, 4 combos):** borde de input legible en todas; superficie genérica tintada imperceptible como cambio; header de tabla dark más legible (fg-muted L .80).
**Decisión de diseño:** subtle dark queda Lc 52–58 a propósito (rol recesivo), pineado ≥ 50; muted ≥ 60 en los 4 tiers.
**Status:** commit local en `feat/palette-retune`. PENDIENTE push + PR + release 3.3.0, aguardando OK explícito.
