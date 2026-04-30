import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Acciones/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Guardar pedido', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'subtle', 'danger', 'success', 'warning'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type S = StoryObj<typeof Button>;

export const Primary: S = {};
export const Secondary: S = { args: { variant: 'secondary' } };
export const Outline: S = { args: { variant: 'outline' } };
export const Ghost: S = { args: { variant: 'ghost' } };
export const Danger: S = { args: { variant: 'danger' } };
export const Success: S = { args: { variant: 'success', children: 'Confirmar pago' } };
export const Warning: S = { args: { variant: 'warning', children: 'Continuar con stock bajo' } };
export const Loading: S = { args: { loading: true, children: 'Procesando…' } };
export const Disabled: S = { args: { disabled: true } };
export const FullWidth: S = { args: { fullWidth: true } };

export const AllSizes: S = {
  render: (a) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...a} size="sm">Pequeño</Button>
      <Button {...a} size="md">Mediano</Button>
      <Button {...a} size="lg">Grande</Button>
    </div>
  ),
};
