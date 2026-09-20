import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Display2';

const meta = {
  title: 'Components/Stat',
  component: Stat,
  tags: ['autodocs'],
  args: { label: 'Pedidos hoy', value: '128', delta: 12 },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'center'] },
  },
} satisfies Meta<typeof Stat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {/* Preferred: numeric `delta` → shared DeltaBadge (signed, localized, tone by sign). */}
      <Stat label="Ventas hoy" value="$1.245.000" hint="vs ayer" delta={12.4} />
      <Stat label="Pedidos" value="38" delta={-4} deltaFormat={(v) => `${v > 0 ? '+' : ''}${v}`} />
      <Stat label="Margen promedio" value="22%" hint="objetivo: 25%" />
    </div>
  ),
};

// `deltaInvert` for higher-is-worse metrics (cost, merma): the arrow still points
// up on an increase, but the tone reads negative. And the legacy string `trend`
// stays supported (deprecated) for back-compat.
export const DeltaInvertAndLegacy: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Stat label="Merma" value="3,1%" delta={3.1} deltaInvert hint="vs mes ant." />
      <Stat label="Costo envío" value="$4.200" delta={-8.5} deltaInvert hint="bajó, mejor" />
      <Stat label="NPS (legacy trend)" value="72" trend={{ value: '+5', dir: 'up' }} />
    </div>
  ),
};
