import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import * as React from 'react';
import { DataTable, TableToolbar, TablePagination, ColumnToggle, type Column, type DataTableProps } from './DataTable';
import type { ToolbarAction } from './ToolbarActions';
import { Badge, Card, CardBody } from './Display';
import { Input } from './Form';
import { Button } from './Button';
import { Modal } from './Overlay';
import { Filter, Download, Edit, Trash } from './Icons';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { formatCurrency } from '../utils/format';

interface OrderRow {
  id: string;
  order: string;
  customer: string;
  branch: string;
  total: number;
}

const ROWS: OrderRow[] = [
  { id: '1', order: 'Pedido #1042', customer: 'Satoru Gojo', branch: 'Sucursal Centro', total: 89990 },
  { id: '2', order: 'Pedido #1043', customer: 'Satoru Gojo', branch: 'Sucursal Norte', total: 159990 },
  { id: '3', order: 'Pedido #1044', customer: 'Satoru Gojo', branch: 'Sucursal Centro', total: 49990 },
];

const COLUMNS: Column<OrderRow>[] = [
  { key: 'order', header: 'Pedido' },
  { key: 'customer', header: 'Cliente' },
  { key: 'branch', header: 'Sucursal' },
  { key: 'total', header: 'Total', numeric: true, accessor: (r) => formatCurrency(r.total) },
];

// `DataTable<T>` is generic: `ComponentProps<typeof DataTable>` / `satisfies
// Meta<typeof DataTable>` collapses `T` to `unknown` (same failure as
// `Combobox<T>`, `RadioGroup<T>` in Tasks 9/10) — every prop typed off `T`
// (`rows`, `columns`, `rowKey`, `rowLabel`, `rowHref`, accessors…) then
// rejects the concrete `OrderRow` fixture. Loose `Meta` + `StoryObj` typed
// directly off `DataTableProps<OrderRow>` sidesteps the collapse.
const meta: Meta = {
  title: 'Components/DataTable',
  component: DataTable,
  subcomponents: { TablePagination, TableToolbar, ColumnToggle },
  tags: ['autodocs'],
  args: { rows: ROWS, columns: COLUMNS, rowKey: (r: OrderRow) => r.id, density: 'compact' },
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    mobileLayout: { control: 'inline-radio', options: ['cards', 'table'] },
  },
};
export default meta;
type Story = StoryObj<DataTableProps<OrderRow>>;

export const Default: Story = {};

/**
 * **Per-column truncation** (`Column.truncate`). Under `table-layout:auto` a
 * long value — worse yet a string with NO spaces — stretches the column and
 * blows out the table's width. `truncate: true` clips to one line with "…";
 * `truncate: n` clamps to `n` lines. The cap is HARD (a `max-width` on an
 * inner wrapper, taken from the column's `width` or a 240px default) and
 * breaks spaceless tokens. In string cells the full value goes into the
 * `title` (hover). Doesn't apply in `mobileLayout="cards"` (cards already
 * wrap).
 */
export const TruncatePerColumn: Story = {
  render: () => {
    const wide = [
      { id: '1', name: 'Taladro percutor inalámbrico 20V con maletín', address: 'Av. Libertador Bernardo O’Higgins 1234, Depto 567, Santiago Centro, Región Metropolitana', notes: 'Cliente pidió despacho en la mañana; dejar en conserjería si no hay nadie; timbre no funciona.' },
      { id: '2', name: 'Sierra circular', address: 'askjdalksdjalksdjaslkdjaslkdjaslkdjaslkdjaslkdjaslkdjaslkdjaslkdj', notes: 'Sin observaciones.' },
      { id: '3', name: 'Lijadora orbital 300W', address: 'Calle Uno 42', notes: 'Retiro en tienda.' },
    ];
    return (
      <div style={{ maxWidth: 640 }}>
        <DataTable
          rows={wide}
          rowKey={(r) => r.id}
          columns={[
            { key: 'name', header: 'Producto', width: 160, truncate: true },
            { key: 'address', header: 'Dirección', width: 220, truncate: true },
            { key: 'notes', header: 'Notas', width: 200, truncate: 2 },
          ]}
        />
      </div>
    );
  },
};

