import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Metrics';

const meta = {
  title: 'Components/Meter',
  component: Meter,
  tags: ['autodocs'],
  args: { value: 64, max: 100 },
  argTypes: {
    optimum: { control: 'inline-radio', options: ['low', 'high', 'middle'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Meter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Meter label="Stock cemento" value={72} low={20} high={80} optimum="high" valueLabel="72 / 100 sacos" />
      <Meter label="Presupuesto usado" value={88} low={70} high={90} optimum="low" valueLabel="88%" />
      <Meter label="Capacidad bodega" value={45} low={30} high={85} optimum="middle" />
      <Meter label="Avance simple (sin umbrales)" value={60} />
    </div>
  ),
};
