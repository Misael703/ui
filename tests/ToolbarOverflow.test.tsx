import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TableToolbar, DataTable, TablePagination } from '../src/components/DataTable';
import { FilterBar } from '../src/components/Filters';
import { Button } from '../src/components/Button';

/**
 * `overflow` (v3.7.0): toolbar actions as DATA so the kit renders them inline
 * on a desk (ghost sm + icon) and behind a "⋯" menu on a phone. jsdom has no
 * matchMedia; stubbed per test.
 */
const stub = (matches: boolean) => Object.defineProperty(window, 'matchMedia', {
  configurable: true, writable: true,
  value: (media: string) => ({ matches, media, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }),
});
const actions = (onSelect = () => {}) => [{ label: 'Exportar', icon: <svg data-testid="ico" />, onSelect }];

describe('TableToolbar overflow', () => {
  it('wide: inline tertiary buttons after the children', () => {
    stub(false);
    const onSelect = vi.fn();
    render(<TableToolbar overflow={actions(onSelect)}><span>buscar</span></TableToolbar>);
    const btn = screen.getByRole('button', { name: 'Exportar' });
    expect(btn).toHaveClass('btn--ghost', 'btn--sm');
    expect(btn.querySelector('[data-testid="ico"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Más opciones' })).toBeNull();
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
  it('narrow: a "Más opciones" menu holds the actions', () => {
    stub(true);
    const onSelect = vi.fn();
    render(<TableToolbar overflow={actions(onSelect)}><span>buscar</span></TableToolbar>);
    expect(screen.queryByRole('button', { name: 'Exportar' })).toBeNull();
    const more = screen.getByRole('button', { name: 'Más opciones' });
    expect(more).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.click(more);
    fireEvent.click(screen.getByRole('menuitem', { name: /Exportar/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
  it('destructive actions render ghost-danger inline', () => {
    stub(false);
    render(<TableToolbar overflow={[{ label: 'Vaciar', destructive: true }]} />);
    expect(screen.getByRole('button', { name: 'Vaciar' })).toHaveClass('btn--ghost-danger');
  });
});

describe('FilterBar overflow', () => {
  it('wide: joins `actions` inside .filter-bar__actions', () => {
    stub(false);
    const { container } = render(<FilterBar actions={<button type="button">Limpiar</button>} overflow={actions()}><div /></FilterBar>);
    const box = container.querySelector('.filter-bar__actions')!;
    expect(box.textContent).toContain('Limpiar');
    expect(box.querySelector('.btn--ghost')).toHaveTextContent('Exportar');
  });
  it('narrow: Limpiar stays visible, Exportar goes behind the menu', () => {
    stub(true);
    render(<FilterBar actions={<button type="button">Limpiar</button>} overflow={actions()}><div /></FilterBar>);
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Exportar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Más opciones' })).toBeInTheDocument();
  });
});

describe('Button hideLabel="desktop" + ghost-danger (v3.7.0)', () => {
  it('desktop: mirror modifier, label still the accessible name', () => {
    render(<Button size="xs" variant="ghost-danger" hideLabel="desktop">Borrar</Button>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    expect(btn).toHaveClass('btn--hide-label-desktop', 'btn--ghost-danger', 'btn--xs');
  });
  it('CSS: desktop variant lives under min-width 601px; ghost-danger is neutral at rest, red on hover', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');
    expect(css).toMatch(/@media \(min-width: 601px\) \{\s*\.btn--hide-label-desktop \{[^}]*aspect-ratio:\s*1/);
    expect(css).toMatch(/\.btn--hide-label-desktop\.btn--xs \{[^}]*width:\s*28px/);
    expect(css).toMatch(/\.btn--ghost-danger \{[^}]*color:\s*var\(--fg-default\)/);
    expect(css).toMatch(/\.btn--ghost-danger:hover:not\(:disabled\),\s*\.btn--ghost-danger:focus-visible \{[^}]*color:\s*var\(--color-danger\)/);
    // the toolbar search shrinks its basis on a phone so search + funnel + ⋯ fit 320px
    expect(css).toMatch(/@media \(max-width: 600px\) \{\s*\.table-toolbar > \.grow,[\s\S]*?flex-basis:\s*120px/);
  });
});

describe('FilterBar sort (v3.7.0)', () => {
  const sort = { value: 'recent', options: [{ value: 'recent', label: 'Más recientes' }, { value: 'client', label: 'Cliente' }], onChange: () => {} };
  it('default sortOn="mobile": nothing on a wide viewport, a SortDropdown on a narrow one', () => {
    stub(false);
    const { container, unmount } = render(<FilterBar sort={sort}><div /></FilterBar>);
    expect(container.querySelector('.filter-bar__sort')).toBeNull();
    unmount();
    stub(true);
    const r = render(<FilterBar sort={sort}><div /></FilterBar>);
    // on a phone it sits next to the funnel (first line), not in the trailing group
    const el = r.container.querySelector('.filter-bar > .filter-bar__sort');
    expect(el).not.toBeNull();
    expect(r.container.querySelector('.filter-bar__end .filter-bar__sort')).toBeNull();
    expect(screen.getByRole('combobox', { name: /Ordenar/ })).toHaveValue('recent');
  });
  it('sortOn="always" renders it on a desk too', () => {
    stub(false);
    const { container } = render(<FilterBar sort={sort} sortOn="always"><div /></FilterBar>);
    expect(container.querySelector('.filter-bar__end .filter-bar__sort')).not.toBeNull();
  });
});

describe('DataTable footer slot (v3.7.0)', () => {
  it('footer alone builds the surface with a footer zone (no toolbar bar)', () => {
    const { container } = render(<DataTableFooterProbe />);
    expect(container.querySelector('.table-surface')).not.toBeNull();
    expect(container.querySelector('.table-surface__bar')).toBeNull();
    expect(container.querySelector('.table-surface > .table-surface__footer')).toHaveTextContent('1–10 de 256');
  });
  it('CSS: footer divider + inset; cards drop it; the phone bar tightens', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');
    expect(css).toMatch(/\.table-surface__footer \{[^}]*border-top:\s*1px solid var\(--border-default\)/);
    expect(css).toMatch(/\.table-surface\.table-surface--cards > \.table-surface__footer \{[^}]*border-top:\s*0/);
    expect(css).toMatch(/@media \(max-width: 600px\) \{\s*\.table-surface__bar > \.filter-bar \{[^}]*padding-inline:\s*var\(--space-3\)/);
    expect(css).toMatch(/\.filter-bar__sort \.sort-dropdown__label \{[^}]*clip-path/);
  });
});

function DataTableFooterProbe() {
  return (
    <DataTable
      columns={[{ key: 'name', header: 'Nombre' }]}
      rows={[{ id: '1', name: 'A' }]}
      rowKey={(r) => r.id}
      footer={<TablePagination page={1} pageSize={10} total={256} onPageChange={() => {}} />}
    />
  );
}

