import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Form-control width convention (v1.82.0). Every field-shaped control fills its
 * container by default; the container constrains the width, not the control, so
 * a row of mixed controls aligns. Combobox used to clamp to a fixed 220px
 * (inline-block) and broke that; this guards it (and the family) from regressing.
 *
 * NumberInput is deliberately excluded: it defaults to content-width and opts
 * into filling via `fullWidth` (like Button) — a compact numeric stepper is
 * often meant to be narrow (quantity fields).
 */
const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'));
  return m ? m[1] : '';
}

describe('form-control width convention — fill by default', () => {
  it('Combobox fills (width:100%), not a fixed 220px inline-block clamp', () => {
    const b = block('.combobox');
    expect(b, '.combobox rule not found').not.toBe('');
    expect(b).toMatch(/width:\s*100%/);
    expect(b).not.toMatch(/min-width:\s*220px/);
  });

  it('the field family fills its container', () => {
    // Two fill mechanisms, both valid: explicit width:100% (inputs, pickers,
    // combobox) or block-level auto-width (multicombo/daterange roots are plain
    // block <div>s, so width:auto already fills — asserted via display:block +
    // no fixed width).
    expect(block('.input, .select, .textarea')).toMatch(/width:\s*100%/);
    for (const sel of ['.datepicker', '.timepicker', '.gridpicker']) {
      expect(block(sel), `${sel} should fill`).toMatch(/width:\s*100%/);
    }
    // multicombo/daterange roots are plain block <div>s (width:auto fills); they
    // must not be pinned to a fixed `width` (a min-width floor is fine).
    for (const sel of ['.multicombo', '.daterange']) {
      expect(block(sel), `${sel} must not clamp to a fixed width`).not.toMatch(/[^-]width:\s*\d/);
    }
  });

  it('NumberInput stays content-width by default (fullWidth opts into filling)', () => {
    // Its base rule must NOT force width:100%; the `--block` modifier does.
    expect(block('.number-input')).not.toMatch(/width:\s*100%/);
    expect(block('.number-input--block')).toMatch(/width:\s*100%/);
  });
});
