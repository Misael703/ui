# Changelog

All notable changes to `@misael703/ui` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.43.0] — 2026-06-05

**Minor. Refined scrollbar across the kit's scroll surfaces — fixes the
rounded-corner asymmetry on the `DataTable`.** The native scrollbar's
square track filled the corner of a rounded scroll container, so the
scrollbar side read as square while the opposite side stayed rounded.
That's not table-specific — every rounded kit scroll surface had the
same latent defect.

### Changed
- Kit scroll surfaces (`.table-wrap__scroll`, `.modal__body`,
  `.drawer__body`, `.combobox__list`, `.multicombo__list`,
  `.menu__panel`, `.cmdk__list`, `.notif__list`, `.transfer__list`) now
  use a thin scrollbar with a **floating, rounded thumb on a transparent
  track** (`scrollbar-width: thin` + `scrollbar-color` for Firefox/modern
  Chrome; `::-webkit-scrollbar` with an inset `background-clip:
  content-box` thumb for Safari/older Chrome — both paths land a clean
  result). The transparent track + inset thumb leave the rounded corners
  clean and symmetric.

### Added
- Public `.kit-scrollbar` utility class — opt any scroll container into
  the same refined scrollbar.

### Compatibility
Non-breaking, additive. Only the kit's OWN scroll surfaces are styled;
the consumer's page (`html`/`body`) scrollbar is untouched.

## [1.42.0] — 2026-06-05

**Minor. `DataTable` sticky header gains an on-scroll "command bar"
elevation.** Now that the bounded sticky header is structurally solid
(1.41.x), this is the polish: in `maxHeight` mode the sticky header sits
**flush at rest** (just its 1px separator) and **lifts off with a soft
downward shadow once content scrolls beneath it** — the depth cue that
makes a sticky header read as a deliberate bar (Linear / Notion /
Stripe).

### Added
- On-scroll header elevation, scoped to `stickyHeader` + `maxHeight`
  (the bounded scroll box). A zero-height sentinel at the top of the
  inner scroll container is watched by an `IntersectionObserver`; when it
  leaves the top, the header gains `0 6px 8px -6px` warm shadow (the 1px
  separator stays). IO, not a scroll listener — no per-frame work; the
  shadow eases in via a `box-shadow` transition. SSR/jsdom-safe (guarded
  on `typeof IntersectionObserver`).
- Ancestor-stick mode (`stickyHeader` without `maxHeight`, e.g. inside a
  `Modal`) keeps the flush header — the outer scroller isn't the table's
  to observe.

### Compatibility
Non-breaking, additive. No API change; the elevation appears
automatically on bounded sticky tables.

## [1.41.2] — 2026-06-05

**Patch. `DataTable` bounded sticky header — proper structural fix for
the rounded-corner leak.** 1.41.1's `clip-path` reduced but did not
fully kill the grey leak where the scrollbar meets the rounded top
corner. The real fix is structural: in `maxHeight` mode the table now
lives in an **inner** `.table-wrap__scroll` (the scroll container,
`overflow: auto`), wrapped by the **outer** `.table-wrap` which keeps the
border + radius and `overflow: hidden`. Because the clipping element
(outer) is no longer the sticky header's scroll container (inner), it
clips everything — the sticky paint AND the scrollbar corners — to the
rounded rect cleanly. Chrome's "can't clip the sticky it scrolls" bug
simply doesn't apply once the two roles are separated.

Verified at 6× zoom: clean rounded corner, scrollbar clipped below the
curve, no grey leak; sticky still pins on scroll. Replaces the `clip-path`
workaround from 1.41.1.

## [1.41.1] — 2026-06-05

**Patch. `DataTable` bounded sticky header (`maxHeight`) no longer leaks
its grey fill past the rounded top corners.** Follow-up to 1.41.0:
in the bounded-scroll mode the sticky `thead` background bled past the
wrap's `border-radius` at the top corners. Chrome does NOT clip a
`position: sticky` descendant's paint to an ancestor's
`overflow` + `border-radius`, so the header's `--bg-subtle` grey poked
out of the corner. Fixed with `clip-path: inset(0 round var(--radius-lg))`
on `.table-wrap--scroll`, which clips ALL descendants — sticky included —
to the rounded rect. Rounded corners preserved; sticky behavior
unchanged.

## [1.41.0] — 2026-06-05

**Minor. `DataTable` sticky header decoupled from its own scroll box —
fixes nested double-scroll + border artifacts inside a `Modal`.
Consumer-driven from despachos-ferreteria.**

Until now `stickyHeader` implied `max-height: 70vh; overflow-y: auto`
on the wrap, forcing the table to be its own scroll container. Inside a
`Modal` body (already `overflow-y: auto`) that produced two nested
vertical scrollbars and rounded-corner / scrollbar-track artifacts where
the sticky header met the wrap's radius.

### ⚠️ Behavior change
`stickyHeader` **no longer caps the height at `70vh`** — that cap moved
to the new explicit `maxHeight` prop. A standalone table that relied on
the implicit bounded scroll should add `maxHeight="70vh"` to restore it:

```diff
- <DataTable stickyHeader … />
+ <DataTable stickyHeader maxHeight="70vh" … />
```

Without `maxHeight`, `stickyHeader` now sticks the header to the nearest
**scrolling ancestor** (a `Modal` body, the page) instead of an internal
box — usually the nicer default, but a visible change for existing
standalone sticky tables.

### Added
- `maxHeight?: string | number` on `DataTable`. Caps the table height
  and scrolls the body inside a bounded box (the wrap becomes the
  vertical scroll container; a `stickyHeader` pins to it). Accepts any
  CSS length (`'70vh'`, `480`, `'30rem'`).

### Changed
- `stickyHeader` alone now leaves the wrap as a non-scroll-container
  (`overflow: visible`) so the header sticks to an outer scroller — one
  scroll, no nested bar, no corner artifacts. CSS forces `overflow-y` to
  `auto` whenever `overflow-x` is `auto`, so a horizontal scroll and
  stick-to-ancestor can't coexist: a **wide** table needs the bounded
  (`maxHeight`) mode for its own horizontal scroll; without it a wider-
  than-container table relies on the ancestor's scroll.

### Internal
- Storybook: `StickyHeader` now uses `maxHeight={300}` (was a `className`
  max-height hack); new `Sticky header en Modal (un solo scroll)` story.

### Compatibility
API-additive (`maxHeight` is new, nothing removed), but `stickyHeader`'s
runtime behavior changed — see the behavior-change note above.

## [1.40.0] — 2026-06-04

**Minor. Two independent changes — consumer-driven from
despachos-ferreteria.**

### Added — `isDateDisabled` on `DatePicker` and `DateRangePicker`
Until now the date pickers could only constrain a contiguous range via
`minDate`/`maxDate`. The new `isDateDisabled?: (date: Date) => boolean`
predicate disables arbitrary days — specific weekdays, holidays,
blackout dates — so the rule is enforced in the calendar instead of
documented in a hint and caught on submit.
- A day the predicate marks renders disabled: greyed (`is-disabled`),
  native-`disabled` (so keyboard Tab skips it and it can't be clicked),
  and never emitted via `onChange`.
- Composes with `minDate`/`maxDate`: a day is disabled if it falls
  outside the range OR the predicate marks it.
- `DateRangePicker`: a range endpoint can never land on a disabled day;
  a disabled day inside an otherwise-valid span stays greyed but is
  included (the span is allowed).
- E.g. block Sundays: `isDateDisabled={d => d.getDay() === 0}`.
- A single predicate covers every case (weekday, holiday set, blackout
  ranges) without adding N props, so no `disabledDaysOfWeek` sugar was
  added — the predicate is what consumers use.

### Fixed — `Button variant="link"` no longer animates a press
The press effect (`scale(0.98)` + shadow) lives in the global
`.btn:active` rule, which `.btn--link` inherited — so a text link
"shrank" on click like a pressable surface. `link` is a text
affordance, not a surface: `.btn--link:active` now resets `transform`
and `box-shadow`, so its only feedback is the existing hover (secondary
color + underline). The other variants (`primary`, `outline`, `ghost`,
`subtle`, `danger`, …) keep the press unchanged.

### Internal
- Storybook: `DatePicker con días deshabilitados` (Sundays) and a
  `Button` `Link` story (with `iconLeft`, mirroring "Volver a órdenes");
  `link` added to the variant control. The smoke gallery `DatePicker`
  entry now disables Sundays so this stays visible.

### Compatibility
Non-breaking, both parts. Without `isDateDisabled` the pickers behave
exactly as before; the `link` button just stops shrinking on click. No
API removed, no code changes for consumers.

## [1.39.0] — 2026-06-04

**Minor. `Combobox` now distinguishes the selected option from the
keyboard/hover highlight — consumer-driven from despachos-ferreteria.**
With a value already chosen, opening the dropdown showed two grey rows:
the selected option (`--color-primary-50` tint) and the first option
(the `active` descendant, which defaulted to index 0). In palettes
where the selected tint reads close to the `active` grey, the two were
indistinguishable — looked like "two selected".

### Changed
- The selected option now carries an unambiguous **check marker** (the
  kit `Check` icon, brand-accent colored), the standard accessible
  pattern (Radix Select, Headless UI, Linear). The `active`
  (keyboard/hover) highlight stays background-only and never shows the
  check, so the two states are always distinguishable regardless of
  palette. This brings `Combobox` in line with `MultiCombobox`, which
  already marked selected rows with a check.
- On open with a value, the `active` descendant now starts ON the
  selected option (and scrolls it into view) instead of index 0. With
  no value, it still starts on the first option. Typing to filter still
  resets the highlight to the first match.
- The listbox now keeps the active option scrolled into view as the
  keyboard cursor moves (the list adjusts its own `scrollTop` only —
  it never scrolls the page).
- The clear (`×`) button grew from 22×22 to 24×24 to meet the WCAG
  2.5.8 tap-target floor — surfaced by the smoke touch-target sweep
  once the gallery exercised the selected state.

### Internal
- The option row was restructured (content column + trailing check);
  `renderOption` output sits in the content slot, the check trails — so
  custom option renderers are unaffected.
- Storybook: new `Combobox con selección` story (pre-selected value);
  the smoke gallery `Combobox` entry now ships a selected value so this
  regression stays visible.

### Compatibility
Non-breaking. No API change — consumers see the corrected behavior on
bump, no code changes.

## [1.38.2] — 2026-06-04

**Patch. `Carousel` pagination dots are now a 24×24 tap target + the
responsive smoke sweep grows two new gates (more routes, touch
targets).**

### Fixed
- `Carousel` pagination dots were an 8×8 button — below the WCAG 2.5.8
  24×24 minimum target size and genuinely hard to tap on a phone. The
  button is now a 24×24 hit area with the small visual dot rendered as
  a centered `::before`, so the look is unchanged (8px dot, 24px active
  pill) while the tap target meets the floor. Caught by the new
  touch-target sweep below.

### Internal — testing
- `smoke/e2e/responsive.spec.ts` grew two gates:
  - **More routes** in the page-overflow + console breakpoint check:
    added `/scenarios`, `/scenarios/modal`, `/scenarios/brand`,
    `/scenarios/table`, `/scenarios/badges`. The `timeline-milestone*`
    scenarios stay out — they're fixed `repeat(5, 1fr)` desktop
    comparison grids (a geometry harness, asserted by scenarios.spec.ts)
    that don't shrink to 375px by design.
  - **Touch-target floor** (WCAG 2.5.8) on `/gallery` at 375px:
    interactive controls under 24×24 in BOTH dimensions are flagged.
    Native form inputs (UA-sized checkbox/radio/switch) and
    wide-but-short controls are out of scope. `Rating`, `TagInput`, and
    `JsonViewer` are allowlisted (intentionally compact, non-touch-first
    affordances); everything else must meet the floor.

### Compatibility
Non-breaking. The `Carousel` dot keeps its visual size and behavior; only
the hit area grew.

## [1.38.1] — 2026-06-04

**Patch. `Container` no longer overflows a width-constrained parent +
new responsive-overflow smoke gate.**

### Fixed
- `<Container>` was `box-sizing: content-box` (the default) with
  `width: 100%` + `paddingInline: var(--space-4)`, so it rendered
  `2×var(--space-4)` (32px) wider than its parent and overflowed any
  width-constrained context — a column, a card, a narrow viewport.
  A full-viewport page masked it via the body's own margins. Now
  `box-sizing: border-box`, so `width: 100%` includes the gutter and
  the container exactly fits its parent. This is also the expected
  semantics of a max-width container with an inline gutter.

### Internal — testing
- New `smoke/e2e/responsive.spec.ts`: a horizontal-overflow sweep at
  375 / 768 / 1280 / 1920 px. On `/gallery` (every component, each in a
  `data-comp` section) it gates per-component overflow and names the
  offender; on the real routes (`/`, `/client`) it gates page-level
  overflow + console errors at each breakpoint. This is the gate that
  caught the `Container` bug above. `AppShell` is allowlisted (its
  `100vw` full-bleed breakout overflows the synthetic padded gallery
  section by design; no real consumer nests it in a card).

### Compatibility
Non-breaking. The `Container` fix only removes an unintended overflow;
no API change.

## [1.38.0] — 2026-06-04

**Minor. `DataTable` surface control: opt-in elevation token +
`surface="flush"` for embedding in a Card — consumer-driven from
despachos-ferreteria.** A standalone `<DataTable>` on a tinted canvas
read as flat because `.table-wrap` carried border + radius but no
shadow, unlike `.card` (which has `--shadow-card`). And embedding a
no-toolbar table in a `<Card>` doubled the border (the single-surface
`.table-surface` mode only activates with a `toolbar`).

### Added
- `--table-elevation` token (default `none`), consumed by both
  `.table-wrap` and `.table-surface`. Raise it to a real shadow on
  `.appshell` or any ancestor — e.g.
  `.appshell { --table-elevation: var(--shadow-card); }` — to make
  tables float on a tinted canvas with the same elevation as `<Card>`.
  When a toolbar is present the shadow lands once on the outer
  `.table-surface`; the inner wrap resets it (no double elevation).
- `surface?: 'card' | 'flush'` prop on `DataTable` (default `'card'`).
  `'flush'` drops the table's own border, radius, and elevation (and
  un-rounds the header) so it sits clean inside a parent that already
  owns the surface — the embedded-in-`Card` case. Works with or
  without a toolbar (the modifier lands on whichever element owns the
  chrome).
- Storybook: `Elevada sobre canvas tintado (--table-elevation)`;
  `TablaSobreCard` updated to use `surface="flush"`.

