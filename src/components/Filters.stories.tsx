import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown, FilterBar, FilterField } from './Filters';
import { Button } from './Button';
import { Checkbox, Select, Input } from './Form';
import { Slider } from './InputsExtra';
import { Combobox, DatePicker } from './Pickers';
import { DataTable, TableToolbar } from './DataTable';
import { PageHeader } from './AppShell';
import { SegmentedControl, SegmentedControlItem } from './Toggle';

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
  viewSwitcher: boolean;
  fields: number;
  summary: boolean;
  filtersApplied: boolean;
  viewAction: boolean;
}

/**
 * **Playground · página de listado.** La estructura estándar de un listado y
 * cómo se comportan sus piezas al juntarse: `PageHeader` → `DataTable` con
 * `toolbar` → filas. El `toolbar` apila `TableToolbar` ("cómo veo": switcher de
 * vistas y acciones de vista, solo si hay switcher) y `FilterBar` ("qué veo":
 * campos, conteo en `summary`, "Limpiar" en `actions` solo con filtros
 * aplicados). Sin Card: la tabla es la superficie. Sube `fields` a 7 para ver
 * cómo envuelve la grilla y dónde queda el conteo; quita el switcher para el
 * caso de un CRUD simple. Reglas completas en DESIGN.md › List-page recipe.
 */
export const PaginaDeListadoPlayground: StoryObj<ListPageArgs> = {
  name: 'Playground · página de listado',
  parameters: { layout: 'fullscreen' },
  args: { viewSwitcher: true, fields: 5, summary: true, filtersApplied: false, viewAction: true },
  argTypes: {
    viewSwitcher: { control: 'boolean' },
    fields: { control: { type: 'range', min: 2, max: 7, step: 1 } },
    summary: { control: 'boolean' },
    filtersApplied: { control: 'boolean' },
    viewAction: { control: 'boolean' },
  },
  render: (a) => {
    const [view, setView] = React.useState('table');
    const rows = [
      { id: '1042', doc: '1042', client: 'Northwind Builders', branch: 'Casa matriz', date: '8 jul 2026', status: 'Pendiente' },
      { id: '1043', doc: '1043', client: 'Constructora Norte', branch: 'Sucursal Sur', date: '9 jul 2026', status: 'Preparado' },
      { id: '1044', doc: '1044', client: 'Cliente de mesón', branch: 'Casa matriz', date: '9 jul 2026', status: 'Entregado' },
    ];
    const opts = (vals: string[]) => vals.map((v) => ({ value: v.toLowerCase(), label: v }));
    const allFields = [
      <FilterField key="q" label="Buscar"><Input defaultValue={a.filtersApplied ? '1042' : ''} placeholder="N° o cliente" /></FilterField>,
      <FilterField key="status" label="Estado"><Combobox value={a.filtersApplied ? 'pendiente' : 'todos'} onChange={() => {}} searchable={false} options={opts(['Todos', 'Pendiente', 'Preparado', 'Entregado'])} /></FilterField>,
      <FilterField key="branch" label="Sucursal"><Combobox value={null} onChange={() => {}} placeholder="Todas" searchable={false} options={opts(['Casa matriz', 'Sucursal Sur'])} /></FilterField>,
      <FilterField key="seller" label="Vendedor"><Combobox value={null} onChange={() => {}} placeholder="Todos" options={opts(['Mesón 1', 'Mesón 2'])} /></FilterField>,
      <FilterField key="date" label="Fecha"><DatePicker value={null} onChange={() => {}} placeholder="Cualquiera" /></FilterField>,
      <FilterField key="pay" label="Pago"><Select defaultValue="all"><option value="all">Todos</option><option value="paid">Pagado</option><option value="due">Pendiente</option></Select></FilterField>,
      <FilterField key="channel" label="Canal"><Select defaultValue="all"><option value="all">Todos</option><option value="store">Tienda</option><option value="web">Web</option></Select></FilterField>,
    ];
    return (
      <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
        <PageHeader title="Pedidos" description="Ventas y entregas de la sucursal." actions={<Button>Nuevo pedido</Button>} />
        <DataTable
          ariaLabel="Pedidos"
          toolbar={
            <>
              {a.viewSwitcher && (
                <TableToolbar>
                  <SegmentedControl value={view} onChange={(v) => setView(v ?? 'table')} ariaLabel="Vista">
                    <SegmentedControlItem value="table">Tabla</SegmentedControlItem>
                    <SegmentedControlItem value="cards">Tarjetas</SegmentedControlItem>
                    <SegmentedControlItem value="board">Tablero</SegmentedControlItem>
                  </SegmentedControl>
                  <span className="grow" />
                  {a.viewAction && <Button variant="outline" size="sm">Exportar</Button>}
                </TableToolbar>
              )}
              <FilterBar
                summary={a.summary ? `${rows.length} pedidos` : undefined}
                actions={a.filtersApplied ? <Button variant="ghost" size="sm">Limpiar</Button> : undefined}
              >
                {allFields.slice(0, a.fields)}
              </FilterBar>
            </>
          }
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: 'doc', header: 'N° pedido' },
            { key: 'client', header: 'Cliente' },
            { key: 'branch', header: 'Sucursal' },
            { key: 'date', header: 'Fecha' },
            { key: 'status', header: 'Estado' },
          ]}
        />
      </div>
    );
  },
};
