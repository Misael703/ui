# Changelog

All notable changes to `@misael703/elalba-ui` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — v0.3.0

This release makes the kit **honestly country-neutral**. The previous
versions shipped with Chilean-flavored defaults (CL regions, `+56` phone
prefix, hardcoded Spanish strings, an `AddressForm` with RUT/Comuna/
Región fields). Those leaked country-specific data into a presentational
layer where they didn't belong. v0.3.0 extracts them.

### Added
- **`LocaleProvider` + `useLocale()`** — i18n layer. All hardcoded
  Spanish strings (~80 keys spanning 20+ components) now read from a
  typed `UiKitMessages` dict consumed via React context. Spanish remains
  the default — without a `<LocaleProvider>` in the tree, components
  fall back to `esMessages` and behave exactly as before.
  - **Partial overrides via shallow merge**:
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
  `AddressForm` is now a presentational composer. Consumers describe
  the field set per market. See "Migration" below for the Chile preset.

### Changed
- **`brand.ts` lazy getter**: `getBrand()` no longer spreads
  `BRAND_DEFAULTS` at module init. The merge is deferred until the
  first read after `configureBrand`. Without `configureBrand`,
  `getBrand()` returns the `BRAND_DEFAULTS` reference directly. Combined
  with the existing `"sideEffects": ["**/*.css"]` declaration in
  `package.json`, this lets bundlers drop the brand module entirely from
  consumer bundles that don't read brand defaults.

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
