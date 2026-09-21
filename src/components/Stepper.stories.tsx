import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Layout';
import { Button } from './Button';

const STEPS = [
  { label: 'Cliente', description: 'Datos básicos' },
  { label: 'Productos', description: 'Selección' },
  { label: 'Pago', description: 'Método y total' },
  { label: 'Confirmar' },
];

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: { steps: STEPS, current: 1 },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Interactive: buttons advance the `current` step. */
export const Examples: Story = {
  render: () => {
    const [c, setC] = React.useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Stepper current={c} steps={STEPS} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => setC((c) => Math.max(0, c - 1))}>Atrás</Button>
          <Button onClick={() => setC((c) => Math.min(3, c + 1))}>Siguiente</Button>
        </div>
      </div>
    );
  },
};
