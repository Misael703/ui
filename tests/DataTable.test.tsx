import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataTable, Accordion, AccordionItem, Breadcrumbs, TablePagination } from '../src/components/DataTable';
import { LocaleProvider } from '../src/locale';

const tableCss = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

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

  it('renders error state with role=alert and hides rows/loading/empty', () => {
    render(
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        loading
        error="Falló la carga"
      />
    );
    // Error wins over loading and rows
    expect(screen.getByRole('alert')).toHaveTextContent('Falló la carga');
    // Rows are NOT rendered when error is set
    expect(screen.queryByText('Taladro')).toBeNull();
    expect(screen.queryByText('Sierra')).toBeNull();
  });

  it('error takes precedence over empty state', () => {
    render(
      <DataTable
        columns={cols}
        rows={[]}
        rowKey={(r: any) => r.id}
        error="Network error"
        empty="No data"
      />
    );
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByText('No data')).toBeNull();
  });

  it('stickyHeader adds the wrapper class', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} stickyHeader />
    );
    expect(container.querySelector('.table-wrap--sticky')).not.toBeNull();
  });

  it('does not add sticky class when stickyHeader is unset', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    expect(container.querySelector('.table-wrap--sticky')).toBeNull();
  });

  it('maxHeight adds the scroll class + inline max-height; sticky alone does NOT', () => {
    const { container, rerender } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} stickyHeader />
    );
    // stickyHeader without maxHeight: sticky class, no scroll class, no inline cap.
    let wrap = container.querySelector('.table-wrap') as HTMLElement;
    expect(wrap.classList.contains('table-wrap--sticky')).toBe(true);
    expect(wrap.classList.contains('table-wrap--scroll')).toBe(false);
    expect(wrap.style.maxHeight).toBe('');
    // with maxHeight: both classes + the inline cap.
    rerender(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} stickyHeader maxHeight="70vh" />);
    wrap = container.querySelector('.table-wrap') as HTMLElement;
    expect(wrap.classList.contains('table-wrap--scroll')).toBe(true);
    expect(wrap.style.maxHeight).toBe('70vh');
  });

  it('CSS: sticky decouples from a bounded box (no implicit 70vh)', () => {
    // The sticky rule no longer imposes its own scroll/height — that moved to
    // the opt-in `.table-wrap--scroll` (maxHeight prop).
    const stickyRule = tableCss.match(/\.table-wrap--sticky\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(stickyRule).not.toMatch(/max-height/);
    expect(stickyRule).not.toMatch(/70vh/);
    // sticky WITHOUT a bounded box → wrap is not a scroll container, so the
    // header can stick to an outer scroller (a Modal body).
    const ancestor = tableCss.match(/\.table-wrap--sticky:not\(\.table-wrap--scroll\)\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(ancestor).toMatch(/overflow:\s*visible/);
    // the bounded mode is the vertical scroll container.
    const scrollRule = tableCss.match(/\.table-wrap--scroll\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(scrollRule).toMatch(/overflow-y:\s*auto/);
  });

  it('mobileLayout=cards adds the wrapper class and data-label to cells', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} mobileLayout="cards" />
    );
    expect(container.querySelector('.table-wrap--cards')).not.toBeNull();
    // Each cell with a string header should carry data-label
    const cells = container.querySelectorAll('tbody td');
    expect(cells[0].getAttribute('data-label')).toBe('Nombre');
    expect(cells[1].getAttribute('data-label')).toBe('SKU');
  });

  it('mobileLayout default is table — no cards class', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    expect(container.querySelector('.table-wrap--cards')).toBeNull();
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

  // ---- v1.10.0: density, interactive rows, alignment ------------------
  it('density defaults to compact (no comfortable class)', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    const table = container.querySelector('table')!;
    expect(table.classList.contains('table--comfortable')).toBe(false);
  });

  it('density="comfortable" opts back into the airy layout', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} density="comfortable" />
    );
    expect(container.querySelector('table.table--comfortable')).not.toBeNull();
  });

  it('non-interactive rows are unchanged (no link/button, no is-clickable)', () => {
    const { container } = render(
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />
    );
    expect(container.querySelector('.data-table__rowlink')).toBeNull();
    expect(container.querySelector('tr.is-clickable')).toBeNull();
  });

  it('rowHref makes each row a real, SR-named, keyboard-operable link', () => {
    render(
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        rowLabel={(r) => r.name}
        rowHref={(r) => `/productos/${r.id}`}
      />
    );
    // One real <a> per row, with an accessible name and a valid href —
    // not an onClick-only div, no role hack on <tr>.
    const a1 = screen.getByRole('link', { name: 'Ver Taladro' });
    const a2 = screen.getByRole('link', { name: 'Ver Sierra' });
    expect(a1).toHaveAttribute('href', '/productos/1');
    expect(a2).toHaveAttribute('href', '/productos/2');
    // The link is focusable (native <a href>), so the row is keyboard-
    // operable; Enter activates natively.
    a1.focus();
    expect(a1).toHaveFocus();
  });

  it('onRowClick renders a real <button> and activates by click', () => {
    const onRow = vi.fn();
    render(
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        rowLabel={(r) => r.name}
        onRowClick={onRow}
      />
    );
    const btn = screen.getByRole('button', { name: 'Ver Taladro' });
    fireEvent.click(btn);
    expect(onRow).toHaveBeenCalledWith(rows[0]);
  });

  it('renderRow is the escape hatch and suppresses the built-in control', () => {
    const { container } = render(
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        rowHref={(r) => `/x/${r.id}`}
        renderRow={({ cells, rowKey }) => (
          <tr key={rowKey} data-custom-row={rowKey}>{cells}</tr>
        )}
      />
    );
    expect(container.querySelector('tr[data-custom-row="1"]')).not.toBeNull();
    // Consumer owns interactivity → kit does not inject its own control.
    expect(container.querySelector('.data-table__rowlink')).toBeNull();
  });

  it('align is honored for React-node cells (table__align-right class)', () => {
    const cellCols = [
      { key: 'name', header: 'Nombre' },
      {
        key: 'act',
        header: 'Acciones',
        align: 'right' as const,
        accessor: () => <button type="button">Editar</button>,
      },
    ];
    const { container } = render(
      <DataTable columns={cellCols} rows={rows} rowKey={(r) => r.id} />
    );
    const actCell = container.querySelectorAll('tbody td')[1] as HTMLElement;
    expect(actCell.classList.contains('table__align-right')).toBe(true);
    expect(actCell.style.textAlign).toBe('right');
    // Left columns stay byte-identical (no extra alignment class).
    const nameCell = container.querySelectorAll('tbody td')[0] as HTMLElement;
    expect(nameCell.className).toBe('');
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

  it('wires trigger and panel with ARIA (controls / labelledby / region)', () => {
    render(
      <Accordion defaultOpen={['a']}>
        <AccordionItem id="a" title="Uno">contenido uno</AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole('button', { name: 'Uno' });
    const panel = screen.getByRole('region', { name: 'Uno' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
  });
});

describe('Breadcrumbs', () => {
  it('marks last item as current', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Productos' }]} />);
    expect(screen.getByText('Productos')).toHaveAttribute('aria-current', 'page');
  });
});

describe('TablePagination', () => {
  it('renders pagination range and prev/next', () => {
    render(<TablePagination page={2} pageSize={10} total={55} onPageChange={() => {}} />);
    expect(screen.getByText(/11–20 de 55/)).toBeInTheDocument();
    expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
    expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument();
  });

  it('omits page-size selector when onPageSizeChange is not provided', () => {
    const { container } = render(
      <TablePagination page={1} pageSize={10} total={55} onPageChange={() => {}} />
    );
    expect(container.querySelector('.table-pagination__size')).toBeNull();
  });

  it('renders page-size selector when onPageSizeChange is provided', () => {
    const onSize = vi.fn();
    render(
      <TablePagination
        page={1}
        pageSize={25}
        total={100}
        onPageChange={() => {}}
        onPageSizeChange={onSize}
      />
    );
    const sel = screen.getByLabelText(/Filas por página/) as HTMLSelectElement;
    expect(sel.value).toBe('25');
    expect(Array.from(sel.options).map((o) => o.value)).toEqual(['10', '25', '50', '100']);
    fireEvent.change(sel, { target: { value: '50' } });
    expect(onSize).toHaveBeenCalledWith(50);
  });

  it('respects custom pageSizeOptions', () => {
    render(
      <TablePagination
        page={1}
        pageSize={5}
        total={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        pageSizeOptions={[5, 15, 30]}
      />
    );
    const sel = screen.getByLabelText(/Filas por página/) as HTMLSelectElement;
    expect(Array.from(sel.options).map((o) => o.value)).toEqual(['5', '15', '30']);
  });
});
