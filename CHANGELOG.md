# Changelog

All notable changes to `@misael703/elalba-ui` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] — 2026-05-13

**Minor release.** Display font swap — Integral CF (commercial license, not
redistributable) replaced with **Outfit** (Google Fonts, SIL Open Font
License 1.1).

### Changed
- **`--font-display` default** is now `"Outfit", "Helvetica Neue", Arial,
  sans-serif` (was `"Integral CF", "Arial Black", ...`). Visual tone shifts
  from industrial/condensed to geometric/modern. Override the token in your
  app if you want a different display family.
- **`fonts.css`** ships a single variable font for Outfit
  (`Outfit-VariableFont_wght.woff2`, 44 KB) covering weights 100–900 from
  one file. Metropolis (body) unchanged.
- **`dist/fonts/`** payload: ~95 KB total (was ~106 KB with the
  un-redistributable Integral CF).

### Removed
- **`IntegralCF-Regular.otf` and `IntegralCF-Bold.otf`** removed from the
  bundle. Integral CF requires a commercial license per workstation and
  cannot be redistributed through an npm package. Consumers that own an
  Integral CF license can still load it themselves via their own
  `@font-face` and override `--font-display` accordingly.

### Added
- **`OFL.txt`** in `dist/fonts/` covering both bundled families
  (Outfit + Metropolis) — required attribution per SIL OFL 1.1.

### Migration
- **No code changes required.** The kit's components keep reading from
  `var(--font-display)`; the value behind it changed.
- Apps that explicitly referenced `"Integral CF"` in their own CSS should
  swap to `"Outfit"` (or whatever family they prefer).
- Build script now copies `*.otf`, `*.woff2`, and `OFL.txt` from
  `src/fonts/` into `dist/fonts/`. No consumer impact.

### Tests
297/297 unchanged.

## [0.3.4] — 2026-05-13

**Patch release.** One bug fix surfaced by barritas + cosmetic CSS cleanup.

### Fixed
- **Tooltip z-index** raised from `var(--z-sticky)` (60) to
  `var(--z-tooltip)` (1000). Tooltips were rendering behind sticky
  table headers, navbars, drawers, and any other element with
  `z-index: 60+`. First hit in barritas: sticky `<th z-index: 1>`
  covered the tooltip of IconButtons in the first row.

