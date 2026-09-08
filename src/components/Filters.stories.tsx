import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown, FilterBar, FilterField } from './Filters';
import { Button } from './Button';
import { Checkbox, Select, Input } from './Form';
import { Slider } from './InputsExtra';
import { Combobox, DatePicker } from './Pickers';
import { DataTable } from './DataTable';
import { PageHeader } from './AppShell';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
            <Button variant="outline" size="sm">Marcar como despachados</Button>
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

/**
 * FilterBar: la barra horizontal densa SOBRE una tabla (contraparte del
 * FilterPanel vertical). Mezcla Select / Input / Combobox y todos quedan a
 * la misma altura (36px vía `.fields--dense`), grilla pareja y responsiva,
 * label en registro quieto. Reemplaza el flex-cluster hecho a mano.
 */
export const FilterBarDemo: StoryObj = {
  render: () => {
    const [estado, setEstado] = React.useState('all');
    const [orden, setOrden] = React.useState('');
    const [camion, setCamion] = React.useState<string | null>('all');
    const [chofer, setChofer] = React.useState<string | null>('all');
    return (
      <div style={{ maxWidth: 1040 }}>
        <FilterBar actions={<Button variant="outline" size="sm">Limpiar</Button>}>
          <FilterField label="Estado">
            <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="issued">Emitido</option>
              <option value="delivered">Entregado</option>
            </Select>
          </FilterField>
          <FilterField label="N° orden">
            <Input value={orden} onChange={(e) => setOrden(e.target.value)} placeholder="Ej. 0010453" />
          </FilterField>
          <FilterField label="Cliente">
            <Input placeholder="Buscar…" />
          </FilterField>
          <FilterField label="Camión">
            <Combobox
              value={camion}
              onChange={setCamion}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'GHJ-12', label: 'GHJ-12' },
                { value: 'KLM-90', label: 'KLM-90' },
              ]}
            />
          </FilterField>
          <FilterField label="Chofer">
            <Combobox
              value={chofer}
              onChange={setChofer}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'r-pizarro', label: 'Rodrigo Pizarro' },
                { value: 'h-salas', label: 'Hernán Salas' },
              ]}
            />
          </FilterField>
        </FilterBar>
      </div>
    );
  },
};

interface ListPageArgs {
  fields: number;
  visibleCount: number;
  mobile: 'drawer' | 'inline';
  summary: boolean;
  filtersApplied: boolean;
  exportAction: boolean;
}

/**
 * **Playground · página de listado.** La estructura estándar de un listado y
 * cómo se comportan sus piezas al juntarse: `PageHeader` → `DataTable` con
 * `toolbar={<FilterBar/>}` → filas. La barra lleva los campos, el conteo en
 * `summary` y en `actions` lo que opera sobre el resultado: "Limpiar" solo con
 * filtros aplicados, "Exportar" si existe. Sin Card: la tabla es la
 * superficie. Sube `fields` a 7 para ver cómo envuelve la grilla y dónde queda
 * el conteo. Reglas completas en DESIGN.md › List-page recipe.
 */
export const PaginaDeListadoPlayground: StoryObj<ListPageArgs> = {
  name: 'Playground · página de listado',
  parameters: { layout: 'fullscreen' },
  args: { fields: 7, visibleCount: 0, mobile: 'drawer', summary: true, filtersApplied: false, exportAction: true },
  argTypes: {
    fields: { control: { type: 'range', min: 2, max: 7, step: 1 } },
    visibleCount: { control: { type: 'range', min: 0, max: 7, step: 1 }, description: '0 = todos visibles; N = colapsa el resto tras "Más filtros"' },
    mobile: { control: 'inline-radio', options: ['drawer', 'inline'], description: 'Bajo 600px: Drawer con los campos (default) o inline. Angosta el canvas para verlo.' },
    summary: { control: 'boolean' },
    filtersApplied: { control: 'boolean' },
    exportAction: { control: 'boolean' },
  },
  render: (a) => {
    // On a phone the truncated Cliente column caps at 110px (`--table-cell-max`,
    // read by `truncate`) so id · name · state fit 320px without sideways scroll.
    const isMobile = useMediaQuery('(max-width: 600px)');
    // Local filter state so the fields are live; the `filtersApplied` control
    // seeds it (and "Limpiar" resets it), instead of freezing `defaultValue`s.
    const [q, setQ] = React.useState('');
    const [status, setStatus] = React.useState<string | null>('todos');
    React.useEffect(() => { setQ(a.filtersApplied ? '1042' : ''); setStatus(a.filtersApplied ? 'pendiente' : 'todos'); }, [a.filtersApplied]);
    // Combobox's clear affordance yields null: that is "no filter", same as 'todos'.
    const hasFilters = q !== '' || (status != null && status !== 'todos');
    const clear = () => { setQ(''); setStatus('todos'); };
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
        {a.exportAction && <Button variant="outline" size="sm">Exportar</Button>}
      </>
    ) : undefined;
    // minmax(0, 1fr): an implicit grid track is `auto` and would grow to the
    // table's max-content, pushing the page into horizontal scroll on a phone.
    return (
      <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, alignContent: 'start', ...(isMobile ? { ['--table-cell-max' as string]: '110px' } : {}) }}>
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
            >
              {allFields.slice(0, a.fields)}
            </FilterBar>
          }
          rows={rows}
          rowKey={(r) => r.id}
          // Priority columns: on a phone the table keeps id · name · state;
          // the secondary ones (`hideOnMobile`) live in the row's detail.
          columns={[
            { key: 'doc', header: 'N° pedido', width: 88 },
            { key: 'client', header: 'Cliente', truncate: true },
            { key: 'branch', header: 'Sucursal', hideOnMobile: true },
            { key: 'date', header: 'Fecha', hideOnMobile: true },
            { key: 'status', header: 'Estado' },
          ]}
        />
      </div>
    );
  },
};
