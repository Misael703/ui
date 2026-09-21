import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel, FilterSection } from './Filters';
import { Checkbox } from './Form';
import { Slider } from './InputsExtra';

const ESTADOS = [
  { v: 'abierto', l: 'Abierto' },
  { v: 'enproceso', l: 'En proceso' },
  { v: 'entregado', l: 'Entregado' },
  { v: 'cancelado', l: 'Cancelado' },
];

const meta = {
  title: 'Components/FilterPanel',
  component: FilterPanel,
  subcomponents: { FilterSection },
  tags: ['autodocs'],
  args: { title: 'Filtros' },
} satisfies Meta<typeof FilterPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => {
    const [estados, setEstados] = React.useState<string[]>(['abierto', 'enproceso']);
    const [precio, setPrecio] = React.useState(50);
    const total = estados.length + (precio !== 50 ? 1 : 0);
    return (
      <FilterPanel {...a} activeCount={total} onClearAll={() => { setEstados([]); setPrecio(50); }}>
        <FilterSection title="Estado">
          {ESTADOS.map((o) => (
            <label key={o.v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <Checkbox
                checked={estados.includes(o.v)}
                onChange={(e) => setEstados((curr) => (e.target.checked ? [...curr, o.v] : curr.filter((x) => x !== o.v)))}
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
