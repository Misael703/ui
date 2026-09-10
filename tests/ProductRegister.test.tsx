import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const index = strip(readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8'));
const root = strip(readFileSync(resolve(__dirname, '../src/styles/_root.css'), 'utf8'));
const filters = readFileSync(resolve(__dirname, '../src/components/Filters.tsx'), 'utf8');

const rule = (css: string, sel: string) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp('(?:^|\\n)' + esc + '\\s*\\{([^}]*)\\}'))?.[1] ?? '';
};
const decl = (body: string, prop: string) => body.match(new RegExp('(?:^|;|\\s)' + prop + ':\\s*([^;]+)'))?.[1]?.trim();

/**
 * 4.0.0 — product register. Measured against a shadcn page, the kit was not
 * bigger (38 vs 36px controls) but heavier in ink: caps + bold + tracking on
 * buttons, tracking on lowercase badges, two radii at one height, three
 * horizontal lines before a card's content. This pins the quieter register.
 * Kept on purpose: 38px controls, surface hairlines, 3:1 control borders.
 */
describe('4.0.0 tokens', () => {
  it('--tt-action (none) and --tracking-action (0) exist so a preset can opt back into caps', () => {
    expect(root).toMatch(/--tt-action:\s*none;/);
    expect(root).toMatch(/--tracking-action:\s*0;/);
  });
  it('surfaces round at 8px (--radius-lg)', () => {
    expect(root).toMatch(/--radius-lg:\s*8px;/);
  });
  it('controls keep 38px and the 3:1 border', () => {
    expect(root).toMatch(/--control-h-md:\s*38px;/);
    expect(decl(rule(index, '.input, .select, .textarea'), 'border')).toContain('var(--border-control)');
  });
});

describe('4.0.0 Button: sentence case, 600, one font with its siblings', () => {
  const btn = rule(index, '.btn');
  it('reads --tt-action / --tracking-action, weight 600', () => {
    expect(decl(btn, 'text-transform')).toBe('var(--tt-action)');
    expect(decl(btn, 'letter-spacing')).toBe('var(--tracking-action)');
    expect(decl(btn, 'font-weight')).toBe('600');
  });
  it('md reads --control-font-md (14px): the --text-data exception is gone', () => {
    const md = rule(index, '.btn--md');
    expect(decl(md, 'font-size')).toBe('var(--control-font-md)');
    expect(index).not.toMatch(/\.btn--md\s*\{[^}]*--text-data/);
  });
  it('every size shares --control-radius-md', () => {
    expect(decl(btn, 'border-radius')).toBe('var(--control-radius-md)');
  });
  it('icons inside a button are 16px (18 in lg / xl)', () => {
    expect(rule(index, '.btn svg')).toMatch(/width:\s*16px;\s*height:\s*16px/);
    expect(rule(index, '.btn--lg svg, .btn--xl svg')).toMatch(/width:\s*18px;\s*height:\s*18px/);
  });
});

describe('4.0.0 controls: one radius at one height', () => {
  it('input / select / textarea round like the button', () => {
    expect(decl(rule(index, '.input, .select, .textarea'), 'border-radius')).toBe('var(--control-radius-md)');
  });
  it('combobox and the picker fields too', () => {
    expect(decl(rule(index, '.combobox__input,\n.combobox__trigger'), 'border-radius')).toBe('var(--control-radius-md)');
    expect(decl(rule(index, '.input-group'), 'border-radius')).toBe('var(--control-radius-md)');
  });
});

describe('4.0.0 Badge: a 20px data chip, 500, no tracking', () => {
  const badge = rule(index, '.badge');
  it('20px tall', () => {
    expect(decl(badge, 'padding')).toBe('1px 8px');
    expect(decl(badge, 'line-height')).toBe('18px');
    expect(decl(badge, 'min-height')).toBe('20px');
  });
  it('500, no letter-spacing on lowercase', () => {
    expect(decl(badge, 'font-weight')).toBe('500');
    expect(decl(badge, 'letter-spacing')).toBe('0');
  });
  it('the opt-in caps register keeps its tracking', () => {
    expect(decl(rule(index, '.badge--label'), 'letter-spacing')).toBe('var(--tracking-wide)');
  });
});

describe('4.0.0 list page density', () => {
  it('table cells 6px 10px', () => {
    expect(decl(rule(index, '.table td'), 'padding')).toBe('6px 10px');
  });
  it('filter bar on the table surface: 8px 16px', () => {
    expect(decl(rule(index, '.table-surface__bar > .filter-bar'), 'padding')).toBe('8px 16px');
  });
  it('pagination footer: 4px', () => {
    expect(decl(rule(index, '.table-surface__footer .table-pagination'), 'padding-block')).toBe('4px');
  });
  it('FilterBar layout defaults to collapse (the trailing group shares the line)', () => {
    expect(filters).toMatch(/const deskLayout: FilterBarLayout = layout \?\? 'collapse';/);
  });
  it('page header sits 8px above the surface; title in the body face, 600, 20px', () => {
    expect(decl(rule(index, '.page-header'), 'margin-bottom')).toBe('8px');
    const title = rule(index, '.page-header__title');
    expect(decl(title, 'font-family')).toBe('var(--font-body)');
    expect(decl(title, 'font-weight')).toBe('600');
    expect(decl(title, 'font-size')).toBe('var(--text-xl)');
    expect(decl(title, 'letter-spacing')).toBe('0');
  });
});

describe('4.0.0 Card: the header divider is opt-in', () => {
  it('.card__header has no border by default; .card__header--divided draws it', () => {
    expect(rule(index, '.card__header')).not.toMatch(/border-bottom/);
    expect(decl(rule(index, '.card__header--divided'), 'border-bottom')).toContain('var(--border-default)');
  });
});
