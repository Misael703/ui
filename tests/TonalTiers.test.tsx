import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel: string) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp('(?:^|\\n)' + esc + '\\s*\\{([^}]*)\\}'))?.[1] ?? '';
};
const decl = (body: string, prop: string) => body.match(new RegExp('(?:^|;|\\s)' + prop + ':\\s*([^;]+)'))?.[1]?.trim();

/**
 * Tonal tiers (v4.2.0): a tier step GROUPS, it never DELINEATES. `--bg-subtle`
 * sits 1.07:1 (generic) / 1.04:1 (El Alba) over `--bg-surface` — enough to
 * make a region feel part of another, never enough to count repeated items.
 * A resting element whose only figure/ground signal is a subtle / muted fill
 * is wrong on every tier; it needs an edge, a shape or rhythm. Pins the
 * three places that had the pattern.
 */
describe('tonal tiers: a comment is a row, not a tinted block', () => {
  const c = rule('.comment');
  it('.comment carries no fill and no radius of its own', () => {
    expect(c).not.toMatch(/background/);
    expect(c).not.toMatch(/border-radius/);
  });
  it('items separate with a hairline between them (never a line before the first)', () => {
    expect(decl(rule('.comment + .comment'), 'border-top')).toContain('var(--border-default)');
  });
  it('the internal note keeps its semantic tint AND an edge', () => {
    const i = rule('.comment--internal');
    expect(decl(i, 'background')).toBe('var(--color-yellow-50)');
    expect(decl(i, 'border')).toContain('dashed');
    expect(decl(i, 'border-radius')).toBeTruthy();
  });
});

describe('tonal tiers: cart items are rows', () => {
  it('.cart__item carries no fill; items separate with a hairline', () => {
    expect(rule('.cart__item')).not.toMatch(/background/);
    expect(decl(rule('.cart__item + .cart__item'), 'border-top')).toContain('var(--border-default)');
  });
});

describe('tonal tiers: modal / drawer footers are plain with a line (like CardFooter)', () => {
  it.each(['.modal__footer', '.drawer__footer'])('%s keeps its hairline and drops the subtle fill', (sel) => {
    const r = rule(sel);
    expect(decl(r, 'border-top')).toContain('var(--border-default)');
    expect(r).not.toMatch(/background/);
  });
});
