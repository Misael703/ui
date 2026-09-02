import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Dataviz semantic tokens (`--chart-*`, v3.1.0) — regression guard.
 *
 * Why this exists: the despachos reports dashboard kept a local hex palette for
 * its Recharts series because the kit exposed no semantic dataviz roles, which
 * (a) broke "the kit owns the palette" and (b) left every chart blind to dark
 * mode. These tokens are the fix; this test pins the consumer's acceptance
 * criterion — same chart, flip the theme, the marks re-tint with correct
 * contrast — as something the build can verify.
 *
 * Contract pinned here, for BOTH palettes (generic + El Alba) in BOTH themes:
 *   1. every role is defined in the base light block (presets inherit by alias;
 *      the base dark block re-points only the roles whose light stop sinks)
 *   2. every role resolves to a FLAT hex — no gradient / color-mix. Consumers
 *      pass `var(--chart-*)` straight into SVG `fill`/`stroke`.
 *   3. every role clears WCAG 3:1 (non-text contrast, SC 1.4.11) against
 *      `--bg-surface`, the tier charts sit on (Card / metric card).
 *
 * The cascade is modeled as the browser computes it (see ContrastDark.test):
 *   base light < base dark < preset light (UNLAYERED) < preset dark.
 */

const ROOT = resolve(__dirname, '../src/styles/_root.css');
const ELALBA = resolve(__dirname, '../src/presets/elalba/styles.css');
const DARK = ':root[data-theme="dark"]';

export const CHART_ROLES = [
  '--chart-primary',
  '--chart-positive',
  '--chart-negative',
  '--chart-warn',
  '--chart-alt',
  '--chart-muted',
] as const;

const NON_TEXT_AA = 3;

function blockFor(css: string, selector: string): string {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = noComments.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'));
  return m ? m[1] : '';
}

function parseTokens(css: string): Record<string, string> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const map: Record<string, string> = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noComments))) map[m[1]] = m[2].trim();
  return map;
}

// Follows var() chains only. Anything that is not a plain hex at the end of the
// chain (color-mix, gradients, rgb()) is returned verbatim so the "flat colour"
// assertion below catches it.
function resolveFlat(map: Record<string, string>, value: string, depth = 0): string {
  const v = (value ?? '').trim();
  if (depth > 24) return v;
  const varM = v.match(/^var\((--[\w-]+)\)$/);
  if (varM) return resolveFlat(map, map[varM[1]] ?? '', depth + 1);
  return v;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
function contrast(a: string, b: string): number {
  const l1 = lum(a), l2 = lum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const rootCss = readFileSync(ROOT, 'utf8');
const elalbaCss = readFileSync(ELALBA, 'utf8');
const baseLightBlock = parseTokens(blockFor(rootCss, ':root'));
const baseDarkBlock = parseTokens(blockFor(rootCss, DARK));
const elalbaLightBlock = parseTokens(blockFor(elalbaCss, ':root'));
const elalbaDarkBlock = parseTokens(blockFor(elalbaCss, DARK));

const MAPS: Record<string, Record<string, string>> = {
  'generic light': baseLightBlock,
  'generic dark': { ...baseLightBlock, ...baseDarkBlock },
  'El Alba light': { ...baseLightBlock, ...elalbaLightBlock },
  'El Alba dark': { ...baseLightBlock, ...baseDarkBlock, ...elalbaLightBlock, ...elalbaDarkBlock },
};

describe('dataviz semantic tokens (--chart-*)', () => {
  it('every role is declared in the base light block (dark re-points only what sinks; the merged maps below pin contrast)', () => {
    for (const role of CHART_ROLES) {
      expect(baseLightBlock[role], `${role} missing in :root`).toBeDefined();
    }
  });

  it('a preset never redefines a role in light without re-asserting it in dark (cascade trap)', () => {
    // Preset light :root is unlayered and would shadow the base dark override.
    for (const role of CHART_ROLES) {
      if (elalbaLightBlock[role] !== undefined) {
        expect(elalbaDarkBlock[role], `${role}: El Alba overrides light but not dark`).toBeDefined();
      }
    }
  });

  for (const [name, map] of Object.entries(MAPS)) {
    describe(name, () => {
      const surface = resolveFlat(map, 'var(--bg-surface)');

      it('surface itself resolves to a flat hex (precondition)', () => {
        expect(surface).toMatch(HEX);
      });

      for (const role of CHART_ROLES) {
        it(`${role} resolves to a flat hex and clears ${NON_TEXT_AA}:1 on --bg-surface`, () => {
          const hex = resolveFlat(map, `var(${role})`);
          expect(hex, `${role} must be a plain #rrggbb (got "${hex}")`).toMatch(HEX);
          const ratio = contrast(hex, surface);
          expect(ratio, `${role} ${hex} on surface ${surface} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(NON_TEXT_AA);
        });
      }
    });
  }

  it('positive and negative are distinct hues from primary (reserved status roles, never the demand series)', () => {
    for (const map of Object.values(MAPS)) {
      const primary = resolveFlat(map, 'var(--chart-primary)');
      expect(resolveFlat(map, 'var(--chart-positive)')).not.toBe(primary);
      expect(resolveFlat(map, 'var(--chart-negative)')).not.toBe(primary);
    }
  });
});
