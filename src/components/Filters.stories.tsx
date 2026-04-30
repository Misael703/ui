import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown } from './Filters';
import { Button } from './Button';
import { Checkbox } from './Form';
import { Slider } from './InputsExtra';

export default { title: 'ERP/Filters', tags: ['autodocs'] } as Meta;

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
