import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown, FilterBar, FilterField, type ToolbarAction } from './Filters';
import { Button } from './Button';
import { Checkbox, Select, Input } from './Form';
import { Slider } from './InputsExtra';
import { Combobox, DatePicker } from './Pickers';
import { DataTable } from './DataTable';
import { PageHeader } from './AppShell';
import { Badge } from './Display';
import { Download, Edit, Trash, MoreVertical } from './Icons';
import { Menu } from './Display2';
import { IconButton } from './Button';
import { TablePagination } from './DataTable';

export default { title: 'Patterns/Filters', tags: ['autodocs'] } as Meta;

export const FilterPanelDemo: StoryObj = {
  render: () => {
    const [estados, setEstados] = React.useState<string[]>(['abierto', 'enproceso']);
    const [precio, setPrecio] = React.useState(50);
    const total = estados.length + (precio !== 50 ? 1 : 0);
    return (
      <FilterPanel activeCount={total} onClearAll={() => { setEstados([]); setPrecio(50); }}>
        <FilterSection title="Estado">
          {[
            { v: 'abierto', l: 'Abierto' },
            { v: 'enproceso', l: 'En proceso' },
            { v: 'despachado', l: 'Despachado' },
            { v: 'cancelado', l: 'Cancelado' },
          ].map((o) => (
            <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <Checkbox
                checked={estados.includes(o.v)}
                onChange={(e) => {
                  setEstados((curr) => e.target.checked ? [...curr, o.v] : curr.filter((x) => x !== o.v));
                }}
              />
              {o.l}
            </label>
          ))}
        </FilterSection>
        <FilterSection title="Monto máximo (k$)">
          <Slider value={precio} onChange={setPrecio} min={0} max={500} step={10} showValue />
        </FilterSection>
      </FilterPanel>
    );
  },
};

export const BulkActionBarDemo: StoryObj = {
  render: () => {
    const [count, setCount] = React.useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, padding: 16 }}>
        <Button variant="secondary" size="sm" onClick={() => setCount(count > 0 ? 0 : 3)}>
          {count > 0 ? 'Deseleccionar' : 'Seleccionar 3'}
        </Button>
        <div style={{ width: '100%' }}>
          <BulkActionBar selectedCount={count} onClear={() => setCount(0)}>
            <Button variant="outline" size="sm">Marcar como enviados</Button>
            <Button variant="ghost" size="sm">Imprimir</Button>
            <Button variant="danger" size="sm">Eliminar</Button>
          </BulkActionBar>
        </div>
      </div>
    );
  },
};

export const SortDropdownDemo: StoryObj = {
  render: () => {
    const [sort, setSort] = React.useState('recent');
    return (
      <SortDropdown
        value={sort}
        onChange={setSort}
        options={[
          { value: 'recent', label: 'Más recientes' },
          { value: 'oldest', label: 'Más antiguos' },
          { value: 'amount-desc', label: 'Mayor monto primero' },
          { value: 'amount-asc', label: 'Menor monto primero' },
          { value: 'urgent', label: 'Urgentes primero' },
        ]}
      />
    );
  },
};

// Hoisted out of render: an element created during a render carries a fiber
// `_owner`, and Storybook's JSX source decorator (Show code) walks nested
// plain objects/arrays recursively — a fiber inside is circular and blows the
// stack. Module-scope elements have no owner.
const EXPORT_ACTIONS: ToolbarAction[] = [{ label: 'Exportar', icon: <Download size={16} />, onSelect: () => {} }];
const ICON = { download: <Download size={16} />, edit: <Edit size={16} />, trash: <Trash size={16} />, editXs: <Edit size={14} />, trashXs: <Trash size={14} />, more: <MoreVertical size={18} /> };
const SORT_OPTIONS = [{ value: 'recent', label: 'Más recientes' }, { value: 'client', label: 'Cliente A–Z' }, { value: 'status', label: 'Estado' }];

interface ListPageArgs {
  fields: number;
  visibleCount: number;
  mobile: 'drawer' | 'inline';
  mobileLayout: 'cards' | 'table';
  summary: boolean;
  filtersApplied: boolean;
  exportAction: boolean;
  sort: boolean;
  rowActions: 'inline' | 'menu' | 'none';
  pagination: 'inside' | 'outside' | 'none';
}

/**
 * **Playground · página de listado.** La estructura estándar de un listado y
 * cómo se comportan sus piezas al juntarse: `PageHeader` → `DataTable` con
 * `toolbar={<FilterBar/>}` → filas. La barra lleva los campos, el conteo en
 * `summary` y en `actions` lo que opera sobre el resultado: "Limpiar" solo con
 * filtros aplicados; "Exportar" va en `overflow` — ambas terciarias (`ghost
 * sm`): la única primaria de la página vive en el `PageHeader`; en móvil
 * "Exportar" se esconde tras el menú "⋯" y "Filtros" es el embudo con el
 * conteo encima. Sin Card: la tabla es la
 * superficie. Sube `fields` a 7 para ver cómo envuelve la grilla y dónde queda
 * el conteo. Reglas completas en DESIGN.md › List-page recipe.
 */
