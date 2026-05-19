import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataTable } from '../src/components/DataTable';

/**
 * Invariant: when a toolbar/filter zone and a DataTable share one rounded
 * surface, the DataTable owns it (border + radius + overflow); between the
 * toolbar and the table header there is exactly ONE divider (no stacked
 * card-border + filter-border + header-top); everything is clipped to the
 * radius so the header strip is clean in the corner — with no change to the
 * header band's own fill/typography.
 *
 * Must FAIL before the fix: `toolbar` prop does not exist; the header `th`
 * corner-radius is unconditional (notches against a preceding toolbar);
 * there is no single clipped surface authority.
 */
const INDEX = resolve(__dirname, '../src/styles/index.css');
const css = readFileSync(INDEX, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function ruleBody(sel: string): string {
  const re = new RegExp(
    `(^|\\})\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
    'm'
  );
  const m = css.match(re);
  if (!m) throw new Error(`rule not found: ${sel}`);
  return m[2].trim();
}
const decl = (body: string, prop: string) =>
  body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'))?.[1].trim();

describe('Table surface — toolbar shares the DataTable rounded surface', () => {
  it('DataTable renders the toolbar inside a single clipped surface', () => {
    const { container } = render(
      <DataTable
        toolbar={<div data-testid="tb">filtros</div>}
        rows={[{ id: '1', n: 'a' }]}
        rowKey={(r) => r.id}
        columns={[{ key: 'n', header: 'N' }]}
      />
    );
    const surface = container.querySelector('.table-surface');
    expect(surface).toBeTruthy();
    // The toolbar AND the table-wrap both live inside the one surface.
    expect(surface!.querySelector('[data-testid="tb"]')).toBeTruthy();
    expect(surface!.querySelector('.table-wrap')).toBeTruthy();
  });

  it('no toolbar → byte-identical legacy structure (no surface wrapper)', () => {
    const { container } = render(
      <DataTable
        rows={[{ id: '1', n: 'a' }]}
        rowKey={(r) => r.id}
        columns={[{ key: 'n', header: 'N' }]}
      />
    );
    expect(container.querySelector('.table-surface')).toBeNull();
    expect(container.querySelector('.table-wrap')).toBeTruthy();
  });

  it('the surface owns border + radius + overflow:hidden (the clip authority)', () => {
    const s = ruleBody('.table-surface');
    expect(decl(s, 'overflow')).toBe('hidden');
    expect(decl(s, 'border')).toContain('var(--border-default)');
    expect(decl(s, 'border-radius')).toBe('var(--radius-lg)');
  });

  it('the inner table-wrap defers (drops its own border + radius)', () => {
    const w = ruleBody('.table-surface > .table-wrap');
    expect(decl(w, 'border')).toBe('0');
    expect(decl(w, 'border-radius')).toBe('0');
  });

  it('header corner-radius is suppressed under a toolbar (no corner seam)', () => {
    const a = ruleBody('.table-surface .data-table thead tr:first-child th:first-child');
    const b = ruleBody('.table-surface .data-table thead tr:first-child th:last-child');
    expect(decl(a, 'border-top-left-radius')).toBe('0');
    expect(decl(b, 'border-top-right-radius')).toBe('0');
  });

  it('exactly one divider between toolbar and header', () => {
    const bar = ruleBody('.table-surface__bar');
    expect(decl(bar, 'border-bottom')).toContain('var(--border-default)');
  });

  it('the header band fill is untouched (only geometry changes)', () => {
    // The band's own look must not be part of this change.
    expect(decl(ruleBody('.table th'), 'background')).toBe('var(--bg-subtle)');
  });

  it('sticky header keeps the grey band (opaque), not white', () => {
    // Bug: the sticky rule hardcoded --bg-surface (white), overriding the
    // grey band. --bg-subtle is already opaque, so sticky still works.
    const th = ruleBody('.table-wrap--sticky .table thead th');
    expect(decl(th, 'background')).toBe('var(--bg-subtle)');
  });
});
