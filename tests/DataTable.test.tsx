import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Accordion, AccordionItem, Breadcrumbs } from '../src/components/DataTable';

const rows = [
  { id: '1', name: 'Taladro', sku: 'TLD-1' },
  { id: '2', name: 'Sierra', sku: 'SRR-2' },
];
const cols = [
  { key: 'name', header: 'Nombre' },
  { key: 'sku', header: 'SKU', sortable: true },
];

describe('DataTable', () => {
  it('renders rows and headers', () => {
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />);
    expect(screen.getByText('Taladro')).toBeInTheDocument();
    expect(screen.getByText('Sierra')).toBeInTheDocument();
  });

  it('handles row selection', () => {
    const onSel = vi.fn();
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} selectable selectedKeys={new Set()} onSelectionChange={onSel} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // first row
    expect(onSel).toHaveBeenCalled();
  });

  it('sorts on header click', () => {
    const onSort = vi.fn();
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} onSortChange={onSort} />);
    fireEvent.click(screen.getByText('SKU'));
    expect(onSort).toHaveBeenCalledWith({ key: 'sku', dir: 'asc' });
  });

  it('shows empty state', () => {
    render(<DataTable columns={cols} rows={[]} rowKey={(r: any) => r.id} empty="Nada" />);
    expect(screen.getByText('Nada')).toBeInTheDocument();
  });

  it('numeric columns get .table__num class and right-align by default', () => {
    const numericRows = [{ id: '1', name: 'A', price: 1500 }];
    const numericCols = [
      { key: 'name', header: 'Nombre' },
      { key: 'price', header: 'Precio', numeric: true },
    ];
    const { container } = render(
      <DataTable columns={numericCols} rows={numericRows} rowKey={(r) => r.id} />
    );
    const numCell = container.querySelector('td.table__num');
    expect(numCell).not.toBeNull();
    expect(numCell!.textContent).toBe('1500');
    expect((numCell as HTMLElement).style.textAlign).toBe('right');
  });
});

describe('Accordion', () => {
  it('toggles item', () => {
    render(
      <Accordion>
        <AccordionItem id="a" title="Uno">contenido uno</AccordionItem>
        <AccordionItem id="b" title="Dos">contenido dos</AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText('contenido uno')).toBeNull();
    fireEvent.click(screen.getByText('Uno'));
    expect(screen.getByText('contenido uno')).toBeInTheDocument();
  });
});

describe('Breadcrumbs', () => {
  it('marks last item as current', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Productos' }]} />);
    expect(screen.getByText('Productos')).toHaveAttribute('aria-current', 'page');
  });
});
