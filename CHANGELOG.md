# Changelog

All notable changes to `@misael703/elalba-ui` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] — 2026-05-14

**Visual minor.** Migrates kit-wide focus indicators from CSS `outline`
to `box-shadow` using the existing `--focus-ring-*` tokens. Also folds
in two contrast/legibility fixes uncovered during Storybook QA:
`<pre><code>` blocks rendering with invisible text and inline code pills
inside `.surface-inverse` zones showing white-on-light-gray.

### Why
Native `outline` has two well-known limitations:
1. It doesn't reliably respect `border-radius` (rectangular fallback
   in some browsers / browser-versions).
2. It's clipped by `overflow: hidden` on ancestors — caused the
   v0.5.0 `NumberInput` phantom orange bar bug.

`box-shadow` for focus rings (Adam Argyle / Chrome team pattern,
adopted by Radix, Mantine v8, etc.) sidesteps both: shadows respect
border-radius natively and aren't clipped by parent overflow.

### Changed (12 focus rules migrated)
All `outline: 2px solid var(--border-focus); outline-offset: Npx;`
patterns replaced with `outline: none; box-shadow: var(--focus-ring-accent);`:

- `.btn:focus-visible`
- `.check input:focus-visible ~ .check__box` (custom checkbox)
- `.chip__close:focus-visible`
- `.tabs__tab:focus-visible`
- `.data-table__sort-btn:focus-visible`
- `.combobox__input:focus`
- `.combobox__clear:focus-visible`
- `.datepicker:focus-within`
- `.daterange__trigger:focus-visible`
- `.carousel:focus-visible`
- `.collapsible__trigger:focus-visible`

Plus `.bulk-bar__clear:focus-visible` (dark-context white focus,
preserved with solid `box-shadow: 0 0 0 2px var(--color-white)`).

### Visual delta
- **Color preserved**: all migrated indicators stay orange
  (`--focus-ring-accent`).
- **Style changed**: from a 2px solid line offset by 1–4px to a 3px
  translucent halo at the element's edge (35% opacity orange).
- **Behavior changed**: focus rings now respect `border-radius` and
  survive `overflow: hidden` ancestors without clipping.

### Fixed (typography / contrast — uncovered via Storybook QA)
- **`<pre><code>` blocks rendered with invisible text.** The global
  `code, .mono` rule applied an inline "pill" style (light gray
  background + padding + border-radius) to every `<code>` element,
  including those inside `<pre>` blocks. Inside `CodeBlock` (dark
  surface, light-gray text color), the `<code>` brought its OWN
  light-gray background, leaving light-gray-on-light-gray. The pill
  is now scoped to `:not(pre) > code, .mono` — only standalone inline
  `<code>` and the explicit `.mono` utility get the pill. `<pre> >
  <code>` falls through to whatever the container styles.
- **Inline code pills inside `.surface-inverse` were illegible.**
  `.surface-inverse` re-scoped `--fg-*` tokens to white but left
  `--bg-subtle` at its default light gray — so `<code>` chips and
  any element using subtle background tokens kept their light-gray
  background while inheriting white text, ending up invisible.
  `.surface-inverse` (and the `[data-tone="inverse"]` attribute
  variant) now also re-scope `--bg-subtle` and `--bg-muted` to
  translucent-light overlays (12% / 18% of `--fg-on-brand`), giving
  inline elements a contextually correct dark backdrop with white
  text. Fixes the Foundations → Inverted Surfaces story rendering
  and any consumer using `<code>`, `Badge`, `KeyValueRow`, etc.
  inside a surface-inverse region.

### Not touched (known opportunities for future)
- `.slider__input` thumb focus — hardcoded `0 0 0 4px rgba(...)`,
  could be unified to `--focus-ring-brand`.
- `.input-otp__slot:focus` — hardcoded `color-mix(... 25% ...)`,
  could be unified to `--focus-ring-brand`.

Both already use `box-shadow` so they don't have the original
`outline` clipping bug — just stylistic inconsistency with the rest
of the focus system. Will revisit when the kit needs another visual
pass.

## [0.6.0] — 2026-05-14

**Minor feature.** Adds a weight scale to the design tokens. Both
bundled font families (Outfit and DM Sans) are variable fonts covering
the full 100–900+ range natively, so every step in the scale renders
without faux-bold synthesis.

### Added
- **Weight scale tokens** in `_root.css`:
  ```css
  --weight-thin:       100;
  --weight-extralight: 200;
  --weight-light:      300;
  --weight-regular:    400;
  --weight-medium:     500;
  --weight-semibold:   600;
  --weight-bold:       700;
  --weight-extrabold:  800;
  --weight-black:      900;
  ```
  Use these in your CSS as `font-weight: var(--weight-semibold)`
  instead of bare numbers for self-documenting weight choices.
