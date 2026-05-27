import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Acceptance guard for the "gold standard" pass: the kit must render a
 * dense DataTable + filter toolbar like the from-scratch reference BY
 * DEFAULT, no consumer override. Pixels live in the Storybook story
 * `GoldStandard`; this pins the token/CSS decisions so they cannot drift.
 *
 * Must FAIL before the fix:
 *  - P1: `--font-mono` is the system stack; no bundled JetBrains Mono.
 *  - P2: no first-class meta/eco role (light, 11px/lh16) — secondary text
 *        inherits ~14px + `--fg-muted` and competes.
 *  - P3: default cell text is `--text-xs` (12px), gold primary is ~14px.
 *  - P4: header is weight 600 / no tracking; gold = lighter + tracked.
 *  - P5 (already shipped v1.11) MUST remain: badge default is the quiet
 *        data-chip (sentence case, tinted, no hard border).
 */
const ROOT = resolve(__dirname, '../src/styles/_root.css');
const TYPO = resolve(__dirname, '../src/styles/_typography.css');
const INDEX = resolve(__dirname, '../src/styles/index.css');
const FONTS = resolve(__dirname, '../src/styles/fonts.css');
const root = readFileSync(ROOT, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const typo = readFileSync(TYPO, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const index = readFileSync(INDEX, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const fonts = readFileSync(FONTS, 'utf8');

const token = (css: string, name: string) =>
  css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1].trim();
function ruleBody(css: string, sel: string): string {
  const re = new RegExp(
    `(^|\\})\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
    'm'
  );
  const m = css.match(re);
  if (!m) throw new Error(`rule not found: ${sel}`);
  return m[2].trim();
}
const decl = (b: string, p: string) =>
  b.match(new RegExp(`(?:^|;)\\s*${p}\\s*:\\s*([^;]+)`, 'i'))?.[1].trim();

describe('P1 — bundled mono by default', () => {
  it('--font-mono leads with the bundled JetBrains Mono', () => {
    expect(token(root, '--font-mono')).toMatch(/^["']?JetBrains Mono["']?,/);
  });
  it('ships a JetBrains Mono @font-face + the woff2 asset', () => {
    expect(fonts).toMatch(/font-family:\s*["']JetBrains Mono["']/);
    expect(fonts).toMatch(/JetBrainsMono[^"')]*\.woff2/);
    expect(existsSync(resolve(__dirname, '../src/fonts/JetBrainsMono-VariableFont_wght.woff2'))).toBe(true);
  });
});

describe('P2 — first-class meta/eco register', () => {
  it('defines a distinct --fg-meta role (not reusing the essential --fg-muted name)', () => {
    expect(token(root, '--fg-meta')).toBeTruthy();
  });
  it('ships a .cell-meta helper at 11px / lh16 / recessed', () => {
    const m = ruleBody(typo, '.cell-meta');
    expect(decl(m, 'font-size')).toBe('var(--text-2xs)');
    expect(decl(m, 'line-height')).toBe('var(--leading-normal)');
    expect(decl(m, 'color')).toBe('var(--fg-meta)');
  });
  it('ships a .cell-wrap utility (opt one cell out of nowrap)', () => {
    const w = ruleBody(typo, '.cell-wrap');
    expect(decl(w, 'white-space')).toBe('normal');
    expect(decl(w, 'overflow-wrap')).toBe('anywhere');
  });
});

describe('P3 — gold cell text size by default', () => {
  it('default cell text is --text-sm (~14px), not --text-xs', () => {
    expect(decl(ruleBody(index, '.table td'), 'font-size')).toBe('var(--text-sm)');
  });
  it('compact padding is unchanged (8px 12px)', () => {
    expect(decl(ruleBody(index, '.table td'), 'padding')).toBe('8px 12px');
  });
});

describe('P4 — header recedes to the gold register', () => {
  const th = ruleBody(index, '.table th');
  it('lighter weight (~500, not 600)', () => {
    expect(Number(decl(th, 'font-weight'))).toBeLessThanOrEqual(500);
  });
  it('has a touch of tracking (not 0)', () => {
    expect(decl(th, 'letter-spacing')).not.toBe('var(--tracking-normal)');
  });
});

describe('P5 — quiet data-chip badge default MUST remain (shipped v1.11)', () => {
  const b = ruleBody(index, '.badge');
  it('sentence case + tinted (not ink); soft hairline so it survives non-white surfaces (1.26.0)', () => {
    expect(decl(b, 'text-transform')).toBe('none');
    expect(decl(b, 'color')).toBe('var(--fg-muted)');
    // 1.26.0 re-decision: the transparent border made the neutral chip vanish
    // on a tinted canvas (--bg-subtle ≈ --bg-canvas in El Alba) — same class of
    // bug as the disappear-on-hover one pinned just below. The soft
    // --border-default hairline (Card/Chip's token) delineates it on any
    // surface tier; it is NOT the loud ink ring the quiet-default pass removed.
    expect(decl(b, 'border')).toBe('1px solid var(--border-default)');
  });

  it('row hover must not collide with the neutral chip background', () => {
    // Two correct decisions (v1.10 row-hover=bg-subtle, v1.11 neutral
    // badge=bg-subtle) made neutral chips disappear on hover. Pin them
    // to distinct surface tokens forever.
    const rowHoverBg = decl(ruleBody(index, '.table tbody tr:hover'), 'background');
    const badgeBg = decl(b, 'background');
    expect(rowHoverBg).not.toBe(badgeBg);
  });
});