### Why elevation is opt-in (not a new default)
A `<DataTable>` is embedded inside another surface (Card, panel, tab)
more often than it floats standalone, so defaulting it to a shadow
would stack shadow-on-shadow in the common case. The token keeps the
flat default and lets a tinted-canvas page elevate per-app.

### Compatibility
Non-breaking. `--table-elevation` defaults to `none` (current flat
look) and `surface` defaults to `'card'` (current chrome). Every
existing consumer renders identically without any change.

## [1.37.0] — 2026-06-03

**Minor. `AppShell` header padding is now overridable via CSS vars —
consumer-driven from despachos-ferreteria.** The header band's inner
padding was hardcoded (`8px 16px` desktop, `8px 12px` mobile), so the
edge controls (hamburger, avatar) couldn't be aligned with the content
gutter (`.appshell__content` is 24px) without redeclaring the internal
rule.

### Added
- `--appshell-header-pad-y` (default `8px`) and
  `--appshell-header-pad-x` (default `16px` desktop / `12px` mobile)
  on `.appshell`. Override either on `.appshell` or any ancestor —
  e.g. `.appshell { --appshell-header-pad-x: 24px; }` aligns the
  header controls with the content gutter. A consumer-set
  `--appshell-header-pad-x` applies to both breakpoints; left unset,
  each keeps its prior hardcoded fallback.
- Storybook story `Topbar · Header padding override (CSS var)`.

### Compatibility
Non-breaking. The vars default to the previous hardcoded values, so
every existing consumer renders identically without any change.

## [1.36.2] — 2026-06-03

**Patch. Closes two bugs in `CommentThread` inline that survived
1.36.1. The scrollbar one took a few wrong stabs before pinning the
root cause — root-cause notes are recorded below to save the next
person the loop.**

### Fixed
- **Phantom scrollbar that 1.36.1 did NOT fix — root cause was font
  loading, not border-box math.** The auto-grow effect was running
  too early, while the textarea was still measuring against the
  browser's fallback font metrics. The kit's web fonts (Outfit / DM
  Sans) carry a taller line-height than the fallback, so when the
  swap completes the textarea's real natural height grows by ~2px —
  exactly the gap that left `overflow-y: auto` showing a scrollbar
  at rest. The earlier border-compensation theory looked plausible
  (`scrollHeight + computedBorder` SHOULD match the rendered box)
  but the underlying metric was shifting under us as the font loaded.
  The fix runs the auto-grow once on mount and then again when
  `document.fonts.ready` resolves: in prod (font cached) the second
  pass is essentially free, on a cold load it re-measures right after
  the font swap. The auto-grow also switched from `useLayoutEffect`
  to `useEffect` so the first read happens after paint, and it now
  uses `el.offsetHeight` after `style.height = 'auto'` (rendered box,
  border-box border already included) instead of computing
  `scrollHeight + computedBorder`.
- **Compose row sits below the vertical centre in empty state.**
  `.comments` is a flex column with `gap: var(--space-4)`. Even when
  `comments` is empty the `<ul class="comments__list">` was still
  rendering (0 height, no children), and the flex gap applied between
  the invisible list and the compose — leaving a 16px phantom slot
  above the compose. Measured: 36px above vs 20px below the compose
  in a `CardBody` of 101px. Fix is to skip the `<ul>` entirely when
  `comments.length === 0`. When at least one comment exists, the list
  renders normally and the gap is the same as before.

### Internal
- Storybook story `CommentThread · Inline (chat-style)` empty-state
  panel is now framed in a card-like container that mirrors how the
  consumer wraps it — the centring fix is visible at a glance.

### Compatibility
Non-breaking. No API change. Consumers on `inputLayout="inline"` see
both bugs disappear without touching their code.

## [1.36.1] — 2026-06-02

**Patch. Fixes two visual bugs in `CommentThread` `inputLayout="inline"`
that broke the "clean chat-style" sensation in the steady (empty /
1-line) state. Consumer-driven from despachos-ferreteria.**

### Fixed
- **Scrollbar visible on first paint with an empty textarea.** 1.35.0
  promised "auto-grows up to ~5 lines (140px ceiling), then scrolls
  internally" but the inline CSS override only set `min-height: 0`,
  leaving the textarea without `max-height` or `overflow-y`. With JS
  re-setting `style.height` to `scrollHeight` and the kit's base
  textarea having `min-height: 96px`, browsers showed a phantom
  scrollbar even in the empty state. Now `.comments__compose--inline
  .textarea` has `max-height: 140px` (matches `INLINE_MAX_HEIGHT_PX`
  in JS) and `overflow-y: auto` — the scrollbar appears only when the
  content actually exceeds the ceiling.
- **"Enviar" button mis-aligned to the bottom-right at 1-line state.**
  1.35.0 used `align-items: end` so the button stays anchored to the
  textarea's bottom edge as it grows multi-line — correct at 4-5
  lines, but at the 1-line baseline (the steady state) the button
  sits at the bottom-right while the placeholder is vertically
  centered. The wrap now defaults to `align-items: center` and the
  component toggles `.is-grown` when the textarea grows past its
  1-line baseline (`scrollHeight > baseline + 4px`), flipping
  alignment to `flex-end`. The 4px epsilon absorbs subpixel rounding
  so the wrap doesn't flicker at the boundary.

### Internal
- New state `grown` + ref `baselineRef` in `CommentThread`. The
  baseline is captured on the first inline-mode paint with the empty
  textarea (= 1-line `scrollHeight` of the runtime font). Cleared
  when leaving inline mode so a re-entry re-measures.

### Compatibility
Non-breaking. No API change. Consumers already on `inputLayout="inline"`
see both bugs disappear without touching their code.

## [1.36.0] — 2026-06-02

**Minor. New `<TimeAgo>` + `<TimeAgoDate>` components and smart-time
helpers — consumer-driven from despachos-ferreteria feature 06.** The
pattern (adaptive relative+absolute label, semantic `<time>` element,
absolute datetime in the kit's `Tooltip`) was validated locally in
despachos for months; promoted to the kit now that cobros-meson,
rentools and marginapp are all heading toward feeds/history surfaces.

### Added — components
- `<TimeAgo iso="…" side?="top" now?={...} />` and
  `<TimeAgoDate iso="…" side?="top" now?={...} />`. Both render a
  semantic `<time dateTime={iso}>` wrapped in the kit's `Tooltip` (the
  tooltip shows the absolute datetime regardless of how compact the
  visible label is).
- **SSR-safe hydration**: the first render (server + first client
  paint) emits the absolute label so server and client HTML match
  byte-for-byte; a `useEffect` then swaps to the smart relative label
  post-mount. No hydration mismatches from clock skew / TZ drift.
- New type export: `TimeAgoProps`.

### Added — helpers
All take `(iso: string, locale: UiKitMessages, now?: Date)` and return
a string — useful when the consumer wants the formatted text without
the component wrapper (chip label, inline string interpolation, etc).
- `smartDateTime` — adaptive scale: `<1 min` → "ahora" / "pronto";
  `<60 min` → "hace N min" / "en N min"; same day → "hoy HH:MM";
  ±1 day → "ayer HH:MM" / "mañana HH:MM"; `<7 days` → "lun HH:MM";
  same year → "12 mar"; else "12 mar 2025". Drops the HH:MM portion
  when the input has no meaningful time-of-day.
- `smartDate` — same scale, date-only (time always ignored).
- `formatIsoDate` — absolute compact date: "12 mar" / "12 mar 2025".
- `formatIsoDateTime` — absolute compact date+time: "12 mar, 14:30".

Naming note: the kit already exposes `formatDate(d: Date, format)` in
`utils/dateFormat` for the Pickers; the new helpers take an ISO string
+ locale and live in `utils/smartTime` under the `formatIso*` namespace
to avoid clashing with the existing export.

### Added — locale keys
`timeAgo.now`, `timeAgo.soon`, `timeAgo.minAgo` (template `hace {n} min`),
`timeAgo.minIn` (`en {n} min`), `timeAgo.today`, `timeAgo.yesterday`,
`timeAgo.tomorrow`, `timeAgo.weekdaysShort` (lowercase 3-letter array,
index 0 = Sunday to match `Date.prototype.getDay()`), and
`timeAgo.monthsShort` (lowercase 3-letter array, index 0 = January).

### Design notes
- **Determinism, no Intl**: the kit formats dates manually rather than
  via `Intl.DateTimeFormat`. Intl honours the runtime locale, which
  differs between server and client in Next App Router and triggers
  hydration warnings on edge cases. Manual formatting is byte-stable
  across environments.
- **Day-precision heuristic**: inputs of the form `YYYY-MM-DD` or
  `YYYY-MM-DDT00:00:00Z` are treated as day-precision markers (no
  meaningful time-of-day). The label drops the HH:MM portion in those
  cases — otherwise every Bsale-sourced date would render with a
  spurious "mié 00:00".
- **TZ handling**: day-precision inputs (the two shapes above) are
  pinned to the calendar day's local midnight so a negative TZ doesn't
  shift the label by one day. Timestamps with a real time-of-day are
  parsed as the JS spec dictates (UTC if `Z`, local otherwise).
- **No internal ticker**: `<TimeAgo>` is stateless after the post-mount
  flip. The consumer is responsible for triggering re-renders (e.g.
  react-query refetch, focus refresh). A built-in tick-every-minute is
  a deferred feature — keeps v1 simple and teardown-safe.

### Compatibility
Pure addition. No existing API touched. The new exports
(`TimeAgo`, `TimeAgoDate`, `TimeAgoProps`, four helpers, nine locale
keys) are additive and non-breaking.

## [1.35.0] — 2026-06-02

**Minor. `CommentThread` gains an opt-in inline (chat-style) compose
layout — consumer-driven from despachos-ferreteria.** The default
stacked layout (textarea above, action row below) reads as visually
disjointed for short coordination comments, especially in empty
states where there's nothing above to anchor the input vertically.
The new `inputLayout="inline"` adopts the Linear/Slack quick-comment
pattern.

### Added
- `inputLayout?: 'stacked' | 'inline'` on `CommentThreadProps`,
  default `'stacked'`.
- In `'inline'`:
  - Textarea and submit share a single flex row, button anchored to
    the textarea's bottom edge.
  - Textarea starts at `rows={1}` and auto-grows up to ~5 lines
    (140px ceiling), then scrolls internally.
  - **Enter** submits; **Shift+Enter** inserts a newline — chat
    convention.
  - `allowInternal` is intentionally ignored — the checkbox doesn't
    fit the compact row. Use `'stacked'` if you need it.
- Storybook story `CommentThread · Inline (chat-style)` with empty
  state + filled state side-by-side.

### Compatibility
Non-breaking. `inputLayout` defaults to `'stacked'`; consumers that
omit it see identical behavior — rows=3, Enviar button below,
`allowInternal` honoured. Enter in stacked mode still inserts a
newline (default form behaviour).

## [1.34.0] — 2026-06-02

**Minor. `AppShell` ships a built-in menu toggle — consumer-driven
from cobros-meson feature 07.** Until now, getting a working drawer
trigger (mobile) or rail/hide toggle (desktop) required passing a
function to `header.left` that consumed the `headerApi.toggle`
render-prop. Every consumer re-implemented the same hamburger; the
mobile path was particularly fragile because forgetting to wire the
trigger left the drawer inaccessible. The new `showMenuToggle` opt-in
solves both with one prop.

### Added
- `showMenuToggle?: boolean` on `AppShellProps`. When `true` and the
  shell has a sidebar (`sections.length > 0`), the kit prepends a
  standard `MenuIcon` button to `header.left`. Click drives the same
  DWIM `toggle()` (drawer in mobile, collapsed in desktop). The button
  carries `aria-label`, `aria-expanded`, `aria-controls` pointing at
  the sidebar `id`, and uses the kit's focus ring.
- New locale key `appshell.toggleMenu` (default ES "Abrir menú").
- Stable `id="appshell-sidebar"` on the `<aside>` so `aria-controls`
  has a target.
- Storybook story `Topbar · Built-in menu toggle (showMenuToggle)`.

### Changed
- `.appshell--header-top .appshell__header-left` gained `gap: 10px` so
  the built-in toggle has breathing room from whatever the consumer
  puts in `header.left`. Additive; harmless for consumers that ship a
  single element in that slot (most cases).

### Compatibility
Non-breaking. `showMenuToggle` defaults to `false` — the render-prop
remains the only path otherwise. When both are provided, the kit
toggle renders first and the consumer's slot content renders after
it, so existing render-prop consumers can opt in without losing their
custom trigger.

## [1.33.0] — 2026-06-02

**Minor. Bundles two consumer-driven changes from cobros-meson
feature 07: `DateRangePicker` gains opt-in apply mode + uncontrolled
support, and three icon gaps land with a full catalogue in the
README.**

> Note on versioning: an intermediate `1.32.0` tag exists on `main`
> for the DateRangePicker apply-mode commit but was never published
> to npm — `1.33.0` is the first published version that includes
> those changes. Consumers using `^1.x` get both features
> automatically via `1.33.0`.

### Added — `DateRangePicker` apply mode (originally tagged 1.32.0)
`DateRangePicker` was previously controlled-only and live: every day
click fired `onChange`, the "Aplicar" button just closed the popover.
Two problems for consumers running a server query off the range —
no way to batch, and a footgun where ignoring the intermediate
`{ from: d, to: null }` silently froze the picker. The apply mode
fixes both.
- `defaultValue?: DateRange` — initial value in uncontrolled mode
  (omit `value`).
- `onApply?: (range: DateRange) => void` — opt-in callback that fires
  only when the user commits (via the "Aplicar" button or a preset).
  Day clicks update an internal draft instead of firing `onChange`.
- `onOpenChange?: (open: boolean) => void` — generic open/close hook.
- Closing the popover without applying (Escape, outside-click, or
  toggling the trigger) reverts the draft to the last applied value.
- Storybook: `Rango de fechas · Modo Aplicar (uncontrolled)` story
  showing the apply-only contract with a hit counter.

### Added — icons
Three lucide-style icons that close real gaps vs the 69-icon set
already shipping from the barrel. Consumer feedback claimed the kit
"only exports `CalendarIcon` and `MenuIcon`" — the gap was discovery,
not amplitude (see Docs below).
- `List` — three-line list with leading bullets. Distinct from
  `Rows3` (table view) and `MenuIcon` (hamburger).
- `Wallet` — classic wallet. Distinct from `CreditCard`.
- `History` — counter-clockwise refresh with inner clock. Distinct
  from `Clock` (instant) and `RefreshCw` (generic refresh).

### Changed — `DateRangePicker`
- `value` and `onChange` are now optional (controlled mode is opt-in
  via `value`). When both `value` and `onApply` are present, day clicks
  no longer fire `onChange`; apply commits fire `onApply` and
  `onChange` together so the controlled `value` stays in sync.

