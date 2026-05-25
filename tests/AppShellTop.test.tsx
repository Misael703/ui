import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
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

  it('collapsedRail adds the rail modifier + a built-in collapse toggle', () => {
    const { container } = render(
      <AppShell headerLayout="top" collapsedRail header={{ center: 'b' }} sections={sections}>x</AppShell>
    );
    expect(container.querySelector('.appshell')).toHaveClass('appshell--rail');
    expect(container.querySelector('.appshell__sidebar .appshell__collapse')).toBeInTheDocument();
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
});
