import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Accordion, AccordionItem, Breadcrumbs } from '../src/components/DataTable';
import { LocaleProvider } from '../src/locale';

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

  it('sortable headers render a button so they are keyboard-operable', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} onSortChange={() => {}} />
    );
    // The "SKU" column is sortable; its <th> should contain a real <button>.
    const skuTh = Array.from(container.querySelectorAll('th'))
      .find((th) => th.textContent?.includes('SKU'))!;
    expect(skuTh.querySelector('button')).not.toBeNull();
    // Non-sortable columns ("Nombre") should not.
    const nameTh = Array.from(container.querySelectorAll('th'))
      .find((th) => th.textContent?.includes('Nombre'))!;
    expect(nameTh.querySelector('button')).toBeNull();
  });

  it('aria-sort is only set on sortable columns', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    const ths = container.querySelectorAll('th');
    const nameTh = Array.from(ths).find((th) => th.textContent?.includes('Nombre'))!;
    const skuTh = Array.from(ths).find((th) => th.textContent?.includes('SKU'))!;
    expect(nameTh.hasAttribute('aria-sort')).toBe(false);
    expect(skuTh.getAttribute('aria-sort')).toBe('none');
  });

  it('every <th> has scope="col"', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBeGreaterThan(0);
    ths.forEach((th) => expect(th.getAttribute('scope')).toBe('col'));
  });

  it('ariaLabel is applied to the <table> element', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} ariaLabel="Productos" />
    );
    expect(container.querySelector('table')).toHaveAttribute('aria-label', 'Productos');
  });

  it('rowLabel customizes the per-row checkbox aria-label', () => {
    render(
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        rowLabel={(r) => `producto ${r.name}`}
        selectable
        selectedKeys={new Set()}
        onSelectionChange={() => {}}
      />
    );
    expect(screen.getByLabelText('Seleccionar producto Taladro')).toBeInTheDocument();
    expect(screen.getByLabelText('Seleccionar producto Sierra')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<DataTable columns={cols} rows={[]} rowKey={(r: any) => r.id} empty="Nada" />);
    expect(screen.getByText('Nada')).toBeInTheDocument();
  });

  it('respects LocaleProvider override for empty/selectAll/selectRow', () => {
    render(
      <LocaleProvider
        messages={{
          'table.empty': 'No data',
          'table.selectAll': 'Select all',
          'table.selectRow': 'Select {label}',
        }}
      >
        <DataTable
          columns={cols}
          rows={rows}
          rowKey={(r) => r.id}
          rowLabel={(r) => r.name}
          selectable
          selectedKeys={new Set()}
          onSelectionChange={() => {}}
        />
      </LocaleProvider>
    );
    expect(screen.getByLabelText('Select all')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Taladro')).toBeInTheDocument();
  });

  it('respects LocaleProvider override for empty state', () => {
    render(
      <LocaleProvider messages={{ 'table.empty': 'No records' }}>
        <DataTable columns={cols} rows={[]} rowKey={(r: any) => r.id} />
      </LocaleProvider>
    );
    expect(screen.getByText('No records')).toBeInTheDocument();
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