### Docs
- README: the `### Iconos` section now lists the full catalogue
  grouped by category, with a pointer to `Storybook › Foundations /
  Icons › Galería` for visual browsing.
- README: the AppShell example now notes that `items.icon` can use
  the bundled set directly — especially relevant for `collapsedRail`
  navs where the icon is the only affordance.

### Compatibility
Non-breaking. Existing `DateRangePicker` consumers passing `value` +
`onChange` without `onApply` see identical behavior: live `onChange`
on every click and "Aplicar" closes only. The new behavior is opt-in
via `onApply`. Icon additions are pure additions to the barrel.

## [1.31.1] — 2026-06-01

**Patch. AppShell mobile scrim / drawer now match the body's exact
bounds.** User reported the mobile scrim mismatched the body in both
axes:
- Horizontal: scrim spanned the full viewport (320) while the header was
  constrained by body's UA-default 8px margin (304) → ~8px gap on the
  right.
- Vertical: scrim was sized by `calc(100dvh − var(--appshell-header-
  height))` using the 56px var, but the rendered header was 73px tall
  (consumer chrome with padding around the logo) → scrim extended
  ~17px past the body's bottom.

### Fixed
- `.appshell.appshell--header-top` spans the full viewport via the
  classic breakout: `width: 100vw` + `margin-left: calc(50% - 50vw)`.
  Consumers who already reset body margin see no difference.
- The scrim moved into `.appshell__body` (was a sibling). It now uses
  `position: absolute; inset: 0` against the body, so it matches the
  body's bounds in both axes — no viewport math, no header-height var
  to keep in sync.
- The mobile drawer (aside) likewise switched from `position: fixed;
  top: var(--appshell-header-height); height: calc(100dvh - header)` to
  `position: absolute; top: 0; bottom: 0` anchored to the body. Same
  argument: the body knows its own height.

### Internal
- `.appshell--header-top .appshell__body` gets `position: relative` so
  the scrim + drawer can anchor to it.

## [1.31.0] — 2026-06-01

### BREAKING CHANGES
- **`headerLayout="side"` removed.** The kit now exposes a single layout
  (full-width header above the body). All `side`-only props removed:
  `brand`, `brandCollapsed`, `topbar`, `user`. Migration: move brand to
  `header.center`, move user/utilities to `header.right`, replace the
  built-in hamburger with a render-prop trigger in `header.left`.
- **`headerLayout` prop removed** (was the discriminator). `AppShellProps`
  is no longer a discriminated union — a single flat interface exports
  the kept props: `header`, `sections`, `theme`, `headerTheme`,
  `collapsedRail`, `defaultCollapsed`, `collapsed`, `onCollapsedChange`,
  `persistKey`, `footer`, `linkAs`, `className`, `children`.
- **Removed locale keys**: `appshell.expandMenu`, `appshell.collapseMenu`,
  `appshell.expand`, `appshell.collapse`, `appshell.openMenu`,
  `appshell.closeMenu` (all chevron/hamburger labels were `side`-only).
  Kept: `appshell.mainNav`, `appshell.breadcrumb`.
- **Built-in collapse chevron removed** (was a `side`-only idiom). Collapse
  is driven exclusively by the consumer's `header.left` render-prop now.
- **CSS removed**: `.appshell__brand[-text]`, `.appshell__foot-text`,
  `.appshell.is-collapsed .appshell__brand`, `.appshell--brand
  .appshell__brand`, `.appshell--brand .appshell__collapse*`,
  `.appshell__main`, `.appshell__topbar*`, `.appshell__hamburger*`,
  `.appshell__collapse*`, and the legacy `@media (max-width: 900px)`
  block that powered the `side` mobile drawer. ~400 lines of CSS deleted.

**Minor (renamed scope). Mobile drawer + responsive hardening.** Pre-1.31,
under 900px the shell rendered the header + content but had no way to reach
the nav: the legacy `@media (max-width: 900px)` block was written for
`side` (recolumns `.appshell` via `grid-template-columns`, no-op on the
`top` shape which uses `grid-template-rows`), and there was no built-in
hamburger. Reported by despachos + cobros-mesón on their phones — the
sidebar was simply unreachable.

### Added
- **Mobile drawer in `headerLayout="top"`.** Below 900px the sidebar becomes a
  `position: fixed` overlay anchored beneath the header (`top:
  var(--appshell-header-height)`), slides in from the left to `min(280px,
  85vw)`, and dims the rest of the viewport with a scrim. ESC closes; tap on
  scrim closes; tap on the consumer trigger toggles. No built-in hamburger —
  the existing `header.left` render-prop drives it (consumer keeps the
  trigger's look).
- **`headerApi.toggle()` is now DWIM by viewport.** On desktop it flips
  `collapsed` as before; on mobile (≤900px) it flips an overlay drawer
  (`is-mobile-open`) and leaves `collapsed` untouched. Same single click
  handler regardless of breakpoint — the pattern Linear / Vercel use. Listener
  cleans up `mobileOpen` when the user resizes back into desktop so a stale
  drawer cannot ghost.
- **`--appshell-header-height: 56px`** exposed as a public CSS var on
  `.appshell.appshell--header-top`. Consumer sticky sub-headers/drawers can
  anchor to the header's bottom edge without hardcoding the 56. The header's
  `min-height` now reads from the same var (single source of truth).
- **`aria-hidden`** on the closed mobile drawer so screen readers don't tab
  through 30 offscreen nav links.
- Story `Topbar · Mobile drawer (≤900px)` + smoke scenario
  `/scenarios/appshell-top-mobile` with Playwright assertions for the
  open/close + scrim + ESC paths.

### Changed
- The desktop "hide / rail" overlay rules
  (`.appshell--header-top:not(.appshell--rail).is-collapsed ...`) are now
  scoped to `@media (min-width: 901px)` so they don't compete with the mobile
  rules below the breakpoint. Pure refactor — desktop behaviour byte-identical
  at ≥901px.

### Smoke harness
- New scenario `appshell-top-mobile` covers: desktop in-flow aside (≥1024px),
  mobile fixed-overlay offscreen aside (375px), trigger-tap opens to `left:0`,
  ESC closes, scrim-tap closes.

### A11y hardening (post-review)
- **`aria-hidden` actually lands** on the closed mobile drawer: `isMobile`
  switched from `useRef` to `useState`, so the breakpoint flip triggers a
  re-render and the attribute reaches the DOM. Pre-fix it was dead code (a
  ref mutation never re-renders).
- **Focus trap inside the open drawer** via the shared `useFocusTrap` hook
  (extracted from Overlay.tsx alongside `useEscape` and `useScrollLock`).
  Opening the drawer focuses the first nav link; Tab/Shift+Tab cycle within;
  closing the drawer restores focus to the trigger.
- **Body scroll lock** while the drawer is open, shared with the
  Modal/Drawer counter (kit-wide nesting safe).
- 5 new vitest assertions cover aria-hidden lands closed / removed open /
  absent on desktop, body overflow:hidden engages on open, focus moves +
  returns on close.

### Internal
- `useFocusTrap`, `useEscape`, `useScrollLock` extracted from
  `src/components/Overlay.tsx` to `src/hooks/` so Modal/Drawer and the
  AppShell mobile drawer share a single implementation. Re-exported via
  `src/hooks/index.ts` for internal consumers only — NOT added to the
  public barrel `src/index.ts` (kept internal until names + docs stabilise).
  Modal/Drawer behaviour byte-identical (9/9 tests still green).

### iOS Safari URL-bar safety (post-review)
- **`100vh` → `100vh` + `100dvh` fallback** on `.appshell.appshell--header-top`
  height so the shell tracks the dynamic viewport edge as the URL bar
  shows/hides. Older browsers ignore the second declaration and keep `100vh`
  (same shape, clipped at the bar). Chrome 108+, Safari 16.4+ use `dvh`.
- **Mobile aside + scrim sized by `calc(100vh - header)` / `calc(100dvh -
  header)`** instead of `bottom: 0` — iOS Safari clipped fixed `bottom: 0`
  by the URL bar. Now the bottom edge tracks the visible viewport.

### `side` brand sidebar band-aware (audit P1 #4)
- `<aside class="appshell__sidebar">` now carries `data-tone="inverse"`
  when `theme="brand"`, mirroring the `top` brand header treatment.
  Descendants (Avatar / Badge / inline icons / links) re-scope foreground
  tokens automatically — previously they kept their default colors against
  the brand-primary surface, a potential AA contrast failure on text.

### Mobile drawer variant smoke (matrix)
- 3 new smoke routes pin the variant combinations: `brand` (sidebar
  surface stays themed + white-α right border), `collapsedRail`
  (mobile overrides the desktop 72px rail rule), `no-nav` (no aside +
  header still compacts to `auto 1fr auto`).
- Visual pass via Playwright MCP confirmed the 4 mobile scenarios at
  375×667 + desktop at 1280×800 with no regression.

### Bug caught by the variant smoke
- The original mobile rule restated `background: var(--bg-surface)` on
  the aside, which TIED on specificity with `.appshell--brand
  .appshell__sidebar { background: var(--color-primary) }` and won by
  source order — silently flattening the brand surface to white in
  mobile. The brand smoke caught it (sum of RGB channels = 765 = white).
  Fix: drop the redundant `background` / `border-right` from the mobile
  rule (both already on the base `.appshell__sidebar`), let the brand
  rule paint as designed. Comment in the CSS documents the trap so a
  future contributor doesn't reintroduce it.

### Side mobile drawer UX + a11y (audit P1 #6 fully closed)
- **Chevron in the drawer foot is context-aware in mobile.** Pre-fix, tapping
  the chevron while the drawer was open in mobile toggled `collapsed` — the
  drawer stayed at 280px width but lost all labels (a UX dead-end: the user
  wanted to close, but got an icon-only zombie drawer). Now, when
  `isMobile && mobileOpen`, the chevron closes the drawer instead. Icon
  stays `<` (chevron-left) as a "close back to the left" affordance.
  `aria-label` switches to "Cerrar menú" (new i18n key
  `appshell.closeMenu`).
- **CSS neutralizes `.is-collapsed` visibility effects while
  `.is-mobile-open`** (labels, badges, section labels, brand padding,
  brand-text, foot-text, navchildren, sidebar-foot layout). A persisted
  `collapsed=true` (from desktop via `persistKey` or controlled mode) no
  longer strips the drawer's content when the user reaches it on a phone.
- **Brand block now picks the FULL `brand` in mobile-open** (instead of
  `brandCollapsed`). Pre-fix, a shell with `defaultCollapsed=true` or a
  persisted desktop collapse showed `brandCollapsed` (mark-only) inside
  the open mobile drawer — a tiny logo floating in an empty band, while
  the labels below rendered full-size. Inconsistent. Now both the brand
  content selection AND the visibility cascade treat the open mobile
  drawer as fully expanded.
- **ESC closes the drawer; focus traps inside the open drawer; body
  scroll locks while open.** Reuses the shared `useFocusTrap` /
  `useEscape` / `useScrollLock` hooks (the same Modal/Drawer and the top
  mobile drawer use).
- **`aria-hidden`** on the closed mobile side drawer (`isMobile` is state,
  not ref, so the attribute actually lands).
- **iOS Safari URL-bar safety** on the side aside: `top: 0; bottom: 0`
  used to clip behind the URL bar. Now sized by `height: 100vh; height:
  100dvh` (same pattern as the top mobile drawer).
- New smoke scenario `/scenarios/appshell-side-mobile` + 2 e2e
  assertions covering the chevron-closes + ESC-closes-with-scroll-lock
  paths.

### Controlled static button in mobile (caught by user)
- A controlled consumer with a static button in `header.left` that calls
  `setCollapsed` directly (i.e., not the render-prop `headerApi.toggle`)
  read as dead in mobile: flipping `collapsed` had no visual effect
  because the aside was a fixed overlay independent of `collapsed`. The
  TopbarRail Storybook story is exactly this shape, and any consumer
  using a custom header chrome with its own controlled state hits the
  same wall.
  Fix: in mobile, mirror `collapsed` → `mobileOpen`. Any change to
  `collapsed` (controlled or uncontrolled) flips the drawer. A prev-value
  ref prevents the initial-render auto-open that would otherwise fire
  just because the shell happens to default to `collapsed=false`.
  Semantics now: `collapsed=true` means "menu hidden" in both viewports —
  rail/hide on desktop, drawer-closed on mobile.

### No rail in mobile (caught by user)
- Desktop body-grid rules for the `side` rail and the `top` hide/rail were
  unscoped — they fired at every viewport. With `collapsed=true` persisted
  from desktop (via `persistKey` or controlled mode) and the user on a
  phone, the outer grid resolved to `72px 1fr` or `0 1fr` even though the
  aside was already a fixed overlay. Visible artifact: a 72px (or 0)
  empty grid track on the left of the content area — a phantom rail
  margin pushing the content off-center.
  Fix: scope the three desktop rules to `@media (min-width: 901px)`:
  - `.appshell.is-collapsed { grid-template-columns: 72px 1fr }`
  - `.appshell--header-top.is-collapsed .appshell__body { 0 1fr }`
  - `.appshell--header-top.appshell--rail.is-collapsed .appshell__body { 72px 1fr }`
  In mobile, the outer grid stays single-column (`1fr`) regardless of
  `collapsed` / `collapsedRail`. The aside (fixed overlay) owns the
  visibility of the menu; the grid only describes the content area.

### Bug caught by user (hide-mode collapse)
- In `headerLayout="top"` without `collapsedRail`, when the user collapsed
  the sidebar the aside went `position: absolute` and slid off-screen
  correctly — BUT the `<main>` then auto-placed into the freed grid col 1
  (0 width) instead of col 2 (1fr). Visible artifact: a 48px-wide main
  strip (just its own 24+24 padding) + a phantom scrollbar at the body's
  right edge.
  Root cause: an absolutely-positioned grid item leaves the auto-placement
  flow. With aside out, main (the next in-flow item) takes col 1.
  Fix: `.appshell--header-top:not(.appshell--no-nav) .appshell__content
  { grid-column: 2 }` inside the desktop media. Main is now ALWAYS pinned
  to col 2 when there's a sidebar, regardless of whether the aside is in
  flow or absolute. `no-nav` is excluded so a single-column grid doesn't
  spawn an implicit second track.
  Pinned by a smoke geometry assertion: at 1440px viewport collapsed-no-rail,
  `main.width >= body.width - 5` (within rounding).

## [1.30.6] — 2026-05-29

**Patch. Compact + milestone alignment.** In `density="compact"` the milestone
marker shrinks from 32px to 16px (compact CSS wins on specificity over the
milestone width rule). But the 1.30.1 `margin-left: -4` — sized to centre the
**32px** milestone against the 24px default in default density — was not
overridden in compact. Result: a 16px milestone with margin-left:-4 sat 4px
LEFT of the 16px default and the connector. Visible as a dog-leg in story #10.

### Fixed
- **`.timeline--compact .timeline__marker--milestone { margin-left: 0 }`.** In
  compact, milestone and default markers are both 16px → nothing to compensate
  → no shift. All three markers + the connector now share the same x-axis.
- New smoke scenario `/scenarios/timeline-milestone-compact` (`default →
  milestone → default` per tone at compact density) + assertion that the
  3 marker centres land within 1px of the connector centre per tone.

## [1.30.5] — 2026-05-29

**Patch. Connector top symmetry.** 1.30.3 closed the gap on the BOTTOM side of
the connector (where it enters the next marker), but the TOP side (where it
emerges from the current marker) still had a 2px gap: `top: 28` lived 2px
below the default marker's bottom (margin-top:2 + height:24 = 26). The line
started "slightly detached" from the marker it came out of — visible as a thin
air gap.

### Fixed
- **`top` overlaps the source marker by 2px on all three sizes.** Now the line
  emerges flush from the marker's bottom edge — the marker (z-index:1, opaque
  fill) occludes the 2px overlap, same trick as the bottom-side `−20px` fix.
  - Default: `top: 28 → 24` (marker bottom 26 − 2).
  - Milestone: `top: 36 → 32` (marker bottom 34 − 2).
  - Compact: `top: 20 → 17` (marker bottom 19 − 2).
