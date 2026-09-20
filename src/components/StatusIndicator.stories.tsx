import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator } from './Display3';

const meta = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  args: { tone: 'success', label: 'Activo' },
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'danger', 'info', 'neutral'] },
    pulse: { control: 'boolean' },
  },
} satisfies Meta<typeof StatusIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatusIndicator tone="success" pulse label="Sincronizado" />
      <StatusIndicator tone="warning" label="Pendiente" />
      <StatusIndicator tone="danger" label="Error de conexión" />
      <StatusIndicator tone="info" pulse label="Procesando" />
      <StatusIndicator tone="neutral" label="Inactivo" />
    </div>
  ),
};
