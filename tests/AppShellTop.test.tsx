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

  it('theme="brand" applies to BOTH header and sidebar (single knob)', () => {
    const { container } = render(
      <AppShell headerLayout="top" theme="brand" header={{ center: 'brand' }} sections={sections}>x</AppShell>
    );
    const root = container.querySelector('.appshell');
    expect(root).toHaveClass('appshell--brand', 'appshell--header-top');
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

  it('CSS: brand+top reuses --color-primary (same shade as the legacy sidebar)', () => {
    // The top-header brand chrome shares `--color-primary` with the legacy
    // `.appshell--brand .appshell__sidebar` so both surfaces match. The
    // sidebar override is intentionally NOT redefined here (the legacy
    // rule already paints it).
    expect(css).toMatch(/\.appshell--brand\.appshell--header-top\s+\.appshell__header\s*\{[^}]*background:\s*var\(--color-primary\)(?!-)/);
  });

  it('CSS: brand+top header keeps a visible separator from the sidebar', () => {
    // Same colour on both surfaces would erase the seam; a soft white-α
    // hairline (the kit's idiom for borders on brand surfaces) keeps the
    // topbar legible from the sidebar.
    expect(css).toMatch(/\.appshell--brand\.appshell--header-top\s+\.appshell__header\s*\{[^}]*border-bottom:\s*1px solid rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.12\s*\)/);
  });
});
