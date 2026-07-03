# DESIGN.md

Design system of `@misael703/ui`. Derived from the canonical token source
`src/styles/_root.css` (single source of truth) and `src/styles/_typography.css`.
Keep this in sync with that file; the CSS wins if they ever disagree.

> Last synced to tokens: **v1.67.0** (2026-06-30). On a token change, re-verify
> the values quoted here against `_root.css` / the El Alba preset.

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
- Canvas `--bg-canvas` `#ede1cc` (warm-earth taupe); surface `--bg-surface`
  `#fff`. The canvas/surface contrast is the signature of the default look.
  Surface-tier order (v1.29.0): the **canvas is the deepest tier** (the page),
  with `--bg-subtle` (`--color-gray-100`) and `--bg-muted` (`--color-gray-150`)
  as *lighter* insets ON a surface — not the other way around. Pre-1.29.0 the
  canvas (`#fef5ef`) sat between subtle and muted, an inversion the tier retune
  fixed; pinned by `tests/SurfaceTiers.test.tsx` in both palettes.

**El Alba preset:** Pantone 287 C blue (`--color-primary-700` `#002f87`) +
Pantone 165 C orange (`--color-secondary-600` `#ff671d`), cool-slate canvas
(`--bg-canvas` `#dde3ed`) on white surfaces, cool slate-tinted neutrals. Tier
scale (semantics preserved, `subtle`→`muted` stays the hover progression):
**canvas `#dde3ed` is the deepest tier (the page)**, with subtle `#f1f4f9` and
muted `#e7ebf2` as lighter insets on a surface `#fff`. The cool canvas gives
white Cards/DataTables figure/ground without the consumer touching CSS (pre-1.16
the El Alba canvas was pure white = no contrast; pre-1.29.0 it was `#eaeef5`,
which sat lighter than its own insets — the v1.29.0 retune deepened it to
`#dde3ed` so the page is unambiguously the bottom tier).

**Status:** full green / yellow / red / info scales; all four semantics alias
the **600** step (`--color-success` = green-600, `--color-warning` = yellow-600,
`--color-danger` = red-600, `--color-info` = info-600), so a row of
{success warning danger info} reads at even luminance weight. v1.29.0 re-anchored
two scales to keep status distinct from brand: **yellow** moved from
amber-orange to a true gold (it used to collide with the El Alba brand orange),
which is why `--color-warning` moved from -500 to -600; **info** moved to a
cyan-leaning sky blue (it used to collide with the El Alba brand navy).

**Categorical palette (v1.16+).** For CATEGORY, not status: six well-separated
hues (`--cat-1`…`--cat-6`), each a triple `--cat-N` (solid rail/dot) /
`--cat-N-bg` (soft chip fill) / `--cat-N-fg` (ink on the bg, all ≥ 4.5:1, pinned
in `Contrast.test`). Palette-neutral (defined in the base, inherited by every
preset). Use for operational zones, regions, tags, teams — anything that only
needs to be *distinguishable*, not *meaningful*.

**Semantic tokens:** `--bg-{canvas,surface,subtle,muted,inverse,inverse-strong}`,
`--fg-{default,muted,subtle,meta,on-brand,on-secondary,link,link-hover}`,
`--border-{default,strong,brand,focus}`, `--accent-{primary,secondary}`.
Components must use these, never raw scale stops or hex. `--fg-meta` (= the
lightest AA-clearing grey, currently aliased to `--fg-subtle`) is the decorative
meta/echo role (secondary cell line, "RUT under name"), separated from the
essential `--fg-muted` so marking text as secondary recedes on its own.
`--border-focus` unified on `--color-primary` (v1.29.0) so a focused element's
border and halo share one brand identity.

**Contrast floor (v1.10.0).** `--fg-muted` and `--fg-subtle` are explicit,
WCAG-AA-clearing values (not raw gray stops): the generic gray ramp shipped
below 4.5:1 as body text on the kit's own surfaces (table headers on
`--bg-subtle`, captions/placeholders on `--bg-canvas`). They keep each
palette's undertone (warm earth / cool slate) and a perceptible
muted↔subtle step; the gray scale stays the decorative ramp. Every
`--fg-*` on every `--bg-*` it actually paints on is AA — enforced by
`tests/Contrast.test.tsx`, which parses these token files directly.