- Smoke spec now asserts BOTH the bottom-side reach AND the top-side attach
  for each tone — symmetric guard, so a future top-side regression fails here
  not in a consumer's review.

## [1.30.4] — 2026-05-29

**Patch. Connector x-axis alignment.** The connector vertical line ran 2px to
the LEFT of the marker centres because the marker's box-sizing was the CSS
default (`content-box`), so `width: 24px + border: 2px` rendered at 28px wide
→ marker centre at x=14, but the connector at `left: 11px; width: 2px` is
centred at x=12. Visible as an off-center connector line in every Timeline.

### Fixed
- **`.timeline__marker { box-sizing: border-box }`.** Declared width now
  matches the visual width (24px / 16px compact / 32px milestone), so the
  marker centre sits at x=12 (24/2) for default and x=12 for milestone
  (32/2 + margin-left:-4), aligned with the connector. The kit doesn't ship a
  global `* { box-sizing }` reset (only form controls have it), so the
  property must be set on the marker explicitly.
- Smoke spec extended with a new test that asserts `connector centre.x ≡
  marker centre.x` (within 1px) for both default and milestone, per tone.
  Catches any future visual offset before it ships.

## [1.30.3] — 2026-05-29

**Patch. Universal connector-reach fix.** v1.30.2 only patched the default→
milestone direction, but the underlying bug was global: the base connector
rule's `bottom: -12px` left a 6px gap to EVERY next marker (not just
milestones). The 24px default markers masked the gap visually because the
tone-colored border drew the eye across it; the 32px milestone markers (and
the milestone → default direction) made it impossible to ignore.

### Fixed
- **Base connector rule extended `-12 → -20`.** The line now lands 2px INTO
  the next marker top in every direction: default↔default, default↔milestone,
  milestone↔default, milestone↔milestone. The marker (z-index: 1, opaque
  fill) occludes the 2px overlap → solid line into solid marker, no visible
  gap. The 1.30.2 `:has(+ .timeline__item--milestone)` special-case became
  redundant and was removed.
- **Smoke spec extended** to assert the reach in BOTH directions per tone
  (default→milestone AND milestone→default), so a future regression in either
  direction fails immediately.

### Visible delta
Every Timeline in every consumer sees its connector lines extend ~8px more.
This is the bug — they should have reached the marker all along. The fix is
the line you'd draw in design, not the one the math left short.

## [1.30.2] — 2026-05-29

**Patch. Visual regression fix.** The connector line between a default item
and a milestone item below it ended ~6px ABOVE the milestone marker — the line
hung in the air instead of reaching into the marker top.

### Fixed
- **Connector reaches the milestone marker top.** The default item's
  connector is calibrated for the 24px marker that normally follows it
  (`bottom: -12px`); when a 32px milestone marker follows, the larger marker
  border sits 6px lower and the translucent halo above it doesn't bridge the
  gap visually — leaving the line hanging. Now `.timeline__item:has(+
  .timeline__item--milestone)::before { bottom: -20px }` extends the line so
  it lands 2px past the marker border top → solid line into solid border, no
  visible gap. Scoped via `:has(+ …)` so default → default connectors are
  untouched. Pinned by an extended Playwright spec on
  `/scenarios/timeline-milestone` that asserts the connector's pseudo bottom Y
  reaches at least the milestone marker top Y, for each of the 5 tones.

## [1.30.1] — 2026-05-30

**Patch. Visual regression fix.** v1.30.0 added the `milestone` variant
(32×32 marker) without realigning the centre axis. When a Timeline mixed a
milestone with default items (24×24), the centres landed on different vertical
axes (4px offset) and the connector line ran through the LEFT side of the
milestone instead of through its centre — the line looked visibly crooked.

### Fixed
- **`.timeline__marker--milestone` centred with default markers.** A
  `margin-left: -4px` shifts the 32px milestone's centre from x=16 to x=12,
  matching the 24px default marker centre at x=12 (and the connector at
  `left: 11px`). The fix is scoped to the milestone marker; nothing else
  moves. Pinned by an extended spec on `/scenarios/timeline-milestone` that
  asserts CENTRE.X equality (within 1px) between the milestone marker and the
  default marker below it, for each of the 5 tones.

## [1.30.0] — 2026-05-30

**Minor. Additive — no breaking changes.** From a real consumer (despachos): an
order-detail timeline with an "Orden creada" anchor at the top, accumulating
operational dispatch events below it. The anchor needs more visual weight than
the events that hang from it; pre-1.30.0 the default hollow marker was
*lighter* than the colored operational markers, **inverting the hierarchy**.

### Added
- **`TimelineItem` `variant?: 'default' | 'milestone'`** (orthogonal to `tone`
  and `state`). Milestone upgrades the marker to **32×32 filled in the tone
  color with a soft halo**, so anchor events out-rank the operational events
  visually. Combinable with all 5 tones; combinable with `state` (a pending
  milestone stays hollow muted, preserving "not yet" while keeping the larger
  anchor slot; a current milestone gets the existing pulse halo). The
  connector top is re-anchored so the line clears the taller marker.
  ```tsx
  <Timeline>
    <TimelineItem variant="milestone" state="done" tone="success" title="Orden creada" />
    <TimelineItem state="done" tone="success" title="Despacho 1/3" />
    {/* … events hanging from the anchor … */}
  </Timeline>
  ```

### Internal
- New tests in `Display3.test.tsx` — variant class applied + composes with each
  of the 5 tones; back-compat (no variant) renders byte-equivalent to 1.29.x.
- New smoke scenario `/scenarios/timeline-milestone` + spec — renders all 5
  tones and asserts each milestone marker computes to 32×32 with a visible
  tone-tinted halo and non-transparent fill.
- Two new Storybook stories: `#7 Milestone · 5 tonos lado a lado` and
  `#8 Milestone · despachos anchor + eventos`.

## [1.29.0] — 2026-05-29

**Minor. Color-system tidy-up — no API change.** Eight coherence fixes to the
kit's color tokens, audit-driven. Brand palettes (default warm-earth + El Alba
Pantone 287 C blue / 165 C orange) are untouched.

### Fixed
- **Surface tier ordering** (A). Both presets had `--bg-canvas` sitting BETWEEN
  `--bg-subtle` and `--bg-muted` in luminance — the source of the "neutral
  Badge vanishes on canvas" bug parched with the hairline in 1.26.0. Re-anchored
  so canvas is the deepest tier in both presets (surface > subtle > muted >
  canvas, strictly). Default canvas `#fef5ef → #ede1cc` (warm taupe). El Alba
  canvas `#eaeef5 → #dde3ed` (a step deeper cool slate). Default
  `--fg-muted`/`--fg-subtle` re-tuned to clear AA on the new (deeper) canvas
  while preserving the warm-earth undertone. El Alba `--fg-subtle` re-tuned
  (`#666b78 → #5e6373`). **Pinned by the new `tests/SurfaceTiers.test.tsx`**
  so the inversion cannot return.
- **`--color-info` scale → cyan-leaning blue** (B). Pre-1.29.0 the scale
  (`#1a73c2` at -600) sat in the same hue family as El Alba's brand navy
  (`#002f87`), so info Badges and primary CTAs fought for the eye. Re-anchored
  to Tailwind's `sky` scale (`#0284c7` at -600), distinctly cyan from any brand
  navy while still reading as "blue" (info icons + alerts). Improves the
  default palette too (slightly more cyan info, harmonises with warm-earth).
- **`--color-yellow` scale → true gold** (C + D + E). Pre-1.29.0 the scale was
  amber-orange (`#f59f00` at -500), sitting in the same hue family as El Alba's
  brand orange (`#ff671d`) → a warning Badge next to a primary CTA read as
  "two warnings". Re-anchored to Tailwind's `yellow` scale (true gold) and
  moved the `--color-warning` alias from -500 to -600 so all four semantics
  sit at the same luminance neighbourhood (~L52–58): a row of {success,
  warning, danger, info} Badges now reads with **even weight** instead of
  warning being noticeably lighter. The harmonised 50 stops also normalise
  the soft-Badge register.
- **`--cat-1` (blue) and `--cat-4` (amber) re-mapped in El Alba** (F). They
  clashed with brand primary (navy) and secondary (orange). Overridden in the
  preset only: `cat-1` → cyan/teal `#0891b2`, `cat-4` → chartreuse-lime
  `#65a30d`. The other 4 cats keep their base values (no collision). The
  default preset cats are untouched (no brand collision there).
- **Single focus identity** (G). `--border-focus` moved from `--color-secondary`
  to `--color-primary`, so a focused element shows a primary border + a primary
  halo (instead of an orange border + a blue halo — two brand colours fighting
  on a single signal). Accent focus is still available via `--focus-ring-accent`
  for the rare accent-specific contexts.
- **Focus ring alphas aligned at 16%** (H). Pre-1.29.0 they were 15 / 35 / 18
  with no documented rationale (`accent` at 2.3× the other two). Now uniform.

### Changed
- **`--fg-link-hover` stays in the link's own brand family** (audit #8). Was
  `var(--color-secondary-600)` — the COMPLEMENTARY brand colour (blue link →
  orange hover in El Alba), brand-bold but visually agitated in dense product
  UI (DataTable rows of links). Now `var(--color-primary-900)` — one shade
  darker than `--fg-link` itself, the standard pattern (Apple, GitHub, Linear).
  The cross-brand accent is still available where consumers genuinely want it.

### Internal
- New guard `tests/SurfaceTiers.test.tsx` — asserts strict luminance ordering
  of `surface > subtle > muted > canvas` in every preset.
- Existing `Contrast.test` re-validates every fg/bg pair under the new values
  (44/44 pass).
- New smoke scenario `/scenarios/badges` + spec — renders the four semantic
  soft Badges in a row and asserts (1) every bg is in the soft register
  (L > 0.85) and (2) the spread between brightest and darkest is < 0.06 →
  catches a future drift in any semantic -50 stop.

## [1.28.0] — 2026-05-28

**Minor. Additive — no breaking changes.** From a real consumer (despachos):
a Timeline showing an order accumulating envíos/retiros until completed had no
way to express progress — only event tone. Three orthogonal additions cover the
scan-the-progress pattern without touching the 1.x look.

### Added
- **`TimelineItem` `state?: 'done' | 'current' | 'pending'`** (orthogonal to
  `tone`). The connector above each item re-paints with the state, so a single
  glance reads the progress: solid coloured for `done`, pulsing ring around the
  marker for `current` (gated by `prefers-reduced-motion`), dashed muted for
  `pending`. Default (no `state`) renders the 1.x look exactly.
- **`Timeline` `density?: 'default' | 'compact'`** — shrinks marker, gap and
  font sizes for sidebars / list summaries. Semantically identical.
- **`TimelineItem` `right?: React.ReactNode`** — trailing slot on the title
  row, aligned right. Useful for a `Badge` marking event type (envío / retiro /
  nota) without bloating the title. Title-row wrapper only renders when `right`
  is provided → DOM is byte-identical for existing consumers.

### Internal
- New CSS modifiers (`.timeline__item--done|--current|--pending`,
  `.timeline--compact`, `.timeline__title-row`, `.timeline__right`) and a
  per-item `--timeline-tone` token (read by marker + connector + pulse) so
  one tone decision drives every progress-state visual.

### Stories
Six Timeline stories in Storybook on the same despachos dataset for comparison:
default, Progress, Numeric (composition), Compact, Event-typed, Inline payload
(composition).

## [1.27.0] — 2026-05-28

**Minor. Additive — no breaking changes.** From a real consumer (cobros-meson,
a flat-route checkout flow): the kit had no top-bar-only mode, so the consumer
hand-rolled a custom header instead of using `AppShell` because `AppShell`
required `sections` and always rendered a sidebar.

### Added
- **`AppShell` top-bar-only mode.** `sections` is now optional. In
  `headerLayout="top"`, omitting it (or passing `[]`) renders just the header
  band over a single-column content area — **no sidebar at all**. For flat-route
  apps (kiosk, single-flow tools, checkout) that don't need panel navigation.
  Same `header.{left,center,right}` slots; no new component, no new variant.
  ```tsx
  <AppShell headerLayout="top" header={{
    left:  <Link href="/"><Logo … /></Link>,
    right: <span>Cobros Khipu · Mesón</span>,
  }}>{children}</AppShell>
  ```
  Internally the shell gets an `appshell--no-nav` modifier that collapses the
  body grid to a single column; the `<aside>` is not rendered. `side` layout
  is unchanged (an empty `sections` array there still renders the rail, as
  before). Required-in-`side` is enforced by docs/JSDoc, not by the type
  (kept as a simple optional to avoid bloating the discriminated union).

## [1.26.0] — 2026-05-27

**Minor. Visible default change (no API change).** A consumer (despachos)
reported neutral Badges vanishing on the tinted page canvas — they blended
into `--bg-canvas` and didn't stand out.