/**
 * **Virtualization** (v1.51.0): `virtualizeRows` windows 5,000 rows down to
 * ~30 DOM nodes with pixel-exact spacers. Requires `maxHeight` and uniform
 * row heights — auto-disables with `renderExpanded`. On mobile it stays a
 * table (cards aren't virtualized; 5,000 cards isn't an option): SKU is
 * hidden with `mobile: 'hidden'`. Selection operates over the full dataset
 * (only the DOM is windowed). The sticky header + totals footer coexist with
 * the windowing.
 */
export const Virtualized: Story = {
  render: () => {
    const big = React.useMemo(() => Array.from({ length: 5000 }, (_, i) => ({
      id: String(i),
      name: `Producto ${i}`,
      sku: `SKU-${10000 + i}`,
      price: 990 + (i % 90) * 1000,
    })), []);
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    const total = React.useMemo(() => big.reduce((s, r) => s + r.price, 0), [big]);
    return (
      <DataTable
        rows={big}
        rowKey={(r) => r.id}
        stickyHeader
        maxHeight={400}
        virtualizeRows={{ rowHeight: 31 }}
        selectable
        selectedKeys={sel}
        onSelectionChange={setSel}
        columns={[
          { key: 'name', header: 'Producto', footer: 'Total (5.000)' },
          { key: 'sku', header: 'SKU', mobile: 'hidden' },
          { key: 'price', header: 'Precio', numeric: true,
            accessor: (r) => formatCurrency(r.price),
            footer: formatCurrency(total) },
        ]}
      />
    );
  },
};

/**
 * **Column visibility** (v1.49.0): `hiddenColumnKeys` filters columns without
 * mutating the canonical array — header, cells, footer and colSpans all
 * follow. `<ColumnToggle>` in the toolbar is the ready-made menu: a popover
 * with checkboxes that stays open across toggles; the last visible column is
 * disabled (zero columns is an unreachable broken state).
 */
export const ColumnVisibility: Story = {
  render: (a) => {
    const [hidden, setHidden] = React.useState<Set<string>>(new Set(['branch']));
    const cols: Column<OrderRow>[] = [
      { key: 'order', header: 'Pedido' },
      { key: 'customer', header: 'Cliente' },
      { key: 'branch', header: 'Sucursal' },
      { key: 'total', header: 'Total', numeric: true, accessor: (r) => formatCurrency(r.total) },
    ];
    return (
      <DataTable
        {...a}
        hiddenColumnKeys={hidden}
        columns={cols}
        toolbar={
          <TableToolbar>
            <span className="grow" />
            <ColumnToggle columns={cols} hiddenKeys={hidden} onChange={setHidden} />
          </TableToolbar>
        }
      />
    );
  },
};

/**
 * Toolbar / filter zone + DataTable on ONE rounded surface. Passed via the
 * `toolbar` prop: the DataTable OWNS the surface (border+radius+overflow),
 * the toolbar is clipped to the radius, there is ONE divider with the
 * header, and the corner stays clean — no stacked card-border + filter +
 * header-top, no seam. This IS the way to combine a toolbar with a
 * DataTable; don't hand-wrap them in your own bordered container (that
 * reintroduces the seam).
 */
// Hoisted: an element created inside render carries a fiber `_owner`, and
// Storybook's JSX source decorator recurses into nested arrays/objects — a
// fiber there is circular (stack overflow). Module scope has no owner.
const EXPORT_ACTIONS: ToolbarAction[] = [{ label: 'Exportar', icon: <Download size={16} />, onSelect: () => {} }];

export const WithToolbar: Story = {
  render: (a) => {
    const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
    return (
      <DataTable
        {...a}
        sort={sort}
        onSortChange={setSort}
        toolbar={
          <TableToolbar overflow={EXPORT_ACTIONS}>
            <div className="grow"><Input placeholder="Buscar pedido…" /></div>
            <Button variant="ghost" size="sm" iconLeft={<Filter size={16} />} hideLabel="mobile">Filtros</Button>
          </TableToolbar>
        }
        columns={[
          { key: 'order', header: 'Pedido', sortable: true },
          { key: 'customer', header: 'Cliente' },
          { key: 'branch', header: 'Sucursal' },
          { key: 'total', header: 'Total', sortable: true, align: 'right', accessor: (r) => formatCurrency(r.total) },
        ]}
      />
    );
  },
};

