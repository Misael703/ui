import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './Inputs';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: { title: 'Sin pedidos', description: 'Crea el primer pedido para verlo aquí.' },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