### Fixed
- **Neutral `Badge` now carries the soft `--border-default` hairline** (was a
  transparent border). Root cause: the neutral badge's fill is `--bg-subtle`,
  which is designed to sit ON white surfaces; on a tinted canvas (e.g. El Alba
  `--bg-canvas`) `--bg-subtle` ≈ `--bg-canvas`, so with no border the chip had
  no visible boundary. The hairline is the kit's standard soft delineator — the
  **same token `Card` and `Chip` already use** — so the neutral badge now reads
  on **any** surface tier (white card, table, or tinted canvas) instead of only
  on white. **Pit of success: consumers no longer need to wrap status chips in
  a white surface to keep them legible.**
  - This is a deliberate reversal of the 1.10.0 "no border" sub-decision (which
    targeted dense white tables). The other 1.10.0 quiet-default wins stay: no
    caps, tinted text. It is a **hairline**, not the loud `--fg-default` ink
    ring 1.10.0 removed.
  - **Visible delta for all consumers:** every neutral `<Badge>` gains a 1px
    `--border-default` outline. Colored/solid variants are unchanged (they
    already override `border-color`).

## [1.25.1] — 2026-05-27

**Patch. Bugfix.** Popover/combobox panels could drift off their anchor when
their own content resized.

### Fixed
- **`usePopoverPosition` recomputes on content resize.** A `ResizeObserver` on
  the panel re-runs the (rAF-coalesced) position pass when the content's size
  changes — e.g. a Combobox list shrinking as the query filters options. Before
  this, coords computed for the initial (tall) size went stale: a `top`-flipped
  panel that then shrank kept its high `top` and drifted up off the anchor.
  Guarded for SSR/old runtimes (`typeof ResizeObserver !== 'undefined'`).

## [1.25.0] — 2026-05-26

**Minor. Additive — no breaking changes.** Icons + a first-class icon slot for
segmented controls, for an icon-based view switcher (despachos: Tabla / Agenda
/ Zona / Tarjetas / Tablero).

### Added
- **5 icons** (Feather/lucide style, `currentColor`, stroke-based — same `make()`
  factory as the rest): `Rows3` (Tabla), `CalendarDays` (Agenda), `Map` (Zona),
  `LayoutGrid` (Tarjetas), `Columns3` (Tablero). Named `Rows3` rather than
  `Table` because the kit already exports `Table` (the `<table>` element wrapper
  in Layout); `Rows3` is the standard lucide name. `MapPin` already existed
  (reuse it for a pin instead of a folded map). All added to the smoke icon grid
  + reviewed `ICON_NAMES`.
- **`ToggleGroupItem` / `SegmentedControlItem` `icon` prop.** Optional leading
  icon, aligned via the toggle's built-in flex gap. Children still work as
  before (the prop is opt-in). For an **icon-only** segment, pass `icon` with
  no children and an `aria-label` (icons render decorative/`aria-hidden`):
  ```tsx
  <SegmentedControlItem value="table" icon={<Table size={16} />}>Tabla</SegmentedControlItem>
  <SegmentedControlItem value="table" icon={<Table size={16} />} aria-label="Tabla" /> {/* icon-only */}
  ```

## [1.24.0] — 2026-05-26

**Minor. Layout behavior change in `headerLayout="top"` — no API change, not
breaking.** From a real consumer: scrolling long content in `top` scrolled the
whole page, carrying the header (logo + collapse hamburger) away and desyncing
the sidebar/rail.

### Fixed
- **`top` now uses the standard app-shell internal-scroll model.** The shell is
  capped at the viewport (`height: 100vh`, replacing the inherited
  `min-height`); the header (row 1) and sidebar (row 2) stay static and **only
  the content scrolls**. A consumer's in-page sticky sub-header
  (`position: sticky; top: 0`) now anchors cleanly to the top of the content
  viewport.
  - The `top` sidebar is reset to `height: auto` (the base is `height: 100vh`
    for the `side` sticky model) so it fills its grid row instead of
    overflowing it and adding a second scrollbar.
  - `overflow-y: auto` is scoped to `.appshell--header-top .appshell__content`
    only — the `side` layout's page-scroll model is untouched. Content padding
    is unchanged.
  - **Consequence:** the `top` shell now owns the viewport height. Render it at
    the root or inside a `100vh` container (a `min-height` wrapper no longer
    bounds it). `side` consumers are unaffected.

## [1.23.0] — 2026-05-26

**Minor. Additive — no breaking changes.** Closes a gap a consumer measured in
1.22.0: in `headerLayout="top"`, `persistKey` (uncontrolled) could not coexist
with a header trigger — the shell rendered `header.{left,center,right}` as
static nodes with no handle to the collapse state, and `top` has no built-in
toggle, so an uncontrolled shell had no way to collapse from the header and
`persistKey` was effectively a no-op there.

### Added
- **Header-slot render-props.** `AppShellHeader` slots
  (`left`/`center`/`right`) now accept a function `(api: AppShellHeaderApi) =>
  ReactNode` in addition to a static `ReactNode`. The API is
  `{ collapsed, toggle, setCollapsed }`, letting a consumer-placed control
  (hamburger) drive the sidebar — the only path in **uncontrolled** `top`.
  New exported types: `AppShellHeaderApi`, `AppShellHeaderSlot`. Static-node
  slots are unchanged (render-prop is opt-in). This makes the documented
  `persistKey` + header-hamburger pattern actually wire up in `top`:
  ```tsx
  <AppShell headerLayout="top" persistKey="despachos.sidebar"
    header={{ left: ({ collapsed, toggle }) =>
      <button aria-expanded={!collapsed} onClick={toggle}><MenuIcon/></button>,
      center: <Logo/> }} />
  ```

## [1.22.0] — 2026-05-26

**Minor. Additive — no breaking changes.** AppShell remembers its collapsed
state across reloads, opt-in. From a real consumer: the sidebar reset to
expanded on every page reload.

### Added
- **`AppShell` `persistKey?: string`.** Opt-in: pass a key and the collapsed
  state is persisted in `localStorage[persistKey]`, surviving reloads. Omit it
  and behaviour is unchanged (resets to `defaultCollapsed` per mount).
  - **SSR-safe.** The initial render still uses `defaultCollapsed` (server and
    first client render agree → no hydration mismatch); the stored value is
    read after mount. A differing stored value may flash for one frame.
  - **Uncontrolled only.** Ignored when `collapsed` is provided — controlled
    mode owns its own persistence.
  - **Resilient.** `localStorage` access is guarded (try/catch); a throwing or
    unavailable store (Safari private mode) falls back to `defaultCollapsed`
    and never crashes the shell.

### Changed
- **`AppShell` `headerLayout="top"` + `collapsedRail` no longer renders its own
  bottom collapse toggle.** In `top`, collapse is driven *only* by the
  consumer's `header.left` control, uniformly across hide and rail modes —
  removing the two-control redundancy (header hamburger **and** rail chevron)
  that `collapsedRail` introduced in 1.21.0. The bottom chevron stays a
  `side`-only idiom (its sidebar has no header to host a hamburger). Affects
  only `top`+`collapsedRail` consumers that relied on the built-in toggle; wire
  the collapse to your existing `header.left` hamburger instead. `side` layout
  is unchanged.

## [1.21.0] — 2026-05-25

**Minor. Additive — no breaking changes.** AppShell `top`-brand polish:
band-aware Avatar + documented collapse pattern. From using
`headerLayout="top" theme="brand"` in a real consumer.

### Added / Changed
- **Band-aware `Avatar`.** On an inverse/brand surface the avatar becomes a
  translucent-white chip with on-brand text (instead of the default
  light-blue chip), so it reads correctly on a brand header **without the
  consumer passing colors**. Driven by `data-tone="inverse"` — the same
  re-scope that tints the sidebar/header. The **`AppShell` brand header
  now sets `data-tone="inverse"`** on its `<header>` (when
  `headerTheme="brand"`), so an avatar in `header.right` is band-aware
  automatically. Outside the AppShell, wrap the branded surface in
  `data-tone="inverse"`/`.surface-inverse`. Default avatar (non-inverse
  surfaces) is unchanged. AA pinned in `Contrast.test`.
  - Fixes the story modeling a weak pattern (white avatar + dark-blue text
    on the brand band): it now shows the correct translucent chip with no
    hand-set colors.

- **`AppShell` `collapsedRail`** (`headerLayout="top"` only). Opt-in: collapse
  to a 72px **icon rail** (nav icons, labels hidden, active-item bar kept)
  instead of hiding the sidebar entirely, plus a built-in expand/collapse
  toggle at the bottom of the rail. Reuses the `side` layout's rail
  mechanics. Default `false` = the original hide behavior (back-compat).

### Docs
- DESIGN.md: band-aware Avatar; and the `headerLayout="top"` collapse
  pattern — by default `collapsed` hides the sidebar entirely (consumer
  wires a hamburger in `header.left`); `collapsedRail` opts into a 72px
  icon rail with a built-in toggle. Canonical snippet included.

Guards: `tests/AppShellTop.test.tsx` (brand header carries
`data-tone="inverse"`), `tests/Contrast.test.tsx` (translucent chip AA).

## [1.20.0] — 2026-05-25

**Minor. Visual default change to `Card`** (both palettes). Follow-up to the
v1.16 tinted El Alba canvas: a card needed a real elevation to read as
floating, which the tinted canvas exposed.

### Added / Changed
- **`Card` elevation.** New `--shadow-card` / `--shadow-card-hover` tokens —
  two layers (fine contact shadow + diffuse lift), tinted with the blue-ish
  ink (not pure black) so they sit on both palettes. `Card` now floats on
  `--shadow-card` by default (was the single-layer `--shadow-sm`);
  `Card interactive` lifts to `--shadow-card-hover` on hover. Accent cards
  keep their rail and pick up the same elevation.