### Changed
- **Removed "El Alba — Ferretería El Alba / Patio Constructor"
  comments** from `tokens.css` and `styles.css`. CSS now reads as a
  generic design-token + component file. (Story files still reference
  El Alba as showcase data — that's content, not branding leakage.)

### Tests
297/297 unchanged.

## [0.3.3] — 2026-05-13

**Patch release.** Adds a CSS-only utility for dark-background regions.

### Added
- **`.surface-inverse` + `[data-tone="inverse"]`** — re-scopes
  foreground tokens (`--fg-default`, `--fg-muted`, `--fg-subtle`,
  `--fg-link`, `--fg-link-hover`, `--border-default`, `--border-strong`)
  so any element inside a dark-background region renders light text
  automatically. No per-element `color: white` overrides needed.

  Two preset bg variants for common cases:
  - `.surface-inverse--brand` → `var(--color-brand-blue)`
  - `.surface-inverse--dark` → `var(--color-blue-900)`

  ```html
  <footer class="surface-inverse surface-inverse--brand">
    <p>Light text on navy, inherited via the cascaded CSS vars.</p>
    <p class="caption">Captions, h1-h6, anchors all follow.</p>
  </footer>
  ```

  Mechanism: same pattern as shadcn/ui's `[data-theme]`, Radix Themes'
  `<Theme appearance="dark">`, and MUI's nested ThemeProvider — pure
  CSS-only equivalent. Components with their own backgrounds (Card,
  Modal, Button, Input) are unaffected; the utility targets surrounding
  text + borders, not nested component skins.

  Reported by barritas during the consumer migration — surfaces popping
  up in footers, hero sections, dark sidebars. Worth shipping before
  consumers normalize the inline `color: white` workaround.

  Uses `color-mix(in srgb, ...)` for translucent muted/subtle/border
  variants (Chrome 111+, Firefox 113+, Safari 16.2+).

### Tests
297/297 unchanged.

## [0.3.2] — 2026-05-13

**Patch release.** Single visual fix surfaced by the barritas spike.

### Fixed
- **Toast icon vertical alignment when no `description` is provided.** The
  `.toast` rule was using `align-items: flex-start` plus a `margin-top: 1px`
  nudge on `.toast__icon` to handle the canonical two-line case (title +
  description). On single-line toasts (`toast.push({ title, variant })` only)
  the nudge pushed the icon ~1–2px below the title baseline.

  Now the default is `align-items: center` with no icon nudge; `:has(.toast__desc)`
  switches back to `flex-start` + `margin-top: 1px` only when a description is
  present. Same pattern used in v0.3.0 for `TransferList` and `MultiCombobox`
  items. The `.toast__title` `margin-bottom: 2px` is similarly scoped to the
  two-line case so it doesn't shift the body off-center on single-line toasts.

### Tests
297/297 unchanged.

## [0.3.1] — 2026-05-08

**Patch release.** Single critical fix: bundlers that resolve CSS `url()`
references (Next.js, Vite, webpack) now build cleanly when importing
the kit's stylesheets.

### Fixed
- **`@font-face` declarations in `styles.css` and `tokens.css` removed.**
  Both files previously duplicated the four `@font-face` rules from
  `fonts.css` with broken `url(../fonts/X.otf)` paths that resolved to a
  non-existent `<package>/fonts/` directory (fonts live at
  `<package>/dist/fonts/`). Any consumer that imported `styles.css` or
  `tokens.css` through a CSS-aware bundler failed with
  `Module not found` for each of the eight font files.

  Now `fonts.css` is the sole owner of the `@font-face` rules, with
  correct `url(fonts/X.otf)` paths. The duplication was a leftover
  invariant — the README already documented importing `fonts.css`
  separately, but the code path had never been exercised by a real
  bundler because the kit had no consumers until barritas integrated
  it at v0.3.0.

### Behavior
- **No breaking change for consumers following the README**, which
  already documented importing `fonts.css` + `styles.css` separately.
- **Behavior change for consumers that imported only `styles.css`**
  expecting fonts inline: those builds were failing on v0.3.0 anyway.
  After upgrading, also import `@misael703/elalba-ui/fonts.css` if you
  want the bundled Integral CF + Metropolis fonts. Or skip it and let
  the kit fall back to the next family in the `--font-display` /
  `--font-body` token chain.

### Tests
297/297 unchanged.

## [0.3.0] — 2026-05-07

Three big themes:

1. **Country-neutral architecture**. Previous versions leaked Chile-specific
   defaults (CL regions, `+56` phone prefix, hardcoded Spanish, an
   `AddressForm` with RUT/Comuna/Región baked in). v0.3.0 extracts those
   to consumer code and slims `BrandDefaults` to truly UI-formatting
   concerns (`name`, `logoBasePath`, `currency`, `locale`).
2. **Internationalization**. ~80 hardcoded Spanish strings across 20+
   components now read from a typed `UiKitMessages` dict consumed via
   `<LocaleProvider>`. Spanish remains the default — kits without a
   provider behave exactly as before.
3. **DataTable maturity + visual polish**. Five new DataTable features
   (`error`, `stickyHeader`, `mobileLayout="cards"`, `TablePagination`,
   plus a virtualization recipe), exit animations on Modal/Drawer/Toast,
   mobile bottom-sheet drawer, and a sweep of small alignment fixes.

### Added
- **`LocaleProvider` + `useLocale()`** — i18n layer. All hardcoded
  Spanish strings now read from a typed `UiKitMessages` dict consumed
  via React context.
  - **Partial overrides via shallow merge** — pass only the keys you
    want to translate:
    ```tsx
    <LocaleProvider messages={{ 'modal.close': 'Close' }}>
      <App />
    </LocaleProvider>
    ```
  - **Templates** with `format(tpl, vars)`: keys like `"Eliminar {name}"`
    or `"{from}–{to} de {total}"` substitute placeholders. The helper is
    exported for consumers building on top of the kit.
  - **Calendar arrays** (`calendar.weekdays`, `calendar.months`,
    `picker.weekdaysShort`) ship as `readonly` tuples for compile-time
    safety.
- **`AddressField` + generic `<AddressForm fields={...}>`** —
  presentational composer. Consumers describe the field set per market.
  See "Migration" below for the Chile preset.
- **DataTable features**:
  - `error?: ReactNode` prop renders an alert state in place of the
    body. Priority: `error > loading > empty > rows`.
  - `stickyHeader?: boolean` pins the `<thead>` while the body scrolls.
    Requires the consumer to constrain wrapper height.
  - `mobileLayout?: 'table' | 'cards'` — below 600px, rows collapse to
    stacked cards with column headers as inline labels.
- **`<TablePagination>`** — convenience component pairing a page-size
  selector with the existing `<Pagination>`. Drop it under a DataTable
  when paginating externally.
- **Exit animations** for `<Modal>`, `<Drawer>`, and `<Toast>` via the
  new `useDelayedUnmount(open, durationMs)` hook (also exported).
  Components stay mounted during a 200ms exit window with `is-closing`
  class so CSS keyframes can play before unmount.
- **Mobile bottom-sheet** for `<Drawer>` — below 600px, both `side`
  variants slide in from the bottom with rounded top corners (native
  iOS/Android pattern).
- **Storybook stories** for every new feature: `ConError`,
  `StickyHeader`, `CardLayoutMobile`, `PaginacionCompleta`,
  `PaginacionSimple`, `DataTableConPaginacion`.

### Changed
- **`brand.ts` lazy getter**: `getBrand()` no longer spreads
  `BRAND_DEFAULTS` at module init. The merge is deferred until the
  first read after `configureBrand`. Without `configureBrand`,
  `getBrand()` returns the `BRAND_DEFAULTS` reference directly. Combined
  with `"sideEffects": ["**/*.css"]` in `package.json`, bundlers can
  drop the brand module entirely from consumer bundles that don't read
  defaults.
- **CategoryNav mega-menu is click-only** — `onMouseEnter`/`onMouseLeave`
  removed. Hover-to-open didn't work on touch devices and was already
  inaccessible to keyboard/screen-reader users. Click matches modern
  e-commerce patterns (Amazon, Mercado Libre).
- **Mobile stacked layouts** for `DescriptionList` and `DiffViewer`. The
  multi-column grids fold to single-column under 600px. The diff's
  before/after labels surface inline via `data-label` attrs threaded
  from the locale dict (i18n preserved).

### Performance
- **Per-component tsup entries**: the build now emits one file per
  component plus shared chunks. The barrel `dist/index.mjs` shrinks
  from 218 KB to 4 KB — a tiny pass-through that re-exports from
  siblings. Consumers' bundlers can drop unused components reliably
  even when importing from the barrel.
- **AppShell memo'd recursive `<NavItemNode>`**: extracts `renderItem`
  to a `React.memo`'d component. A single section re-render no longer
  churns through every other nav item in the tree.
- **Carousel `next`/`prev`/`onKey` stabilized via `useCallback`** with
  the functional setIndex form, so handlers don't reconstruct on every
  navigation.
- **DataTable already-memo'd row** with ref-stable toggle handler (from
  v0.2.3) plus `format()`-based aria-label computation in the parent.