/** Sticky header: the thead stays visible while the body scrolls. The wrap
 * itself is the scroll container (don't wrap it in your own
 * `overflow-y:auto`). Default `max-height:70vh`; overridden here with a
 * `className`. */
const stickyCols = [
  { key: 'name', header: 'Producto' },
  { key: 'sku', header: 'SKU' },
  { key: 'stock', header: 'Stock', align: 'right' as const },
  { key: 'price', header: 'Precio', align: 'right' as const, accessor: (r: { price: number }) => formatCurrency(r.price) },
];
const stickyRows = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `Producto ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(3, '0')}`,
  stock: (i * 7) % 100,
  price: 10000 + i * 4500,
}));

/**
 * **`stickyHeader` + `maxHeight`** (v1.41.0): a bounded scroll region. The wrap
 * caps at `maxHeight` and scrolls its body; the header pins to the box. Use
 * this for a standalone table with an internal scroll area. (Before 1.41.0
 * `stickyHeader` implied `max-height: 70vh` — that cap is now the explicit
 * `maxHeight` prop.)
 *
 * v1.42.0: scroll the body — the header sits flush at rest and lifts off with
 * a soft shadow once content scrolls beneath it (the "command bar" elevation).
 */
export const StickyHeader: Story = {
  render: () => (
    <DataTable stickyHeader maxHeight={300} rows={stickyRows} rowKey={(r) => r.id} ariaLabel="Inventario" columns={stickyCols} />
  ),
};

/**
 * **`stickyHeader` inside a Modal** (v1.41.0): without `maxHeight`, the wrap
 * doesn't create its own scroll — the header pins to the `Modal` body's
 * scroll instead. A single scroll, no nested scrollbars or edge artifacts.
 * Open the modal and scroll.
 */
export const StickyHeaderInModal: Story = {
  name: 'Sticky header in Modal (single scroll)',
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir inventario</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Inventario">
          <DataTable stickyHeader rows={stickyRows} rowKey={(r) => r.id} ariaLabel="Inventario" columns={stickyCols} />
        </Modal>
      </>
    );
  },
};

/** P5h — `align:'right'` action column with a React node (a button flex row):
 * now genuinely right-aligned (it used to float left). */
export const AlignedActionColumn: Story = {
  render: (a) => (
    <DataTable
      {...a}
      ariaLabel="Pedidos"
      columns={[
        { key: 'order', header: 'Pedido' },
        { key: 'customer', header: 'Cliente' },
        {
          key: 'acc', header: 'Acciones', align: 'right', mobile: 'actions',
          accessor: () => (
            <span style={{ display: 'inline-flex', gap: 8 }} data-row-interactive>
              <Button size="xs" variant="ghost" iconLeft={<Edit size={14} />} hideLabel="desktop">Editar</Button>
              <Button size="xs" variant="ghost-danger" iconLeft={<Trash size={14} />} hideLabel="desktop">Borrar</Button>
            </span>
          ),
        },
      ]}
    />
  ),
};

/** Card layout on mobile (default): below 600px each row becomes a card with
 * three zones per `Column.mobile` — header (title with caption + status +
 * checkbox), body (label · value) and footer (full-width actions). Same DOM
 * as the table. Use Storybook's mobile viewport to see it. */
export const CardLayoutMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (a) => {
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    return (
      <div style={{ background: 'var(--bg-canvas)', padding: 16 }}>
        <DataTable
          {...a}
          ariaLabel="Pedidos"
          selectable
          selectedKeys={sel}
          onSelectionChange={setSel}
          onRowClick={() => {}}
          columns={[
            { key: 'order', header: 'Pedido', mobile: 'title' },
            { key: 'customer', header: 'Cliente' },
            { key: 'branch', header: 'Sucursal', mobile: 'status', accessor: (r) => <Badge variant="info">{r.branch}</Badge> },
            { key: 'total', header: 'Total', align: 'right', accessor: (r) => formatCurrency(r.total) },
            { key: 'actions', header: '', align: 'right', mobile: 'actions', accessor: () => <Button variant="outline" size="sm" data-row-interactive>Ver detalle</Button> },
          ]}
        />
      </div>
    );
  },
};

