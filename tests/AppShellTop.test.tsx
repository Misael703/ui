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
const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');
const sections = [
  { label: 'Operación', items: [{ id: 'home', label: 'Inicio', href: '#' }] },
];

describe('AppShell headerLayout="top" — full-width topbar variant', () => {
  it('renders the top-layout modifier + header with three slots', () => {
    const { container } = render(
      <AppShell
        headerLayout="top"
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

  it('drops the sidebar brand block and the inline topbar in top layout', () => {
    const { container } = render(
      <AppShell headerLayout="top" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell__brand')).toBeNull();
    expect(container.querySelector('.appshell__topbar')).toBeNull();
  });

  it('theme="brand" applies to BOTH header and sidebar (headerTheme inherits theme)', () => {
    const { container } = render(
      <AppShell headerLayout="top" theme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    // sidebar brand (appshell--brand) + header brand (appshell--header-brand)
    expect(root).toHaveClass('appshell--brand', 'appshell--header-top', 'appshell--header-brand');
  });

  it('headerTheme="brand" with theme="default" brands ONLY the header, not the sidebar', () => {
    const { container } = render(
      <AppShell headerLayout="top" theme="default" headerTheme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    expect(root).toHaveClass('appshell--default', 'appshell--header-brand');
    // sidebar stays neutral — no brand class on the root
    expect(root).not.toHaveClass('appshell--brand');
  });

  it('brand header carries data-tone="inverse" so its content is band-aware', () => {
    const { container } = render(
      <AppShell headerLayout="top" headerTheme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell__header')).toHaveAttribute('data-tone', 'inverse');
  });

  it('default (non-brand) header has no data-tone', () => {
    const { container } = render(
      <AppShell headerLayout="top" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell__header')).not.toHaveAttribute('data-tone');
  });

  it('collapsedRail adds the rail modifier but NO built-in toggle (top is driven by the header hamburger)', () => {
    // The bottom chevron is a `side`-only idiom (its sidebar has no header to
    // host a hamburger). In `top`, collapse is ALWAYS driven by the consumer's
    // `header.left` control — in both hide and rail modes — so the shell never
    // renders its own toggle here. Avoids the two-control redundancy.
    const { container } = render(
      <AppShell headerLayout="top" collapsedRail header={{ center: 'b' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).toHaveClass('appshell--rail');
    expect(container.querySelector('.appshell__sidebar .appshell__collapse')).toBeNull();
  });

  it('header slot render-prop receives the collapse API and toggles an UNCONTROLLED shell', () => {
    // The whole point: in `top` uncontrolled mode there is no built-in toggle,
    // so a header hamburger needs the API to flip the state. A static node
    // could never do this — only the render-prop form reaches setCollapsed.
    const { container } = render(
      <AppShell headerLayout="top" header={{
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
      <AppShell headerLayout="top" header={{ left: <span data-testid="static">x</span>, center: 'b' }} sections={sections}>y</AppShell>
    );
    expect(container.querySelector('.appshell__header-left [data-testid="static"]')).toBeTruthy();
  });

  it('without collapsedRail there is no rail modifier (default = hide)', () => {
    const { container } = render(
      <AppShell headerLayout="top" header={{ center: 'b' }} sections={sections}>x</AppShell>
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
      <AppShell headerLayout="top" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    expect(root).toHaveClass('appshell--header-default');
    expect(root).not.toHaveClass('appshell--header-brand');
  });

  it('default (no headerLayout) is byte-identical to the legacy shell', () => {
    const { container } = render(
      <AppShell brand={<span>brand</span>} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell--header-top')).toBeNull();
    expect(container.querySelector('.appshell__header')).toBeNull();
    expect(container.querySelector('.appshell__brand')).toBeTruthy();
    expect(container.querySelector('.appshell__topbar')).toBeTruthy();
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

  it('CSS: header-brand band reuses --color-primary (driven by headerTheme, not theme)', () => {
    // The brand top-header is keyed on `.appshell--header-brand` (from the
    // `headerTheme` prop) — NOT `.appshell--brand` — so it can fire over a
    // neutral sidebar. It shares `--color-primary` with the legacy
    // `.appshell--brand .appshell__sidebar` so the shades match when both
    // are branded.
    expect(css).toMatch(/\.appshell--header-top\.appshell--header-brand\s+\.appshell__header\s*\{[^}]*background:\s*var\(--color-primary\)(?!-)/);
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

  /* Top-bar-only mode (v1.27.0). `sections` is optional in `top`; omitting it
     (or passing []) renders just the header band over a single-column content
     area — no sidebar at all. For flat-route apps without panel nav. */
  it('without sections renders no sidebar, marks the shell `appshell--no-nav`', () => {
    const { container } = render(
      <AppShell headerLayout="top" header={{ center: 'brand' }}>x</AppShell>
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
      <AppShell headerLayout="top" header={{ center: 'b' }} sections={[]}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).toHaveClass('appshell--no-nav');
    expect(container.querySelector('.appshell__sidebar')).toBeNull();
  });

  it('with sections, no `appshell--no-nav` and the sidebar renders (back-compat)', () => {
    const { container } = render(
      <AppShell headerLayout="top" header={{ center: 'b' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).not.toHaveClass('appshell--no-nav');
    expect(container.querySelector('.appshell__sidebar')).toBeInTheDocument();
  });

  it('CSS: top-bar-only collapses the body grid to a single column', () => {
    // Placed AFTER the rail rule so it wins by source order on the rare
    // no-nav+rail combo. Pin the rule so a refactor cannot silently drop it.
    expect(css).toMatch(/\.appshell--header-top\.appshell--no-nav\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*1fr/);
  });
});
