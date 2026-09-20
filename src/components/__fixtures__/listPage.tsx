import * as React from 'react';
import { FilterBar, FilterField, type ToolbarAction } from '../Filters';
import { Button, IconButton } from '../Button';
import { Select, Input } from '../Form';
import { Combobox, DatePicker } from '../Pickers';
import { DataTable, TablePagination } from '../DataTable';
import { PageHeader } from '../AppShell';
import { Badge } from '../Display';
import { Download, Edit, Trash, MoreVertical } from '../Icons';
import { Menu } from '../Display2';

// Hoisted out of render: an element created during a render carries a fiber
// `_owner`, and Storybook's JSX source decorator (Show code) walks nested
// plain objects/arrays recursively — a fiber inside is circular and blows the
// stack. Module-scope elements have no owner.
const EXPORT_ACTIONS: ToolbarAction[] = [{ label: 'Exportar', icon: <Download size={16} />, onSelect: () => {} }];
const ICON = { download: <Download size={16} />, edit: <Edit size={16} />, trash: <Trash size={16} />, editXs: <Edit size={14} />, trashXs: <Trash size={14} />, more: <MoreVertical size={18} /> };
const SORT_OPTIONS = [{ value: 'recent', label: 'Más recientes' }, { value: 'client', label: 'Cliente A–Z' }, { value: 'status', label: 'Estado' }];

export interface ListPageArgs {
  fields: number;
  layout: 'inline' | 'collapse' | 'drawer';
  visibleCount: 'auto' | 1 | 2 | 3 | 4 | 5;
  barMobile: 'drawer' | 'inline' | 'collapse';
  mobileLayout: 'cards' | 'table';
  summary: boolean;
  filtersApplied: boolean;
  exportAction: boolean;
  sort: boolean;
  rowActions: 'inline' | 'menu' | 'none';
  pagination: 'inside' | 'outside' | 'none';
}

