# DESIGN.md

Design system of `@misael703/ui`. Derived from the canonical token source
`src/styles/_root.css` (single source of truth) and `src/styles/_typography.css`.
Keep this in sync with that file; the CSS wins if they ever disagree.

## Theme model

- **Light only.** No global dark mode. Dark zones are opt-in per container via
  `[data-tone="inverse"]` / `.surface-inverse`, which re-scopes the foreground
  tokens. A global `.dark` theme is intentionally deferred.
- **CSS custom properties only.** No Tailwind preset, no CSS-in-JS. Every
  semantic token cascades from the brand scales, so a brand change is a token
  override (`src/presets/*`), never a component edit.
- **Cascade isolation.** All kit CSS lives in `@layer elalba`, so unlayered
  consumer CSS wins without specificity wars.
- Color space: sRGB hex. `color-mix(in srgb, ...)` for focus halos and overlays.

## Color

Two palettes ship. The generic default and the El Alba preset
(`src/presets/elalba/styles.css`, opt-in import) override the same token names.

**Default — warm earth (espresso + sand on cream paper):**

- Primary (espresso/taupe), base `--color-primary-800` `#423e37`; `900`
  `#2e2b26` reserved for hover/pressed. Full 50–900 scale.
- Secondary (sand/café-con-leche), base `--color-secondary-400` `#e4bb97`. A
  light decorative accent (eyebrows, rails), not a CTA color.
- Neutrals: warm stone greys, `--color-ink` `#1c1917` → `--color-gray-50`
  `#fafaf9`. Brown undertone to pair with espresso.
- Canvas `--bg-canvas` `#fef5ef` (warm cream); surface `--bg-surface` `#fff`.
  The canvas/surface contrast is the signature of the default look.

**El Alba preset:** Pantone 287 C blue (`--color-primary-700` `#002f87`) +
Pantone 165 C orange (`--color-secondary-600` `#ff671d`), white canvas, cool
slate-tinted neutrals.

**Status:** full green / yellow / red / info scales; semantics alias the
600 step (`--color-success` = green-600, `--color-warning` = yellow-500,
`--color-danger` = red-600, `--color-info` = info-600).

**Semantic tokens:** `--bg-{canvas,surface,subtle,muted,inverse}`,
`--fg-{default,muted,subtle,on-brand,on-secondary,link,link-hover}`,
`--border-{default,strong,brand,focus}`, `--accent-{primary,secondary}`.
Components must use these, never raw scale stops or hex.

## Typography

- Families: display `Outfit`, body `DM Sans` (both bundled variable fonts,
  100–900/1000, no faux synthesis), mono `ui-monospace` stack.
- Scale: Major Third rooted at 16px, `--text-2xs` 11px → `--text-7xl` 88px
  (fixed rem, not fluid — product register).
- Weights `--weight-thin` 100 → `--weight-black` 900.
- Leading 1.05 / 1.2 / 1.45 / 1.6; tracking -0.01em / 0 / 0.04em / 0.08em.
- All-caps opt-out: `--tt-label` (micro: eyebrows, badges, table headers, KPI
  labels) and `--tt-title` (display headings). Default `uppercase`; a consumer
  or preset can set either to `none` without forking component CSS.

## Spacing, radii, elevation

- Spacing: 4pt grid, `--space-0` 0 → `--space-24` 96px.
- Radii: `--radius-xs` 2px → `--radius-xl` 18px, `--radius-pill` 999px.
- Shadows: soft, neutral — `--shadow-xs` → `--shadow-lg`, plus `--shadow-brand`.
- Breakpoints (documentation + JS use, not usable in `@media` conditions):
  `--bp-sm` 480 / `--bp-md` 768 / `--bp-lg` 1024 / `--bp-xl` 1280.

## Motion

- Easing `--ease-standard` `cubic-bezier(0.2,0.8,0.2,1)` (ease-out, no bounce),
  plus `--ease-in` / `--ease-out`.
- Durations `--duration-fast` 120ms / `--duration-base` 200ms /
  `--duration-slow` 320ms. Motion conveys state, not decoration.

## Focus & layering

- Focus is `:focus-visible` + `box-shadow` ring (`--focus-ring-brand` /
  `-accent` / `-danger`, 3px halo). Never bare `outline:none`. This is a hard
  rule — every interactive component must show a visible focus ring.
- Z-index scale: `--z-dropdown` 50 → `--z-overlay` 100 → `--z-toast` 200 →
  `--z-tooltip` 1000 → `--z-popover`/`--z-floating` 1300. Portaled floating
  panels use `--z-floating` (above Modal/Drawer).
- Overlay scrim `--backdrop` = ink at 55%.

## Component conventions

- `React.forwardRef`, explicit prop `interface`, `...rest` spread, BEM-ish
  classes (`.btn`, `.btn--primary`, `is-loading`).
- Every interactive component ships default / hover / focus-visible / active /
  disabled, plus loading/error where relevant.
- Custom (no Radix). Accessibility is owned by the kit: semantic roles, ARIA
  wiring, keyboard nav, focus trap/restore in overlays. WAI-ARIA patterns for
  composite widgets (TreeView, Accordion, Menu, Menubar, Combobox).

## Polymorphism (two patterns, on purpose)

The kit lets a component render as a consumer element (e.g. `next/link`)
without wrappers, using the right pattern for each API shape:

- **`asChild` (children-based components).** Pass `asChild` and a single
  child element; the kit merges its class, `ref`, handlers and ARIA onto it
  via `Slot`/`Slottable` (dependency-free). Default `false` (no change).
  Supported today: **`Button`**, **`Card`**. The single child must be a valid
  element; injected affordances (Button icons/spinner) are preserved.
- **Render-prop (data/array-driven components).** When a component renders a
  generated list (nav, breadcrumbs, menus), `asChild` cannot express
  "render each of N items as a Link". The correct pattern is a render-prop:
  `AppShell`'s `linkAs` is the canonical example. Future `Breadcrumbs`/`Menu`
  link support will use a `renderLink`-style prop, not `asChild`.

Do not add `asChild` to elements constrained by their parent (`<li>` under
`<ul>`, `<option>` under `<select>`): it would emit invalid markup. Use the
render-prop or keep the semantic wrapper.

## Extending variants (consumer-defined, no fork)

Variant props are **open enums** (`Extensible<T>`): known values autocomplete,
any string is accepted. The kit emits a BEM class from the value
(`variant="x"` → `btn--x`, `badge--x`, `card--accent-x`, `alert--x`). To add a
brand-specific variant without forking:

1. Pass it: `<Button variant="brand-x">`. No type error (since v1.6.0).
2. Style the emitted class in your own CSS, **outside** `@layer elalba` so it
   wins by the layer order the kit already establishes:

   ```css
   /* your app, unlayered */
   .btn--brand-x {
     background: var(--my-brand);
     color: #fff;
   }
   ```

Open today: `Button.variant`, `Badge.variant`, `Alert.variant`, `Card.accent`.
The same `Extensible<T>` type is exported for forks/consumers to reuse on
their own components. Unknown values are safe at runtime: these components only
interpolate the class, they do not switch on the value.
