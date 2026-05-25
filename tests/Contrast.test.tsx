import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * WCAG 2.x contrast regression guard for the semantic color tokens.
 *
 * Why this exists: a data-dense consumer (despachos) surfaced that
 * `--fg-muted` / `--fg-subtle` shipped BELOW AA on the kit's own surfaces
 * (table headers, captions, placeholders). Tokens are the single source of
 * truth (`src/styles/_root.css`); this test reads them directly and resolves
 * the `var()` chains so it can never drift from what actually ships. The El
 * Alba preset is layered exactly as a consumer layers it (base ⊕ override).
 *
 * Target (WCAG 2.1): 4.5:1 normal text, 3:1 large/UI.
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

const baseMap = parseTokens(readFileSync(ROOT, 'utf8'));
// A consumer importing the El Alba preset layers its :root AFTER the base,
// so its declarations win — exactly an object spread of base then preset.
const elalbaMap = { ...baseMap, ...parseTokens(readFileSync(ELALBA, 'utf8')) };

const tok = (map: Record<string, string>, name: string) =>
  resolveVar(map, `var(${name})`);

function rgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
function contrast(a: string, b: string): number {
  const l1 = lum(rgb(a)), l2 = lum(rgb(b));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

interface Pair { label: string; fg: string; bg: string; min: number }

function pairs(map: Record<string, string>): Pair[] {
  const T = (n: string) => tok(map, n);
  return [
    // --- normal text: 4.5:1 ---
    { label: 'fg-muted on bg-surface', fg: T('--fg-muted'), bg: T('--bg-surface'), min: 4.5 },
    { label: 'fg-muted on bg-canvas', fg: T('--fg-muted'), bg: T('--bg-canvas'), min: 4.5 },
    { label: 'fg-muted on bg-subtle (TABLE HEADER)', fg: T('--fg-muted'), bg: T('--bg-subtle'), min: 4.5 },
    { label: 'fg-subtle on bg-surface (caption/placeholder)', fg: T('--fg-subtle'), bg: T('--bg-surface'), min: 4.5 },
    { label: 'fg-subtle on bg-canvas', fg: T('--fg-subtle'), bg: T('--bg-canvas'), min: 4.5 },
    { label: 'fg-subtle on bg-subtle', fg: T('--fg-subtle'), bg: T('--bg-subtle'), min: 4.5 },
    // Meta/eco role (.cell-meta). Distinct token from --fg-muted; must
    // clear AA on every surface a secondary cell line can paint on.
    { label: 'fg-meta on bg-surface (cell eco line)', fg: T('--fg-meta'), bg: T('--bg-surface'), min: 4.5 },
    { label: 'fg-meta on bg-canvas', fg: T('--fg-meta'), bg: T('--bg-canvas'), min: 4.5 },
    { label: 'fg-meta on bg-subtle (eco line on hovered row)', fg: T('--fg-meta'), bg: T('--bg-subtle'), min: 4.5 },
    { label: 'fg-default on bg-surface', fg: T('--fg-default'), bg: T('--bg-surface'), min: 4.5 },
    { label: 'fg-link on bg-surface', fg: T('--fg-link'), bg: T('--bg-surface'), min: 4.5 },

    // --- categorical palette: each --cat-N-fg must be AA on its soft --cat-N-bg ---
    { label: 'cat-1 fg on cat-1 bg', fg: T('--cat-1-fg'), bg: T('--cat-1-bg'), min: 4.5 },
    { label: 'cat-2 fg on cat-2 bg', fg: T('--cat-2-fg'), bg: T('--cat-2-bg'), min: 4.5 },
    { label: 'cat-3 fg on cat-3 bg', fg: T('--cat-3-fg'), bg: T('--cat-3-bg'), min: 4.5 },
    { label: 'cat-4 fg on cat-4 bg', fg: T('--cat-4-fg'), bg: T('--cat-4-bg'), min: 4.5 },
    { label: 'cat-5 fg on cat-5 bg', fg: T('--cat-5-fg'), bg: T('--cat-5-bg'), min: 4.5 },
    { label: 'cat-6 fg on cat-6 bg', fg: T('--cat-6-fg'), bg: T('--cat-6-bg'), min: 4.5 },
  ];
}

function run(name: string, map: Record<string, string>) {
  describe(`contrast — ${name}`, () => {
    for (const p of pairs(map)) {
      it(`${p.label} ≥ ${p.min}:1`, () => {
        const r = contrast(p.fg, p.bg);
        // Surface the measured ratio in the failure message.
        expect(
          r,
          `${p.label}: ${r.toFixed(2)}:1 (${p.fg} on ${p.bg}), need ≥ ${p.min}`
        ).toBeGreaterThanOrEqual(p.min);
      });
    }
  });
}

run('default palette', baseMap);
run('El Alba preset', elalbaMap);

/**
 * Band-aware Avatar (v1.21.0). On an inverse/brand surface the avatar chip
 * is `color-mix(--fg-on-brand 16%, transparent)` over the brand color, with
 * `--fg-on-brand` text. Compose the translucent chip over the brand surface
 * and assert the white text clears AA — in El Alba (the brand band consumers
 * actually use), where the band is `--color-primary` blue.
 */
describe('band-aware Avatar chip on brand surface', () => {
  // alpha-composite `fg` at `a` over opaque `bg`
  function over(fg: string, bg: string, a: number): string {
    const [fr, fgc, fb] = rgb(fg), [br, bgc, bb] = rgb(bg);
    const ch = (f: number, b: number) => Math.round(f * a + b * (1 - a));
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(ch(fr, br))}${hex(ch(fgc, bgc))}${hex(ch(fb, bb))}`;
  }
  it('white text on the translucent chip over El Alba brand is AA', () => {
    const brand = tok(elalbaMap, '--color-primary');      // #002f87
    const onBrand = tok(elalbaMap, '--fg-on-brand');       // white
    const chip = over(onBrand, brand, 0.16);               // 16% white over blue
    const r = contrast(onBrand, chip);
    expect(r, `avatar text on chip: ${onBrand} on ${chip} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * El Alba primary↔secondary button swap (preset-only).
 *
 * The owner accepted, eyes open (2026-05-18), a DELIBERATE brand exception:
 * the El Alba PRIMARY button is the exact brand orange #ff671d + white,
 * which is 2.91:1 — below WCAG AA. This is not negligence and not silent
 * debt: it is encoded here so it (a) cannot drift, (b) cannot get worse,
 * (c) trips this test if anyone "fixes" it to AA (forcing a conscious
 * re-decision and removal of the exception). Everything else on both
 * buttons must remain strictly AA — the exception is exactly one surface
 * pair (+ its hover), nothing more.
 */
describe('El Alba button swap — preset-only, documented exception', () => {
  const INDEX = resolve(__dirname, '../src/styles/index.css');
  const css = readFileSync(INDEX, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  it('.btn--primary/.btn--secondary are tokenized with the original fallback', () => {
    expect(css).toMatch(/\.btn--primary\s*\{[^}]*var\(--btn-primary-bg,\s*var\(--color-primary\)\)/);
    expect(css).toMatch(/\.btn--secondary\s*\{[^}]*var\(--btn-secondary-bg,\s*var\(--color-secondary\)\)/);
  });

  it('swaps the colour families in El Alba (primary←secondary, secondary←primary)', () => {
    // Primary carries the exact brand SECONDARY orange (#ff671d); secondary
    // carries the brand PRIMARY blue — that is the swap.
    expect(tok(elalbaMap, '--btn-primary-bg')).toBe(tok(elalbaMap, '--color-secondary'));
    expect(tok(elalbaMap, '--btn-secondary-bg')).toBe(tok(elalbaMap, '--color-primary'));
  });

  it('SECONDARY stays strictly AA (the swap must not break the blue side)', () => {
    const sfg = tok(elalbaMap, '--btn-secondary-fg');
    for (const [label, bg] of [
      ['secondary bg', tok(elalbaMap, '--btn-secondary-bg')],
      ['secondary hover', tok(elalbaMap, '--btn-secondary-bg-hover')],
    ] as Array<[string, string]>) {
      const r = contrast(sfg, bg);
      expect(r, `${label}: ${sfg} on ${bg} = ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('PRIMARY is the pinned sub-AA brand exception (bounded both ways)', () => {
    const pfg = tok(elalbaMap, '--btn-primary-fg');
    const base = contrast(pfg, tok(elalbaMap, '--btn-primary-bg'));
    const hover = contrast(pfg, tok(elalbaMap, '--btn-primary-bg-hover'));
    // Acknowledged values: white/#ff671d = 2.91, white/#ff8344 = 2.44.
    // Lower bound: cannot get WORSE than the known hover (2.44).
    // Upper bound: stays BELOW AA — if it ever reaches 4.5 this fails on
    // purpose, so the exception is reviewed and removed, not left stale.
    expect(base, `primary base = ${base.toFixed(2)}:1 (expected ~2.91, sub-AA brand exception)`).toBeCloseTo(2.91, 1);
    expect(hover, `primary hover = ${hover.toFixed(2)}:1 (expected ~2.44, sub-AA brand exception)`).toBeCloseTo(2.44, 1);
    expect(base).toBeLessThan(4.5);
    expect(hover).toBeGreaterThanOrEqual(2.4);
  });

  it('does not define --btn-* in the default palette (fallback governs)', () => {
    expect(baseMap['--btn-primary-bg']).toBeUndefined();
    expect(baseMap['--btn-secondary-bg']).toBeUndefined();
  });
});
