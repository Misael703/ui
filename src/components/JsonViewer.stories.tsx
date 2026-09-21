import type { Meta, StoryObj } from '@storybook/react';
import { JsonViewer } from './Code';

const meta = {
  title: 'Components/JsonViewer',
  component: JsonViewer,
  tags: ['autodocs'],
  args: {
    data: {
      order: {
        id: 1042,
        customer: 'Satoru Gojo',
        items: [
          { sku: 'ELT-12', name: 'Cemento gris', qty: 10, price: 5490 },
          { sku: 'FRR-08', name: 'Fierro 12mm', qty: 5, price: 3290 },
        ],
        total: 71350,
        paid: true,
        shippingAddress: null,
      },
    },
    defaultExpandDepth: 2,
  },
} satisfies Meta<typeof JsonViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
