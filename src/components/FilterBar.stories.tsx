import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar, FilterField, type AppliedFilter } from './Filters';
import { Input, Select } from './Form';
import { Button } from './Button';

const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  subcomponents: { FilterField },
  tags: ['autodocs'],
  args: {
    layout: 'inline',
    mobileLayout: 'drawer',
    sortOn: 'mobile',
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['inline', 'collapse', 'drawer'] },
    mobileLayout: { control: 'inline-radio', options: ['inline', 'collapse', 'drawer'] },
    sortOn: { control: 'inline-radio', options: ['mobile', 'always'] },
  },
} satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Horizontal, dense filter row — the counterpart to `FilterPanel`'s vertical
 * facet sidebar. Fields go as `FilterField` children; `summary` is a
 * read-only result slot (the row count), `actions` holds row-level controls
 * ("Limpiar"), and `applied` renders the current values as removable chips.
 * `layout` is the "how much do you hide" scale: `inline` (every field,
 * wrapping), `collapse` (the first N inline, the rest behind "Más
 * filtros"), `drawer` (everything behind the funnel button — requires
 * `applied` so the values stay visible).
 */
export const Default: Story = {
  render: (a) => {
    const [q, setQ] = React.useState('1042');
    const [status, setStatus] = React.useState('pendiente');
    const clear = () => { setQ(''); setStatus('todos'); };
    const applied: AppliedFilter[] = [
      ...(q !== '' ? [{ key: 'q', label: 'Buscar', value: q, onRemove: () => setQ('') }] : []),
      ...(status !== 'todos' ? [{ key: 'status', label: 'Estado', value: status, onRemove: () => setStatus('todos') }] : []),
    ];
    return (
      <FilterBar
        {...a}
        summary="3 pedidos"
        applied={applied}
        onClearAll={clear}
        actions={<Button variant="ghost" size="sm" onClick={clear}>Limpiar</Button>}
      >
        <FilterField key="q" label="Buscar">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° o cliente" />
        </FilterField>
        <FilterField key="status" label="Estado">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="entregado">Entregado</option>
          </Select>
        </FilterField>
      </FilterBar>
    );
  },
};
