import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * WCAG AA contrast guard for the DARK theme (v1.79.0).
 *
 * Mirror of Contrast.test.tsx, scoped to the `:root[data-theme="dark"]` blocks.
 * The dark maps are built exactly as the cascade computes them when the theme
 * is active: base light ⊕ base dark (⊕ preset light ⊕ preset dark for El Alba).
 *
 * The soft status/category chip stops are re-tinted in dark via
 * `color-mix(in oklab, …)`, so this file ports the OKLab matrices (Björn
 * Ottosson) to resolve those mixes to a concrete hex before measuring — a chip
 * whose ink drops below AA on its own dark-tinted background fails here.
 *
 * Target (WCAG 2.1): 4.5:1 normal text.
 */

const ROOT = resolve(__dirname, '../src/styles/_root.css');
const ELALBA = resolve(__dirname, '../src/presets/elalba/styles.css');
const DARK = ':root[data-theme="dark"]';

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

const rootCss = readFileSync(ROOT, 'utf8');
const elalbaCss = readFileSync(ELALBA, 'utf8');
const baseLight = parseTokens(blockFor(rootCss, ':root'));
const baseDark = { ...baseLight, ...parseTokens(blockFor(rootCss, DARK)) };
// El Alba dark, modeling the REAL cascade priority (low → high):
//   base :root (layered) < base dark (layered) < preset :root (UNLAYERED) < preset dark (UNLAYERED)
// The kit imports its tokens into `@layer elalba`; a preset is imported unlayered,
// and unlayered beats layered before specificity is even considered. So the
// preset's light `:root` OVERRIDES the base dark block — which is why any token a
// preset remaps in light must be re-asserted in its dark block. This spread order
// (base dark BEFORE preset light) reproduces that, so a future preset token that
// shadows the base dark without a dark re-assertion would surface here.
const elalbaDark = {
  ...baseLight,
  ...parseTokens(blockFor(rootCss, DARK)),
  ...parseTokens(blockFor(elalbaCss, ':root')),
  ...parseTokens(blockFor(elalbaCss, DARK)),
};