/** TablePagination with a page-size selector and a row range. */
export const FullPagination: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    return (
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={87}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    );
  },
};

/** TablePagination without a page-size selector — for fixed-size tables. */
export const SimplePagination: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return (
      <TablePagination
        page={page}
        pageSize={20}
        total={155}
        onPageChange={setPage}
      />
    );
  },
};

/** DataTable + TablePagination together, the typical usage pattern. */
export const WithPagination: Story = {
  render: () => {
    const allRows = Array.from({ length: 87 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${String(i + 1).padStart(3, '0')}`,
      stock: Math.floor(Math.random() * 100),
    }));
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const start = (page - 1) * pageSize;
    const visible = allRows.slice(start, start + pageSize);
    return (
      <div>
        <DataTable
          rows={visible}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          columns={[
            { key: 'name', header: 'Producto' },
            { key: 'sku', header: 'SKU' },
            { key: 'stock', header: 'Stock', align: 'right' },
          ]}
        />
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={allRows.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>
    );
  },
};

function SortableTable(args: DataTableProps<OrderRow>) {
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  return <DataTable {...args} sort={sort} onSortChange={setSort} />;
}

/**
 * Sorting is uncontrolled inside the table (from v1's `sort`/`onSortChange`
 * contract, see `DataTableProps`): the header button cycles `aria-sort`
 * `none → ascending → descending → none` and the consumer re-orders `rows`
 * in response. Verified live against the real markup — the sortable header
 * cell (`role="columnheader"`) wraps a `<button>` that carries the click
 * handler; `aria-sort` lives on the `<th>` itself.
 */
export const SortToggle: Story = {
  args: { columns: COLUMNS.map((c) => (c.key === 'total' ? { ...c, sortable: true } : c)) },
  render: (a) => <SortableTable {...a} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: /Total/ });
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  },
};

interface DataTablePlaygroundArgs {
  state: 'rows' | 'empty' | 'emptyCustom' | 'loading' | 'error';
  density: 'compact' | 'comfortable';
  surface: 'standalone' | 'card' | 'elevated';
  selectable: boolean;
  interactive: boolean;
  expandable: boolean;
  totals: boolean;
  stickyHeader: boolean;
  bounded: boolean;
  mobileLayout: 'cards' | 'table';
}

/**
 * **Playground · DataTable.** The table's props combined in one place
 * (previously, one story per value).
 *
 * - **`state`**: `rows={[]}` shows the default empty state or the `empty`
 *   slot (an overlay sibling of the table, anchored and centered in the
 *   visible area, with the header still scrollable to communicate the
 *   shape); `loading` paints a 5-row skeleton; `error` takes precedence over
 *   everything and renders in `role="alert"`.
 * - **`density`**: `compact` is the readable default (v1.10.0); `comfortable`
 *   is the previous register, taller per row.
 * - **`surface`**: a standalone table is FLAT by default and owns its own
 *   border/radius; on a tinted canvas raise `--table-elevation` on an
 *   ancestor (here `var(--shadow-card)`) and the kit applies it to the wrap
 *   and the surface — the same shadow as `<Card>`. Inside a Card pass
 *   `surface="flush"`: without it you get a doubled border and nested
 *   radius.
 * - **`selectable`**: "select all" operates on the rows currently present
 *   (a server page = the page, not the whole dataset).
 * - **`interactive`**: navigable row via `rowHref` — a real `<a>` stretched
 *   over the row, keyboard-operable, with a screen-reader name (`rowLabel`)
 *   and a visible focus ring on the row.
 * - **`expandable`**: `renderExpanded` adds the chevron column; the panel is
 *   an extra full-width `<tr>`, controlled like selection (`expandedKeys` /
 *   `onExpandedChange`).
 * - **`totals`**: `Column.footer` renders a `<tfoot>` styled like the header
 *   band but in the data register; with `bounded` it stays pinned to the
 *   bottom of the scroll box, mirroring the sticky header. The kit does NOT
 *   sum for you (the page total ≠ the dataset total).
 * - **`stickyHeader` / `bounded`**: the header pins to the nearest scroller —
 *   the internal one with `maxHeight`, or an external one (Modal, page)
 *   without it.
 * - **`mobileLayout`**: cards (default) or table below 600px; narrows the
 *   canvas.
 */
export const Playground: StoryObj<DataTablePlaygroundArgs> = {
  name: 'Playground · DataTable',
  args: { state: 'rows', density: 'compact', surface: 'standalone', selectable: false, interactive: false, expandable: false, totals: false, stickyHeader: false, bounded: false, mobileLayout: 'cards' },
  argTypes: {
    state: { control: 'inline-radio', options: ['rows', 'empty', 'emptyCustom', 'loading', 'error'] },
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    surface: { control: 'inline-radio', options: ['standalone', 'card', 'elevated'], description: 'standalone = flat con borde propio · card = dentro de <Card> con surface="flush" · elevated = --table-elevation sobre canvas tintado' },
    selectable: { control: 'boolean' },
    interactive: { control: 'boolean', description: 'rowHref: la fila es un link real' },
    expandable: { control: 'boolean' },
    totals: { control: 'boolean', description: 'Column.footer (sticky bottom con bounded)' },
    stickyHeader: { control: 'boolean' },
    bounded: { control: 'boolean', description: 'maxHeight 320: scroll interno' },
    mobileLayout: { control: 'inline-radio', options: ['cards', 'table'] },
  },
  render: (a) => {
    type Row = { id: string; name: string; sku: string; stock: number; price: number };
    const many = React.useMemo<Row[]>(() => Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${100 + i}`,
      stock: (i * 7) % 30,
      price: 9990 + i * 5000,
    })), []);
    const data = a.state === 'rows' ? many : [];
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['1']));
    const totalStock = many.reduce((s, r) => s + r.stock, 0);
    const totalPrice = many.reduce((s, r) => s + r.price, 0);
    const columns: Column<Row>[] = [
      { key: 'name', header: 'Producto', mobile: 'title', footer: a.totals ? 'Total (20 productos)' : undefined },
      { key: 'sku', header: 'SKU' },
      { key: 'stock', header: 'Stock', numeric: true, footer: a.totals ? totalStock : undefined },
      { key: 'price', header: 'Precio', numeric: true, accessor: (r) => formatCurrency(r.price), footer: a.totals ? formatCurrency(totalPrice) : undefined },
    ];
    const table = (
      <DataTable
        rows={data}
        rowKey={(r) => r.id}
        rowLabel={(r) => r.name}
        ariaLabel="Productos"
        columns={columns}
        density={a.density}
        surface={a.surface === 'card' ? 'flush' : 'card'}
        selectable={a.selectable}
        selectedKeys={sel}
        onSelectionChange={setSel}
        rowHref={a.interactive ? (r) => `#/productos/${r.id}` : undefined}
        renderExpanded={a.expandable ? (r) => (
          <div style={{ display: 'grid', gap: 4, fontSize: 'var(--text-sm)' }}>
            <strong>{r.name}</strong>
            <span>SKU {r.sku} · {r.stock} unidades en bodega central</span>
            <span>Último movimiento: hace 3 días</span>
          </div>
        ) : undefined}
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        stickyHeader={a.stickyHeader}
        maxHeight={a.bounded ? 320 : undefined}
        mobileLayout={a.mobileLayout}
        loading={a.state === 'loading'}
        error={a.state === 'error' ? 'No pudimos cargar los productos. Reintenta en unos segundos.' : undefined}
        empty={a.state === 'emptyCustom' ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Sin productos en este filtro</strong>
            <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
              Ajusta los filtros o limpia la búsqueda para ver más resultados.
            </span>
          </div>
        ) : undefined}
      />
    );
    if (a.surface === 'card') return <Card><CardBody>{table}</CardBody></Card>;
    if (a.surface === 'elevated') {
      return (
        <div style={{ background: 'var(--bg-canvas, #eef1f5)', padding: 32, ['--table-elevation' as string]: 'var(--shadow-card)' }}>
          {table}
        </div>
      );
    }
    return table;
  },
};

