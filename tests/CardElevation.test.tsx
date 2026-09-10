import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card, CardBody } from '../src/components/Display';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Card elevation (v1.20.0). With the tinted canvas (v1.16), a 1px border
 * alone barely separates a card from the page, so `Card` now floats on a
 * two-layer shadow (`--shadow-card`). Guards:
 *  - `--shadow-card` is two layers (fine contact + diffuse lift)
 *  - `.card` uses it (not the old single-layer `--shadow-sm`)
 *  - a card nested in a card drops its lift (no double elevation)
 */
const root = readFileSync(resolve(__dirname, '../src/styles/_root.css'), 'utf8');
const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('Card elevation (CSS)', () => {
  it('--shadow-card is a two-layer shadow', () => {
    const m = root.match(/--shadow-card:\s*([^;]+);/);
    expect(m, '--shadow-card must be defined').toBeTruthy();
    // two layers = two rgba() color stops
    expect((m![1].match(/rgba?\(/g) || []).length).toBe(2);
  });

  it('--shadow-card-hover is defined for interactive cards', () => {
    expect(root).toMatch(/--shadow-card-hover:\s*[^;]+;/);
  });

  it('.card uses --shadow-card (not the single-layer --shadow-sm)', () => {
    const m = css.match(/(^|\})\s*\.card\s*\{([^}]*)\}/);
    expect(m, '.card rule must exist').toBeTruthy();
    expect(m![2]).toMatch(/box-shadow:\s*var\(--shadow-card\)/);
  });

  it('nested card drops its elevation (no double shadow)', () => {
    expect(css).toMatch(/\.card\s+\.card\s*\{[^}]*box-shadow:\s*none/);
  });
});

describe('Card accent (CSS) — tinted surface + hue border, not a side rail', () => {
  // v1.68.1 replaced the 4px `inset box-shadow` left rail (side-stripe) with a
  // tinted face + a border in the accent hue. Guard the shape so the rail can't
  // come back and the now-unneeded hover-preservation block stays gone.
  it('the shared accent rule tints the surface + colours the border', () => {
    const m = css.match(/\.card--accent-cat-6\s*\{([^}]*)\}/);
    expect(m, 'shared accent rule (…, .card--accent-cat-6 { … }) must exist').toBeTruthy();
    expect(m![1]).toMatch(/background:\s*color-mix\([^)]*var\(--card-accent-color\)\s*6%/);
    expect(m![1]).toMatch(/border-color:\s*color-mix\(/);
  });

  it('the 4px inset side rail is gone', () => {
    expect(css).not.toContain('inset 4px 0 0 var(--card-accent-color)');
  });

  it('the special accent-hover box-shadow block is gone (base :hover just works)', () => {
    expect(css).not.toMatch(/\.card--interactive\.card--accent-[a-z0-9-]+:hover/);
  });
});

/**
 * `variant="inset"` (v3.4.0). The kit only had ONE way to group content — a
 * floating Card (border + shadow + surface). Consumers who wanted a grouped
 * section that does NOT float invented a `card-flat` class; that escape hatch
 * is the signal the vocabulary was missing. Inset = a sunken panel on
 * `--bg-subtle`, no border, no shadow, same header/body/footer API. It is the
 * "E" pattern: cards only for self-contained objects, sections go inset.
 */
describe('Card variant="inset" (v3.4.0)', () => {
  it('renders the modifier class and keeps the base card class (same API)', () => {
    const { container } = render(<Card variant="inset"><CardBody>x</CardBody></Card>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('card');
    expect(el).toHaveClass('card--inset');
  });
  it('default variant adds no modifier (byte-identical to pre-3.4.0)', () => {
    const { container } = render(<Card><CardBody>x</CardBody></Card>);
    expect(container.firstElementChild!.className).toBe('card');
  });
  it('CSS: inset sits on --bg-subtle with the on-canvas hairline (v3.6.0) and no elevation', () => {
    const m = css.match(/\.card--inset\s*\{([^}]*)\}/);
    expect(m, '.card--inset rule must exist').toBeTruthy();
    expect(m![1]).toMatch(/background:\s*var\(--bg-subtle\)/);
    // 3.4.0 shipped `transparent`; at 1.09:1 against the canvas-F page the panel
    // was invisible except for its corners (measured by despachos) — the token's
    // floors are pinned in ContrastDark.test.
    expect(m![1]).toMatch(/border-color:\s*var\(--border-on-canvas\)/);
    expect(m![1]).toMatch(/box-shadow:\s*none/);
  });
  it('CSS: the footer carries no fill of its own (v4.1.0), so an inset footer cannot fuse with the panel', () => {
    // Pre-4.1.0 the footer was a --bg-subtle band and the inset had to reset it
    // to transparent; now the footer is plain everywhere and only the opt-in
    // divider line changes tint inside an inset.
    const footer = css.match(/\n\.card__footer\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(footer).not.toMatch(/background/);
    expect(css).toMatch(/\.card--inset\s*>\s*\.card__footer--divided\s*\{[^}]*border-top-color:\s*var\(--border-on-canvas\)/);
  });
});
