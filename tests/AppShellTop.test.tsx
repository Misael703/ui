import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppShell } from '../src/components/AppShell';

/**
 * `headerLayout="top"` — AppShell variant: full-width header above the body,
 * three slots (`header.{left,center,right}`); brand lives in `header.center`,
 * the sidebar has no brand block, and `collapsed` hides the sidebar entirely
 * (no 72px rail). `theme="brand"` tints both header and sidebar (single knob).
 *
 * The TOPBAR is invariant to collapse: only the sidebar changes width.
 *
 * Must FAIL before the fix: props don't exist; outer is overridden by the
 * legacy `.appshell.is-collapsed` rule (2-class specificity) and breaks the
 * layout; logo not in true viewport center.
 */
const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  // Strip CSS comments — they often contain `{` / `}` which break the
  // `[^}]*` regex used to match property bodies.
  .replace(/\/\*[\s\S]*?\*\//g, '');
const sections = [
  { label: 'Operación', items: [{ id: 'home', label: 'Inicio', href: '#' }] },
];

describe('AppShell headerLayout="top" — full-width topbar variant', () => {
  it('renders the top-layout modifier + header with three slots', () => {
    const { container } = render(
      <AppShell
                header={{
          left:   <button data-testid="hl">menu</button>,
          center: <span   data-testid="hc">brand</span>,
          right:  <span   data-testid="hr">user</span>,
        }}
        sections={sections}
      >x</AppShell>
    );
    expect(container.querySelector('.appshell--header-top')).toBeTruthy();
    const header = container.querySelector('.appshell__header');
    expect(header).toBeTruthy();
    expect(header!.querySelector('.appshell__header-left [data-testid="hl"]')).toBeTruthy();
    expect(header!.querySelector('.appshell__header-center [data-testid="hc"]')).toBeTruthy();
    expect(header!.querySelector('.appshell__header-right [data-testid="hr"]')).toBeTruthy();
  });

  it('ships the first-paint transition guard so a collapsed-on-load shell does not animate', () => {
    // The collapse animations are always-on, so a shell that settles to
    // collapsed AFTER the first paint (SSR hydration, persistKey, async
    // controlled state) would animate the collapse on load. The component
    // renders `appshell--no-anim` until one frame post-mount (rAF, which does
    // not fire in jsdom → class stays for the assertion), and the CSS kills
    // the shell's transitions while it is present.
    const { container } = render(
      <AppShell defaultCollapsed header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).toHaveClass('appshell--no-anim');
    expect(css).toMatch(/\.appshell--no-anim[\s\S]*?\.appshell__sidebar[\s\S]*?transition: none !important/);
  });

  it('drops the sidebar brand block and the inline topbar in top layout', () => {
    const { container } = render(
      <AppShell header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell__brand')).toBeNull();
    expect(container.querySelector('.appshell__topbar')).toBeNull();
  });

  it('theme="brand" applies to BOTH header and sidebar (headerTheme inherits theme)', () => {
    const { container } = render(
      <AppShell theme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    // sidebar brand (appshell--brand) + header brand (appshell--header-brand)
    expect(root).toHaveClass('appshell--brand', 'appshell--header-top', 'appshell--header-brand');
  });

  it('headerTheme="brand" with theme="default" brands ONLY the header, not the sidebar', () => {
    const { container } = render(
      <AppShell theme="default" headerTheme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    expect(root).toHaveClass('appshell--default', 'appshell--header-brand');
    // sidebar stays neutral — no brand class on the root
    expect(root).not.toHaveClass('appshell--brand');
  });

  it('brand header carries data-tone="inverse" so its content is band-aware', () => {
    const { container } = render(
      <AppShell headerTheme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell__header')).toHaveAttribute('data-tone', 'inverse');
  });

  it('default (non-brand) header has no data-tone', () => {
    const { container } = render(
      <AppShell header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell__header')).not.toHaveAttribute('data-tone');
  });

  it('collapsedRail adds the rail modifier but NO built-in toggle (top is driven by the header hamburger)', () => {
    // The bottom chevron is a `side`-only idiom (its sidebar has no header to
    // host a hamburger). In `top`, collapse is ALWAYS driven by the consumer's
    // `header.left` control — in both hide and rail modes — so the shell never
    // renders its own toggle here. Avoids the two-control redundancy.
    const { container } = render(
      <AppShell collapsedRail header={{ center: 'b' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).toHaveClass('appshell--rail');
    expect(container.querySelector('.appshell__sidebar .appshell__collapse')).toBeNull();
  });

  it('header slot render-prop receives the collapse API and toggles an UNCONTROLLED shell', () => {
    // The whole point: in `top` uncontrolled mode there is no built-in toggle,
    // so a header hamburger needs the API to flip the state. A static node
    // could never do this — only the render-prop form reaches setCollapsed.
    const { container } = render(
      <AppShell header={{
        left: ({ collapsed, toggle }) => (
          <button data-testid="burger" aria-expanded={!collapsed} onClick={toggle}>menu</button>
        ),
        center: 'brand',
      }} sections={sections}>x</AppShell>
    );
    const burger = container.querySelector('[data-testid="burger"]')!;
    expect(container.querySelector('.appshell')).not.toHaveClass('is-collapsed');
    expect(burger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(burger);
    expect(container.querySelector('.appshell')).toHaveClass('is-collapsed');
    expect(burger).toHaveAttribute('aria-expanded', 'false');
  });

  it('static-node header slots still render unchanged (render-prop is opt-in)', () => {
    const { container } = render(
      <AppShell header={{ left: <span data-testid="static">x</span>, center: 'b' }} sections={sections}>y</AppShell>
    );
    expect(container.querySelector('.appshell__header-left [data-testid="static"]')).toBeTruthy();
  });

  it('without collapsedRail there is no rail modifier (default = hide)', () => {
    const { container } = render(
      <AppShell header={{ center: 'b' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).not.toHaveClass('appshell--rail');
  });

  it('CSS: collapsedRail keeps a 72px rail (not 0) when collapsed', () => {
    expect(css).toMatch(/\.appshell--header-top\.appshell--rail\.is-collapsed\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*72px\s+1fr/);
  });

  it('CSS: hide mode (no rail) slides the sidebar out (full width, no rail narrowing)', () => {
    // The 240→0 width transition would flash the ~72px rail; instead the
    // sidebar keeps its width and translates off-screen (overlaying), so it
    // never narrows into a rail. Rail mode keeps the width transition.
    expect(css).toMatch(/\.appshell--header-top:not\(\.appshell--rail\)\.is-collapsed\s+\.appshell__sidebar\s*\{[^}]*transform:\s*translateX\(-100%\)/);
    expect(css).toMatch(/\.appshell--header-top:not\(\.appshell--rail\)\s+\.appshell__sidebar\s*\{[^}]*transition:\s*transform/);
  });

  it('default top layout (no headerTheme) does not brand the header', () => {
    const { container } = render(
      <AppShell header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    expect(root).toHaveClass('appshell--header-default');
    expect(root).not.toHaveClass('appshell--header-brand');
  });

  it('renders the top header layout by default (no headerLayout prop)', () => {
    // v1.31: the shell is always top — no discriminator needed.
    const { container } = render(
      <AppShell header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell--header-top')).toBeTruthy();
    expect(container.querySelector('.appshell__header')).toBeTruthy();
  });

  // CSS guards: the topbar must (a) be invariant to collapse and (b) put the
  // logo at the TRUE viewport centre, regardless of how wide the left/right
  // zones grow.
  it('CSS: top-layout outer override beats the legacy .appshell.is-collapsed rule', () => {
    // Specificity fix: must use `.appshell.appshell--header-top` (two
    // classes, ≥(0,2,0)), not the bare `.appshell--header-top` which loses
    // to `.appshell.is-collapsed` and re-introduces the 72px column.
    expect(css).toMatch(/\.appshell\.appshell--header-top\s*\{/);
  });

  it('CSS: topbar uses `1fr auto 1fr` so the centre slot is true viewport-centre', () => {
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__header\s*\{[^}]*grid-template-columns:\s*1fr\s+auto\s+1fr/);
  });

  it('CSS: only the body grid-template-columns reacts to is-collapsed (topbar invariant)', () => {
    // The collapse rule must target the BODY, never the outer or the header.
    expect(css).toMatch(/\.appshell--header-top\.is-collapsed\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*0\s+1fr/);
  });

  it('CSS: header-brand band uses --chrome-brand (driven by headerTheme, not theme)', () => {
    // The brand top-header is keyed on `.appshell--header-brand` (from the
    // `headerTheme` prop) — NOT `.appshell--brand` — so it can fire over a
    // neutral sidebar. It shares `--chrome-brand` with the legacy
    // `.appshell--brand .appshell__sidebar` so the shades match when both are
    // branded. `--chrome-brand` is the LARGE-brand-chrome role (v1.81.0):
    // navy-700 in light; in dark a DEEP quiet navy (not the mid `--fill-brand`
    // used by small controls) so a full-width band doesn't dominate the dark UI.
    expect(css).toMatch(/\.appshell--header-top\.appshell--header-brand\s+\.appshell__header\s*\{[^}]*background:\s*var\(--chrome-brand\)/);
  });

  it('CSS: header-brand band keeps a visible separator from the body', () => {
    // A soft white-α hairline (the kit's idiom for borders on brand
    // surfaces) keeps the topbar legible from whatever sits below it.
    expect(css).toMatch(/\.appshell--header-top\.appshell--header-brand\s+\.appshell__header\s*\{[^}]*border-bottom:\s*1px solid rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.12\s*\)/);
  });

  /* Internal-scroll model (v1.24.0). In `top` the shell is capped at the
     viewport and only the content scrolls — header (row 1) and sidebar (row 2)
     stay static. These guards pin the three rules that make that work and that
     a naive refactor would silently drop. */
  it('CSS: top shell is capped at the viewport (height: 100vh, not min-height)', () => {
    // `height: 100vh` (not just the base `min-height`) is what bounds the grid
    // so the body row can be `1fr` of a fixed height and host an inner scroll.
    expect(css).toMatch(/\.appshell\.appshell--header-top\s*\{[^}]*height:\s*100vh/);
  });

  it('CSS: top sidebar is height:auto (fills its row, no second scrollbar)', () => {
    // The base sidebar is `height: 100vh`; left as-is in `top` it would overflow
    // the bounded body row and add a second scrollbar. Must be reset to auto.
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__sidebar\s*\{[^}]*height:\s*auto/);
  });

  it('CSS: only the top content scrolls (overflow-y:auto + min-height:0, scoped)', () => {
    // The single scroll container. Scoped to `--header-top` so the `side`
    // layout's page-scroll model is untouched.
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__content\s*\{[^}]*overflow-y:\s*auto/);
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__content\s*\{[^}]*min-height:\s*0/);
  });

  it('CSS: the GLOBAL .appshell__content keeps its padding (top scoping must not strip it)', () => {
    // Guard the "do not touch the padding" constraint: the base rule still
    // carries `padding: 24px`, and the scoped top rule only adds scroll.
    expect(css).toMatch(/\.appshell__content\s*\{[^}]*padding:\s*24px/);
  });

  it('CSS: the top header padding is driven by overridable vars (not hardcoded)', () => {
    // The header band reads `--appshell-header-pad-x/-y` so consumers can
    // align its edge controls with the content gutter without redeclaring
    // the rule. Defaults preserve the prior 8/16.
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__header\s*\{[^}]*padding:\s*var\(--appshell-header-pad-y,\s*8px\)\s*var\(--appshell-header-pad-x,\s*16px\)/);
  });

  /* Top-bar-only mode (v1.27.0). `sections` is optional in `top`; omitting it
     (or passing []) renders just the header band over a single-column content
     area — no sidebar at all. For flat-route apps without panel nav. */
  it('without sections renders no sidebar, marks the shell `appshell--no-nav`', () => {
    const { container } = render(
      <AppShell header={{ center: 'brand' }}>x</AppShell>
    );
    const root = container.querySelector('.appshell')!;
    expect(root).toHaveClass('appshell--no-nav');
    expect(container.querySelector('.appshell__sidebar')).toBeNull();
    // The header band is still there — that's the whole point of this mode.
    expect(container.querySelector('.appshell__header')).toBeInTheDocument();
    // And the content still renders.
    expect(container.querySelector('.appshell__content')).toBeInTheDocument();
  });

  it('explicit sections={[]} behaves the same as omitting it (top-bar-only)', () => {
    const { container } = render(
      <AppShell header={{ center: 'b' }} sections={[]}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).toHaveClass('appshell--no-nav');
    expect(container.querySelector('.appshell__sidebar')).toBeNull();
  });

  it('with sections, no `appshell--no-nav` and the sidebar renders (back-compat)', () => {
    const { container } = render(
      <AppShell header={{ center: 'b' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).not.toHaveClass('appshell--no-nav');
    expect(container.querySelector('.appshell__sidebar')).toBeInTheDocument();
  });

  it('CSS: top-bar-only collapses the body grid to a single column', () => {
    // Placed AFTER the rail rule so it wins by source order on the rare
    // no-nav+rail combo. Pin the rule so a refactor cannot silently drop it.
    expect(css).toMatch(/\.appshell--header-top\.appshell--no-nav\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  /* Mobile drawer (v1.31.0). The aside becomes a fixed overlay anchored
     beneath the header; the consumer toggles via `headerApi.toggle()`, which
     is DWIM by viewport (desktop ⇒ collapse, mobile ⇒ open/close drawer).
     These CSS guards pin the rules a refactor would silently drop. */
  it('CSS: --appshell-header-height is exposed as a public var (so sticky sub-headers can anchor)', () => {
    expect(css).toMatch(/\.appshell\.appshell--header-top\s*\{[^}]*--appshell-header-height:\s*64px/);
  });

  it('CSS: top shell heights use 100vh + 100dvh fallback (iOS Safari URL-bar safe)', () => {
    // `100vh` first (older browsers), `100dvh` second (overrides on Chrome
    // 108+ / Safari 16.4+ to track the dynamic viewport edge). Both must be
    // present in the same rule.
    expect(css).toMatch(/\.appshell\.appshell--header-top\s*\{[^}]*height:\s*100vh[^}]*height:\s*100dvh/);
  });

  it('CSS: top hide-mode + rail body grid rules live inside @media (min-width:901px) (mobile gap guard)', () => {
    // The 0+1fr / 72px+1fr body grids only make sense on desktop, where the
    // aside is in flow. In mobile the aside is fixed-overlay and any extra
    // grid track on the left reads as a 72px / 0 margin on the content.
    expect(css).toMatch(/@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.appshell--header-top\.is-collapsed\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*0\s+1fr/);
    expect(css).toMatch(/@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.appshell--header-top\.appshell--rail\.is-collapsed\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*72px\s+1fr/);
  });

  it('CSS: desktop main is explicitly pinned to grid-column 2 (hide-mode collapse bug guard)', () => {
    // When the aside goes `position: absolute` (hide-mode collapsed), it
    // leaves the grid flow → main auto-places to col 1 (0 width). Explicit
    // `grid-column: 2` keeps it in the 1fr column. Scoped to the desktop
    // media so mobile single-column grids are not affected.
    expect(css).toMatch(/@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.appshell--header-top:not\(\.appshell--no-nav\)\s+\.appshell__content\s*\{[^}]*grid-column:\s*2/);
  });

  it('CSS: mobile aside uses top:0 + bottom:0 (matches body bounds, no viewport math)', () => {
    // v1.31.1: replaced `calc(100vh - header)` with `top: 0; bottom: 0`
    // anchored to .appshell__body. The body knows its own height; we don't
    // need to subtract the header twice.
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.appshell--header-top\s+\.appshell__sidebar\s*\{[^}]*top:\s*0[^}]*bottom:\s*0/);
  });

  it('CSS: header min-height reads from the same var (single source of truth)', () => {
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__header\s*\{[^}]*min-height:\s*var\(--appshell-header-height\)/);
  });

  it('CSS: desktop hide/rail overlay rules are scoped to min-width:901px (so they cannot leak into mobile)', () => {
    // The pre-1.31 rules `position: absolute; translateX(-100%); width: 240px`
    // used to fire on ALL viewports and outranked the mobile overlay by
    // specificity. Scoping them to desktop avoids the fight.
    expect(css).toMatch(/@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.appshell--header-top:not\(\.appshell--rail\)\.is-collapsed\s+\.appshell__sidebar\s*\{[^}]*transform:\s*translateX\(-100%\)/);
  });

  it('CSS: mobile (≤900px) anchors the top sidebar to .appshell__body (position:absolute, no fragile viewport math)', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.appshell--header-top\s+\.appshell__sidebar\s*\{[^}]*position:\s*absolute/);
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.appshell--header-top\s+\.appshell__sidebar\s*\{[^}]*transform:\s*translateX\(-100%\)/);
  });

  it('CSS: .appshell--header-top .appshell__body is the positioning context (position:relative) for the absolute scrim/aside', () => {
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__body\s*\{[^}]*position:\s*relative/);
  });

  it('CSS: mobile header compacts to `auto 1fr auto` (center stretches, ends stay compact)', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.appshell--header-top\s+\.appshell__header\s*\{[^}]*grid-template-columns:\s*auto\s+1fr\s+auto/);
  });

  it('CSS: is-mobile-open slides the sidebar in (translateX(0))', () => {
    expect(css).toMatch(/\.appshell--header-top\.is-mobile-open\s+\.appshell__sidebar\s*\{[^}]*transform:\s*translateX\(0\)/);
  });

  it('CSS: mobile scrim matches the body exactly via `inset: 0` (anchored to .appshell__body)', () => {
    expect(css).toMatch(/\.appshell--header-top\.is-mobile-open\s+\.appshell__scrim\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/);
  });

  /* React side of the drawer — jsdom + a matchMedia mock so the consumer
     trigger's `toggle()` flips the drawer instead of `collapsed`. */
  function withMatchMedia(matches: boolean, fn: () => void) {
    const original = window.matchMedia;
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    window.matchMedia = ((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try { fn(); } finally { window.matchMedia = original; }
  }

  it('mobile: render-prop toggle() opens the drawer (is-mobile-open) and does NOT touch is-collapsed', () => {
    withMatchMedia(true, () => {
      const { container, getByTestId } = render(
        <AppShell
                    sections={sections}
          header={{
            left: ({ toggle }) => <button data-testid="trigger" onClick={toggle}>m</button>,
            center: 'brand',
          }}
        >x</AppShell>
      );
      const root = container.querySelector('.appshell')!;
      expect(root).not.toHaveClass('is-mobile-open');
      expect(root).not.toHaveClass('is-collapsed');
      fireEvent.click(getByTestId('trigger'));
      expect(root).toHaveClass('is-mobile-open');
      expect(root).not.toHaveClass('is-collapsed');
      // Click again closes it; `collapsed` remains untouched.
      fireEvent.click(getByTestId('trigger'));
      expect(root).not.toHaveClass('is-mobile-open');
      expect(root).not.toHaveClass('is-collapsed');
    });
  });

  it('desktop: render-prop toggle() flips is-collapsed as before (no drawer)', () => {
    withMatchMedia(false, () => {
      const { container, getByTestId } = render(
        <AppShell
                    sections={sections}
          header={{
            left: ({ toggle }) => <button data-testid="trigger" onClick={toggle}>m</button>,
            center: 'brand',
          }}
        >x</AppShell>
      );
      const root = container.querySelector('.appshell')!;
      fireEvent.click(getByTestId('trigger'));
      expect(root).toHaveClass('is-collapsed');
      expect(root).not.toHaveClass('is-mobile-open');
    });
  });

  it('mobile: ESC closes the open drawer', () => {
    withMatchMedia(true, () => {
      const { container, getByTestId } = render(
        <AppShell
                    sections={sections}
          header={{
            left: ({ toggle }) => <button data-testid="trigger" onClick={toggle}>m</button>,
            center: 'brand',
          }}
        >x</AppShell>
      );
      fireEvent.click(getByTestId('trigger'));
      expect(container.querySelector('.appshell')).toHaveClass('is-mobile-open');
      // Listener lives on `document` (shared `useEscape` hook) — fire there.
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(container.querySelector('.appshell')).not.toHaveClass('is-mobile-open');
    });
  });

  it('mobile: activating a `linkAs` nav item closes the drawer (regression: stayed open before the fix)', () => {
    withMatchMedia(true, () => {
      const { container, getByTestId } = render(
        <AppShell
          sections={sections}
          linkAs={(item, content, className) => (
            <a data-testid="navlink" href={item.href} className={className}>{content}</a>
          )}
          header={{
            left: ({ toggle }) => <button data-testid="trigger" onClick={toggle}>m</button>,
            center: 'brand',
          }}
        >x</AppShell>
      );
      const root = container.querySelector('.appshell')!;
      fireEvent.click(getByTestId('trigger'));
      expect(root).toHaveClass('is-mobile-open');
      // Route via the consumer's link (next/link stand-in) — the drawer must
      // close even though the kit can't wire onClick into the linkAs node.
      fireEvent.click(getByTestId('navlink'));
      expect(root).not.toHaveClass('is-mobile-open');
    });
  });

  it('CSS: the hidden drawer is untabbable (visibility:hidden, not just off-screen)', () => {
    // Mobile closed drawer + desktop hide-collapse both left links focusable
    // off-screen; visibility:hidden removes them from the tab order and AT.
    expect(css).toMatch(/\.appshell--header-top\s+\.appshell__sidebar\s*\{[^}]*visibility:\s*hidden/);
    expect(css).toMatch(/\.appshell--header-top\.is-mobile-open\s+\.appshell__sidebar\s*\{[^}]*visibility:\s*visible/);
    expect(css).toMatch(/is-collapsed\s+\.appshell__sidebar\s*\{[^}]*visibility:\s*hidden/);
  });

  it('CSS: the `linkAs` close-delegation wrapper is layout-invisible (display:contents)', () => {
    expect(css).toMatch(/\.appshell__navlink-slot\s*\{[^}]*display:\s*contents/);
  });

  it('mobile + controlled: flipping `collapsed` mirrors to mobileOpen (drawer opens)', () => {
    // The bug the user reported: a controlled consumer with a static
    // button (no render-prop) that calls setCollapsed directly read as
    // dead in mobile, because flipping `collapsed` is invisible in mobile
    // (aside is fixed-overlay). Fix: in mobile, any `collapsed` change
    // mirrors to `mobileOpen` so the drawer responds.
    withMatchMedia(true, () => {
      function Controlled() {
        const [collapsed, setCollapsed] = React.useState(true);
        return (
          <AppShell
                        sections={sections}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            header={{
              // Static button (NOT a render-prop) that flips controlled state.
              left: <button data-testid="static-trigger" onClick={() => setCollapsed((c) => !c)}>m</button>,
              center: 'brand',
            }}
          >x</AppShell>
        );
      }
      const { container, getByTestId } = render(<Controlled />);
      const root = container.querySelector('.appshell')!;
      expect(root).not.toHaveClass('is-mobile-open');
      // Initial is-collapsed=true (drawer closed in mobile).
      expect(root).toHaveClass('is-collapsed');
      fireEvent.click(getByTestId('static-trigger'));
      // collapsed flipped → sync sets mobileOpen=true → drawer opens.
      expect(root).toHaveClass('is-mobile-open');
      // Click again: collapsed=true → drawer closes.
      fireEvent.click(getByTestId('static-trigger'));
      expect(root).not.toHaveClass('is-mobile-open');
    });
  });

  it('mobile: initial render does NOT auto-open the drawer (prev-collapsed ref guard)', () => {
    // Sync effect must only fire when `collapsed` actually changes. Otherwise
    // mobile users would open onto a pre-open drawer just because their shell
    // happens to default to `collapsed=false`.
    withMatchMedia(true, () => {
      const { container } = render(
        <AppShell
                    sections={sections}
          header={{ left: <span /> , center: 'brand' }}
        >x</AppShell>
      );
      expect(container.querySelector('.appshell')).not.toHaveClass('is-mobile-open');
    });
  });

  it('mobile: scrim renders only while the drawer is open (click closes it)', () => {
    withMatchMedia(true, () => {
      const { container, getByTestId } = render(
        <AppShell
                    sections={sections}
          header={{
            left: ({ toggle }) => <button data-testid="trigger" onClick={toggle}>m</button>,
            center: 'brand',
          }}
        >x</AppShell>
      );
      expect(container.querySelector('.appshell__scrim')).toBeNull();
      fireEvent.click(getByTestId('trigger'));
      const scrim = container.querySelector('.appshell__scrim') as HTMLElement;
      expect(scrim).toBeTruthy();
      fireEvent.click(scrim);
      expect(container.querySelector('.appshell__scrim')).toBeNull();
    });
  });

  /* A11y hardening (post-1.31 review): the closed mobile drawer must hide
     from assistive tech; the open drawer must trap focus and return it on
     close; the body must lock scroll. Pre-fix, `isMobile` was a ref so the
     `aria-hidden` attribute never landed (React doesn't re-render on ref
     mutation). These tests pin the fix. */
  it('mobile (closed): aria-hidden lands on the aside post-mount (state, not ref)', async () => {
    await new Promise<void>((resolve) => {
      withMatchMedia(true, () => {
        const { container } = render(
          <AppShell
                        sections={sections}
            header={{ left: ({ toggle }) => <button onClick={toggle}>m</button>, center: 'b' }}
          >x</AppShell>
        );
        // After the matchMedia effect fires, the aside picks up aria-hidden.
        setTimeout(() => {
          const aside = container.querySelector('aside.appshell__sidebar');
          expect(aside?.getAttribute('aria-hidden')).toBe('true');
          resolve();
        }, 0);
      });
    });
  });

  it('mobile (open): aria-hidden is removed', async () => {
    await new Promise<void>((resolve) => {
      withMatchMedia(true, () => {
        const { container, getByTestId } = render(
          <AppShell
                        sections={sections}
            header={{ left: ({ toggle }) => <button data-testid="t" onClick={toggle}>m</button>, center: 'b' }}
          >x</AppShell>
        );
        setTimeout(() => {
          fireEvent.click(getByTestId('t'));
          const aside = container.querySelector('aside.appshell__sidebar');
          expect(aside?.hasAttribute('aria-hidden')).toBe(false);
          resolve();
        }, 0);
      });
    });
  });

  it('desktop: aria-hidden is not applied (the drawer concept does not exist there)', () => {
    withMatchMedia(false, () => {
      const { container } = render(
        <AppShell
                    sections={sections}
          header={{ left: ({ toggle }) => <button onClick={toggle}>m</button>, center: 'b' }}
        >x</AppShell>
      );
      const aside = container.querySelector('aside.appshell__sidebar');
      expect(aside?.hasAttribute('aria-hidden')).toBe(false);
    });
  });

  it('mobile: opening the drawer locks body scroll; closing releases it', () => {
    withMatchMedia(true, () => {
      // Reset any stale state from prior tests.
      document.body.style.overflow = '';
      const { getByTestId } = render(
        <AppShell
                    sections={sections}
          header={{ left: ({ toggle }) => <button data-testid="t" onClick={toggle}>m</button>, center: 'b' }}
        >x</AppShell>
      );
      expect(document.body.style.overflow).not.toBe('hidden');
      fireEvent.click(getByTestId('t'));
      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.click(getByTestId('t'));
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  it('CSS: .appshell.appshell--header-top breaks out of body margin (width:100vw + recentering margin)', () => {
    // v1.31.1: body's UA-default 8px margin (or any consumer wrapping) made
    // the fixed scrim/drawer extend past the shell's right edge. The shell
    // now spans the full viewport via the classic breakout: width:100vw
    // plus margin-left:calc(50% - 50vw) to recenter when body has its own
    // padding.
    expect(css).toMatch(/\.appshell\.appshell--header-top\s*\{[^}]*width:\s*100vw[^}]*margin-left:\s*calc\(50%\s*-\s*50vw\)/);
  });

  it('mobile: opening the drawer moves focus into it; closing returns focus to the trigger', () => {
    withMatchMedia(true, () => {
      const { getByTestId, container } = render(
        <AppShell
                    sections={[{ label: 'Op', items: [
            { id: 'a', label: 'Inicio', href: '/a' },
            { id: 'b', label: 'Pedidos', href: '/b' },
          ] }]}
          header={{
            left: ({ toggle }) => <button data-testid="trigger" onClick={toggle}>m</button>,
            center: 'b',
          }}
        >x</AppShell>
      );
      const trigger = getByTestId('trigger') as HTMLButtonElement;
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      fireEvent.click(trigger);
      // The focus trap moves focus to the first tabbable inside the aside —
      // here, the first nav link.
      const firstLink = container.querySelector('aside.appshell__sidebar a[href]') as HTMLElement;
      expect(document.activeElement).toBe(firstLink);
      // Close (ESC) — focus restored to the trigger.
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('built-in menu toggle (showMenuToggle)', () => {
    it('renders the kit toggle when showMenuToggle + sidebar; click flips collapsed (aria-expanded)', () => {
      const { container } = render(
        <AppShell showMenuToggle sections={sections} header={{ center: 'brand' }}>
          x
        </AppShell>
      );
      const btn = container.querySelector('.appshell__menu-toggle') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toBe('Abrir menú');
      // Initially expanded (defaultCollapsed=false → !collapsed === true).
      expect(btn.getAttribute('aria-expanded')).toBe('true');
      fireEvent.click(btn);
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('kit toggle renders BEFORE the consumer\'s header.left content', () => {
      const { container } = render(
        <AppShell
          showMenuToggle
          sections={sections}
          header={{ left: <span data-testid="consumer-left">x</span>, center: 'b' }}
        >
          x
        </AppShell>
      );
      const left = container.querySelector('.appshell__header-left')!;
      const kids = Array.from(left.children);
      expect(kids[0]?.classList.contains('appshell__menu-toggle')).toBe(true);
      expect(kids[1]?.getAttribute('data-testid')).toBe('consumer-left');
    });

    it('does not render the toggle when there is no sidebar (top-bar-only shell)', () => {
      const { container } = render(
        <AppShell showMenuToggle header={{ center: 'brand' }}>
          x
        </AppShell>
      );
      expect(container.querySelector('.appshell__menu-toggle')).toBeNull();
    });

    it('aria-controls points to the aside id', () => {
      const { container } = render(
        <AppShell showMenuToggle sections={sections} header={{ center: 'brand' }}>
          x
        </AppShell>
      );
      const btn = container.querySelector('.appshell__menu-toggle')!;
      const aside = container.querySelector('aside.appshell__sidebar')!;
      expect(btn.getAttribute('aria-controls')).toBe(aside.id);
      expect(aside.id).toBeTruthy();
    });
  });
});

describe('AppShell collapsed/rail nav item centering', () => {
  // When collapsed the nav label is width 0, so the item must center the icon and
  // drop the row gap — otherwise the leftover gap + padding pushes it off-centre.
  it('the collapsed nav item centers its content with no gap', () => {
    const rule = css.match(/\.appshell\.is-collapsed \.appshell__navitem\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/justify-content:\s*center/);
    expect(rule).toMatch(/gap:\s*0/);
  });
});
