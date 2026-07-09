import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataTable } from '../src/components/DataTable';

/**
 * Row activation for interactive DataTables (iOS/WebKit fix, v1.80.0).
 *
 * The stretched-overlay pattern (an `inset:0` control counting on `<tr>` as its
 * positioned containing block) is dropped: WebKit/iOS ignores `position:relative`
 * on a `<tr>`, so every row's overlay escaped to the viewport, stacked, and the
 * last one hijacked all taps + vertical scroll. Pointer activation now lives on
 * the `<tr>` onClick (works in every browser), guarded against nested controls;
 * the rowlink stays purely as the focusable, SR-named keyboard affordance.
 */

const tableCss = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

const rows = [
  { id: '1', name: 'Taladro', sku: 'TLD-1' },
  { id: '2', name: 'Sierra', sku: 'SRR-2' },
];
const cols = [
  { key: 'name', header: 'Nombre' },
  { key: 'sku', header: 'SKU' },
];

describe('DataTable row activation — pointer', () => {
  it('clicking a cell activates THAT row (not the last), once', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} onRowClick={onRowClick} />);
    // Second row's SKU cell — the bug routed every tap to the last row; here the
    // clicked row must be the one that fires.
    fireEvent.click(screen.getByText('SRR-2'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it('does NOT activate the row when the selection checkbox is clicked', () => {
    const onRowClick = vi.fn();
    const onSel = vi.fn();
    render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} onRowClick={onRowClick}
        selectable selectedKeys={new Set()} onSelectionChange={onSel} />
    );
    fireEvent.click(screen.getAllByRole('checkbox')[1]); // first data row
    expect(onSel).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('does NOT activate the row when a nested [data-row-interactive] control is clicked', () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    const colsWithBtn = [
      { key: 'name', header: 'Nombre' },
      {
        key: 'act', header: 'Acción',
        accessor: (r: typeof rows[number]) => (
          <button data-row-interactive onClick={() => onEdit(r.id)}>Editar</button>
        ),
      },
    ];
    render(<DataTable columns={colsWithBtn} rows={rows} rowKey={(r) => r.id} onRowClick={onRowClick} />);
    fireEvent.click(screen.getAllByText('Editar')[0]);
    expect(onEdit).toHaveBeenCalledWith('1');
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe('DataTable row activation — keyboard control (rowlink)', () => {
  it('the rowlink is a focusable, SR-named control', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} onRowClick={() => {}} />
    );
    const link = container.querySelector('.data-table__rowlink') as HTMLButtonElement;
    expect(link).not.toBeNull();
    expect(link.tagName).toBe('BUTTON');
    expect(link.getAttribute('aria-label')).toBeTruthy();
    // Not removed from the tab order (Tab reaches it; Enter/Space activates).
    expect(link.getAttribute('tabindex')).not.toBe('-1');
  });

  it('activating the rowlink fires once and does not double-fire via row bubbling', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} onRowClick={onRowClick} />
    );
    const link = container.querySelector('.data-table__rowlink') as HTMLButtonElement;
    fireEvent.click(link); // native activation (keyboard Enter → button click)
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
});

describe('DataTable row activation — rowHref', () => {
  it('renders a real <a href> and the row click delegates through it', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} rowHref={(r) => `/item/${r.id}`} />
    );
    const link = container.querySelector('a.data-table__rowlink') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/item/1');
    const spy = vi.fn((e: Event) => e.preventDefault()); // stop jsdom navigation
    link.addEventListener('click', spy);
    fireEvent.click(screen.getByText('TLD-1')); // first row's cell
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('DataTable — non-interactive rows stay inert', () => {
  it('without onRowClick/rowHref there is no rowlink and no clickable row', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    expect(container.querySelector('.data-table__rowlink')).toBeNull();
    expect(container.querySelector('tr.is-clickable')).toBeNull();
    // Clicking a cell does nothing (and does not throw).
    fireEvent.click(screen.getByText('Sierra'));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

// Cross-browser regression guard for the overlay itself: assert the CSS never
// re-introduces the full-bleed `inset:0` control nor the <tr> positioning it
// depended on. This fails in ANY browser/jsdom, no WebKit needed.
describe('DataTable rowlink CSS — no full-bleed overlay (iOS fix)', () => {
  const block = (sel: string): string => {
    const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = tableCss.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'));
    return m ? m[1] : '';
  };
  it('.data-table__rowlink is clipped (sr-only), not an inset:0 overlay', () => {
    const b = block('.data-table__rowlink');
    expect(b, '.data-table__rowlink rule not found').not.toBe('');
    expect(b).toMatch(/clip-path/);
    expect(b).not.toMatch(/inset:\s*0/);
  });
  it('.data-table tr.is-clickable no longer relies on position:relative', () => {
    const b = block('.data-table tr.is-clickable');
    expect(b, 'is-clickable rule not found').not.toBe('');
    expect(b).not.toMatch(/position:\s*relative/);
  });
});
