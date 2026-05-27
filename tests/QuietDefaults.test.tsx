import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Badge } from '../src/components/Display';

/**
 * Regression guard for the post-1.10.0 "quiet defaults" pass. These are
 * CSS-default changes that ship to prod consumers, so the test reads the
 * real stylesheet (single source of truth) and asserts the shipped rule —
 * it can never drift from what consumers actually get. Pixels live in
 * Storybook; this locks the token-level decisions.
 *
 * Defects (must FAIL before the fix):
 *  - P1 Badge: neutral default carried `--fg-default` ink + a hard ink ring
 *    + `--tt-label` uppercase → shouted as a data chip in a dense table.
 *    Default register must be the quiet data-chip (no caps, tinted text).
 *    NOTE (1.26.0): the soft `--border-default` hairline was re-added — it is
 *    the kit's standard delineator (Card/Chip), needed so the chip survives a
 *    tinted canvas; not the loud ink ring. See the border test below.
 *  - P2 Label: `.label` is weight 700 + `--fg-default` ink → the scaffold
 *    weighs as much as the value. It must recede (muted + lighter weight)
 *    without dropping below AA (covered by Contrast.test).
 *  - P3 Modal: `.modal__body` has `overflow-y:auto` but no `overflow-x`,
 *    which per CSS spec computes `overflow-x:auto` → a horizontal scrollbar
 *    on slightly-wide content. It must clip on x, scroll only on y.
 */

const INDEX = resolve(__dirname, '../src/styles/index.css');
const TYPO = resolve(__dirname, '../src/styles/_typography.css');

/** Return the declaration block (between the matching braces) of the first
 *  rule whose selector list exactly equals `selector`. */
function ruleBody(css: string, selector: string): string {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = new RegExp(
    `(^|\\})\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
    'm'
  );
  const m = noComments.match(re);
  if (!m) throw new Error(`rule not found: ${selector}`);
  return m[2].trim();
}

function decl(body: string, prop: string): string | undefined {
  const m = body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return m?.[1].trim();
}

describe('P1 — Badge default is the quiet data-chip register', () => {
  const css = readFileSync(INDEX, 'utf8');
  const badge = ruleBody(css, '.badge');

  it('does not uppercase by default (caps move to opt-in tone="label")', () => {
    expect(decl(badge, 'text-transform')).toBe('none');
  });

  it('neutral text is tinted (--fg-muted), not ink (--fg-default)', () => {
    expect(decl(badge, 'color')).toBe('var(--fg-muted)');
  });

  it('carries the soft --border-default hairline so it stays legible on any surface tier (1.26.0 re-decision)', () => {
    // Conscious reversal of the 1.10.0 "no border" sub-decision. 1.10.0 removed
    // the border to quiet the badge in dense WHITE tables, where its --bg-subtle
    // fill already delineates it. But --bg-subtle is designed to sit ON white
    // surfaces; on a tinted canvas (El Alba --bg-canvas) subtle ≈ canvas, so a
    // transparent border made the neutral chip VANISH (reported from despachos).
    // The hairline is the kit's standard soft delineator — the SAME token as
    // Card and Chip — NOT the loud --fg-default ink ring 1.10.0 removed. The
    // other quiet wins (no caps, tinted text) below still hold, and colored/
    // solid variants keep overriding border-color with their own.
    const border = decl(badge, 'border') ?? '';
    expect(border).toContain('var(--border-default)');
  });

  it('ships the opt-in brand micro-label register (.badge--label = caps)', () => {
    const label = ruleBody(css, '.badge--label');
    expect(decl(label, 'text-transform')).toBe('var(--tt-label)');
  });
});

describe('P2 — Form label recedes by default', () => {
  const typo = readFileSync(TYPO, 'utf8');
  const label = ruleBody(typo, '.label');

  it('uses the muted foreground, not ink', () => {
    expect(decl(label, 'color')).toBe('var(--fg-muted)');
  });

  it('is lighter than the value it labels (weight < 700)', () => {
    expect(Number(decl(label, 'font-weight'))).toBeLessThan(700);
  });
});

describe('P1 — Badge tone API is additive and backward-compatible', () => {
  it('defaults to the quiet data register (no badge--label)', () => {
    const { container } = render(<Badge>Clase A4</Badge>);
    const el = container.querySelector('.badge') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.classList.contains('badge--label')).toBe(false);
  });

  it('opts into the brand micro-label register with tone="label"', () => {
    const { container } = render(<Badge tone="label">Nuevo</Badge>);
    expect(container.querySelector('.badge')).toHaveClass('badge--label');
  });

  it('keeps variant orthogonal to tone', () => {
    const { container } = render(<Badge variant="accent" tone="label">$1.990</Badge>);
    const el = container.querySelector('.badge') as HTMLElement;
    expect(el).toHaveClass('badge--accent');
    expect(el).toHaveClass('badge--label');
  });
});

describe('Badge appearance axis (soft default · solid · outline)', () => {
  const css = readFileSync(INDEX, 'utf8');

  it('soft is the default — no appearance class emitted', () => {
    const { container } = render(<Badge variant="primary">x</Badge>);
    const el = container.querySelector('.badge') as HTMLElement;
    expect(el.classList.contains('badge--app-solid')).toBe(false);
    expect(el.classList.contains('badge--app-outline')).toBe(false);
  });

  it('emits badge--app-solid / badge--app-outline, orthogonal to variant', () => {
    const { container: s } = render(<Badge variant="primary" appearance="solid">x</Badge>);
    expect(s.querySelector('.badge')).toHaveClass('badge--primary', 'badge--app-solid');
    const { container: o } = render(<Badge variant="danger" appearance="outline">x</Badge>);
    expect(o.querySelector('.badge')).toHaveClass('badge--danger', 'badge--app-outline');
  });

  it('ships the solid/outline rules and the missing .badge--info fill', () => {
    expect(() => ruleBody(css, '.badge--app-solid')).not.toThrow();
    expect(() => ruleBody(css, '.badge--app-outline')).not.toThrow();
    expect(() => ruleBody(css, '.badge--info')).not.toThrow();
    // solid uses white on the per-variant dark token (AA by symmetry with
    // the already-shipped --color-*-800 text tokens).
    expect(decl(ruleBody(css, '.badge--app-solid'), 'color')).toBe('var(--color-white)');
  });
});

describe('P3 — Modal body never scrolls horizontally', () => {
  const css = readFileSync(INDEX, 'utf8');
  const body = ruleBody(css, '.modal__body');

  it('clips on x, scrolls only on y', () => {
    expect(decl(body, 'overflow-x')).toBe('hidden');
    expect(decl(body, 'overflow-y')).toBe('auto');
  });

  it('lets flex/grid children shrink instead of forcing a blowout', () => {
    expect(decl(body, 'min-width')).toBe('0');
  });
});
