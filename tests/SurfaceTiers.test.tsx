import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Surface tier ordering guard (v1.29.0).
 *
 * Why this exists: pre-1.29.0 the El Alba `--bg-canvas` (#eaeef5) sat BETWEEN
 * `--bg-subtle` (#f1f4f9) and `--bg-muted` (#e7ebf2) in luminance — semantically
 * wrong (canvas is the deepest page tier, subtle/muted are insets on a surface).
 * That inversion was the source of the "neutral Badge vanishes on canvas" bug
 * patched with the hairline in 1.26.0 (subtle ≈ canvas → no figure/ground).
 *
 * This test asserts that in EVERY preset the four bg tiers are strictly ordered
 * by luminance, lightest → darkest:
 *
 *     --bg-surface  (lightest, content that pops)
 *   > --bg-subtle   (inset on surface)
 *   > --bg-muted    (stronger inset / hover)
 *   > --bg-canvas   (darkest, page background)
 *
 * A future regression that reverts the ordering fails here, not in a consumer.
 */

const ROOT = resolve(__dirname, '../src/styles/_root.css');
const ELALBA = resolve(__dirname, '../src/presets/elalba/styles.css');

// Extract one selector's declarations. Blocks are brace-free, so the first `}`
// closes it. `:root` matches only the light block (the dark selector has `[`
// right after `:root`, not `\s*{`).
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

function resolveVar(map: Record<string, string>, value: string, depth = 0): string {
  if (depth > 20) return value;
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (m) return resolveVar(map, map[m[1]] ?? '', depth + 1);
  return value;
}

function rgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
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

const rootCss = readFileSync(ROOT, 'utf8');
const elalbaCss = readFileSync(ELALBA, 'utf8');
// Light: scope to `:root` so the dark block can't clobber the tiers.
const baseMap = parseTokens(blockFor(rootCss, ':root'));
const elalbaMap = { ...baseMap, ...parseTokens(blockFor(elalbaCss, ':root')) };
// Dark. El Alba models the real layer priority: base :root (layered) < base dark
// (layered) < preset :root (unlayered) < preset dark (unlayered). The kit is
// `@layer elalba` but the preset is unlayered, so preset light beats base dark —
// hence base dark spreads BEFORE preset light here (see ContrastDark.test.tsx).
const DARK = ':root[data-theme="dark"]';
const baseDarkMap = { ...baseMap, ...parseTokens(blockFor(rootCss, DARK)) };
const elalbaDarkMap = {
  ...baseMap,
  ...parseTokens(blockFor(rootCss, DARK)),
  ...parseTokens(blockFor(elalbaCss, ':root')),
  ...parseTokens(blockFor(elalbaCss, DARK)),
};

const tier = (map: Record<string, string>, name: string) =>
  resolveVar(map, `var(${name})`);

function check(name: string, map: Record<string, string>) {
  describe(`surface tiers — ${name}`, () => {
    const surface = tier(map, '--bg-surface');
    const subtle  = tier(map, '--bg-subtle');
    const muted   = tier(map, '--bg-muted');
    const canvas  = tier(map, '--bg-canvas');

    it('all four tiers resolve to a hex value', () => {
      for (const v of [surface, subtle, muted, canvas]) {
        expect(v, `unresolved: ${v}`).toMatch(/^#[0-9a-f]{3,8}$/i);
      }
    });

    it('luminance ordering is surface > subtle > muted > canvas (strict)', () => {
      const L = { surface: lum(surface), subtle: lum(subtle), muted: lum(muted), canvas: lum(canvas) };
      const msg = `tiers: ${JSON.stringify(L)} (surface=${surface}, subtle=${subtle}, muted=${muted}, canvas=${canvas})`;
      expect(L.surface, `surface ≤ subtle — ${msg}`).toBeGreaterThan(L.subtle);
      expect(L.subtle,  `subtle ≤ muted — ${msg}`).toBeGreaterThan(L.muted);
      expect(L.muted,   `muted ≤ canvas — ${msg}`).toBeGreaterThan(L.canvas);
    });
  });
}

check('default palette', baseMap);
check('El Alba preset', elalbaMap);

// Dark theme (v1.79.0). Elevation is additive light: the page (canvas) is the
// DEEPEST tier, and surface/subtle/muted rise lighter — the INVERSE ordinal of
// light (where surface is lightest). Guard that inversion so a "just copy the
// light ordering" regression is caught.
function checkDark(name: string, map: Record<string, string>) {
  describe(`surface tiers — ${name} (dark)`, () => {
    const surface = tier(map, '--bg-surface');
    const subtle  = tier(map, '--bg-subtle');
    const muted   = tier(map, '--bg-muted');
    const canvas  = tier(map, '--bg-canvas');

    it('all four dark tiers resolve to a hex value', () => {
      for (const v of [surface, subtle, muted, canvas]) {
        expect(v, `unresolved: ${v}`).toMatch(/^#[0-9a-f]{3,8}$/i);
      }
    });

    it('canvas is the darkest tier and cards lift above it', () => {
      const L = { surface: lum(surface), subtle: lum(subtle), muted: lum(muted), canvas: lum(canvas) };
      const msg = `tiers: ${JSON.stringify(L)}`;
      // Canvas (page) strictly darkest; surface (card) lifts above it.
      expect(L.canvas, `canvas not darkest — ${msg}`).toBeLessThan(L.surface);
      // Additive-light elevation: muted > subtle > surface > canvas.
      expect(L.muted,   `muted ≤ subtle — ${msg}`).toBeGreaterThan(L.subtle);
      expect(L.subtle,  `subtle ≤ surface — ${msg}`).toBeGreaterThan(L.surface);
      expect(L.surface, `surface ≤ canvas — ${msg}`).toBeGreaterThan(L.canvas);
    });

    it('surfaces are genuinely dark (not a mislabeled light set)', () => {
      expect(lum(surface), `surface ${surface} too light for dark`).toBeLessThan(0.1);
      expect(lum(canvas), `canvas ${canvas} too light for dark`).toBeLessThan(0.1);
    });
  });
}

checkDark('default palette', baseDarkMap);
checkDark('El Alba preset', elalbaDarkMap);

// v1.77.0: the El Alba surface is tinted off pure white. Guard both properties
// (tinted AND still the lightest tier) so neither regresses on its own.
describe('El Alba — tinted surface (v1.77.0)', () => {
  it('surface is a whisper of tint, not pure #ffffff, and still the lightest tier', () => {
    const surface = tier(elalbaMap, '--bg-surface');
    expect(surface.toLowerCase()).not.toBe('#ffffff');
    expect(surface.toLowerCase()).not.toBe('#fff');
    expect(lum(surface)).toBeGreaterThan(lum(tier(elalbaMap, '--bg-subtle')));
  });
});
