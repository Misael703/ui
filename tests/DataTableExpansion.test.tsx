import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, type Column } from '../src/components/DataTable';

interface Row { id: string; name: string }
const ROWS: Row[] = [
  { id: '1', name: 'Martillo' },
  { id: '2', name: 'Taladro' },
];
const COLS: Column<Row>[] = [{ key: 'name', header: 'Producto' }];

const renderTable = (props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) =>
  render(
    <DataTable
      columns={COLS}
      rows={ROWS}
      rowKey={(r) => r.id}
      rowLabel={(r) => r.name}
      renderExpanded={(r) => <div>Detalle de {r.name}</div>}
      expandedKeys={new Set()}
      onExpandedChange={() => {}}
      {...props}
    />
  );

describe('DataTable row expansion', () => {
  it('sin renderExpanded NO hay columna de chevron (no breaking)', () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    expect(container.querySelector('.data-table__expand-btn')).toBeNull();
    expect(container.querySelectorAll('thead th')).toHaveLength(1);
  });

  it('con renderExpanded agrega el toggle por fila con aria-expanded', () => {
    renderTable();
    const btn = screen.getByRole('button', { name: 'Expandir detalle de Martillo' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    // colapsado: sin aria-controls (apuntaría a un id inexistente)
    expect(btn).not.toHaveAttribute('aria-controls');
  });

  it('click notifica onExpandedChange con la key agregada (controlado)', () => {
    const onExpandedChange = vi.fn();
    renderTable({ onExpandedChange });
    fireEvent.click(screen.getByRole('button', { name: 'Expandir detalle de Taladro' }));
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(['2']));
  });

  it('expandida: renderiza el panel con colSpan total y aria-controls apunta a él', () => {
    const { container } = renderTable({ expandedKeys: new Set(['1']), selectable: true, selectedKeys: new Set(), onSelectionChange: () => {} });
    const btn = screen.getByRole('button', { name: 'Expandir detalle de Martillo' });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const detail = container.querySelector('.data-table__detail td') as HTMLElement;
    expect(detail).not.toBeNull();
    expect(screen.getByText('Detalle de Martillo')).toBeInTheDocument();
    // checkbox + chevron + 1 columna de datos
    expect(detail.colSpan).toBe(3);
    expect(btn.getAttribute('aria-controls')).toBe(detail.id);
  });

  it('re-click sobre una fila expandida la quita del Set', () => {
    const onExpandedChange = vi.fn();
    renderTable({ expandedKeys: new Set(['1']), onExpandedChange });
    fireEvent.click(screen.getByRole('button', { name: 'Expandir detalle de Martillo' }));
    expect(onExpandedChange).toHaveBeenCalledWith(new Set());
  });

  it('estados error/empty usan el colSpan con la columna extra', () => {
    const { container } = renderTable({ rows: [], expandedKeys: new Set() });
    const td = container.querySelector('tbody td') as HTMLTableCellElement;
    expect(td.colSpan).toBe(2); // chevron + 1 columna
  });

  it('el footer de totales agrega la celda líder del chevron', () => {
    const cols: Column<Row>[] = [{ key: 'name', header: 'Producto', footer: 'Total' }];
    const { container } = renderTable({ columns: cols });
    expect(container.querySelectorAll('tfoot td')).toHaveLength(2);
  });
});
