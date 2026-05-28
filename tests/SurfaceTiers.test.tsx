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

const baseMap = parseTokens(readFileSync(ROOT, 'utf8'));
const elalbaMap = { ...baseMap, ...parseTokens(readFileSync(ELALBA, 'utf8')) };

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