- **No double elevation.** A `.card` nested inside another `.card` drops its
  shadow (it's a sub-panel, not a second floating surface) — keeps border +
  radius. Verified in Storybook (nested card → `box-shadow: none`).

### Canvas-tint regression audit (v1.16 follow-up — no fixes needed)
Audited every component/token that assumed a white canvas after v1.16
turned the El Alba canvas cool-slate. **No regressions found:** all
backgrounds already use tokens (no hardcoded `#fff`/`white` that would seam
against the canvas; the `rgba(255,255,255,x)` values are overlays on
brand/dark surfaces). Tier order holds (canvas < subtle < muted < surface);
AppShell already uses `--bg-canvas` for the shell and `--bg-surface` for the
sidebar; WCAG of `--fg-*` on `--bg-canvas` is pinned AA by `Contrast.test`.
The one real consequence — `--border-default` (#e3e6ec) barely separating a
card from the #eaeef5 canvas — is exactly what the `Card` elevation above
resolves. No visual-snapshot baseline exists in the repo, so nothing to
regenerate.

Pinned by `tests/CardElevation.test.tsx`. DESIGN.md updated.

## [1.19.0] — 2026-05-25

**Minor. Additive — no breaking changes.** Two form-ergonomics gaps that
surfaced building a real data-dense screen (despachos) against the kit.

### Added
- **`NumberInput` `fullWidth`.** Fills the container width — the field grows
  and left-aligns — instead of the default intrinsic inline width. Mirrors
  `Button`'s `fullWidth` (→ `.btn--block`); new `.number-input--block` class.
  Removes the need for consumers to hand-override `.number-input` width inside
  a full-width `FormField`.
- **`Combobox` `renderOption`.** Custom renderer for each listbox row
  (`(option) => ReactNode`) — e.g. an id `Badge`/mono code next to the name.
  Falls back to `label` (+ `description`) when omitted; the searchable input
  still shows `label` as text (only the rows are customized).

Pinned by `tests/Inputs.test.tsx` (block modifier) and
`tests/ComboboxRenderOption.test.tsx`. Stories: `NumberInputFullWidth`,
`ComboboxRenderOption`.

## [1.18.1] — 2026-05-22

**Patch.** `AppShell` sidebar layout: fix the collapsed brand header being
8px taller than the topbar, which broke the alignment of the two header
dividers at the sidebar/main corner. Collapsing changed the brand's
vertical padding (12px → 16px); now it stays 12px (only the horizontal
padding narrows for the rail), so both headers are the same height in both
states. Guarded in `tests/AppShell.test.tsx`.

## [1.18.0] — 2026-05-22

**Minor. Additive at runtime; tightens types.** Two AppShell improvements.

### Added
- **`AppShell` `headerTheme`** (`headerLayout="top"` only). Themes the
  header band independently of the sidebar; defaults to `theme`, so
  `theme="brand"` still tints both (back-compat). `theme="default"
  headerTheme="brand"` = a brand top bar over a neutral sidebar (common
  data-heavy admin pattern). New `.appshell--header-brand` class drives the
  brand header (decoupled from `.appshell--brand`).

### Changed
- **`AppShellProps` is now a discriminated union** keyed on `headerLayout`
  (`AppShellBaseProps` + `AppShellSideProps` + `AppShellTopProps`).
  TypeScript now rejects layout-mismatched props at compile time
  (`brand`/`topbar`/`user` only with `side`; `header` only with `top`) —
  previously they were silently ignored at runtime. **Runtime output is
  byte-identical.** Types-only tightening: the only code that breaks is code
  that was already passing no-op props for its layout. Kept as **minor**
  (owner call): functionally additive, no runtime change.

Pinned by `tests/AppShellProps.test.tsx` (type contract) and
`tests/AppShellTop.test.tsx` (3 theming guards).

## [1.17.0] — 2026-05-22

**Minor. Additive — no breaking changes.** Consumer-driven: these gaps
surfaced building a real data-dense screen (despachos) against the kit.

### Added
- **Layout: `Grid` responsive columns.** `columns` now accepts a
  per-breakpoint object: `<Grid columns={{ base: 1, sm: 2, lg: 4 }}>`. Each
  breakpoint inherits the previous when omitted; breakpoints match the kit
  tokens (sm 480 · md 768 · lg 1024 · xl 1280). Number/string/`minColWidth`
  forms unchanged.
- **Layout: `Cluster`.** Horizontal group that wraps (tag lists, chip rows,
  button bars) — sugar for `<Stack direction="row" wrap>`.
- **Layout: `Spacer`.** Flexible spacer (`flex: 1`, pushes flex siblings
  apart) or a fixed gap on the space scale with `size`.
- **Categorical accents.** Six well-separated hues for CATEGORY (zones,
  regions, teams), distinct from status colors. New tokens `--cat-1..6`
  (+ `-bg` soft + `-fg` ink, all ≥ 4.5:1 AA, pinned in `Contrast.test`,
  palette-neutral in the base). Exposed as `Card accent="cat-1..6"` and
  `Badge variant="cat-1..6"`. Plus **`Card accent="neutral"`** (grey rail).
- **`SegmentedControl`** (+ `SegmentedControlItem`). Single-select toggle
  group with equal-width segments — the view-switcher case, with no `type`
  discriminant to forget. Wraps `ToggleGroup type="single"`.
- **Date helpers** (`src/utils/dateFormat`): `formatRelativeDay(iso, {locale,
  now})` ("Hoy"/"Mañana"/"Ayer" then localized weekday), `isToday`,
  `isTomorrow`, `isYesterday`. Timezone-deterministic — a date-only ISO maps
  to the calendar day written, never UTC-shifted (SSR-safe). Pass `now` to
  pin. Tested in `tests/RelativeDay.test.tsx`.

### Docs
- Storybook: `GridResponsive`, `ClusterDemo`, `SpacerDemo`,
  `CategoricalAccents`, `SegmentedControlDemo`, `CardComoLink`.
- DESIGN.md: documented compact card-as-link (`<Card interactive asChild>`
  over a Link — no separate `ListRow` needed).

## [1.16.0] — 2026-05-22

**Minor.** Visual change to the **El Alba preset only** (the generic base
is unchanged). No API changes. Affects every El Alba consumer (barritas,
marginapp, etc.) — review once after bumping; it's a strict figure/ground
improvement.

### Changed (El Alba preset)
- **Tinted canvas.** `--bg-canvas` `#fff` → **`#eaeef5`** (subtle cool-slate).
  A white canvas equalled a white surface, so Cards, DataTable and filters
  dissolved into the page (zero figure/ground). White surfaces now read as
  elevated against a cool-slate page background **without the consumer
  touching CSS**.
- **Re-scaled background tiers** (semantics preserved — `subtle`→`muted`
  stays the hover progression, so ghost-button / footer hovers don't
  invert):
  - `--bg-subtle` → `#f1f4f9` (inset on a surface: table header, card footer)
  - `--bg-muted`  → `#e7ebf2` (stronger inset / hover, still "below" subtle
    in luminance = more prominent)
  - `--bg-surface` stays `#fff`; order: canvas < subtle < muted < surface.
- **`--fg-subtle`** `#686d7c` → **`#666b78`** (one slate step darker). The
  darker canvas dropped `fg-subtle`/`fg-meta` on canvas to 4.44:1 (just
  under AA); this clears it (~4.58 canvas / ~5.33 surface / ~4.77 subtle).
  Captions/meta read a hair stronger everywhere.

Pinned by `tests/Contrast.test.tsx` (27 pairs, all AA). DESIGN.md updated.

## [1.15.0] — 2026-05-20

**Minor.** Additive. AppShell gains a top-header layout variant. The
default `headerLayout="side"` output is **byte-identical** for existing
consumers — only opting into `headerLayout="top"` changes anything.

### Added
- **`AppShell` `headerLayout`** (`'side'` default · `'top'`).
  - `'side'` (default): legacy shell — brand at top of sidebar, topbar
    inside main. Unchanged.
  - `'top'`: full-width header above the body with three slots
    (`header.left`, `header.center`, `header.right`). Brand lives in
    `header.center` at the **true viewport centre** (`1fr auto 1fr` column
    grid — the centre slot is geometrically centred independent of how
    wide the left/right zones grow). The sidebar has no brand block;
    `collapsed` hides the sidebar entirely — no 72px rail. **The topbar is
    invariant to `collapsed`** — only `.appshell__body` animates its
    columns. `theme="brand"` tints both the header and the sidebar with
    the existing brand tokens (single knob).
- **`AppShellHeader`** type / `header` prop with `left`/`center`/`right`
  React.ReactNode slots (only used when `headerLayout="top"`).
- Storybook stories `TopbarCentered` (default light) and
  `TopbarCenteredBrand` (brand blue).
- **`Combobox` `searchable` prop** (`true` default · `false`). `false`
  swaps the trigger from a typeable `<input>` to a `<button>` (same shell:
  border / radius / chevron / focus ring) and shows the full options list
  without filtering — closes the gap between `<Select>` (native dropdown,
  jarring) and the searchable Combobox: same visual register, no input.
  Existing usages unchanged. Also: Enter no longer commits when the
  listbox is closed (previously could race with the open-on-click in the
  new button-trigger path; latent for the input path too, now consistent).

### Correctness (encoded by `tests/AppShellTop.test.tsx`)
- `.appshell.appshell--header-top` (2 classes, `(0,2,0)`) is used for the
  outer column override so it beats the legacy `.appshell.is-collapsed`
  rule (which also has `(0,2,0)`); else collapse re-introduces the legacy
  72px sidebar column and breaks the layout.
- Header uses `grid-template-columns: 1fr auto 1fr` so the centre slot
  lands at the absolute viewport centre.

### Unchanged (verified, must remain)
- The default `headerLayout="side"` shell is byte-identical to v1.14.x
  (asserted by the guard: no `.appshell__header`, sidebar `.appshell__brand`
  present, inline `.appshell__topbar` present).

## [1.14.0] — 2026-05-19

**Minor.** "Gold standard" pass: the kit renders a dense DataTable + filter
toolbar like the from-scratch reference **by default, no consumer
override**. Additive API/tokens; three visual defaults change in prod
consumers (barritas / marginapp / despachos) — intentional, documented
before→after.

### Added
- **Bundled mono — JetBrains Mono** (variable woff2, Latin, **72 KB**;
  same self-hosted pattern as Outfit/DM Sans, OFL-1.1, OFL.txt updated).
  `--font-mono` default is now `"JetBrains Mono", ui-monospace, …` instead
  of the system stack — tabular datasets (doc numbers, RUT, plates) render
  identically on every OS. Kit font payload 84 KB → **156 KB** (+72 KB);
  consumers that don't import `fonts.css` are unaffected (token falls back
  to the system stack as before).
- **`--fg-meta` role token** + **`.cell-meta`** (11px / lh16 / `--fg-meta`)
  and **`.cell-mono`** (`--font-mono` + tabular-nums) helpers. A
  secondary/eco cell line (e.g. "Factura electrónica" under a doc number,
  RUT under a customer) recedes on its own — no hand-tuned size/colour.
  `--fg-meta` is a distinct role separated from the essential `--fg-muted`,
  set to the lightest grey the kit ships that still clears WCAG AA on every
  surface it paints (= `--fg-subtle`; AA-enforced in both palettes by
  `Contrast.test.tsx`). **No accessibility exception.**
- **`--tracking-snug`** token (`0.02em`).
- **`.cell-wrap`** utility — opt one cell out of the table's
  `white-space:nowrap` so a free-text column (address, notes) wraps to
  multiple lines instead of pushing the whole table into horizontal scroll.
  Apply to a child of the accessor (`<div className="cell-wrap" …>`);
  `overflow-wrap:anywhere` also breaks pathological long tokens.

### Changed (visual — affects prod consumers)
- **DataTable primary cell text `--text-xs` → `--text-sm`** (≈12 → 14px).
  Compact padding (8·12) is unchanged; the eco line uses `.cell-meta`
  (11px). Matches the gold table's primary/secondary size split.
- **Table header lighter + tracked.** `.table th` `font-weight` 600 → 500,
  `letter-spacing` `--tracking-normal` → `--tracking-snug`. Colour
  unchanged (`--fg-muted`, 5.27:1 on `--bg-subtle`, AA — weight/tracking
  don't affect contrast). (1.10.0 had already moved 700→600 + caps→sentence
  + muted; 1.13.0 added the one-divider/no-seam surface.)

### Fixed
- **Row-hover no longer hides the neutral data-chip badge.** `.table tbody
  tr:hover` was `--bg-subtle`, the same token the v1.11 quiet badge uses
  for its background — neutral chips (e.g. "Envío", "Clase A4")
  disappeared on hover. Row-hover is now `--bg-muted` (one stop darker;
  already a kit semantic); variant chips (tinted `-50/-100`) unaffected.
  Pinned by `GoldStandard.test.tsx` so the two tokens can never collide
  again.

### Unchanged (verified, must remain)
- Badge default stays the quiet data-chip (v1.11.0); DataTable density
  stays compact-by-default (v1.10.0); the `toolbar`-owned single surface
  with no seam (v1.13.0). Guarded by `tests/GoldStandard.test.tsx`.

## [1.13.0] — 2026-05-19

**Minor.** Additive `DataTable` `toolbar` prop (no-toolbar output is
byte-identical) + a sticky-header colour fix that affects any consumer
using `stickyHeader` (e.g. despachos).

### Added
- **`DataTable` `toolbar` prop** — a toolbar/filter zone that shares the
  table's rounded surface. The DataTable owns ONE surface (`.table-surface`
  = the single authority for border + radius + `overflow:hidden`): the
  toolbar slot is clipped to the radius and carries the single divider, the
  inner `.table-wrap` defers its border/radius but stays the scroll/sticky
  context (unchanged), and the filled header drops its corner-rounding so
  the strip is clean in the corner — no stacked card-border + filter-border
  + header-top, no seam. Accepts any node (`<TableToolbar>`, `<FilterBar>`,
  a custom row). The header band's own fill/typography is untouched
  (geometry only). The legacy sibling pattern
  (`<TableToolbar/><DataTable/>`, seamed via `.table-toolbar + .table-wrap`)
  still works and is unchanged.

