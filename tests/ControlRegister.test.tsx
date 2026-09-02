import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guard del registro compact (v3.0.0): los size sets viven en tokens y el
 * default del kit es el registro denso. Un control escala TODAS sus medidas
 * juntas (altura+font+pad+radio); pointer:coarse restaura el touch target.
 */
const root = readFileSync(resolve(__dirname, '../src/styles/_root.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const index = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
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

describe('compact register — size-set tokens', () => {
  it('define los sets de control', () => {
    expect(token(root, '--control-h-sm')).toBe('28px');
    expect(token(root, '--control-h-md')).toBe('38px');
    expect(token(root, '--control-h-lg')).toBe('44px');
    expect(token(root, '--control-font-sm')).toBe('var(--text-xs)');
    expect(token(root, '--control-font-md')).toBe('var(--text-sm)');
    expect(token(root, '--control-pad-x-md')).toBe('12px');
    expect(token(root, '--control-radius-md')).toBe('6px');
  });
  it('define el stop de datos 13px', () => {
    expect(token(root, '--text-data')).toBe('0.8125rem');
  });
  it('los field metrics leen de los tokens de control', () => {
    expect(token(root, '--field-min-h')).toBe('var(--control-h-md)');
    expect(token(root, '--field-pad-y')).toBe('7px');
    expect(token(root, '--field-pad-x')).toBe('var(--control-pad-x-md)');
  });
  it('pointer:coarse restaura el touch target 44px', () => {
    const coarse = root.match(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\}\s*\}/)?.[1] ?? '';
    expect(coarse).toMatch(/--control-h-md:\s*44px/);
    expect(coarse).toMatch(/--field-pad-y:\s*10px/);
  });
});

describe('compact register — fields', () => {
  it('los campos consumen el set md (38px/14px)', () => {
    const f = ruleBody(index, '.input, .select, .textarea');
    expect(f).toMatch(/font-size:\s*var\(--control-font-md\)/);
    expect(f).toMatch(/min-height:\s*var\(--field-min-h, 38px\)/);
    expect(f).toMatch(/padding:\s*var\(--field-pad-y, 7px\) var\(--field-pad-x, 12px\)/);
  });
  it('los labels bajan a 12px', () => {
    expect(ruleBody(index, '.field__label')).toMatch(/font-size:\s*var\(--text-xs\)/);
  });
  it('los inputs de picker consumen el font de control', () => {
    // el bloque agrupado termina en .daterange__field-input — matchear ahí
    expect(index).toMatch(/\.daterange__field-input\s*\{[^}]*font-size:\s*var\(--control-font-md\)/);
  });
});
