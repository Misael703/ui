# Kit audit — fix plan (from `/impeccable` exhaustive pass, 2026-07-04)

Critique delivered in chat. Every `✓` item was verified against source this session.
Nothing here is implemented yet — awaiting go-ahead. Each batch = one PR.

## Estado
- ✅ **PR 1 (batch 1)** — PR #115 merged, **v1.68.5 en npm**. Headless destapó un 8º detalle (panel de marca no se ocultaba en mobile: `display:grid` inline ganaba al media query) → arreglado.
- ✅ **PR 2 (batch 2)** — PR #116 merged, **v1.68.6 en npm** (`latest`). Toast side-stripe + em dashes de copy. Placeholders `'—'` DIFERIDOS a batch 4.
- 🔨 **Batch 3 (a11y)** — EN CURSO (3a overlays/controles primero; 3b menús requiere D1).
- ⏳ Batches 4/5 pendientes (4 requiere D2).

## Roadmap (orden de PRs)
1. **PR 1 — Batch 1** · `patch` · bugs confirmados, sin API. ✅ hecho (local).
2. **PR 2 — Batch 2** · `patch` · limpieza de prohibiciones. ✅ hecho (local).
3. **PR 3 — Batch 3** · `minor` · a11y. Partir en **3a overlays** (sin deps) y **3b menús** (dep: Decisión 1).
4. **PR 4 — Batch 4** · `minor` · consistencia/tokens/i18n/dead code (dep: Decisión 2).
5. **PR 5 — Batch 5** · `minor` · IconButton + composición de blocks.

## Decisiones pendientes (recomendación por defecto si no hay respuesta)
- **D1 — roles de menú:** por semántica → NavigationMenu + UserMenu = disclosure de links
  (`aria-expanded` + `<ul>` de `<a>`, sin `role=menu`); ContextMenu = menú WAI-ARIA real. *(rec.)*
- **D2 — radio/checkbox:** custom en todo → RadioGroup/CheckboxGroup componen `<Radio>`/`<Checkbox>`
  (`.check__box`), un solo look + focus ring de marca. *(rec.)*

---

## Batch 1 — Confirmed bugs (P1, low-risk, no API change) → patch bump

- [ ] `index.css:1863` — `--color-grey-200` → `--color-gray-200` (dead NumberInput stepper hover). ✓
- [ ] `Button.tsx:72,88` — loading spinner hardcoded `spinner--inverse` (white) invisible on outline/ghost/subtle/link/warning. Make ring inherit `currentColor` (drop `--inverse`), or pick spinner modifier from `variant`. Add a story/test that renders a loading Button per variant. ✓
- [ ] `Button.tsx:61-77` + `index.css` — `<Button asChild disabled/loading>` has no effect: add `.btn[aria-disabled="true"]{opacity:.45;pointer-events:none}` and guard the merged `onClick`. ✓
- [ ] `AuthSplit.tsx:30,118` — mobile form stuck at 50%. Add a root class and collapse container to `grid-template-columns:1fr` inside the `@media (max-width:768px)`. ✓
- [ ] `Icons.tsx:105-106` — `Tool` === `Wrench` (byte-identical). Give `Tool` the lucide crossed wrench+screwdriver glyph, or make it an explicit named alias. ✓
- [ ] `DataTablePage.tsx:118-119` — dual sort; column-header sort is dead. Pick one model (drive `filtered` from `sort` and drop `SortDropdown`, OR remove `sort`/`onSortChange`). ✓
- [ ] `CheckoutSummary.tsx:59-63` — derive `iva = round(subtotal*0.19)` and total from line items (mirror InvoiceDocument). ✓

## Batch 2 — Ban cleanup (the remaining slop tells) → patch bump

- [ ] `index.css:1508` — Toast: drop `border-left-width:4px` + per-variant `border-left-color`; carry variant via the already-colored icon + optional 1px `border-color`/tint. ✓ (2 reviewers)
- [ ] `index.css:2936` — AppShell active-nav: consider dropping the 3px `::before` stripe in favor of the tinted `is-active` background already on the selector. (Borderline — confirm intent.)
- [ ] Em-dash sweep: `AvailabilityCalendar.tsx:49`, `RouteMap.tsx:67` titles → `·`. Null-sentinels in Audit/DeliveryTimeline/Commerce CompareTable → `undefined` + rendered "Sin dato".

