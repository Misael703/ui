# UI Kit v3.4.0 — Canvas F (tinte de marca, tiers re-espaciados) + `Card variant="inset"`

**Origen:** decisión 2026-09-06 tras la story comparativa de canvas: F como tokens, E ("sin cards") como patrón de consumo.
**Branch:** `feat/canvas-inset` (apilada sobre `feat/palette-retune` 3.3.0; local, push/PR/release con OK explícito).

## Decisiones
- El Alba light: canvas `#e8effb` (L .95, H navy). Insets suben para que canvas siga siendo el tier más profundo: muted L .965, subtle L .978, surface `#fcfdff` (.994). Dark intacto. Genérico intacto.
- `Card variant="inset"`: superficie hundida (`--bg-subtle`, sin borde ni sombra), misma API (`CardHeader`/`CardBody`). Reemplaza el `card-flat` casero del consumidor.
- Regla en DESIGN.md: card = objeto autocontenido; tabla NUNCA dentro de card; grupo de campos/sección = inset o página.
- Spike story borrada.

## Tareas
- [x] T1 — Tests rojos: SurfaceTiers (El Alba canvas ≥ L .94, tono a ≤ 10° del navy, pasos ≥ .012); Card inset (clase, CSS sin borde/sombra, bg-subtle; nested inset no dobla nada).
- [x] T2 — Tokens El Alba light + comentarios; Card `variant` + CSS.
- [x] T3 — Stories: Card `Inset`; composición "Página sin cards" (sección inset + tabla directa + card solo para objeto).
- [x] T4 — Suite + build + capturas (El Alba light/dark, genérico light).
- [x] T5 — DESIGN.md (canvas F + regla de cards) + CHANGELOG 3.4.0 + bump. Commit local. Reportar.

## Review
**Tests:** 1136 unit; nuevos: SurfaceTiers (canvas L ≥ .94, tono ≤ 10° del navy, pasos ≥ .012), CardElevation (variant inset: clase, CSS, footer transparente, default byte-idéntico). Contraste light/dark verdes con los tiers nuevos. tsc limpio, build exit 0.
**Visual:** stories `Card · inset vs card` y `Página sin cards`, AppShell El Alba light con canvas F (capturas en scratch).
**Status:** commit local en `feat/canvas-inset` (apilada sobre `feat/palette-retune`). PENDIENTE push + PR + release, aguardando OK explícito. Después: migración en despachos (desenvolver tablas, card-flat → inset).
