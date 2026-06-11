import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, ColumnToggle, type Column } from '../src/components/DataTable';

interface Row { id: string; name: string; sku: string; price: number }
const ROWS: Row[] = [
  { id: '1', name: 'Martillo', sku: 'MAR-1', price: 5000 },
];
const COLS: Column<Row>[] = [
  { key: 'name', header: 'Producto' },
  { key: 'sku', header: 'SKU' },
  { key: 'price', header: 'Precio', numeric: true, footer: '$5.000' },
];

describe('DataTable hiddenColumnKeys', () => {
  it('oculta header, celdas y footer de la columna escondida', () => {
    const { container } = render(
      <DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} hiddenColumnKeys={new Set(['sku'])} />
    );
    expect(screen.queryByText('SKU')).not.toBeInTheDocument();
    expect(screen.queryByText('MAR-1')).not.toBeInTheDocument();
    expect(container.querySelectorAll('thead th')).toHaveLength(2);
    expect(container.querySelectorAll('tbody td')).toHaveLength(2);
    expect(container.querySelectorAll('tfoot td')).toHaveLength(2);
  });

  it('Set vacío o ausente no cambia nada (no breaking)', () => {
    const { container } = render(
      <DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} hiddenColumnKeys={new Set()} />
    );
    expect(container.querySelectorAll('thead th')).toHaveLength(3);
  });

  it('el colSpan del empty usa solo las columnas visibles', () => {
    const { container } = render(
      <DataTable columns={COLS} rows={[]} rowKey={(r) => r.id} hiddenColumnKeys={new Set(['sku', 'price'])} />
    );
    expect((container.querySelector('tbody td') as HTMLTableCellElement).colSpan).toBe(1);
  });
});

describe('ColumnToggle', () => {
  const setup = (hidden = new Set<string>()) => {
    const onChange = vi.fn();
    render(<ColumnToggle columns={COLS} hiddenKeys={hidden} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Columnas' }));
    return onChange;
  };

  it('lista todas las columnas con su estado de visibilidad', () => {
    setup(new Set(['sku']));
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(3);
    expect(boxes[0]).toBeChecked();      // Producto visible
    expect(boxes[1]).not.toBeChecked();  // SKU oculta
  });

  it('check/uncheck notifica el Set actualizado', () => {
    const onChange = setup();
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(onChange).toHaveBeenCalledWith(new Set(['sku']));
  });

  it('re-mostrar una columna la saca del Set', () => {
    const onChange = setup(new Set(['sku']));
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(onChange).toHaveBeenCalledWith(new Set());
  });

  it('la última columna visible queda deshabilitada (nunca cero columnas)', () => {
    setup(new Set(['sku', 'price']));
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes[0]).toBeDisabled();      // única visible → no se puede ocultar
    expect(boxes[1]).not.toBeDisabled();  // ocultas siempre se pueden mostrar
  });
});
