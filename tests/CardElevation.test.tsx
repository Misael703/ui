import { describe, it, expect } from 'vitest';
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
