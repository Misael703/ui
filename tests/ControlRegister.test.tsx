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
const token = (css: string, name: string) =>
  css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1].trim();

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
