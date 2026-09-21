import type { Meta, StoryObj } from '@storybook/react';
import { OrderSummary } from './Commerce';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/OrderSummary',
  component: OrderSummary,
  tags: ['autodocs'],
  args: {
    title: 'Resumen del pedido',
    rows: [
      { label: 'Subtotal (2 ítems)', value: formatCurrency(135980) },
      { label: 'Envío', value: formatCurrency(3500) },
      { label: 'Descuento (BIENVENIDO)', value: `-${formatCurrency(13598)}` },
      { label: 'Total', value: formatCurrency(125882), emphasis: true },
    ],
  },
} satisfies Meta<typeof OrderSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ maxWidth: 360 }}>
      <OrderSummary {...a} />
    </div>
  ),
};
