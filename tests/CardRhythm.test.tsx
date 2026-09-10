import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Card, CardHeader, CardBody, CardFooter } from '../src/components/Display';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel: string) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp('(?:^|\\n)' + esc + '\\s*\\{([^}]*)\\}'))?.[1] ?? '';
};
const decl = (body: string, prop: string) => body.match(new RegExp('(?:^|;|\\s)' + prop + ':\\s*([^;]+)'))?.[1]?.trim();

/**
 * Card rhythm (v4.1.0). 4.0.0 dropped the header hairline and the header
 * turned out to have no type register of its own: it was body text, and the
 * line was what made it read as a title. Separation now comes from type and
 * vertical rhythm — title 16/600 close to its content, body with 20px of
 * air, footer plain at the bottom laying out its children — not from tone
 * or lines. Lines stay opt-in (`divider`) on header and footer; the caps
 * micro-label register is opt-in (`tone="label"`), same vocabulary as Badge.
 */
describe('Card rhythm: header', () => {
  const h = rule('.card__header');
  it('is the title register: 16px, 600, tight leading; 20px top/sides, none below', () => {
    expect(decl(h, 'font-size')).toBe('var(--text-md)');
    expect(decl(h, 'font-weight')).toBe('600');
    expect(decl(h, 'line-height')).toBe('1.25');
    expect(decl(h, 'padding')).toBe('20px 20px 0');
  });
  it('lays out a trailing action / badge with flex + gap', () => {
    expect(decl(h, 'display')).toBe('flex');
    expect(decl(h, 'justify-content')).toBe('space-between');
    expect(decl(h, 'gap')).toBe('12px');
  });
  it('a heading dropped inside inherits the register (no margin, no own size)', () => {
    const inner = rule('.card__header :is(h1, h2, h3, h4)');
    expect(decl(inner, 'font')).toBe('inherit');
    expect(decl(inner, 'margin')).toBe('0');
  });
  it('no hairline by default; --divided draws it and pads 12px under it', () => {
    expect(h).not.toMatch(/border-bottom/);
    const d = rule('.card__header--divided');
    expect(decl(d, 'border-bottom')).toContain('var(--border-default)');
    expect(decl(d, 'padding-bottom')).toBe('12px');
  });
  it('tone="label": caps micro-label, muted, 6px to the body', () => {
    const l = rule('.card__header--label');
    expect(decl(l, 'font-size')).toBe('var(--text-2xs)');
    expect(decl(l, 'text-transform')).toBe('var(--tt-label)');
    expect(decl(l, 'letter-spacing')).toBe('var(--tracking-wide)');
    expect(decl(l, 'color')).toBe('var(--fg-muted)');
    expect(decl(rule('.card__header--label + .card__body'), 'padding-top')).toBe('6px');
  });
  it('subtitle: 14px muted, 2px under the title', () => {
    const s = rule('.card__subtitle');
    expect(decl(s, 'font-size')).toBe('var(--text-sm)');
    expect(decl(s, 'color')).toBe('var(--fg-muted)');
    expect(decl(s, 'margin')).toBe('2px 0 0');
  });
});

describe('Card rhythm: body and footer', () => {
  it('body: 20px, 10px under a header', () => {
    expect(decl(rule('.card__body'), 'padding')).toBe('20px');
    expect(decl(rule('.card__header + .card__body'), 'padding-top')).toBe('10px');
  });
  it('footer: plain (no fill, no line), 20px bottom/sides, children spread with flex', () => {
    const f = rule('.card__footer');
    expect(decl(f, 'padding')).toBe('0 20px 20px');
    expect(f).not.toMatch(/border-top/);
    expect(f).not.toMatch(/background/);
    expect(decl(f, 'display')).toBe('flex');
    expect(decl(f, 'justify-content')).toBe('space-between');
    expect(decl(f, 'gap')).toBe('8px');
  });
  it('footer --divided: hairline + 12px above the content', () => {
    const d = rule('.card__footer--divided');
    expect(decl(d, 'border-top')).toContain('var(--border-default)');
    expect(decl(d, 'padding-top')).toBe('12px');
  });
  it('inset keeps its own hairline tint on dividers', () => {
    expect(decl(rule('.card--inset > .card__header--divided'), 'border-bottom-color')).toBe('var(--border-on-canvas)');
    expect(decl(rule('.card--inset > .card__footer--divided'), 'border-top-color')).toBe('var(--border-on-canvas)');
  });
});

describe('Card rhythm: component API', () => {
  it('CardHeader tone="label" and divider, CardFooter divider emit their modifiers', () => {
    const { container } = render(
      <Card>
        <CardHeader tone="label" divider>Resumen</CardHeader>
        <CardBody>x</CardBody>
        <CardFooter divider>y</CardFooter>
      </Card>
    );
    expect(container.querySelector('.card__header')).toHaveClass('card__header--label', 'card__header--divided');
    expect(container.querySelector('.card__footer')).toHaveClass('card__footer--divided');
  });
  it('defaults emit no modifier', () => {
    const { container } = render(<Card><CardHeader>t</CardHeader><CardFooter>f</CardFooter></Card>);
    expect(container.querySelector('.card__header')!.className).toBe('card__header');
    expect(container.querySelector('.card__footer')!.className).toBe('card__footer');
  });
});