### Fixed (visual — affects prod consumers using `stickyHeader`)
- **Sticky header kept the grey band instead of turning white.**
  `.table-wrap--sticky .table thead th` hardcoded `background:
  var(--bg-surface)` (white), silently overriding the `--bg-subtle` grey
  header band on every sticky table. A sticky header only needs an *opaque*
  fill (so body rows don't show through on scroll) and `--bg-subtle` is
  already opaque, so it now matches the non-sticky header. The band's
  fill/typography is otherwise unchanged.

## [1.12.0] — 2026-05-18

**Minor.** Buttons are now colour-tokenized so a preset can re-skin them
without touching the global `--color-*` tokens. Additive; the generic
default is byte-identical. **El Alba preset only**: the primary/secondary
button colours are swapped, and the El Alba **primary** button carries a
**deliberate, owner-accepted WCAG-AA exception** (see below) — a visible
brand change in prod consumers on that preset (barritas).

### Added
- **Button colour tokens** — `.btn--primary` / `.btn--secondary` (and their
  `:hover`) read `--btn-primary-bg` / `-fg` / `-bg-hover` and the secondary
  equivalents, each with the original semantic token as the **fallback**.
  A preset can re-skin buttons in isolation (links, focus rings, badges,
  active states keep the unswapped `--color-*`). Default palette: no
  `--btn-*` defined → fallback governs → pixel-identical, no change.

### Changed (visual — El Alba preset only, affects barritas)
- **Primary ↔ secondary button colours swapped in the El Alba preset.**
  Secondary is now the brand blue (`--color-primary` `#002f87` + white =
  **11.96:1** ✓ AA, hover `--color-primary-900` 16.74:1) — this also
  retires the pre-existing sub-AA El Alba *secondary* button.

### Accessibility exception (deliberate, owner-accepted 2026-05-18)
- The El Alba **primary** button is the **exact brand orange** `#ff671d`
  (`--color-secondary`) + white = **2.91:1** (hover `#ff8344` = **2.44:1**)
  — **below WCAG AA**. The kit's "accessibility is owned" guarantee is
  **intentionally waived for this single button**: the kit owner chose
  brand fidelity over AA, eyes open, after reviewing the implications. This
  is **not silent debt** — it is pinned and bounded in
  `tests/Contrast.test.tsx` (the primary pair must stay this exact sub-AA
  value: it cannot drift, cannot get worse, and if it is ever "fixed" to AA
  the test fails so the exception is consciously removed) and annotated in
  `DESIGN.md`. The exception is exactly one surface pair plus its hover;
  every other El Alba (and default) button surface remains strictly AA.
  Consumers on the El Alba preset (barritas) inherit this on the primary
  CTA app-wide when they bump to `^1.12.0`.

## [1.11.0] — 2026-05-18

**Minor.** Quiet-defaults follow-up to 1.10.0, driven by building a real
dense table (driver list) + an edit modal. Additive API (`Badge` gains an
optional `tone`); three defaults change visually in prod consumers
(barritas / despachos) — intentional, the loud default was the defect.

### Added
- **`Badge` `tone` prop** (`'data'` default · `'label'`). `'data'` is the
  quiet data-chip register: sentence case, tinted text (`--fg-muted`), no
  hard border — it reads as metadata in a dense table. `'label'` opts into
  the brand micro-label (uppercase texture) for eyebrows / kickers / tags.
  Backward-compatible at the type level (new optional prop); orthogonal to
  `variant`.
- **`Badge` `appearance` prop** (`'soft'` default · `'solid'` · `'outline'`),
  orthogonal to `variant` (the colour role). `'soft'` is the tinted chip
  (unchanged default). `'solid'` is a filled chip (the variant's deep
  `--color-*-800` tone + white text); `variant="neutral" appearance="solid"`
  is the dark/ink tag. `'outline'` is a hairline chip (transparent fill,
  the deep tone for text + border). Both reuse the variant's already-shipped
  AA text token, so contrast is AA by construction — measured worst cases:
  solid white-on-tone ≥ **5.5:1** (warning yellow-800; El Alba accent
  5.47), outline tone-on-surface ≥ **5.56:1**. Supersedes the legacy
  `variant="solid"` / `"solid-orange"` magic strings (kept, not removed).
- **`.badge--info`** filled in: the `info` variant existed in the union
  since forever but had no CSS (it fell back to neutral). Soft register,
  same shape as the other status variants. Contrast info-800/info-50 =
  **7.85:1** ✓.

### Changed (visual — affects prod consumers)
- **`Badge` default is now the data-chip register.** Was uppercase
  (`--tt-label`) + ink (`--fg-default`) + a hard `--border-default` ring —
  it shouted as a status/type/price chip in dense tables. Now sentence
  case, `--fg-muted`, no hard border. Neutral contrast on `--bg-subtle`:
  default 16.0 → **5.27**, El Alba 17.2 → **5.66** (both still AA). Brand
  caps are not lost — opt in with `tone="label"`. The 1.10.0 P4 decision
  ("badges are micro-labels, keep caps") only held for eyebrow badges; it
  did not cover badges that carry a data value.
- **Form `Label` recedes.** `.label` was weight `700` + ink
  (`--fg-default`) — the scaffold weighed as much as the value. Now weight
  `500` + `--fg-muted`. Still AA on every surface it paints (default
  canvas 5.34 / surface 5.74 · El Alba 6.17 — guarded by
  `Contrast.test.tsx`). 1.10.0 fixed only the case (`--tt-data`); this
  fixes the weight/colour.

### Fixed
- **`Modal` body never scrolls horizontally.** `.modal__body` had
  `overflow-y:auto` with no `overflow-x`, which per the CSS spec computes
  `overflow-x:auto` → an ugly horizontal scrollbar on slightly-wide
  content. Now `overflow-x:hidden; overflow-y:auto; min-width:0` so a
  flex/grid child (e.g. a 2-column form) reflows/clips instead of forcing
  a blowout the consumer never asked for.

## [1.10.0] — 2026-05-17

**Minor.** Data-density / legibility pass driven by a data-heavy consumer
(despachos: tables + 7-filter rows + status columns). API additions are
purely additive (the `src/index.ts` barrel only gains exports — no removed
or renamed exports, no breaking change). Several **defaults change visually**
in production consumers (barritas / marginapp / despachos): this is
intentional — an illegible default was the defect. SemVer-honest minor.

### Added

- **`DataTable` interactive rows.** `rowHref(row)` and `onRowClick(row)`
  make every row navigable: the kit renders a real, stretched `<a>` /
  `<button>` that is keyboard-operable, screen-reader-named (`table.rowAction`
  → "Ver {label}"), with the focus ring on the row — valid table markup, no
  `role` hack on `<tr>`, no onClick-only div. `renderRow({row,cells,rowKey})`
  is the data-driven render-prop escape hatch (same family as
  `AppShell.linkAs`; deliberately not `asChild`). All optional; default off →
  existing usages render byte-identically.
- **`DataTable` `density` prop** (`'comfortable' | 'compact'`, default
  `'compact'`).
- **`Badge` `pulse` prop** — pulsing status dot so ONE component can own a
  status column (previously needed `StatusIndicator` + `Badge` mixed).
  Respects `prefers-reduced-motion`.
- **`--tt-data` text-transform hook** (`none`) for table headers + form
  labels; **`.fields--dense`** container utility (drops controls to 36px
  for dense desktop filter rows; the 44px touch default is unchanged).
- **`FilterBar` / `FilterField`** — the horizontal dense filter row that
  sits on top of a table (counterpart to `FilterPanel`'s vertical facet
  sidebar). `FilterBar` owns a responsive grid and applies `.fields--dense`
  so a mixed Select/Input/Combobox row is uniform; `FilterField` uses a
  deliberately quiet label register (no `--tt-label` mutation, so forms are
  untouched) and wires the label to its control. Props: `actions`,
  `minColWidth`, `columns`. Replaces the hand-rolled flex cluster.
- **`tests/Contrast.test.tsx`** — WCAG regression guard that parses the
  real token files and resolves the `var()` chains.

### Changed (visual — affects prod consumers)

- **Contrast to WCAG AA.** `--fg-muted` / `--fg-subtle` shipped below 4.5:1
  as body text on the kit's own surfaces. Minimal-delta, undertone-preserving
  fix in both palettes (gray scale untouched):

  | token · worst surface | before | after |
  |---|---|---|
  | default `--fg-muted` · table header (`--bg-subtle`) | 4.40 ✗ | **5.27** ✓ |
  | default `--fg-muted` · `--bg-canvas` | 4.46 ✗ | **5.34** ✓ |
  | default `--fg-subtle` · `--bg-canvas` | 2.34 ✗ | **4.82** ✓ |
  | default `--fg-subtle` · `--bg-subtle` | 2.31 ✗ | **4.75** ✓ |
  | El Alba `--fg-subtle` · `--bg-surface` | 3.74 ✗ | **5.16** ✓ |
  | El Alba `--fg-subtle` · `--bg-subtle` | 3.43 ✗ | **4.74** ✓ |
  | inactive sort glyph (UI, 3:1) | 1.75 ✗ | **3.17 / 3.34** ✓ |

  `--fg-muted` default `#78716c → #6b6560`; `--fg-subtle` default
  `#a8a29e → #726c66`; El Alba `--fg-subtle` `#7e8495 → #686d7c` (El Alba
  `--fg-muted` re-anchored to its slate `--color-gray-600` `#5b6173`,
  already AA — pixel-identical). **El Alba note:** this breaks
  `@misael703/elalba-ui@0.7.1` pixel-identity *by design* — v0.7.1
  `--fg-subtle` was sub-AA.
- **Type hierarchy restored.** `--tt-title` and `--tt-data` default to
  `none` (was `uppercase`): page/modal titles are sentence case; table
  headers and form labels read as data. `--tt-label` stays `uppercase`
  for true micro-labels only (badges, eyebrows, KPI labels). Headings,
  table `th`, form `Label`, and the appshell brand are no longer all-caps.
- **`DataTable` density-legible by default.** Cell padding `14px 16px →
  8px 12px`, font `--text-sm → --text-xs`, `white-space:nowrap` +
  ellipsis (cells no longer wrap to two lines — the #1 "heaviness"
  driver). `density="comfortable"` (`.table--comfortable`) restores the
  old 14/16 + wrapping. `.table--compact` kept idempotent.
- **Table header recedes.** `th` weight `700 → 600`, sentence case, normal
  tracking, padding `12/16 → 8/12` — it labels the data instead of
  competing with it.
- **`align` honored for element cells.** A right/centered column whose cell
  is a React node (e.g. an action `<button>` / flex wrapper) now actually
  aligns (was floated left; `text-align` alone doesn't move a block/flex
  child). Left columns are byte-identical (no extra class).
- **`Badge` quieter by default.** Weight `700 → 600`, padding `4px 10px →
  3px 8px`.
- **`Pagination` collapses** to nothing when everything fits one page (was
  a lone disabled pager); button weight `700 → 500`.
- **`Combobox` trigger reads as a field.** Border `--border-default →
  --border-strong`, radius `--radius-sm → --radius-md`, a chevron
  affordance, and the **same tokenized metrics** (`--field-min-h` /
  `--field-pad-*`) as `Select`/`Input` so all three line up at any
  density — including inside `.fields--dense` (was a plain text box with
  hardcoded height/padding that stayed tall in dense filter rows).
- **DataTable owns its surface.** `.table-wrap` clips to its own radius and
  the filled header follows it — no corner notch in any container. Do not
  wrap `<DataTable>` in your own bordered/rounded/overflow container.

## [1.9.1] — 2026-05-17

**Patch.** Positioning fix. No public API change.

### Fixed
- **`Combobox` / `MultiCombobox`: first open no longer jumps to the viewport
  edge.** With `matchAnchorWidth`, on the first open the floating list was
  measured before its `width: anchorWidth` constraint applied, so the viewport
  clamp used the inflated natural width and yanked `left` to the gutter (the
  panel appeared far left, over the sidebar); a second open looked correct
  because the width was cached. `usePopoverPosition` now clamps and flips with
  the width the panel *will* have (the anchor width) when `matchAnchorWidth` is
  set, so the first open is positioned correctly. Regression test added.

## [1.9.0] — 2026-05-17

**Minor.** RSC support + packaging + UI fixes. Drop-in (no public API change),
but consumption semantics change: the package is now a client boundary.

### Fixed
- **RSC: a Next Server Component can import the kit again.** `'use client'`
  was stripped by the bundler, so importing the kit from a Server Component
  crashed (`React.createContext is not a function`). It is now re-applied to
  every emitted JS post-build. The whole package is a client boundary —
  importing a pure util (`cx`, `formatDate`) from an RSC also pulls a client
  boundary; acceptable, a future server-safe subpath could refine this.
- **Package types no longer masquerade.** `exports["."]` and
  `exports["./presets/elalba-defaults"]` use per-condition types
  (`import` → `.d.mts`, `require` → `.d.ts`); added `"type": "commonjs"`.
  `publint` is clean.
- **Tabs are readable.** Inactive tabs were bold (700) + low-contrast
  (`--fg-muted`) + wide tracking at 14px. Now weight 600, `--fg-default`,
  normal tracking, primary on hover.
- **`DataTable stickyHeader` actually sticks.** `.table-wrap` is
  `overflow-x:auto`, so it (not an outer wrapper) is the sticky scroll
  container; the sticky variant now scrolls vertically itself
  (`max-height:70vh`, overridable via `className`). Do not wrap `<DataTable>`
  in your own `overflow-y:auto` container.
- **No corner notch under a toolbar.** A `DataTable` directly after a
  `TableToolbar` drops the wrap's top border/radius so the two seam cleanly
  (was a double border / white rounded-corner artifact).

## [1.8.0] — 2026-05-17

**Minor.** Adds the `appshell__foot-text` collapse convention. CSS-only,
additive, no breaking changes; drop-in.

### Added
- **`appshell__foot-text` convention** (mirror of `appshell__brand-text`,
  v1.2.0). Wrap the textual part of `AppShell`'s `footer` slot (version
  label, env tag) in `<span className="appshell__foot-text">`; it collapses
  away with the 72px rail instead of wrapping onto two lines and overlapping
  the collapse toggle. The kit renders `{footer}` raw (like `{brand}`), so
  the consumer adopts the class the same way as `brand-text`. Demonstrated
  by the `Layout/AppShell › FooterTextColapsable` story.

## [1.7.1] — 2026-05-17

**Patch.** Two kit bug fixes. Ships in `dist`; no breaking changes, drop-in.

### Fixed
- **Portaled popovers now use a fixed positioning strategy.**
  `usePopoverPosition` returned document-relative coords (rect +
  `scrollX/scrollY`) for `position: absolute` panels. Inside a
  `position: fixed` `Modal` (with scroll-lock) that coordinate space is
  wrong and the viewport clamp pinned panels to the bottom-left (e.g. the
  `Combobox` dropdown displaced when used in a Modal). The hook now returns
  viewport-relative coords and every portaled panel (Combobox, DatePicker,
  DateRangePicker, MultiCombobox, YearPicker, MonthPicker, Popover,
  HoverCard, Tooltip, ContextMenu, Menu, Menubar, NavigationMenu) renders
  with `position: fixed`. It already recomputes on capture-phase ancestor
  scroll + resize, so panels stay glued. Correct now inside fixed/transformed
  ancestors and scroll containers.
- **`Combobox` clear (×) button is centered.** `.combobox__clear` was a
  22×22 pill with no flex centering, so the icon sat off-center. Added
  `inline-flex` centering.

## [1.7.0] — 2026-05-17

**Minor.** New pickers + a real overlay dismiss fix. Ships in `dist`; no
breaking changes (additive components + locale keys; the fix only makes
dismissal more correct). Drop-in via version bump.

### Added
- **`YearPicker`**: decade grid with `<<`/`>>` decade nav, boundary years
  dimmed, `value: number`, `minYear`/`maxYear`. 
- **`MonthPicker`**: 12-month grid with prev/next year nav, `value: Date`,
  `minDate`/`maxDate`. Both share the floating primitive used by `DatePicker`
  (Portal + position + dismiss) and a new `.gridpicker` style.
- Locale keys: `picker.prevYear`, `picker.nextYear`, `picker.prevDecade`,
  `picker.nextDecade`, `picker.selectYear`, `picker.selectMonth`.

### Fixed
- **`Modal` / `Drawer` backdrop dismiss is now press-origin aware.** A press
  that started inside the dialog (e.g. selecting text in an input) and was
  released over the backdrop fired a `click` whose target was the backdrop,
  closing the overlay. The backdrop now closes only when the press both
  started and ended on the backdrop itself (`mousedown` origin tracked); the
  dialog's `stopPropagation` was removed (the guard supersedes it).

## [1.6.1] — 2026-05-17

**Patch. Docs/recipes only — not shipped.** Workstream C of the versatility
roadmap. Blocks live in `src/blocks/` and are excluded from the package
(tsup entry is components-only, `files: ["dist"]`); no runtime change for
consumers. Only npm-visible delta is the README.

### Added
- **Blocks (copy-paste recipes)**, browsable under `Blocks/` in Storybook,
  composed from existing components: **Data table page** (filters + toolbar +
  selectable table + bulk actions + pagination), **Admin dashboard** (AppShell
  + PageHeader + KPI grid + table), **Auth screen** (centered card login),
  **Checkout** (address form + order summary + promo + free-shipping). Each is
  a starting point you copy and own, not a configurable component.
- README "Blocks (copy-paste)" section.

## [1.6.0] — 2026-05-17

**Minor.** Consumer-extensible variants (Workstream B of the versatility
roadmap). Ships in `dist` (`.d.ts`); no breaking changes (the exported unions
are unchanged, only the prop types widen; drop-in via version bump).

### Added
- **`Extensible<T>`** type (exported): opens a closed string union for
  consumer extension while keeping autocomplete for known values.
- `variant` / `accent` on **`Button`**, **`Badge`**, **`Alert`**, **`Card`**
  are now `Extensible<…>`: `variant="brand-x"` is no longer a type error.
  The kit emits the BEM class (`btn--brand-x`, …); style it in your own CSS
  outside `@layer elalba`. Documented in `DESIGN.md` "Extending variants"
  with a live `Foundations/ExtendingVariants` story.

### Notes
- Safe at runtime: these components only interpolate the class, they do not
  switch on the value.
- The optional `variantClass` helper from the roadmap was intentionally
  dropped (YAGNI: nothing internal consumes it; the CSS contract is the
  extension point, not a JS helper).

## [1.5.0] — 2026-05-17

**Minor.** Polymorphism (`asChild`), Workstream A of the versatility roadmap.
Ships in `dist`; no breaking changes (`asChild` defaults to `false`, behavior
unchanged; drop-in via version bump).

### Added
- **`Slot` and `Slottable`** primitives (dependency-free, no Radix): merge
  `className` / handlers / `ref` / ARIA onto a consumer-provided element and
  preserve sibling content. Exported from the barrel.