### Removed (BREAKING)
- **`BrandDefaults.phonePrefix`** — `<PhoneInput>` no longer falls back
  to a brand-level prefix. The `prefix` prop stays optional but defaults
  to nothing (the prefix span is omitted when absent). Pass
  `prefix="+56"` explicitly per-instance, or wrap the component to set a
  default for your app.
- **`BrandDefaults.regions`** and the embedded `CL_REGIONS` constant.
  Region data belongs in app code.
- **`Address` interface** (with Chilean fields: `rut`, `region`,
  `comuna`). `<AddressForm>`'s `value` is now `Record<string, string>`,
  keyed by whatever the consumer puts in their field set.
- **`AddressFormProps.regions` and `AddressFormProps.showRut`** props.
  Replaced by entries in the `fields` array.

### Fixed
- **DatePicker focus ring** wraps the whole compound (input + toggle
  button) via `:focus-within` on the wrapper — was breaking at the seam
  before. Wrapper also uses `width: fit-content` so it doesn't stretch
  inside flex/grid parents.
- **TransferList and MultiCombobox** option items center the checkbox
  vertically when the item has no description; fall back to
  `flex-start` for two-line items via `:has(.*-desc)`.
- **Toggle Variantes story** centers items vertically when mixing
  sm/md/lg sizes.

