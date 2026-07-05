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

## Batch D2 — `SectionHeader` (RELEASE, minor)
- [ ] Nueva primitiva en Layout.tsx: `title` + `description?` + `actions?` (baseline, tokens)
- [ ] Export barrel + entry en smoke/gallery registry (gate anti-rot)
- [ ] Story + test
- [ ] Verificar

## Batch D3 — Loading/empty en superficies de datos (RELEASE, minor)
- [ ] `StatCard` `loading?` → skeleton value+delta
- [ ] Charts: estado `empty` ("sin datos") cuando `data` vacío
- [ ] i18n key si hace falta
- [ ] Tests + verificar

## Batch D4 — Refactor bloque AdminDashboard (SIN release; bloques fuera de dist)
- [ ] `Kpi` → `StatCard` con deltas numéricos
- [ ] Grilla inline → `Grid` con `minColWidth`
- [ ] Section header hand-rolled → `SectionHeader`
- [ ] "Stock crítico" → `Meter`/accent danger
- [ ] Corregir nota `@deprecated` de `Kpi` (dice "no consumers", es falso)
- [ ] Verificar render

## Reglas
- Rama por batch → PR → smoke CI → merge+delete → GitHub Release → npm
- PARAR antes de cada push/release para confirmación explícita
- Sin prettier --write; nuevo export → smoke registry o el gate explota

## Review (dashboard pass)
(pendiente)