// ---- sRGB ↔ OKLab (Ottosson) so `color-mix(in oklab, …)` can be evaluated ----
const toLin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const toGamma = (l: number) => {
  const v = l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
};
function rgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function linToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function oklabToLin(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
// color-mix(in oklab, A ratioA, B) — A weighted ratioA, B weighted (1-ratioA).
function oklabMix(hexA: string, hexB: string, ratioA: number): string {
  const [ar, ag, ab] = rgb(hexA).map(toLin) as [number, number, number];
  const [br, bg, bb] = rgb(hexB).map(toLin) as [number, number, number];
  const A = linToOklab(ar, ag, ab), B = linToOklab(br, bg, bb);
  const mix = A.map((v, i) => v * ratioA + B[i] * (1 - ratioA)) as [number, number, number];
  const [r, g, b] = oklabToLin(mix[0], mix[1], mix[2]);
  return `#${[r, g, b].map((c) => toGamma(c).toString(16).padStart(2, '0')).join('')}`;
}

const COLOR_MIX = /^color-mix\(in oklab,\s*(var\(--[\w-]+\)|#[0-9a-fA-F]{3,8})\s+([\d.]+)%,\s*(var\(--[\w-]+\)|#[0-9a-fA-F]{3,8})\)$/;
// Resolve a token value to a concrete hex, following var() chains and oklab mixes.
function evalColor(map: Record<string, string>, value: string, depth = 0): string {
  const v = (value ?? '').trim();
  if (depth > 24) return v;
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  const varM = v.match(/^var\((--[\w-]+)\)$/);
  if (varM) return evalColor(map, map[varM[1]] ?? '', depth + 1);
  const mixM = v.match(COLOR_MIX);
  if (mixM) return oklabMix(evalColor(map, mixM[1], depth + 1), evalColor(map, mixM[3], depth + 1), parseFloat(mixM[2]) / 100);
  return v;
}

const lum = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
};
function contrast(a: string, b: string): number {
  const l1 = lum(a), l2 = lum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

interface Pair { label: string; fg: string; bg: string }
function pairs(map: Record<string, string>): Pair[] {
  const C = (n: string) => evalColor(map, `var(${n})`);
  const P: Pair[] = [];
  // Foreground text on each dark surface tier.
  for (const [fgName, fgTok] of [['muted', '--fg-muted'], ['subtle', '--fg-subtle'], ['meta', '--fg-meta']] as const) {
    for (const bg of ['--bg-surface', '--bg-canvas', '--bg-subtle']) {
      P.push({ label: `fg-${fgName} on ${bg.replace('--bg-', '')}`, fg: C(fgTok), bg: C(bg) });
    }
  }
  P.push({ label: 'fg-default on surface', fg: C('--fg-default'), bg: C('--bg-surface') });
  P.push({ label: 'fg-link on surface', fg: C('--fg-link'), bg: C('--bg-surface') });
  P.push({ label: 'fg-link on canvas', fg: C('--fg-link'), bg: C('--bg-canvas') });
  // Brand roles split in dark: ink (--color-primary) must read as TEXT on the
  // surface; the solid fill (--fill-brand) must carry white text (buttons,
  // checked controls, selected cells). Plus the soft brand chips.
  P.push({ label: 'brand ink (--color-primary) on surface', fg: C('--color-primary'), bg: C('--bg-surface') });
  P.push({ label: 'white on fill-brand (solid brand button)', fg: C('--color-white'), bg: C('--fill-brand') });
  P.push({ label: 'white on chrome-brand (AppShell brand band)', fg: C('--color-white'), bg: C('--chrome-brand') });
  P.push({ label: 'primary badge ink on primary-100 chip', fg: C('--color-primary-800'), bg: C('--color-primary-100') });
  P.push({ label: 'accent badge ink on secondary-100 chip', fg: C('--color-secondary-800'), bg: C('--color-secondary-100') });
  // Soft status chips: -800 ink on the -50 (badge/alert) and -100 (calendar) bg.
  for (const s of ['green', 'yellow', 'red', 'info']) {
    P.push({ label: `${s} ink on ${s}-50 chip`, fg: C(`--color-${s}-800`), bg: C(`--color-${s}-50`) });
    P.push({ label: `${s} ink on ${s}-100 chip`, fg: C(`--color-${s}-800`), bg: C(`--color-${s}-100`) });
  }
  // Categorical chips: each cat-N-fg on its dark-tinted cat-N-bg.
  for (let n = 1; n <= 6; n++) {
    P.push({ label: `cat-${n} fg on cat-${n} bg`, fg: C(`--cat-${n}-fg`), bg: C(`--cat-${n}-bg`) });
  }
  return P;
}

function run(name: string, map: Record<string, string>) {
  describe(`contrast (dark) — ${name}`, () => {
    for (const p of pairs(map)) {
      it(`${p.label} ≥ 4.5:1`, () => {
        expect(p.fg, `unresolved fg for ${p.label}: ${p.fg}`).toMatch(/^#[0-9a-f]{3,8}$/i);
        expect(p.bg, `unresolved bg for ${p.label}: ${p.bg}`).toMatch(/^#[0-9a-f]{3,8}$/i);
        const r = contrast(p.fg, p.bg);
        expect(r, `${p.label}: ${r.toFixed(2)}:1 (${p.fg} on ${p.bg}), need ≥ 4.5`).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
}

run('default palette', baseDark);
run('El Alba preset', elalbaDark);

// Sanity: the OKLab port round-trips a known mix close to the browser's result.
// 50% white over black in oklab ≈ #7c7c7c (not #808080 — oklab L is perceptual).
describe('oklab color-mix port', () => {
  it('mixes toward the perceptual midpoint, resolving to a real hex', () => {
    const mid = oklabMix('#ffffff', '#000000', 0.5);
    expect(mid).toMatch(/^#[0-9a-f]{6}$/i);
    const [r] = rgb(mid);
    // OKLab L=0.5 gray ≈ #636363 (R≈99): perceptually mid, darker than sRGB's
    // naive R128 — mixing in oklab (not srgb) is the whole point.
    expect(r).toBeGreaterThan(85);
    expect(r).toBeLessThan(115);
  });
});