- **`Foundations → Weight Scale`** Storybook story — visualizes every
  step on both display (Outfit) and body (DM Sans) families with usage
  examples.

### Note
The kit's internal component CSS still uses bare numbers (`700`, `400`)
for backward-compat and minimal diff. The tokens are for consumer /
fork use and for future kit refactors.

### Single source of truth in action
This is the first release that benefits from the v0.5.2 refactor:
adding the 9 weight tokens required editing **one file** (`_root.css`).
Both `tokens.css` and `index.css` get them automatically via
`@import` + postcss-import inlining.

## [0.5.2] — 2026-05-14

**Internal refactor.** Eliminates the recurring drift between
`tokens.css` and `index.css` (the cause of v0.4.2, v0.4.3 and v0.4.4
patches) by introducing single-source partials. Zero behavior change
for consumers — `dist/styles.css` and `dist/tokens.css` remain
self-contained and functionally identical to v0.5.0.

*Version 0.5.1 was not published to npm; it was an unrelated CI
workflow change (Node 24 / Actions v5 bump).*

### Changed
- **`src/styles/_root.css`** (new) — canonical `:root { ... }` source
  for every CSS custom property the kit exposes. Edit ONLY here.
- **`src/styles/_typography.css`** (new) — type role classes (`.h1`,
  `.body`, etc.), `code`/`.mono`, `a`/`a:hover`, `.surface-inverse`
  utility. Shared between `tokens.css` and `index.css`.
- **`src/styles/tokens.css`** — slimmed to two `@import` statements.
  No more duplication of the token block.
- **`src/styles/index.css`** — uses `@import url(...) layer(elalba)`
  syntax at the top (spec-compliant position) to pull the partials
  into the `elalba` cascade layer. Inline `@layer elalba { ... }` block
  contains only base-element rules and component CSS now.
- **`postcss.config.cjs`** — `postcss-import` added to the plugin chain
  (runs before autoprefixer / cssnano) to inline the partials at build
  time. Published `dist/styles.css` and `dist/tokens.css` are still
  self-contained with no runtime `@import`.

### Why
Three patch releases in a row (v0.4.2 / v0.4.3 / v0.4.4) closed
specific drift gaps between the two duplicated `:root` blocks. The
duplication was intentional (to allow `tokens.css`-only imports) but
the manual mirroring was load-bearing and error-prone. The single
source of truth removes the maintenance burden permanently. Adding a
new token now means editing **only** `_root.css`; both public entry
points pick it up automatically.

### Migration note for consumers
None. The published dist output is functionally identical. If you fork
the kit and were used to editing `tokens.css` and `index.css` in sync,
edit `_root.css` instead.

## [0.5.0] — 2026-05-14

**Visual minor.** Body font swapped from Metropolis to DM Sans. No API
changes; consumers will see all body text (paragraphs, labels, inputs,
table cells, badges, tooltips) rendered in DM Sans variable on next
update. Display font (Outfit) is unchanged. Also includes a small
`NumberInput` visual fix.

### Fixed
- **`NumberInput` phantom orange bar** between the `−` button and the
  numeric input. The `.number-input__btn:focus-visible` rule applied
  `outline: 2px solid var(--border-focus); outline-offset: -2px`, which
  drew the focus ring inside the button perimeter. Combined with the
  wrapper's `overflow: hidden` and `border-radius`, the top/left/bottom
  edges of the outline were clipped by the rounded corners but the
  right edge — sitting flush against the input — stayed visible as a
  stray orange bar after a mouse click. The rule has been removed: the
  `±` buttons have `tabIndex={-1}` so they're not keyboard-reachable,
  and a focus-visible style on them never served a navigation purpose.
  `:hover` background change remains as the only feedback.

### Why
Metropolis was a solid choice but is a static font requiring multiple
files (Regular + Bold = ~80 KB) and capped at two weights. DM Sans is
a single variable woff2 (~36 KB) covering the full 100–1000 weight
range, with comparable readability characteristics and slightly more
modern proportions. The kit's bundle drops while gaining a full weight
ramp for future hierarchical work.

### Changed
- **`--font-body`** in both `tokens.css` and `index.css`:
  `"Metropolis", "Inter", ...` → `"DM Sans", "Helvetica Neue", ...`.
- **`fonts.css`** — Metropolis `@font-face` declarations (two static
  files) replaced with a single DM Sans variable `@font-face` covering
  the full weight range.
- **`src/fonts/`** — Metropolis-Regular.otf and Metropolis-Bold.otf
  removed; DMSans-VariableFont_wght.woff2 added.
