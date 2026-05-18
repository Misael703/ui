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
    { label: 'fg-default on bg-surface', fg: T('--fg-default'), bg: T('--bg-surface'), min: 4.5 },
    { label: 'fg-link on bg-surface', fg: T('--fg-link'), bg: T('--bg-surface'), min: 4.5 },
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