## Batch 3 — A11y hardening (upholds "accessibility is owned") → minor bump

- [ ] `ContextMenu.tsx` — no keyboard. Lift Menubar's roving-tabindex Arrow/Home/End/Esc + focus-on-open; add `Shift+F10`/ContextMenu-key opener.
- [ ] `Gallery.tsx:110` — Lightbox: route through `useFocusTrap`/`useScrollLock`/`useEscape` + `createPortal`. Main image (`:41`) → real `<button>`.
- [ ] Combobox family (`Pickers`, `AdvancedPickers`, CommandPalette) — give options stable `id`, set `aria-activedescendant` on input.
- [ ] Menu-role vocabulary: decide UserMenu + NavigationMenu direction — **disclosure-of-links** (drop `role=menu/menuitem`, keep `aria-expanded`) vs **real menu keyboarding**. Apply consistently with ContextMenu. **[needs a design decision]**
- [ ] `Carousel.tsx:62` — pause autoplay on hover/focus; skip when `prefers-reduced-motion`; expose stop control.
- [ ] `Resizable.tsx:111` — ArrowLeft/Right/Up/Down step handlers + `aria-valuenow/min/max`.
- [ ] `HoverCard.tsx` — Escape dismiss (WCAG 1.4.13).
- [ ] onClick-on-span → real controls: Display3 calendar events (`:456`), NotificationsPage row, block Switches missing labels (ReturnInspection `:104`, SettingsPage `:172`).
- [ ] `Toggle`/SegmentedControl — add `:focus-visible` ring (`--focus-ring-accent`).
- [ ] Prefer transform over layout-prop animation: AppShell collapse (`index.css:3117`), SegmentedControl indicator width (`:4576`).

## Batch 4 — Consistency + tokens + i18n + dead code → minor bump

- [ ] Radio/Checkbox unify: `RadioGroup`/`CheckboxGroup` should compose `<Radio>`/`<Checkbox>` (custom `.check__box`) instead of native controls; drop dead `className="radio"/"checkbox"`. **[design decision: custom vs native everywhere]**
- [ ] `Stat` should consume `DeltaBadge` (or a shared `Trend` atom) so trend arrows/chrome are single-sourced with `StatCard`.
- [ ] `Charts.tsx:54-55` — promote `#6b7e95`/`#d4a574` to `--cat-7`/`--cat-8` tokens.
- [ ] Token leaks → semantic tokens: Slider focus rgba (`index.css:2332`), chip-remove rgba (`:2385/2583`), `PriceDisplay` red scale → `--color-danger`.
- [ ] i18n: `Code`/`JsonViewer` (+ English "items"/"keys"), `InputOTP`, `Form.tsx:175` `aria-label` → `useLocale()` keys.
- [ ] WizardPage: map enum → label in confirm step; "tipear" → "Escribe para buscar…"; add step gating seam; drop `alert()`. RouteMap "conectá" → "conecta".
- [ ] Dedup `.pagination` CSS (`index.css:837` block, dead `.active`) — keep the `is-active` block.
- [ ] `Comments.tsx:5,245` — remove `_internal={X}` shim + unused import.
- [ ] `Button.tsx:17` — reconcile `size` type with orphan `.btn--xs/xl/icon` CSS (expose or delete).
- [ ] Stale JSDoc package name `@misael703/elalba-ui` → `@misael703/ui` (Icons, Charts, Code.stories).

## Batch 5 — IconButton primitive + block composition → minor bump

- [ ] Add `IconButton` (padding/focus-ring/hover once); recompose AdminDashboard×2, CartDrawer, DispatchBoard.
- [ ] AdminDashboard: give one KPI primacy or pair the band with a sparkline; add "Ver todos" on the table; wrap table in `<section aria-labelledby>`.
- [ ] AuditLogPage: modal → `Drawer side="right"` so the log stays visible.
- [ ] Empty states: Product/Tool catalogs, DataTablePage, AuditLogPage — zero-results branch with "Limpiar filtros".
- [ ] EmptyState/ErrorPage: drop the Card wrapper to match NotFound's bare centered instinct.

---

## Verification per batch (before "done")
- `npm test` green + new guard tests (Contrast/CardElevation-style) for each fix.
- Headless Storybook check on own port (6017), killed by exact PID.
- `npm run build` + `smoke:ci` with a free `SMOKE_PORT`.
- Deliver via branch + PR; **no merge/publish without explicit OK**.

