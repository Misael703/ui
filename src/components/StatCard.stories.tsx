import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StatCard, Sparkbar, ProportionBar, Meter } from './Metrics';
import { formatCurrency } from '../utils/format';
import { ShoppingCart, Wallet, Users, Package } from './Icons';

const meta = {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  args: { label: 'Pedidos hoy', value: '128', delta: 12 },
  argTypes: {
    accent: {
      control: 'select',
      options: ['brand', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral', 'cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'],
    },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof StatCard>;
export default meta;
type Story = StoryObj<typeof meta>;

const row: React.CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' };
const TREND_DATA = [12, 18, 14, 22, 19, 28, 24, 31, 27, 35];

export const Default: Story = {};

/** A row of stat cards with different accents, icons and deltas. */
export const Examples: Story = {
  render: () => (
    <div style={row}>
      <StatCard
        accent="cat-2"
        icon={<Wallet size={16} />}
        label="Ventas hoy"
        value={formatCurrency(1284500)}
        delta={8.2}
        caption="vs. ayer"
        chart={<Sparkbar data={TREND_DATA} highlightLast height={36} />}
      />
      <StatCard accent="cat-1" icon={<ShoppingCart size={16} />} label="Pedidos" value="342" delta={-4.1} caption="vs. ayer" />
      <StatCard accent="cat-4" icon={<Users size={16} />} label="Clientes nuevos" value="28" delta={0} caption="estable" />
      <StatCard accent="cat-5" icon={<Package size={16} />} label="Margen de error" value="1,8%" delta={3.4} deltaInvert caption="vs. semana" />
    </div>
  ),
};

// Async loading: label/icon stay (a KPI's identity is known before its number),
// value + delta become skeletons and the card is aria-busy.
export const Loading: Story = {
  render: () => (
    <div style={row}>
      <StatCard accent="cat-2" icon={<Wallet size={16} />} label="Ventas hoy" value="—" loading />
      <StatCard accent="cat-1" icon={<ShoppingCart size={16} />} label="Pedidos" value="—" loading />
      <StatCard accent="cat-4" icon={<Users size={16} />} label="Clientes nuevos" value="—" loading />
    </div>
  ),
};

// A composed mini-dashboard to validate the pieces read well together.
export const DashboardPlayground: Story = {
  name: 'Playground · Dashboard',
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', maxWidth: 920 }}>
      <StatCard accent="cat-2" icon={<Wallet size={16} />} label="Ingresos" value={formatCurrency(4820000)} delta={12.4} caption="vs. mes anterior" chart={<Sparkbar data={TREND_DATA} highlightLast />} />
      <StatCard accent="cat-1" icon={<ShoppingCart size={16} />} label="Pedidos" value="1.284" delta={-2.3} caption="vs. mes anterior" />
      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 16, padding: 16, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-surface)' }}>
        <ProportionBar segments={[{ label: 'Pagado', value: 62 }, { label: 'Pendiente', value: 28 }, { label: 'Vencido', value: 10 }]} />
        <Meter label="Meta mensual" value={82} low={50} high={90} optimum="high" valueLabel="82%" />
      </div>
    </div>
  ),
};