/* Generic wide dataset (16 fixed-width columns): the sum exceeds any
   container, to exercise horizontal scroll + edge cues. */
const WIDE_HEADERS = [
  'Producto', 'SKU', 'Categoría', 'Bodega', 'Lote', 'Proveedor', 'Unidad', 'Stock',
  'Reservado', 'Disponible', 'Costo', 'Precio', 'Margen', 'Actualizado', 'Responsable', 'Observación',
];
const makeWideCols = (n: number) => WIDE_HEADERS.slice(0, n).map((header, i) => ({ key: `c${i}`, header, width: i === 0 ? 220 : 120 }));
const makeWideRows = (n: number, cols: number) => Array.from({ length: n }, (_, r) => Object.fromEntries([
  ['id', String(r)],
  ...WIDE_HEADERS.slice(0, cols).map((h, i) => [`c${i}`, i === 0 ? `Producto ${r + 1}` : `${h} ${r + 1}`]),
])) as Array<Record<string, string>>;

interface ScrollRegionArgs {
  mode: 'fillHeight' | 'maxHeight';
  columns: number;
  rows: number;
  containerHeight: number;
  toolbar: boolean;
  pagination: boolean;
  virtualize: boolean;
}

/**
 * **Playground · scroll region.** How `fillHeight` / `maxHeight` behave when
 * combined with a toolbar, pagination, virtualization, and a table wider
 * than its container. `fillHeight` (v3.2.0) fills the container's height (a
 * flex column with a definite height) with no number; `maxHeight` sets a
 * fixed cap. In both, the sticky header pins to the internal scroller and
 * the **edge cues** (`has-more-{left,right,down}`) mark which direction has
 * more content — invisible in bounded mode before 3.2.0. Raise `columns` to
 * 16 for horizontal scroll; `rows` to 400 + `virtualize` for windowing;
 * `rows` to 0 for the empty state of a table wider than the viewport: the
 * message stays anchored and centered in the visible area (an overlay
 * sibling of the table, outside the horizontal scroll track) while the
 * header stays scrollable to communicate the table's shape.
 */
