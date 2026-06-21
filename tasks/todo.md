# Dashboard data-communication primitives (2026-06-21)

## Contexto

Auditoría del kit para "comunicar datos de un vistazo". El kit ya tiene
`Stat`, `Charts` (recharts BYO), `Progress`/`ProgressCircle`, `Badge`,
`StatusIndicator`, `DataTable`, `DescriptionList`, `Timeline`, `Calendar`.
Faltan los **átomos de densidad** de dashboard. Usuario eligió **Tier 1 + Tier 2
(los 7)**. Todos **CSS-only** (sin sumar deps; recharts queda solo para charts
grandes). Paleta El Alba, tokens existentes.

## Componentes (todos en `src/components/Metrics.tsx`)

1. **DeltaBadge** — pill de variación dirigida por signo (▲ verde / ▼ rojo /
   – neutro). `invert` para "higher-is-worse" (error rate). Saca la lógica que
   hoy vive dentro de `Stat`. Formato default `+12,4%` vía `formatNumber`.
2. **StatCard** — átomo KPI: icon + label + valor grande (tabular) + DeltaBadge
   + caption ("vs. mes anterior") + slot `chart` (Sparkline/Sparkbar). Accent
   opcional (cat-1..6) en borde izq.
3. **Meter** — valor en rango con umbrales (`low`/`high`/`optimum`), tono por
   zona. Semántica `role="meter"` (≠ Progress que es `progressbar`).
4. **Sparkbar** — micro-barras inline CSS (sin recharts); completa la familia
   micro-viz junto a Sparkline. `highlightLast`.
5. **ProportionBar** — barra única 100%-segmentada (pagado/pendiente/vencido) +
   leyenda. Colores cat-* por índice.
6. **BulletChart** — bullet graph de Few: actual vs target vs rangos
   cualitativos. CSS-only horizontal.
7. **CalendarHeatmap** — grilla de intensidad (GitHub-style), opacidad por
   bucket, leyenda menos→más.

## Checklist

- [x] `src/components/Metrics.tsx` — los 7 componentes + interfaces
- [x] CSS en `src/styles/index.css` — bloque `/* Metrics */` (compacto, sin prettier)
- [x] `src/components/Metrics.stories.tsx` — story por componente + dashboard demo
- [x] `tests/Metrics.test.tsx` — 24 tests (comportamiento + CSS guards)
- [x] Barrel: `export * from './components/Metrics'` en `src/index.ts`
- [x] Smoke gallery: 7 entries nuevas en `smoke/gallery/registry.tsx` (gate anti-rot)
- [x] `npm test` verde — 722/722 (+24)
- [x] `npm run smoke:ci` verde — 64 passed, 1 skip (attw conocido)
- [x] Validación visual (Playwright headless vía smoke) — dashboard/bullets/meters/heatmap OK
- [ ] CHANGELOG + bump — **esperar OK explícito antes de push/release**

## Review

Shipeado a `main`-local (sin commit/push aún). Los 7 componentes en un solo
`Metrics.tsx` (espejo de Display/Charts), todos CSS-only.

**Verificación:**
- 24 unit tests (signo→tono en DeltaBadge, role=meter + zonas de umbral, escalado
  de Sparkbar, shares de ProportionBar, bandas/target de Bullet, buckets de
  Heatmap) + CSS guards de tokens semánticos.
- Suite completa 722 verde, build limpio, lint limpio, tsc limpio (salvo el
  error pre-existente de Comments.stories).
- Smoke anti-rot confirma los 7 exportados + registrados; responsive/overflow OK.
- Visual headless (bypass del MCP lockeado): geometría exacta (accent cat-2
  #14a08c, meter 82%, delta +12,4%), bandas de bullet graduadas, ramp de heatmap.

**Pendiente de decisión:** estrategia de release (batch único 1.58.0 vs 7 MINORs).

## Decisiones a anotar

- Un solo archivo `Metrics.tsx` (cohesión "dashboard data-viz", espejo de
  Display/Display2/Display3/Charts).
- `Meter` vs `Progress`: distinción ARIA real (`meter` = medición estática en
  rango; `progressbar` = avance de tarea a 100%).
- BulletChart y heatmap CSS-only a propósito: no obligar a instalar recharts
  para micro-viz inline.
- Estrategia de release (batch único vs 7 MINORs incrementales) se decide al
  final, con OK del usuario.