**Documented AA exception — El Alba primary button (v1.12.0).** One
deliberate, owner-accepted (2026-05-18) departure from "accessibility is
owned": in the **El Alba preset only**, the **primary** button is the exact
brand orange `#ff671d` + white = **2.91:1** (hover `#ff8344` = 2.44:1),
below WCAG AA. Brand fidelity was chosen over AA for this single surface,
eyes open. It is not silent: `tests/Contrast.test.tsx` pins the exact
sub-AA value (cannot drift or worsen; trips if "fixed", forcing conscious
removal) and `CHANGELOG.md` records the decision. Scope is exactly this one
button pair (+ hover); every other button/surface, in every palette,
remains strictly AA. Revisit if the brand tolerates a darker orange or a
dark label (both are AA — see the v1.12.0 CHANGELOG for the measured
alternatives).

## Typography

- Families: display `Outfit`, body `DM Sans` (both bundled variable fonts,
  100–900/1000, no faux synthesis), mono `JetBrains Mono` → `ui-monospace`
  stack.
- Scale: Major Third rooted at 16px, `--text-2xs` 11px → `--text-7xl` 88px
  (fixed rem, not fluid — product register).
- Weights `--weight-thin` 100 → `--weight-black` 900.
- Leading 1.05 / 1.2 / 1.45 / 1.6; tracking -0.01em / 0 / 0.02em / 0.04em /
  0.08em (the 0.02em `--tracking-snug` is the small positive for recessed table
  headers).
- Text-transform role hooks (v1.10.0 — three roles, not two; restores the
  type hierarchy that collapsed when everything shouted in caps at once):
  - `--tt-label` **`uppercase`**: TRUE micro-labels only — eyebrows, badges,
    KPI/section/group labels. The brand's caps texture lives here.
  - `--tt-data` **`none`**: table headers + form labels. Column/field names
    read as data, one step below the title.
  - `--tt-title` **`none`**: display-font headings (page/modal/drawer/empty
    titles, appshell brand) — human sentence case, clearly above the data.
  A consumer or preset can still override any of the three without forking
  component CSS.

## Spacing, radii, elevation

- Spacing: 4pt grid, `--space-0` 0 → `--space-24` 96px.
- Radii: `--radius-xs` 2px → `--radius-xl` 18px, `--radius-pill` 999px.
- Shadows: soft, neutral — `--shadow-xs` → `--shadow-lg`, plus `--shadow-brand`.
  `--shadow-card` / `--shadow-card-hover` (v1.20.0) are two-layer (fine
  contact + diffuse lift) for `Card`'s default float — needed since the
  tinted canvas (v1.16) leaves a 1px border alone too weak to separate a
  card from the page. A card nested in a card drops its lift (no double
  elevation). Tint is the blue-ish ink, not pure black, so it sits on both
  palettes.
- Breakpoints (documentation + JS use, not usable in `@media` conditions):
  `--bp-sm` 480 / `--bp-md` 768 / `--bp-lg` 1024 / `--bp-xl` 1280.

## Motion

- Easing: an exponential ease-out family (confident deceleration, no bounce) —
  `--ease-out-quart` / `--ease-out-quint` / `--ease-out-expo`. `--ease-standard`
  and `--ease-out` both resolve to `--ease-out-quint`
  (`cubic-bezier(0.22,1,0.36,1)`); `--ease-in` (`cubic-bezier(0.4,0,1,1)`) is the
  accelerate curve for elements leaving the screen.
- Durations `--duration-fast` 120ms / `--duration-base` 200ms /
  `--duration-slow` 320ms, plus `--duration-exit` 150ms (~75% of base — dismissals
  feel decisive). Motion conveys state, not decoration.

## Focus & layering

- Focus is `:focus-visible` + `box-shadow` ring (`--focus-ring-brand` /
  `-accent` / `-danger`, 3px halo, all at **16% alpha** — aligned v1.29.0 so the
  default brand and danger signals read at one halo weight). Never bare
  `outline:none`. This is a hard rule — every interactive component must show a
  visible focus ring.