export const ScrollRegionPlayground: StoryObj<ScrollRegionArgs> = {
  name: 'Playground · scroll region',
  args: { mode: 'fillHeight', columns: 16, rows: 60, containerHeight: 520, toolbar: false, pagination: true, virtualize: false },
  argTypes: {
    mode: { control: 'inline-radio', options: ['fillHeight', 'maxHeight'] },
    columns: { control: { type: 'range', min: 3, max: 16, step: 1 } },
    rows: { control: 'inline-radio', options: [0, 12, 60, 400] },
    containerHeight: { control: 'inline-radio', options: [360, 520, 720] },
    toolbar: { control: 'boolean' },
    pagination: { control: 'boolean' },
    virtualize: { control: 'boolean' },
  },
  render: (a) => {
    const cols = React.useMemo(() => makeWideCols(a.columns), [a.columns]);
    const data = React.useMemo(() => makeWideRows(a.rows, a.columns), [a.rows, a.columns]);
    const [page, setPage] = React.useState(1);
    const isMobile = useMediaQuery('(max-width: 600px)');
    return (
      // The fixed-height container stands in for a page's `100dvh` column; on a
      // phone the table is cards and flows with the page, so the box goes.
      <div style={{ height: isMobile ? 'auto' : a.containerHeight, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong>Inventario</strong>
          <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>Contenedor de {a.containerHeight}px · {a.mode}</span>
        </div>
        <DataTable
          rows={data}
          rowKey={(r) => r.id}
          columns={cols}
          fillHeight={a.mode === 'fillHeight'}
          maxHeight={a.mode === 'maxHeight' ? 360 : undefined}
          stickyHeader
          density="compact"
          virtualizeRows={a.virtualize ? { rowHeight: 31 } : undefined}
          toolbar={a.toolbar ? <TableToolbar><Input placeholder="Buscar producto" /></TableToolbar> : undefined}
          ariaLabel="Inventario"
          empty={
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Sin movimientos en el período</strong>
              <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
                No hay registros entre las fechas elegidas. Prueba con otro rango.
              </span>
            </div>
          }
        />
        {a.pagination && a.rows > 0 && <TablePagination page={page} pageSize={a.rows} total={a.rows * 3} onPageChange={setPage} />}
      </div>
    );
  },
};
