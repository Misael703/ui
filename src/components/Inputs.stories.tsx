import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { NumberInput, Pagination, EmptyState, Kpi } from './Inputs';

export default { title: 'Forms/Inputs', tags: ['autodocs'] } as Meta;

export const NumberInputBasico: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<number | null>(1);
    return <NumberInput value={v} onChange={setV} min={0} max={99} suffix="u" />;
  },
};

export const NumberInputFullWidth: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<number | null>(1200);
    return (
      <div style={{ width: 320 }}>
        <NumberInput value={v} onChange={setV} min={0} fullWidth suffix="kg" />
      </div>
    );
  },
};

export const PaginationBasico: StoryObj = {
  render: () => {
    const [p, setP] = React.useState(3);
    return <Pagination page={p} pageSize={20} total={234} onPageChange={setP} />;
  },
};

export const EmptyBasico: StoryObj = {
  render: () => <EmptyState title="Sin pedidos aún" description="Cuando hagas tu primer pedido aparecerá acá." />,
};

export const KpiBasico: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <Kpi label="Ventas hoy" value="$2.4M" delta={{ value: '12%', trend: 'up' }} hint="vs ayer" />
      <Kpi label="Pedidos" value="184" delta={{ value: '3%', trend: 'down' }} />
      <Kpi label="Ticket prom." value="$13.8K" delta={{ value: '0%', trend: 'flat' }} />
    </div>
  ),
};

/** Playground interactivo: usa Controls para `min`/`max`/`step`/`prefix`/`suffix`. */
export const NumberInputPlayground: StoryObj<typeof NumberInput> = {
  args: { min: 0, max: 99, step: 1, suffix: 'u', disabled: false },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  render: (args) => {
    const [v, setV] = React.useState<number | null>(1);
    return <NumberInput {...args} value={v} onChange={setV} />;
  },
};