- Z-index scale: `--z-base` 1 → `--z-dropdown` 50 → `--z-sticky` 60 →
  `--z-overlay` 100 → `--z-toast` 200 → `--z-tooltip` 1000 →
  `--z-popover`/`--z-floating` 1300. Portaled floating panels use `--z-floating`
  (above Modal/Drawer).
- Overlay scrim `--backdrop` = ink at 55%.

## Component conventions

- `React.forwardRef`, explicit prop `interface`, `...rest` spread, BEM-ish
  classes (`.btn`, `.btn--primary`, `is-loading`).
- **Metric surfaces (v1.68.4).** Two components, one job each: **`StatCard`** is
  the metric *card* (padded surface, icon, tint accent, delta, optional chart
  slot); **`Stat`** is the inline stat (label + value + trend, no card chrome,
  for placing inside another surface). `Kpi` is **deprecated** (overlaps
  `StatCard`, no consumers) and will be removed in the next major.
- Every interactive component ships default / hover / focus-visible / active /
  disabled, plus loading/error where relevant.
- Custom (no Radix). Accessibility is owned by the kit: semantic roles, ARIA
  wiring, keyboard nav, focus trap/restore in overlays. WAI-ARIA patterns for
  composite widgets (TreeView, Accordion, Menu, Menubar, Combobox).
- **DataTable owns its surface (v1.10.0).** `.table-wrap` is the single
  surface authority: it draws the border, the radius, the horizontal
  scroll and the corner clipping, and the filled header follows that
  radius — so the table never produces a corner notch in *any* container.
  Consequence: do **not** wrap `<DataTable>` in your own bordered /
  rounded / `overflow` container (it doubles the border and re-introduces
  the artifact). Drop it directly into a `Card` body.
- **Toolbar / filter zone = the `DataTable` `toolbar` prop (v1.13.0).** To
  put a toolbar/filter row on the same rounded surface, pass it via
  `toolbar` — the DataTable renders it inside `.table-surface` (the single
  border+radius+`overflow:hidden` authority): one divider, header corner
  squared, no seam. Hand-wrapping `<TableToolbar/>` + `<DataTable/>` in
  your own bordered container is the anti-pattern. The bare sibling pattern
  still works (legacy `.table-toolbar + .table-wrap`) but is not the
  recommended path.
- **DataTable density is `compact` by default (v1.10.0).** The
  readable-dense register (≈30px rows, `--text-xs`, single-line cells)
  is the default because the kit serves data-heavy screens — "default =
  product". `density="comfortable"` opts back into the airy 14/16 rows.
- **Interactive rows.** `rowHref` / `onRowClick` render a real, stretched
  `<a>` / `<button>` (keyboard-operable, SR-named, valid table markup —
  never a role hack on `<tr>` or an onClick-only div). `renderRow` is the
  data-driven render-prop escape hatch (same family as `AppShell.linkAs`;
  not `asChild`, which would emit invalid markup on `<tr>`).
- **Band-aware Avatar (v1.21.0).** `Avatar` re-colors itself on an
  inverse/brand surface (translucent-white chip + on-brand text) instead of
  its default light-blue chip — driven by `data-tone="inverse"` on an
  ancestor, the same re-scope mechanism that tints the sidebar/header. The
  `AppShell` brand header (`headerTheme="brand"`) sets `data-tone="inverse"`
  on its `<header>`, so an avatar in `header.right` is band-aware with **no
  per-call-site colors**. Outside the AppShell, wrap your branded surface in
  `data-tone="inverse"` (or `.surface-inverse`) to get the same. AA pinned
  in `Contrast.test`.