- **Build script** (`package.json`) — no longer copies `*.otf` (none
  remain); copies `*.woff2 + OFL.txt`.
- **`OFL.txt`** — Metropolis attribution removed, DM Sans attribution
  added (also SIL OFL 1.1).
- **README + Foundations story caption** — references updated to DM Sans.

### Bundle delta
| | Before (v0.4.5) | After (v0.5.0) |
|---|---|---|
| Outfit (display) | 44 KB | 44 KB |
| Body font | Metropolis: 47 KB (2 files) | DM Sans: 36 KB (1 file) |
| **Total fonts** | **~91 KB** | **~80 KB** |
| Weight range (body) | 400 + 700 | 100 → 1000 (variable) |

### Migration note for consumers
If your app has CSS overrides referencing `font-family: 'Metropolis'`
directly (instead of `var(--font-body)`), update them to either:
- `font-family: var(--font-body)` (recommended — follows kit token), or
- `font-family: 'DM Sans', sans-serif` (explicit)

The recommended path has always been `var(--font-body)` — components
in the kit have never referenced `'Metropolis'` directly. If your
overrides do, this is a good moment to migrate to the token.

## [0.4.5] — 2026-05-13

**Minor patch.** Card accent rail now survives consumer-side border
resets (notably Tailwind's `preflight`), plus a new `accent="secondary"`
variant for dual-brand kits.

### Fixed
- **`Card` accent rail invisible when consumer applies an unlayered
  border reset** (e.g. Tailwind v3+ preflight). The kit's
  `border-left-width: 4px` lives in `@layer elalba`, so any unlayered
  `border-width: 0` from the consumer wins by CSS spec. The accent rail
  now uses `box-shadow: inset 4px 0 0 ...` instead of `border-left`,
  which is unaffected by border resets. Behavior preserved for the
  interactive hover state — accent stays during `:hover`.
  *Visual delta:* cards with an accent are now ~3px narrower (no
  longer extended by the 4px left border), and the text inside is
  ~3px closer to the left edge. Imperceptible in most layouts.

### Added
- **`Card` accent variant `"secondary"`** — uses the existing
  `--accent-secondary` token (which defaults to `--color-brand-orange`
  in El Alba's defaults). Consumers with a different secondary brand
  override the token at `:root` and the variant follows automatically.
  Use case: highlighting promotional / featured cards that aren't
  status-coded.
  ```tsx
  <Card accent="secondary">…</Card>
  ```
- **README → `Interop con Tailwind (u otro reset global)`** section
  documenting why the kit's `@layer elalba` loses against unlayered
  consumer styles, and three mitigation paths (layer your own styles,
  disable preflight, scoped overrides).

## [0.4.4] — 2026-05-13

**Patch release.** Closes the full set of drift between `tokens.css` and
`index.css` that v0.4.2 only partially fixed: a deep CSS audit revealed
the `.surface-inverse` utility was missing from `index.css`, plus
`tokens.css` was missing entire sections of design tokens (status
palette, z-index scale, focus rings, breakpoints, etc.) and one visible
color divergence.

(Version 0.4.3 was prepared during this work but never published; its
`.surface-inverse` fix is folded into this release.)

### Fixed
- **`.surface-inverse` + `[data-tone="inverse"]`** missing from
  `styles.css`. Originally shipped in v0.3.3 but added only to
  `tokens.css`. Consumers who didn't also import `tokens.css` saw the
  class as a no-op. The block (including `--brand` / `--dark` background
  variants) is now mirrored in `index.css`, so a plain
  `import '@misael703/elalba-ui/styles.css'` is enough to use it.
- **`--color-danger` value divergence** — `tokens.css` had
  `#d1462f` (warm/orange-tinted red) while `index.css` resolved
  `--color-danger` to `--color-red-600` = `#dc2626` (clean red). Any
  consumer using error states, destructive buttons, or form validation
  saw a different color depending on which CSS entry point they
  imported. `tokens.css` now aliases to the scale, so both files
  resolve to `#dc2626`.
- **`.daterange__popover` z-index** raised from `var(--z-sticky)` (60)
  to `var(--z-tooltip)` (1000), matching the existing `.datepicker__popover`.
  The date range picker was rendering behind sticky table headers — the
  same regression class fixed for `.tooltip__bubble` in v0.3.4.

### Added (to `tokens.css`, mirroring `index.css`)
- **Full status color scale** (40 tokens): `--color-green-*`,
  `--color-yellow-*`, `--color-red-*`, `--color-info-*` in 10 stops each.
  Previously a `tokens.css`-only consumer had no access to non-base
  shades of status colors.
- **Z-index scale**: `--z-base`, `--z-dropdown`, `--z-sticky`,
  `--z-overlay`, `--z-toast`, `--z-tooltip`, plus the new `--z-popover`
  (1300) referenced by four components in `index.css`.
- **Focus ring + overlay tokens**: `--focus-ring-brand`,
  `--focus-ring-accent`, `--focus-ring-danger`, `--backdrop`.
- **Breakpoint tokens**: `--bp-sm`, `--bp-md`, `--bp-lg`, `--bp-xl`.
- **`--radius-xs`** (2px) and **`--text-2xs`** (0.6875rem) — both were
  in `index.css` only.

### Added (to `index.css`)
- **`--z-popover: 1300`** in the `:root` z-index scale. Previously
  referenced as `var(--z-popover, 1300)` (fallback magic number) in
  Popover, HoverCard, Menubar, and NavigationMenu — consumers couldn't
  override it via the token system.

### Architecture note
This is the third patch in a row (v0.4.2 → v0.4.4) closing drift
between `tokens.css` and `index.css`. The duplication is intentional —
it allows partial imports where a consumer wants only tokens — but
mirroring is now established as load-bearing. A future release should
evaluate either a single-source-of-truth build step (extract tokens
into a separate file consumed by both) or a parity linter (test that
fails if the two `:root` blocks diverge).

## [0.4.2] — 2026-05-13

**Patch release.** Fixes a leftover Integral CF reference that made v0.4.0
visually incorrect, plus adds Storybook coverage for v0.3.4 and v0.3.0
features that lacked stories.

### Fixed
- **`--font-display` in `styles.css`** still resolved to
  `"Integral CF", "Arial Black", ...` from a leftover `:root` block in
  `index.css`. The token was correctly flipped to Outfit in `tokens.css`
  on v0.4.0 but `index.css` kept its own duplicate definition, so any
  consumer importing `styles.css` (the recommended path per README) saw
  Arial Black as the fallback — never Outfit, because Outfit wasn't even
  in the token's font stack. `index.css` now matches `tokens.css`:
  `"Outfit", "Helvetica Neue", Arial, sans-serif`.
- **Three stale "Integral CF" comments** in `index.css` (tracking note,
  fonts.css guidance, Avatar metrics comment) removed/generalized.
- **README** "Fuentes (opcional)" section and "Forking → Fuentes"
  pointers updated to reference Outfit + the current file layout.

### Added
- **`.storybook/fonts.css` + preview import** so Storybook actually loads
  Outfit and Metropolis at dev time. Since v0.3.1 moved all `@font-face`
  declarations to `fonts.css` and `preview.ts` only imported `index.css`,
  Storybook had been rendering with fallback Helvetica/Arial fonts
  without the maintainer realizing. Now mirrored with paths relative to
  `.storybook/` so Vite resolves the assets in dev.
- **`Foundations → Localization` story** — side-by-side demo of Spanish
  defaults vs an English override via `LocaleProvider`. Closes the
  documentation gap around the i18n layer shipped in v0.3.0.
- **`Layout → TooltipEnContextoSticky` story** — regression guard for
  the v0.3.4 tooltip z-index fix. Sticky `<thead z-index: 60>` with
  tooltip buttons in row cells; if the tooltip ever drops below sticky
  again the issue is visible at a glance.

### Tests
297/297 unchanged. JSDOM doesn't render fonts, so the v0.4.0 regression
wasn't catchable by the existing suite.

## [0.4.1] — 2026-05-13

**Patch release.** Single hydration fix.

### Fixed
- **`<ToastProvider>` hydration mismatch in Next.js App Router.** The
  provider always renders the `toast-stack` portal container so toasts
  pushed later have a host to mount into. The previous SSR check —
  `typeof document !== 'undefined' && createPortal(...)` — prevented a
  *crash* on the server but did not prevent the *mismatch*: server
  rendered nothing, client's first render rendered the portal, React
  flagged the diff against the streamed HTML.

  Standard React 18+ SSR-safe portal pattern applied: `mounted` state
  starts as `false`, `useEffect` flips it to `true` after hydration.
  Both server and the client's hydration render produce the same output
  (no portal); the portal appears on the next render cycle, after
  hydration is complete.

  Reported by barritas during Fase 3 of the migration.

### Not affected (verified)
- Modal, Drawer, Popover, HoverCard, Combobox, MultiCombobox,
  DatePicker, DateRangePicker, Menubar, NavigationMenu, Lightbox,
  ContextMenu, CommandPalette — all are gated by user-interaction state
  (`open`) that starts as `false`. Server and first client render
  produce the same (no portal) output without any extra gating.

### Tests
297/297 unchanged. JSDOM doesn't reproduce SSR hydration, so verification
is observational from a Next.js consumer.

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