## Positives to preserve (don't regress)
Core CSS clean of all classic bans (verified). Menubar WAI-ARIA-complete. Modal/Drawer focus trap+restore+scroll-lock+press-origin guard. DataTable a11y (aria-sort, stretched-row link, virtualized rowcount). Slot/Slottable polymorphism. MoneyInput caret restoration. Metric naming split + Kpi deprecation. Blocks: ReturnInspection, RentalBooking, DeliveryTimeline, DetailPage, CartDrawer, DispatchBoard.

---

# Dashboard / data-communication pass (impeccable, 2026-07-05)

Micro-viz suite (Sparkbar/ProportionBar/BulletChart/CalendarHeatmap/Meter) es
sólida. La deuda es CONSISTENCIA: 3 encodings del mismo "delta", el bloque
estrella usa lo deprecado, `Stat`/`Kpi` sin tabular-nums. Scope aprobado: TODO.

## Batch D1 — Consistencia del átomo de variación (RELEASE, minor → v1.76.0) ✅ local
- [x] `Stat` acepta `delta?: number` (+ `deltaFormat?`, `deltaInvert?`) → renderiza `DeltaBadge`
- [x] `Stat.trend` (string) queda como escape hatch deprecado, back-compat intacto
- [x] `.stat__value` + `.kpi__value` → `font-variant-numeric: tabular-nums`
- [x] `Kpi` alinea su set de íconos con DeltaBadge (Arrow*/Minus en vez de Chevron*)
- [x] Tests: Stat delta numérico + invert + delta-gana-a-trend; guard tabular-nums; 907 pass
- [x] build verde, DTS correcto, headless confirmó delta+invert+tabular live
- [ ] PARAR: push/PR/release pendiente de OK

## Batch D2 — `SectionHeader` (RELEASE, bundled → v1.76.0) ✅ local
- [x] Nueva primitiva en Layout.tsx: `title` + `description?` + `actions?` (baseline, tokens, `level`, `titleId`)
- [x] Export barrel + entry en smoke/gallery registry (gate anti-rot pasa)
- [x] Story (SectionHeaderDemo) + tests (5) + CSS guard
- [x] Headless: H3, aria-labelledby resuelve, baseline align

## Batch D3 — Loading/empty en superficies de datos (RELEASE, bundled → v1.76.0) ✅ local
- [x] `StatCard` `loading?` → skeleton value+delta, aria-busy, label queda
- [x] Charts Line/Area/Bar/Donut: `empty` ("Sin datos") cuando `data` vacío, corta antes de recharts
- [x] i18n key `chart.empty`
- [x] Tests (empty ×4 + override + loading + CSS) + stories; headless confirmó ambos

## Batch D4 — Refactor bloque AdminDashboard (SIN release; bloques fuera de dist) ✅ local
- [x] `Kpi` → `StatCard` con deltas numéricos
- [x] Grilla inline → `Grid` con `minColWidth`
- [x] Section header hand-rolled → `SectionHeader`
- [x] "Stock crítico" → `Meter` + accent `danger`
- [x] Bonus (surgió del refactor): `StatCard.accent` ampliado a `CardAccent` (semánticos), no-breaking
- [x] `Kpi` sin consumidores → su nota `@deprecated` ya es verdadera
- [x] Headless: 0 nodos `.kpi`, 4 StatCards, danger+Meter, SectionHeader H3

## Reglas
- Bundle D1+D2+D3 en 1 release (v1.76.0); D4 es bloque (no release)
- PARAR antes de push/PR/release: pendiente de OK
- Sin prettier --write; nuevo export → smoke registry o el gate explota

## Review (dashboard pass) — 2026-07-05
Todo local y verificado: 921 tests, build tsup verde, smoke:ci (coverage gate) verde,
headless de los 4 batches. Commits (rama `feat/dashboard-data-comm-pass`):
- D1 2a937b3 — Stat→DeltaBadge + tabular-nums + Kpi arrows
- D2 d3bf88f — SectionHeader
- D3 edf1a5a — StatCard loading + charts empty
- D4 a473250 — StatCard semantic accents + AdminDashboard refactor
CHANGELOG + package.json → v1.76.0 (bundle de D1-D3; D4 no cambia dist).
PENDIENTE: push rama → PR → smoke → merge → GitHub Release v1.76.0 → npm (espera OK).

