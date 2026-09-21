import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './DataTable';

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Inicio', href: '#' },
      { label: 'Pedidos', href: '#' },
      { label: 'Pedido #1042' },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