export const PaginaDeListadoPlayground: StoryObj<ListPageArgs> = {
  name: 'Playground · página de listado',
  parameters: { layout: 'fullscreen' },
  args: { fields: 7, visibleCount: 0, mobile: 'drawer', mobileLayout: 'cards', summary: true, filtersApplied: false, exportAction: true, sort: true, rowActions: 'inline', pagination: 'inside' },
  argTypes: {
    fields: { control: { type: 'range', min: 2, max: 7, step: 1 } },
    visibleCount: { control: { type: 'range', min: 0, max: 7, step: 1 }, description: '0 = todos visibles; N = colapsa el resto tras "Más filtros"' },
    mobile: { control: 'inline-radio', options: ['drawer', 'inline'], description: 'Bajo 600px: Drawer con los campos (default) o inline. Angosta el canvas para verlo.' },
    mobileLayout: { control: 'inline-radio', options: ['cards', 'table'], description: 'Bajo 600px: tarjetas por fila (default, `Column.mobile` reparte título/estado/campos) o tabla con columnas prioritarias (`mobile: "hidden"`).' },
    summary: { control: 'boolean' },
    filtersApplied: { control: 'boolean' },
    exportAction: { control: 'boolean' },
    sort: { control: 'boolean', description: '`FilterBar sort`: SortDropdown en la barra, por default solo bajo 600px (sin thead en cards)' },
    rowActions: { control: 'inline-radio', options: ['inline', 'menu', 'none'], description: 'Hasta 2 acciones: lápiz y basurero inline · 3 o más: menú kebab' },
    pagination: { control: 'inline-radio', options: ['inside', 'outside', 'none'], description: 'inside = `DataTable footer` (misma superficie) · outside = TablePagination debajo' },
  },
  render: (a) => {
    // Local filter state so the fields are live; the `filtersApplied` control
    // seeds it (and "Limpiar" resets it), instead of freezing `defaultValue`s.
    const [q, setQ] = React.useState('');
    const [status, setStatus] = React.useState<string | null>('todos');
    React.useEffect(() => { setQ(a.filtersApplied ? '1042' : ''); setStatus(a.filtersApplied ? 'pendiente' : 'todos'); }, [a.filtersApplied]);
    // Combobox's clear affordance yields null: that is "no filter", same as 'todos'.
    const hasFilters = q !== '' || (status != null && status !== 'todos');
    const clear = () => { setQ(''); setStatus('todos'); };
    const [sortBy, setSortBy] = React.useState('recent');
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(25);
    // Full pagination (v3.7.0 recipe): rows-per-page selector + range + pager.
    const pager = <TablePagination page={page} pageSize={pageSize} total={256} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />;
    const rows = [
      { id: '1042', doc: '1042', client: 'Northwind Builders', branch: 'Casa matriz', date: '8 jul 2026', status: 'Pendiente' },
      { id: '1043', doc: '1043', client: 'Constructora Norte', branch: 'Sucursal Sur', date: '9 jul 2026', status: 'Preparado' },
      { id: '1044', doc: '1044', client: 'Cliente de mesón', branch: 'Casa matriz', date: '9 jul 2026', status: 'Entregado' },
    ];
    const opts = (vals: string[]) => vals.map((v) => ({ value: v.toLowerCase(), label: v }));
    const allFields = [
      <FilterField key="q" label="Buscar"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° o cliente" /></FilterField>,
      <FilterField key="status" label="Estado"><Combobox value={status} onChange={setStatus} searchable={false} options={opts(['Todos', 'Pendiente', 'Preparado', 'Entregado'])} /></FilterField>,
      <FilterField key="branch" label="Sucursal"><Combobox value={null} onChange={() => {}} placeholder="Todas" searchable={false} options={opts(['Casa matriz', 'Sucursal Sur'])} /></FilterField>,
      <FilterField key="seller" label="Vendedor"><Combobox value={null} onChange={() => {}} placeholder="Todos" options={opts(['Mesón 1', 'Mesón 2'])} /></FilterField>,
      <FilterField key="date" label="Fecha"><DatePicker value={null} onChange={() => {}} placeholder="Cualquiera" /></FilterField>,
      <FilterField key="pay" label="Pago"><Select defaultValue="all"><option value="all">Todos</option><option value="paid">Pagado</option><option value="due">Pendiente</option></Select></FilterField>,
      <FilterField key="channel" label="Canal"><Select defaultValue="all"><option value="all">Todos</option><option value="store">Tienda</option><option value="web">Web</option></Select></FilterField>,
    ];
    const actions = (hasFilters || a.exportAction) ? (
      <>
        {hasFilters && <Button variant="ghost" size="sm" onClick={clear}>Limpiar</Button>}

      </>
    ) : undefined;
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
              actions={actions}
              visibleCount={a.visibleCount > 0 ? a.visibleCount : undefined}
              hiddenActiveCount={a.visibleCount > 0 && a.visibleCount < 2 && hasFilters ? 1 : 0}
              mobile={a.mobile}
              activeCount={(q !== '' ? 1 : 0) + (status != null && status !== 'todos' ? 1 : 0)}
              // Exportar may leave the bar on a phone (it goes behind "⋯");
              // Limpiar stays in `actions` because it is contextual.
              overflow={a.exportAction ? EXPORT_ACTIONS : undefined}
              sort={a.sort ? { value: sortBy, options: SORT_OPTIONS, onChange: setSortBy } : undefined}
            >
              {allFields.slice(0, a.fields)}
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
  },
};

/**
 * **Listado completo.** La composición de referencia con valores fijos —
 * mismo render que el playground: `PageHeader` con la única primaria; una
 * sola superficie con `FilterBar` arriba (búsqueda, estado, sucursal, fecha;
 * Exportar en `overflow`, orden en móvil), filas en el medio con acciones
 * en kebab, y `TablePagination` abajo en `footer`; un divisor entre cada
 * zona. Para variar cualquier pieza, usa el playground.
 */
export const ListadoCompleto: StoryObj<ListPageArgs> = {
  ...PaginaDeListadoPlayground,
  name: 'Listado completo (composición)',
  args: { fields: 5, visibleCount: 0, mobile: 'drawer', mobileLayout: 'cards', summary: true, filtersApplied: false, exportAction: true, sort: true, rowActions: 'menu', pagination: 'inside' },
};