---

# Dark mode (impeccable, 2026-07-08)

Gap #1 para pelear con shadcn Pro: el kit no tiene dark (0 `prefers-color-scheme`,
0 `data-theme`, 0 `.dark` en styles/presets). Auditoría confirma cambio TOKEN-ONLY:
3 hex hardcodeados = traffic-lights del Mac mock (se quedan); ~28 rgba = blancos
translúcidos sobre superficies ya-oscuras (inverse/lightbox, correctos en ambos temas).

## Arquitectura (resuelta): híbrido de 2 capas, simétrico a light
- **Base** `_root.css` → bloque `:root[data-theme="dark"]` con la MAQUINARIA
  palette-agnóstica (invertir surface tiers, fg claro, borders sutiles, status
  remapeado, sombras). El kit genérico queda dark-capable sin preset.
- **Preset elalba** `elalba/styles.css` → bloque `:root[data-theme="dark"]` que
  sobreescribe SOLO lo de marca (paso de navy para acentos, tinte de superficies
  hacia navy, botón secundario navy que sube, naranja apenas domada).
- Cascada idéntica a hoy: preset importado después → gana por orden de fuente.
  Semánticos dark que referencian escalas por nombre recogen la escala del preset solos.

## Brief (escena física)
Admin de back-office de noche / despachador en móvil en bodega en penumbra. Dark =
confort, NO primario (mesón POS sigue en luz). → Dark fiel, baja fatiga, TINTADO HACIA
NAVY de marca. NO neón de terminal, NO zinc/slate neutro (reflejo 2º orden). Naranja
CTA preservado.

