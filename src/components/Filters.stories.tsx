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

/**
 * **Receta: página de listado** (v3.7.0). La estructura estándar de todo CRUD:
 * `PageHeader` (título + acción primaria) → `DataTable` con `toolbar` → filas.
 * El `toolbar` apila dos bandas sobre la misma superficie de la tabla:
 * `TableToolbar` con el switcher de vistas ("cómo veo") y acciones de vista, y
 * `FilterBar` con los campos ("qué veo"), el conteo en `summary` y "Limpiar" en
 * `actions` solo cuando hay filtros aplicados. La fila superior existe solo si
 * hay switcher; el conteo va SIEMPRE en `summary`, junto a los filtros que lo
 * producen. Sin Card: la tabla es la superficie.
 *
 * Reglas: una fila en escritorio y los campos envuelven por ancho mínimo (160),
 * nunca anchos fijos por campo; labels en registro denso (los de `FilterField`);
 * búsqueda libre primero, selectores después, fecha al final; cinco campos como
 * tope, el resto detrás de "Más filtros". Tres páginas con los mismos campos
 * (Buscar + Estado) = una composición local de veinte líneas sobre `FilterBar`,
 * no un componente nuevo del kit.
 */
export const RecetaPaginaDeListado: StoryObj = {
  name: 'Receta: página de listado',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [view, setView] = React.useState('table');
    const [q, setQ] = React.useState('');
    const [status, setStatus] = React.useState<string | null>('active');
    const [zone, setZone] = React.useState<string | null>(null);
    const [date, setDate] = React.useState<Date | null>(null);
    const rows = [
      { id: '623', doc: '623', client: 'Misael Hetfield', zone: 'Local', date: '8 jul 2026', status: 'Sin preparar' },
      { id: '1363', doc: '1363', client: 'Cliente Boleta', zone: 'Metropolitana', date: '4 jul 2026', status: 'En ruta' },
      { id: '1401', doc: '1401', client: 'Constructora Norte', zone: 'V Región', date: '9 jul 2026', status: 'En preparación' },
    ];
    const hasFilters = q !== '' || status !== 'active' || zone != null || date != null;
    const clear = () => { setQ(''); setStatus('active'); setZone(null); setDate(null); };
    return (
      <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
        <PageHeader title="Órdenes de despacho" description="Trazabilidad desde la venta en Bsale hasta la entrega." actions={<Button>Nueva orden</Button>} />
        <DataTable
          ariaLabel="Órdenes"
          toolbar={
            <>
              <TableToolbar>
                <SegmentedControl value={view} onChange={(v) => setView(v ?? 'table')} ariaLabel="Vista">
                  <SegmentedControlItem value="table">Tabla</SegmentedControlItem>
                  <SegmentedControlItem value="agenda">Agenda</SegmentedControlItem>
                  <SegmentedControlItem value="board">Tablero</SegmentedControlItem>
                </SegmentedControl>
                <span className="grow" />
                <Button variant="outline" size="sm">Exportar</Button>
              </TableToolbar>
              <FilterBar
                summary={`${rows.length} órdenes`}
                actions={hasFilters ? <Button variant="ghost" size="sm" onClick={clear}>Limpiar</Button> : undefined}
              >
                <FilterField label="Buscar">
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Documento o cliente" />
                </FilterField>
                <FilterField label="Estado">
                  <Combobox value={status} onChange={setStatus} searchable={false} options={[
                    { value: 'active', label: 'Activas' }, { value: 'all', label: 'Todas' }, { value: 'delivered', label: 'Entregadas' },
                  ]} />
                </FilterField>
                <FilterField label="Zona">
                  <Combobox value={zone} onChange={setZone} placeholder="Todas" searchable={false} options={[
                    { value: 'local', label: 'Local' }, { value: 'rm', label: 'Metropolitana' }, { value: 'v', label: 'V Región' },
                  ]} />
                </FilterField>
                <FilterField label="Vendedor">
                  <Combobox value={null} onChange={() => {}} placeholder="Todos" options={[{ value: 'vt', label: 'Vendedor Test' }]} />
                </FilterField>
                <FilterField label="Entrega">
                  <DatePicker value={date} onChange={setDate} placeholder="Cualquiera" />
                </FilterField>
              </FilterBar>
            </>
          }
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: 'doc', header: 'N° documento' },
            { key: 'client', header: 'Cliente' },
            { key: 'zone', header: 'Zona' },
            { key: 'date', header: 'Entrega' },
            { key: 'status', header: 'Estado' },
          ]}
        />
      </div>
    );
  },
};