### Migration

#### `<PhoneInput>`

Before (v0.2.x):

```tsx
// configureBrand({ phonePrefix: '+56' }) called once at startup → all
// PhoneInputs got "+56" automatically.
<PhoneInput value={v} onChange={setV} />
```

After (v0.3.0):

```tsx
<PhoneInput value={v} onChange={setV} prefix="+56" />
```

If you have many phone inputs, wrap once:

```tsx
const ChilePhoneInput = (p: React.ComponentProps<typeof PhoneInput>) =>
  <PhoneInput {...p} prefix="+56" />;
```

#### `<AddressForm>`

Before (v0.2.x):

```tsx
const [addr, setAddr] = useState<Partial<Address>>({});
<AddressForm value={addr} onChange={setAddr} regions={CL_REGIONS} />
```

After (v0.3.0):

```tsx
import type { AddressField } from '@misael703/elalba-ui';

const CL_REGIONS = [
  'Arica y Parinacota', 'Tarapacá', /* ... */
].map((r) => ({ value: r, label: r }));

const chileFields: AddressField[] = [
  { key: 'fullName', label: 'Nombre completo' },
  { key: 'rut', label: 'RUT', placeholder: '12.345.678-9' },
  { key: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678' },
  { key: 'street', label: 'Calle', width: 'half' },
  { key: 'number', label: 'Número', width: 'third' },
  { key: 'apartment', label: 'Depto/Casa', width: 'third' },
  { key: 'region', label: 'Región', type: 'select', options: CL_REGIONS, width: 'half' },
  { key: 'comuna', label: 'Comuna', width: 'half' },
  { key: 'notes', label: 'Notas para el despacho', type: 'textarea', rows: 2 },
];

const [addr, setAddr] = useState<Record<string, string>>({});
<AddressForm fields={chileFields} value={addr} onChange={setAddr} />
```

The Storybook story `Commerce → AddressFormDemo` is the canonical
working example.

#### `configureBrand`

Before (v0.2.x):

```tsx
configureBrand({
  name: 'Mi Marca',
  currency: 'USD',
  locale: 'en-US',
  logoBasePath: '/static/brand',
  phonePrefix: '+1',                // ❌ removed
  regions: ['Alabama', 'Alaska'],   // ❌ removed
});
```

After (v0.3.0):

```tsx
configureBrand({
  name: 'Mi Marca',
  currency: 'USD',
  locale: 'en-US',
  logoBasePath: '/static/brand',
});
```

The TypeScript compiler will flag the removed fields.

### Behavior unchanged
- Default Spanish strings preserved exactly (existing tests querying by
  Spanish aria-labels still pass).
