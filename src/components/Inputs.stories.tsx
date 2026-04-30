import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { NumberInput, Pagination, EmptyState, Kpi } from './Inputs';

export default { title: 'Avanzados/Inputs', tags: ['autodocs'] } as Meta;

export const NumberInputBasico: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<number | null>(1);
    return <NumberInput value={v} onChange={setV} min={0} max={99} suffix="u" />;
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
