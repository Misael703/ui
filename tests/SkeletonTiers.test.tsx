import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const root = strip(readFileSync(resolve(__dirname, '../src/styles/_root.css'), 'utf8'));
const elalba = strip(readFileSync(resolve(__dirname, '../src/presets/elalba/styles.css'), 'utf8'));
const index = strip(readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8'));

/**
 * Skeleton on every tier (v4.2.3). The placeholder used to be painted with
 * absolute tier colours (--bg-subtle → --bg-muted): invisible on an inset
 * (same fill), lighter than the page on the El Alba canvas (figure/ground
 * inverted), barely there on a surface. Same family as inset-on-canvas
 * (3.6.0) and CommentThread-on-card (4.2.0). Now it is translucent INK
 * relative to whatever hosts it: color-mix(--fg-default N%, transparent).
 * This pins N by compositing the ink over every host — canvas, inset
 * (--bg-subtle) and surface — in both palettes and both themes.
 */
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// sRGB alpha compositing: the mix with `transparent` keeps the ink's colour
// and only sets its alpha, so the painted result is host·(1−N) + ink·N.
const over = (ink: number[], host: number[], n: number) => host.map((h, i) => h * (1 - n) + ink[i] * n);

// Token blocks: the light `:root` and the dark `:root[data-theme="dark"]` of each file.
function block(css: string, dark: boolean): Record<string, string> {
  const re = dark ? /:root\[data-theme="dark"\]\s*\{([^}]*)\}/g : /(?:^|\n):root\s*\{([^}]*)\}/g;
  const out: Record<string, string> = {};
  for (const m of css.matchAll(re)) for (const d of m[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[d[1]] = d[2].trim();
  return out;
}
const resolveHex = (map: Record<string, string>, base: Record<string, string>, v: string, depth = 0): string => {
  const val = (map[v] ?? base[v] ?? v).trim();
  if (/^#[0-9a-f]{6}$/i.test(val)) return val;
  const m = val.match(/^var\((--[\w-]+)\)$/);
  return m && depth < 10 ? resolveHex(map, base, m[1], depth + 1) : val;
};
const tiers = ['--bg-canvas', '--bg-subtle', '--bg-surface'];
const hosts: { name: string; ink: number[]; hosts: Record<string, number[]> }[] = [];
for (const pal of ['generic', 'elalba'] as const) {
  for (const dark of [false, true]) {
    const base = { ...block(root, false), ...(dark ? block(root, true) : {}) };
    const map = pal === 'elalba' ? { ...base, ...block(elalba, false), ...(dark ? block(elalba, true) : {}) } : base;
    const ink = resolveHex(map, base, '--fg-default');
    const h: Record<string, number[]> = {};
    for (const t of tiers) h[t] = rgb(resolveHex(map, base, t));
    hosts.push({ name: `${pal} ${dark ? 'dark' : 'light'}`, ink: rgb(ink), hosts: h });
  }
}

const pct = (name: string) => {
  const m = root.match(new RegExp(name + ':\\s*color-mix\\(in oklab, var\\(--fg-default\\) (\\d+)%, transparent\\)'));
  return m ? parseInt(m[1], 10) / 100 : NaN;
};

describe('Skeleton: translucent ink relative to its host', () => {
  const nBase = pct('--skel-ink'), nBand = pct('--skel-ink-band');
  it('tokens are ink mixes, not tier colours', () => {
    expect(nBase).toBeGreaterThan(0);
    expect(nBand).toBeGreaterThan(nBase);
  });
  it('.skel paints base and band from the tokens, never from --bg-subtle / --bg-muted', () => {
    const r = index.match(/\n\.skel\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(r).toMatch(/var\(--skel-ink\)/);
    expect(r).toMatch(/var\(--skel-ink-band\)/);
    expect(r).not.toMatch(/--bg-subtle|--bg-muted/);
  });
  it.each(hosts.map((h) => [h.name, h] as const))('%s: base ≥ 1.2:1 on canvas, inset and surface; band ≥ 1.2:1 over the base', (_n, h) => {
    for (const t of tiers) {
      const host = h.hosts[t];
      const base = over(h.ink, host, nBase), band = over(h.ink, host, nBand);
      expect(contrast(base, host), `${t} base`).toBeGreaterThanOrEqual(1.2);
      expect(contrast(band, base), `${t} band`).toBeGreaterThanOrEqual(1.2);
    }
  });
});