- **AppShell `headerLayout="top"` collapse (v1.15.0+).** The collapse toggle
  is the consumer's to wire (no built-in affordance in `top`, unlike `side`):
  put a hamburger in `header.left` and drive `collapsed`/`onCollapsedChange`.
  **Default behavior:** in `top`, `collapsed` hides the sidebar **entirely**
  (no 72px rail) so the content reclaims the full width; the header stays
  full-width and invariant. **Opt into a rail with `collapsedRail`
  (v1.21.0):** collapse to a 72px icon rail (icons + active bar, labels
  hidden — same mechanics as `side`) instead of hiding the sidebar.
  `collapsedRail` is **purely visual** (rail vs hide); collapse is *always*
  driven by the consumer's `header.left` control in `top`, in both modes — no
  built-in toggle (the bottom chevron is a `side`-only idiom; `side` has no
  header to host a hamburger). Single control, no redundancy. *(v1.22.0
  removed the built-in rail toggle added in 1.21.0 for exactly this reason.)*
  Wire the hamburger via a **header-slot render-prop** (v1.23.0), which hands
  it the collapse API (`{ collapsed, toggle, setCollapsed }`) — this is the
  only way to drive an **uncontrolled** shell from the header (and what lets
  `persistKey` work in `top`; see below). Static nodes still work for slots
  that don't toggle. Canonical snippet (uncontrolled + persisted, default hide):
  ```tsx
  <AppShell headerLayout="top" persistKey="despachos.sidebar"
    header={{
      left: ({ collapsed, toggle }) => (
        <button aria-label="Menú" aria-expanded={!collapsed} onClick={toggle}><MenuIcon /></button>
      ),
      center: <Logo/>,
    }} sections={…} />
  ```
  Controlled is still supported (`collapsed`/`onCollapsedChange`) when the host
  needs to own the state — but then `persistKey` is ignored (the host owns
  persistence too). (See the `AppShellTop` block and the `TopbarCentered` story.)
- **AppShell collapse persistence (`persistKey`, v1.22.0+).** Opt-in. Pass a
  key and the collapsed state survives reloads via `localStorage[persistKey]`;
  omit it and the shell resets to `defaultCollapsed` per mount (unchanged
  default — chosen so the kit never writes storage or risks an SSR hydration
  mismatch behind the consumer's back). SSR-safe: the initial render uses
  `defaultCollapsed`, the stored value is applied after mount. **Uncontrolled
  only** — ignored when `collapsed` is provided (controlled mode owns its own
  persistence). In `side` the built-in chevron drives it; in `top` drive it
  from a header-slot render-prop (v1.23.0) — without one, an uncontrolled `top`
  shell has no toggle and `persistKey` cannot be exercised.
  `<AppShell persistKey="despachos.sidebar" sections={…} />`.
- **Two scroll models, one per layout (v1.24.0).** `side` uses the **sticky**
  model: the page scrolls, the sidebar (`height: 100vh; position: sticky`) and
  topbar (`position: sticky`) stay pinned. `top` uses the **internal-scroll**
  model: the shell is capped at the viewport (`height: 100vh`), header (row 1)
  and sidebar (row 2) are static, and only `.appshell__content` scrolls
  (`overflow-y: auto`, scoped to `--header-top`). Two consequences for `top`:
  the sidebar is `height: auto` (fills its row, not `100vh`, to avoid a second
  scrollbar), and the shell **owns the viewport height** — render it at the
  root or in a `100vh` container. A consumer's in-page sticky sub-header anchors
  to the top of the content viewport, not the page.

## Polymorphism (two patterns, on purpose)

The kit lets a component render as a consumer element (e.g. `next/link`)
without wrappers, using the right pattern for each API shape:

- **`asChild` (children-based components).** Pass `asChild` and a single
  child element; the kit merges its class, `ref`, handlers and ARIA onto it
  via `Slot`/`Slottable` (dependency-free). Default `false` (no change).
  Supported today: **`Button`**, **`Card`**. The single child must be a valid
  element; injected affordances (Button icons/spinner) are preserved.
  - **Compact card-as-link / list-row.** There is no separate `ListRow`
    component on purpose: `<Card interactive asChild>` over an `<a>`/`<Link>`
    *is* the clickable row — accessible hover/focus, one interactive node
    (no `<a>` inside `<div>`). Tighten `CardBody` padding for a dense row.
    See the `CardComoLink` story.
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