- **`asChild`** on **`Button`** and **`Card`**: render as the provided child
  element (e.g. `next/link`'s `<a>`) while keeping the kit's classes, ref,
  handlers, and Button's icons/loading. `composeRefs`/`mergeProps` handle
  ref + prop merging; React 18/19 safe.

### Notes
- Scope was deliberately limited to `Button` + `Card` (the clean,
  high-value, children-based targets). `asChild` is intentionally **not**
  added to parent-constrained elements (`ListGroupItem` is `<li>` under
  `<ul>`), components with injected internal structure (`Chip`), compound
  widgets (`Tab`), or data/array-driven APIs (`Breadcrumbs`, `Menu`,
  `AppShell`) — those use a render-prop instead (`AppShell.linkAs` is
  unchanged; it is the correct pattern for its array API). See `DESIGN.md`
  "Polymorphism".

## [1.4.0] — 2026-05-17

**Minor.** Motion refinement (no public API changes; drop-in via version bump).
Unlike 1.3.1, this ships in `dist` and affects runtime consumers (better
default feel).

### Added
- **Exponential ease-out family**: `--ease-out-quart` / `--ease-out-quint` /
  `--ease-out-expo` tokens.
- **`--duration-exit`** (150ms, ~75% of `--duration-base`) for dismissals.

### Changed
- `--ease-standard` and `--ease-out` now resolve to the quint curve
  (confident deceleration) instead of the flat Material/CSS defaults. Token
  names are preserved, so this is a feel change, not a breaking one. The whole
  kit decelerates more decisively without adding any new motion.
- Exit animations (modal/drawer/toast backdrops and panels, plus the
  `useDelayedUnmount` delay) now run at `--duration-exit` instead of
  `--duration-base`: entrances unchanged, dismissals snappier.
- `.switch__track` background transition now carries `--ease-standard`.

### Fixed
- **`prefers-reduced-motion`**: `useDelayedUnmount` no longer keeps overlays
  mounted for the (now invisible) exit duration; it unmounts immediately for
  reduced-motion users. SSR/jsdom-safe.
- `var()` motion fallbacks aligned with real token values (`--duration-base`
  220→200ms, `--duration-fast` 150→120ms, `--ease-standard` fallbacks → the
  real curve). No behavioral change; consistency only.

### Removed
- Dead legacy accordion CSS (`.accordion__head` / `__chevron` / `__body` /
  `.accordion__item.open`, 25 lines) superseded by the
  trigger/chev/panel/is-open implementation and unreachable.

## [1.3.1] — 2026-05-17

**Patch. Docs/Storybook only — no shipped code changes.** Stories are not part
of the published package (`files: ["dist"]`), so this does not affect runtime
consumers; the only npm-visible delta is the README copy.

### Changed
- **Storybook synced with v1.3.0**: `Divider` stories note the deprecation and
  point to `Separator`; `Tree` documents the WAI-ARIA keyboard model;
  `Accordion` documents its ARIA wiring; `Menubar` / `Modal` document their
  keyboard/focus model.
- **Neutral Spanish (tú, not vos)** in Storybook copy and README (fixes voseo:
  `Notá`/`Envolvé`/`Mirá`/`pasá`/`querés`/`agregá`/`podés`/`andá`/`usás`/…).
- **Honest titles + regression hygiene**: `FloatingPortal` moved to
  `Internal/Regression/`; `Display3` / `Layout` meta titles now describe their
  real contents; the sticky-tooltip story is documented user-facing.

### Added
- **Interactive Playground stories with controls** for `Badge`, `Input`,
  `NumberInput`, `Toggle` and `DataTable` (Button already had this).

### Fixed
- `console.log` in Calendar/FileUpload stories replaced with
  `@storybook/addon-actions` `action()`; removed an unused `base` prop in the
  Foundations `Scale` helper; cross-linked `Foundations/Logos` ↔
  `Foundations/Logo`.

## [1.3.0] — 2026-05-17

**Minor.** Production audit remediation: accessibility fixes, internal
consolidation, and a quality gate. No public API breaks (drop-in via version
bump); `Divider` is kept as a deprecated alias and the new date utilities are
additive.

### Fixed
- **`Tree` is now fully keyboard-operable** (WAI-ARIA TreeView): roving
  `tabindex`, ArrowUp/Down to move, ArrowRight/Left to expand/collapse or move
  to child/parent, Home/End, Enter/Space to select. The focusable element is
  the treeitem row; the disclosure chevron is decorative and out of the tab
  order. Closes a WCAG 2.1.1 (Keyboard) failure where the row was a
  non-focusable `div`.
- **`Accordion` trigger and panel are ARIA-wired**: `aria-controls`,
  `role="region"` and `aria-labelledby` via `React.useId()`. The
  unmount-on-close behavior is unchanged.

### Changed
- **`Divider` is now a deprecated alias of `Separator`.** It delegates to
  `Separator` with `decorative={false}`, preserving `role="separator"`,
  `aria-orientation` and the legacy `divider` / `divider--vertical` classes:
  zero visual or behavioral change for existing consumers. New code should use
  `Separator`.
- **Calendar grid helpers deduplicated.** `startOfMonth`, `addMonths`,
  `isSameDay` and `buildMonthGrid` (previously copied verbatim across
  `Pickers`, `AdvancedPickers` and `Display3`) now live in
  `utils/dateFormat` and are exported from the public barrel (additive).
  `DatePicker` / `DateRangePicker` consume the shared grid; the full-month
  `Calendar` intentionally keeps its distinct 42-cell model.

### Added
- **`DESIGN.md` and `PRODUCT.md`**: design-system source of truth (derived
  from the token files) and product/brand context.
- **Lint & format gate.** ESLint 9 flat config (typescript-eslint,
  eslint-plugin-react-hooks, eslint-plugin-jsx-a11y, eslint-config-prettier)
  and Prettier, with `lint` / `lint:fix` / `format` / `format:check` scripts.
  CI runs `npm run lint` before tests. `react-hooks/rules-of-hooks` is an
  error in shipped code (zero violations) and off in `*.stories.tsx`.
  Pre-existing style debt is surfaced as warnings; the gate fails on errors
  only.
- **README "Costo del CSS (hoja única)"** documenting the single-stylesheet
  tradeoff (~19 KB gzip) and why CSS is not code-split.

## [1.2.0] — 2026-05-17

**Minor.** Closes the floating-primitive convergence debt + an uppercase
theming opt-out (no public API changes; drop-in via version bump).

### Added
- **`NavigationMenu` / `Menubar` keyboard navigation.** ArrowUp/Down,
  Home/End, Enter/Space, Escape (returns focus to the trigger), roving
  `tabindex`. `Menubar` adds ArrowLeft/Right between menus (switches the
  open menu when navigating between siblings).
- **`appshell__brand-text` convention.** Wrap the textual part of
  `AppShell`'s `brand` in `<span className="appshell__brand-text">` and
  it collapses away with the rail while the logo/mark stays — no separate
  `brandCollapsed` needed. Mirrors the nav-label collapse.
- **`--tt-label` / `--tt-title` tokens** (default `uppercase`). Set
  either to `none` (consumer or preset) to drop all-caps without forking
  component CSS. `--tt-label` covers micro-typography (eyebrows, badges,
  table headers, KPI/section labels); `--tt-title` covers display-font
  headings (`.h1`–`.h3`, modal/drawer/empty titles, AppShell brand). The
  El Alba preset is intentionally unchanged — its all-caps is brand
  signature.

### Fixed
- **`NavigationMenu` / `Menubar` no longer clip inside `overflow`
  containers.** Both now route through `Portal` + `usePopoverPosition` +
  `useDismiss` (flip, clamp, reposition on capture-phase ancestor scroll
  and resize), closing the convergence debt tracked in 1.1.0.
- **`DatePicker` / `DateRangePicker` calendar** routed through the same
  primitive; the popover is no longer clipped by a `Card`/table
  `overflow` and follows the trigger on scroll. Also fixes a `DatePicker`
  edge case where dismissing could immediately reopen (focus returned to
  the focus-to-open input).
- **`AppShell` collapsed brand** no longer bleeds clipped text out of the
  72px rail when no `brandCollapsed` is provided — opt into the new
  `appshell__brand-text` convention to drop the text and keep the mark.

### Changed
- Every floating panel in the kit now shares one primitive: `createPortal`
  is fully removed from `src` (no duplicated portal/positioning logic
  remains). Public props of `NavigationMenu`, `Menubar`, `DatePicker`,
  `DateRangePicker` and `AppShell` are unchanged.

## [1.1.0] — 2026-05-17

**Minor.** Shared floating primitive (no public API changes; drop-in).

### Added
- **`Portal`** — SSR-safe body portal.
- **`usePopoverPosition(anchorRef, contentRef, opts)`** — rect-based,
  document-relative positioning with viewport flip + clamp, repositioning
  on capture-phase scroll of *any* ancestor and on resize.
- **`useDismiss`** — shared outside-click / Escape / focus-return.
- **`--z-floating`** token + `.is-floating` layer, above `--z-overlay`
  (Modal/Drawer) so panels opened inside a modal aren't covered.

### Fixed
- **Floating panels no longer clip inside `overflow` containers.**
  `Menu` (and `Popover`, `ContextMenu`, `HoverCard`, `Combobox`,
  `MultiCombobox`, `Tooltip`) now render through `Portal` +
  `usePopoverPosition`, so a `Menu` inside a `DataTable`/`Card` is no
  longer cut off and follows the trigger on scroll.
- **`Menu` keyboard navigation** wired: ArrowUp/Down, Home/End,
  Enter/Space, Escape (returns focus to the trigger), roving `tabindex`.
- **`AppShell` collapsed rail (Bug 2):** the expand toggle and `footer`
  slot stay inside the 72px rail (centered, no overlap/clip) and the
  brand clamps even without a `brandCollapsed` slot. The collapse
  toggle now exposes `aria-expanded`.

### Changed
- `Tooltip` is now JS-driven (hover/focus, Escape, `aria-describedby`)
  and portaled, so it escapes `overflow:hidden`. It no longer renders a
  CSS arrow (`::after`) and is not in the DOM until shown.
- `Combobox`/`MultiCombobox`/`ContextMenu`/`HoverCard`/`Popover`
  positioning unified on the shared hook (adds flip + scroll/resize
  reposition). Native `<select>`-based `SortDropdown` was left as-is
  (browser-rendered popups already escape overflow). `NavigationMenu`
  and `Menubar` keep their own logic (out of scope; tracked debt).

## [1.0.1] — 2026-05-15

**Patch.** Fixes a gap in the El Alba preset introduced in 1.0.0.

### Fixed
- **El Alba preset: secondary button had unreadable text.** The generic
  base sets `--fg-on-secondary: var(--color-primary)` (dark) because the
  generic secondary is light sand. The El Alba preset re-scoped
  `--color-secondary` to its saturated orange but did not restore
  `--fg-on-secondary`, so `.btn--secondary` rendered orange with El Alba
  blue text instead of the white-on-orange CTA from v0.7.1. The preset
  now sets `--fg-on-secondary: var(--color-white)`. Generic (non-preset)
  consumers are unaffected.

## [1.0.0] — 2026-05-15

**Major — generic kit + preset architecture.** The kit is no longer
El Alba-branded by default. It ships a neutral "warm earth" palette and
El Alba is now an opt-in preset. Package renamed
`@misael703/elalba-ui` → `@misael703/ui`.

### Migration guide (for El Alba / barritas consumers)

To reproduce the exact pre-1.0 look:

```diff
- "@misael703/elalba-ui": "^0.7.1"
+ "@misael703/ui": "^1.0.0"
```

```ts
import "@misael703/ui/styles.css";
import "@misael703/ui/presets/elalba";        // restores El Alba palette
import { elalbaDefaults } from "@misael703/ui/presets/elalba-defaults";
configureBrand(elalbaDefaults);               // CLP / es-CL / "El Alba"
// Logos: @misael703/ui/presets/elalba-logos/<name>.svg
```

The preset restores the El Alba blue/orange scales, the original cool
neutral greys and the white canvas — pixel-identical to v0.7.1, **with
two intentional exceptions** (see Breaking).

### Breaking

- **Package renamed**: `@misael703/elalba-ui` → `@misael703/ui`. The
  old name is deprecated on npm (points here).
- **Design token renames** (update any consumer CSS overrides):
  | Old | New |
  |---|---|
  | `--color-brand-blue` | `--color-primary` |
  | `--color-brand-orange` | `--color-secondary` |
  | `--color-blue-{50..900}` | `--color-primary-{50..900}` |
  | `--color-orange-{50..900}` | `--color-secondary-{50..900}` |
  | `--fg-on-orange` | `--fg-on-secondary` |
- **Default palette changed**: generic kit is now espresso primary
  (`#423e37`) + sand secondary (`#e4bb97`) on a cream canvas
  (`#fef5ef`), warm stone neutrals. Import the El Alba preset to get
  the old blue/orange/white look back.
- **Button color mapping fixed** (applies even with the El Alba
  preset): `.btn--primary` now uses `--color-primary` and
  `.btn--secondary` uses `--color-secondary`. v0.7.1 had these
  inverted (an El Alba-specific orange-CTA convention baked into the
  component). If you relied on the inversion, your primary buttons
  will now be navy (El Alba primary) instead of orange — adopt the
  generic mapping or override `.btn--*` in your app.
- **Hero primary button on dark heroes**: `.btn--primary` inside
  `.hero--brand` / `.hero--inverse` / `.hero--image` now renders as a
  solid white CTA with brand-colored text (previously it shared the
  hero background and vanished once the button mapping was fixed).

### Added

- **`@misael703/ui/presets/elalba`** — CSS token overrides restoring
  the El Alba brand palette + cool neutrals + white canvas.
- **`@misael703/ui/presets/elalba-defaults`** — `elalbaDefaults`
  (`BrandDefaults`: CLP, es-CL, "El Alba", `/assets/logos`).
- **`@misael703/ui/presets/elalba-logos/*`** — the 16 bundled El Alba
  logo assets (4 variants × light/dark × svg/png).
- **Single-source token architecture**: `_root.css` + `_typography.css`
  partials, inlined into `styles.css` / `tokens.css` at build via
  postcss-import (eliminates the v0.4.x drift class entirely).
- **Weight scale tokens**: `--weight-thin` … `--weight-black`.
- **Storybook preset switcher** — a "Preset" toolbar global toggles
  the real El Alba preset CSS at runtime (Genérico ↔ El Alba).
- **`Dockerfile`** for hosting the Storybook as a static site.

### Changed / Fixed (rolled up from the 0.5–0.7 line)

- Body font Metropolis → DM Sans (variable, single woff2).
- Focus rings migrated `outline` → `box-shadow` (`--focus-ring-*`),
  fixing clipping under `overflow: hidden` + border-radius.
- Table scroll shadows are now overflow-aware (both edges).
- `<pre><code>` and inline code inside `.surface-inverse` no longer
  render invisible (contrast fixes).
- Storybook taxonomy: consistent English tree, nine clean top-level
  groups, generic demo copy (no El Alba / Chile-specific strings
  outside the preset).
- CI on Node 20 LTS, Actions v5.

## [0.7.1] — 2026-05-14

**Patch.** Table scroll shadows are now context-aware: they appear only
when the table actually overflows horizontally, on whichever side has
hidden content, and disappear on empty / short tables.

### Fixed
- **`.table-wrap` always showed a right-edge shadow** even when there
  was no horizontal overflow, and never showed a left-edge shadow when
  the user had scrolled into the table. Replaced the single static
  gradient with Lea Verou's scroll-shadows pattern: four stacked
  background layers (two cover masks pinned to content via
  `background-attachment: local`, two real shadows pinned to the
  wrapper via `background-attachment: scroll`) so each shadow is only
  visible when there's content hidden on that side. Pure CSS, no JS.

### Why this matters on touch devices
iOS Safari and most Android browsers hide scrollbars by default. Without
any visual hint, users don't know a table can be scrolled horizontally.
The original shadow gave that hint but produced visual noise on tables
that didn't actually scroll. The fix preserves the affordance only when
useful.

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
