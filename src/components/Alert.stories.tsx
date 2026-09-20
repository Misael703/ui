import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Display';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { variant: 'info', children: 'El pedido se guardó.' },
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert variant="info" title="Aviso">Mantenimiento el sábado.</Alert>
      <Alert variant="success" title="Listo">Pedido confirmado.</Alert>
      <Alert variant="warning" title="Atención">Stock bajo.</Alert>
      <Alert variant="danger" title="Error">No pudimos procesar el pago.</Alert>
    </div>
  ),
};