- Visual appearance of `<AddressForm>` unchanged — the new 6-column
  grid replicates the old column ratios at the layout level.

## [0.2.1] — 2026-05-04

Patch release with deep audits across overlay correctness, form
accessibility, DataTable a11y, and bundle hygiene. **No breaking
changes** — every existing API still works the same way.

### Fixed
- **Overlay correctness**: `Modal`, `Drawer`, and `Toast` now render via
  `createPortal` to `document.body`. Previously they rendered inline,
  where any ancestor with `overflow:hidden`, `transform`, or `filter`
  could clip the backdrop or break stacking.
- **Body scroll lock** for `Modal`/`Drawer` with a shared counter so
  closing an inner overlay doesn't release the lock for an outer one.
- **Toast hover/focus pause**: auto-dismiss timer pauses while pointer
  or keyboard focus is on the toast and resumes with the remaining
  time.
- **Eight floating panels portal'd to body** (Popover, HoverCard,
  DatePicker, DateRangePicker, Menubar, NavigationMenu, Combobox,
  MultiCombobox). Solves both the math bug (positioned-wrapper offset)
  and the long-standing clipping bug under `overflow:hidden` ancestors.
- **`FormField` a11y wiring**: auto-generates the input id via
  `useId()` and threads `aria-describedby` from hint/error to the input
  (the IDs were generated before but never connected).
- **`Switch` `role="switch"`** on the underlying `<input>` so screen
  readers announce on/off semantics instead of "checkbox".
- **Combobox/MultiCombobox listbox ids** derive from `useId()` per
  instance — duplicate ids when multiple instances were on the same
  page are gone. `MultiCombobox` was missing `aria-controls` entirely;
  added.
- **Focus rings** added to `.number-input__btn`, `.datepicker__toggle`,
  `.combobox__clear`, and the new `.data-table__sort-btn` (WCAG 2.4.7).
- **DataTable keyboard sort**: sortable headers now render a real
  `<button>` so they're reachable by Tab + Space/Enter (was a `<th>`
  with `onClick`, unreachable by keyboard).
- **DataTable a11y**: `scope="col"` on every `<th>`, `aria-sort` only
  on sortable columns, accessible names via new `ariaLabel` and
  `rowLabel` props.
- **Avatar**: switched initials to body font (Inter/Metropolis); the
  display font (Integral CF) clipped descenders and pushed glyphs
  below the optical center. Status badge now overhangs the circle's
  edge instead of getting clipped.
- **Notification badge** sits on the bell icon's top-right corner
  without covering the bell.
- **DatePicker trigger** is flush with the input now (was a misaligned
  floating block due to a legacy `.datepicker` wrapper rule).
- **Box-sizing reset**: global `button, input, select, textarea {
  box-sizing: border-box }` fixes off-by-2px alignment in input-groups.
- **Form-control font reset**: global `button, input, select, textarea,
  optgroup { font: inherit }` so form controls use Metropolis instead
  of the system font.

### Added
- **`Checkbox`** gains `invalid` and `indeterminate` props (with
  `aria-checked="mixed"` for tri-state).
- **`Switch`** gains `invalid` prop.
- **`RadioGroup`** accepts a `label` prop applied as `aria-label` on
  the `role="radiogroup"` container.
- **`FileUpload`** accepts `aria-label` and links the `hint` via
  `aria-describedby` for screen readers.
- **`DataTable`**: `ariaLabel` (table-level accessible name) and
  `rowLabel(row)` (per-row checkbox accessible name).
- **DataTable stories**: loading skeleton, empty state, and
  custom-empty slot.
- **Bundle**: source maps in `dist/` for consumer debugging.
- **`tokens.css` subpath export** now flows through PostCSS like the
  other stylesheets — consumers were importing the unprocessed source
  before.

### Removed
- Legacy duplicate CSS blocks: `.popover`, `.datepicker` (wrapper
  styles), `.aspect-ratio` (older rule), `.scroll-area` (older rule),
  six redundant per-component `font: inherit` declarations.