export function ListPagePlayground(a: ListPageArgs) {
  // Local filter state so the fields are live; the `filtersApplied` control
  // seeds it (and "Limpiar" resets it), instead of freezing `defaultValue`s.
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<string | null>('todos');
  React.useEffect(() => { setQ(a.filtersApplied ? '1042' : ''); setStatus(a.filtersApplied ? 'pendiente' : 'todos'); }, [a.filtersApplied]);
  const clear = () => { setQ(''); setStatus('todos'); };
  const applied = [
    ...(q !== '' ? [{ key: 'q', label: 'Buscar', value: q, onRemove: () => setQ('') }] : []),
    ...(status != null && status !== 'todos' ? [{ key: 'status', label: 'Estado', value: status[0].toUpperCase() + status.slice(1), onRemove: () => setStatus('todos') }] : []),
  ];
  const [sortBy, setSortBy] = React.useState('recent');
  const [page, setPage] = React.useState(1);
  // Fixed page size: range + pager, no rows-per-page selector (the list
  // page decides its size; the selector is for data-heavy reports).
  const pager = <TablePagination page={page} pageSize={25} total={256} onPageChange={setPage} />;
  const rows = [
    { id: '1042', doc: 'Pedido #1042', client: 'Northwind Builders', branch: 'Sucursal Centro', date: '8 jul 2026', status: 'Pendiente' },
    { id: '1043', doc: 'Pedido #1043', client: 'Satoru Gojo', branch: 'Sucursal Sur', date: '9 jul 2026', status: 'Preparado' },
    { id: '1044', doc: 'Pedido #1044', client: 'Northwind Builders', branch: 'Sucursal Centro', date: '9 jul 2026', status: 'Entregado' },
  ];
  const opts = (vals: string[]) => vals.map((v) => ({ value: v.toLowerCase(), label: v }));
  const allFields = [
    <FilterField key="q" label="Buscar"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° o cliente" /></FilterField>,
    <FilterField key="status" label="Estado"><Combobox value={status} onChange={setStatus} searchable={false} options={opts(['Todos', 'Pendiente', 'Preparado', 'Entregado'])} /></FilterField>,
    <FilterField key="branch" label="Sucursal"><Combobox value={null} onChange={() => {}} placeholder="Todas" searchable={false} options={opts(['Sucursal Centro', 'Sucursal Sur'])} /></FilterField>,
    <FilterField key="seller" label="Vendedor"><Combobox value={null} onChange={() => {}} placeholder="Todos" options={opts(['Mesón 1', 'Mesón 2'])} /></FilterField>,
    <FilterField key="date" label="Fecha"><DatePicker value={null} onChange={() => {}} placeholder="Cualquiera" /></FilterField>,
    <FilterField key="pay" label="Pago"><Select defaultValue="all"><option value="all">Todos</option><option value="paid">Pagado</option><option value="due">Pendiente</option></Select></FilterField>,
    <FilterField key="channel" label="Canal"><Select defaultValue="all"><option value="all">Todos</option><option value="store">Tienda</option><option value="web">Web</option></Select></FilterField>,
  ];
  // minmax(0, 1fr): an implicit grid track is `auto` and would grow to the
  // table's max-content, pushing the page into horizontal scroll on a phone.
  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, alignContent: 'start' }}>
      <PageHeader title="Pedidos" description="Ventas y entregas de la sucursal." actions={<Button>Nuevo pedido</Button>} />
      <DataTable
        ariaLabel="Pedidos"
        toolbar={
          <FilterBar
            summary={a.summary ? `${rows.length} pedidos` : undefined}
            onClearAll={clear}
            layout={a.layout}
            visibleCount={a.visibleCount}
            mobileLayout={a.barMobile}
            // The applied values as chips: removable, and the source of the
            // badges on the funnel / "Más filtros" (never a hand-kept count).
            applied={applied}
            // Drawer: the search box stays in the bar, the rest go behind the funnel.
            pinned={a.layout === 'drawer' || a.barMobile === 'drawer' ? allFields[0] : undefined}
            // Exportar may leave the bar on a phone (it goes behind "⋯");
            // Limpiar stays in `actions` because it is contextual.
            overflow={a.exportAction ? EXPORT_ACTIONS : undefined}
            sort={a.sort ? { value: sortBy, options: SORT_OPTIONS, onChange: setSortBy } : undefined}
          >
            {a.layout === 'drawer' ? allFields.slice(1, a.fields) : allFields.slice(0, a.fields)}
          </FilterBar>
        }
        footer={a.pagination === 'inside' ? pager : undefined}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={a.rowActions === 'menu' ? () => {} : undefined}
        rowLabel={(r) => r.client}
        // Phone: cards by default — client as the title, state as the
        // badge, the rest as label/value lines. `mobileLayout="table"` keeps
        // the table and drops the secondary columns (`mobile: 'hidden'`).
        mobileLayout={a.mobileLayout}
        columns={[
          { key: 'doc', header: 'N° pedido', width: 88 },
          { key: 'client', header: 'Cliente', truncate: true, mobile: 'title' },
          { key: 'branch', header: 'Sucursal', mobile: a.mobileLayout === 'table' ? 'hidden' : 'field' },
          { key: 'date', header: 'Fecha', mobile: a.mobileLayout === 'table' ? 'hidden' : 'field' },
          { key: 'status', header: 'Estado', mobile: 'status', accessor: (r) => <Badge variant={r.status === 'Entregado' ? 'success' : r.status === 'Preparado' ? 'info' : 'warning'}>{r.status}</Badge> },
          // Row actions: up to two go inline (pencil + bin, icon-only on a
          // desk, labelled in the card footer); three or more go behind a
          // kebab Menu — on a phone the row itself opens the detail.
          ...(a.rowActions === 'inline' ? [{ key: 'actions', header: '', align: 'right' as const, width: 72, mobile: 'actions' as const, accessor: () => (
            <span style={{ display: 'inline-flex', gap: 4 }} data-row-interactive>
              <Button size="xs" variant="ghost" iconLeft={ICON.editXs} hideLabel="desktop">Editar</Button>
              <Button size="xs" variant="ghost-danger" iconLeft={ICON.trashXs} hideLabel="desktop">Eliminar</Button>
            </span>
          ) }] : a.rowActions === 'menu' ? [{ key: 'actions', header: '', align: 'right' as const, width: 48, mobile: 'hidden' as const, accessor: () => (
            <span data-row-interactive>
              <Menu align="end" trigger={<IconButton variant="ghost" size="sm" icon={ICON.more} aria-label="Más acciones" />} items={[
                { label: 'Descargar', icon: ICON.download },
                { label: 'Editar', icon: ICON.edit },
                { label: 'Eliminar', icon: ICON.trash, destructive: true },
              ]} />
            </span>
          ) }] : []),
        ]}
      />
      {a.pagination === 'outside' && pager}
    </div>
  );
}

export function FullListPage() {
  return (
    <ListPagePlayground
      fields={5}
      layout="inline"
      visibleCount="auto"
      barMobile="drawer"
      mobileLayout="cards"
      summary
      filtersApplied={false}
      exportAction
      sort
      rowActions="menu"
      pagination="inside"
    />
  );
}