## Paleta dark El Alba (borrador, verificar AA en implementación)
- canvas (más profundo): ~#0e1524 navy-tinted near-black (ink #0c1220 es el ancla)
- surface (cards, SUBE sobre canvas → más claro): ~#161d2e
- subtle/muted (insets/hover, más claros aún en dark): ~#1e2739 / ~#27314a
- fg-default ~#e8ebf2 (casi-blanco navy-tinted, no #fff); fg-muted/subtle light slates ≥4.5
- fg-link/acento: navy LIFTED (primary-300 #9bb1dc / primary-400 #6b8aca)
- btn-primary: naranja + blanco (excepción AA persiste, documentar en dark)
- btn-secondary: navy sube a primary-600/500 (navy puro sobre negro = mugroso)
- status: texto -400, chip bg = color-mix(-600 ~20% + surface) (sin añadir stops -950)
- categorical -bg via color-mix oscuro, -fg = solid claro (puede diferir a follow-up)
- shadows casi invisibles en dark; elevación la lleva la luminancia de surface (polish)

## DECISIONES PENDIENTES (esperando OK)
- **Activación:** v1 manual `[data-theme="dark"]` (rec.) vs manual + fallback
  `@media (prefers-color-scheme)` ahora.
- **Alcance:** base+elalba (rec., compite con shadcn) vs elalba-only (más rápido a las apps).

## Checklist
- [ ] Base: bloque `:root[data-theme="dark"]` (maquinaria + dark genérico)
- [ ] Preset: bloque `:root[data-theme="dark"]` (overrides de marca)
- [ ] Tokenizar 2-3 scroll-shadow gradients rgba(0,0,0,α) (~líneas 900-901)
- [ ] Parser de tests: leer bloques `[data-theme="dark"]` además de `:root`
- [ ] `tests/ContrastDark.test.tsx`: sweep AA sobre surface+canvas dark, ambos presets
- [ ] `SurfaceTiers.test.tsx`: en dark el orden INVIERTE (surface > canvas por luminancia)
- [ ] Storybook: globalType toggle `data-theme` en docs root; verificar visual
- [ ] (opcional) export `useTheme` + `ThemeToggle` → si se exportan, REGISTRAR en smoke
      gallery ENTRIES o el anti-rot test explota (pasó en PR #52)
- [ ] CHANGELOG + DESIGN.md: dark, activación, excepción AA del botón naranja persiste
- [ ] Headless: Storybook :6017, flip data-theme, barrer componentes clave

## Riesgos
- Additive: `:root` light intacto; tests de contraste light NO se mueven (dark = set nuevo).
- No romper la simetría de la cascada; preset gana por orden de fuente.

## Review — 2026-07-08 (local, esperando OK para push/release)
Todo hecho salvo el opcional `useTheme`/`ThemeToggle` (DEFERIDO: el consumidor pone
`data-theme` y su toggle; sin export nuevo → no toca el smoke gate). Token-only, light
100% intacto.

Descubrimiento clave (documentado en DESIGN.md + tests): el kit vive en `@layer elalba`
pero el preset se importa SIN capa → el `:root` light del preset le gana al bloque dark
del base (unlayered > layered, antes que specificity). Por eso el preset debe re-afirmar
en su bloque dark lo que remapea en light: surfaces, fg-muted/subtle, fg-on-secondary y
sus 2 cats remapeados (1, 4). Headless (Storybook) lo cazó; el fix es re-afirmar en el
bloque dark de elalba (correcto, no un workaround). Los tests dark ahora modelan ese
orden de capas en su spread.

Verificación:
- 990 unit tests verdes; 158 de token (Contrast light intacto + ContrastDark AA ambos
  presets + SurfaceTiers light y dark-invertido).
- build tsup + postcss verde; `data-theme=dark` shippea en dist (base + preset).
- `smoke:ci` verde (65 e2e, real Next consumer, cascada layered+unlayered real).
- Headless: generic dark (espresso #1b1714) y elalba dark (navy #0d1424) OK; status chips
  y 6 cats dark-tinted con tinta clara; 0 fugas de fondo-claro/texto-negro en componentes.

Archivos: _root.css (bloque dark base), presets/elalba/styles.css (bloque dark marca),
index.css (edge-shadow token), .storybook/preview.tsx (toggle Theme), tests
Contrast/SurfaceTiers (scoping + dark), tests/ContrastDark.test.tsx (nuevo), CHANGELOG +
DESIGN.md + package.json → v1.79.0.
PENDIENTE: rama feat/dark-mode → commit → PR → smoke CI → merge → GitHub Release → npm
(espera OK explícito).

---

# AppShell P1 — nav a escala (impeccable, 2026-07-10)

Del análisis del AppShell: 3 huecos reales de un shell "de escala". `NavItem.children`
existe en el tipo pero NADIE lo usa (vía libre). Tooltip = `<Tooltip label side>`
(envuelve en <span>, ojo flex). Colapso ya oculta children/labels en rail (CSS).

## 1. Skip-to-content link (a11y)
- [ ] `<a class="appshell__skip-link" href="#appshell-content">` como PRIMER hijo del shell
- [ ] `<main id="appshell-content" tabIndex={-1}>`
- [ ] i18n `appshell.skipToContent` (messages.ts tipo + es.ts valor)
- [ ] CSS sr-only-hasta-:focus → pill visible top-left al enfocar

## 2. Tooltips en el rail colapsado
- [ ] AppShell computa `railActive = collapsedRail && collapsed && !isMobile`, lo pasa a NavItemNode
- [ ] depth 0 + railActive → envolver el node en `<Tooltip label={item.label} side="right">`
- [ ] CSS `.appshell__nav .tooltip { display:block }` para no romper el flex del item

## 3. Grupos de nav colapsables
- [ ] `NavItem` gana `defaultOpen?: boolean`; helper `descendantActive(item)`
- [ ] children presentes → parent = `<button class="appshell__navgroup" aria-expanded aria-controls>` (icon+label+chevron), NO link (su destino propio va como primer child)
- [ ] `open` init = `defaultOpen ?? descendantActive`; toggle onClick; children `<ul id>` render sólo si open
- [ ] parent con descendiente activo → clase `is-within` (marca el grupo del page actual)
- [ ] chevron `ChevronRight` rota 90° con transform al abrir (no anima layout)
- [ ] en rail: children ya ocultos (CSS); el grupo muestra icono+tooltip

## Verificación
- [ ] tests: skip-link (target main + tabindex), rail tooltip (wrap en rail), grupos (aria-expanded, toggle, auto-open por active, is-within)
- [ ] story nueva/extendida con grupos anidados + rail; headless dark+light
- [ ] full suite + lint + build; sin export nuevo del barrel → no toca smoke gate
- [ ] release lo hace el user (bump + GitHub Release)