- `aria-atomic="true"` from the Toast container (caused screen readers
  to re-read the entire stack on every push).

### Documentation
- README updated with new props and conventions.
- DataTable JSDoc documents deferred gaps (no built-in pagination,
  error prop, sticky header, virtualization).

### Deferred to v0.3.0
- Exit animations for Modal/Drawer/Toast (requires "closing" state).
- DataTable: built-in pagination, error prop, sticky header,
  virtualization.
- Brand singleton refactor for stricter tree-shaking.
- Per-component entries in tsup for real code-splitting (today's
  `splitting: true` is a no-op with the single barrel entry).

---

## [0.2.0] — 2026-05-03

### Added
- **`DatePicker`** and **`DateRangePicker`** locale-aware date format
  via the new `format` prop. `'auto'` derives from
  `configureBrand({locale})` (e.g. `es-CL` → `dd-mm-aaaa`, `en-US` →
  `mm-dd-aaaa`, `ja-JP` → `aaaa-mm-dd`).
- **`AppShell`**: `theme: 'default' | 'brand'` for sidebar color
  variants, animated sidebar collapse, larger logo without enlarging
  the click area.
- **`Collapsible`** primitive (Radix-style API: controlled or
  uncontrolled, SSR-friendly with the `hidden` attribute instead of
  conditional rendering).
- **10 new component stories**: Carousel, ContextMenu, HoverCard,
  InputOTP, Menubar, NavigationMenu, Popover, Resizable, Toggle,
  Primitives.
- **6 text-formatting icons**: Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight.

### Changed
- **BREAKING (low impact)**: `DatePicker` and `DateRangePicker` now
  render dates per the resolved format. Consumers passing ISO strings
  or relying on a specific output should pass `format="iso"` to keep
  the old behavior.
- Storybook taxonomy reorganized into 11 consistent categories.
- Foundations / Logos manifest refreshed; Motion story now actually
  animates.

### Fixed
- Hero outline button now visible on dark heroes (white border, was
  blue-on-blue invisible).
- Toggle hover preserves contrast when pressed (was illegible on
  hover).
- Table sorted-header accent (visual cue for ascending/descending).
- AppShell brand area animation cleaner; sidebar labels fade with
  proper a11y delay.

---

## [0.1.2] — 2026-05-02

### Fixed
- `TransferList` and `PermissionMatrix`: replaced inline checkboxes
  with the `Checkbox` component so the visual structure matches the
  rest of the kit.
- `Chip` close button: X icon was invisible (background and border
  collapsed onto the icon).
- `TableToolbar` layout: search input no longer overlaps with filter
  buttons.

---

## [0.1.1] — 2026-05-01

### Fixed
- `Checkbox` and `Radio`: introduced compound `.check` + `.check__box`
  structure so the visual style matches across uses.
- `DataTable`: numeric columns now auto-apply `.table__num` (monospace
  + right-align); the inline checkbox for selection was replaced with
  the `Checkbox` component.

### Added
- `Button` `variant: 'link'` now exposed.

---

## [0.1.0] — 2026-04-30

Initial public release.

### Added
- Multi-brand UI kit: tokens, components, runtime brand configuration
  (`configureBrand()`).
- ~50 components across Layout, Form, Display, Overlay, Feedback,
  Marketing, Commerce, and Data categories.
- Storybook with autodocs.
- Trusted Publishing CI (npm OIDC + provenance).
- MIT license.

[0.2.1]: https://github.com/Misael703/elalba-ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/Misael703/elalba-ui/releases/tag/v0.2.0
[0.1.2]: https://github.com/Misael703/elalba-ui/releases/tag/v0.1.2
[0.1.1]: https://github.com/Misael703/elalba-ui/releases/tag/v0.1.1
[0.1.0]: https://github.com/Misael703/elalba-ui/releases/tag/v0.1.0
