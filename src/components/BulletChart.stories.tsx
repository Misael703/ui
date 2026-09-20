import type { Meta, StoryObj } from '@storybook/react';
import { BulletChart } from './Metrics';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/BulletChart',
  component: BulletChart,
  tags: ['autodocs'],
  args: { value: 72, target: 80 },
  argTypes: {
    tone: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof BulletChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <BulletChart label="Ventas vs. meta" value={234} target={260} ranges={[150, 220, 300]} valueLabel={formatCurrency(234000)} tone="primary" />
      <BulletChart label="Satisfacción" value={88} target={90} ranges={[60, 80, 100]} valueLabel="88%" tone="success" />
      <BulletChart label="Tiempo de entrega" value={52} target={40} ranges={[30, 50, 70]} valueLabel="52 min" tone="warning" />
    </div>
  ),
};
