import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonGroup } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Actions/Button',
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

/**
 * Primary vs Secondary. Cambia el toolbar **Preset → El Alba**: el kit
 * invierte los colores SOLO en ese preset y SOLO en botones — primary pasa
 * a naranja profundo (`#b84300` + blanco, 5.47:1 AA) y secondary al azul de
 * marca (`#002f87` + blanco, 11.96:1). Links/focus/badges no se invierten.
 */
export const PrimaryVsSecondary: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="primary">Guardar pedido</Button>
      <Button variant="secondary">Duplicar</Button>
      <Button variant="primary" disabled>Guardar pedido</Button>
    </div>
  ),
};

/**
 * `ButtonGroup`: agrupa botones como un control segmentado (los bordes
 * internos se colapsan; `role="group"`, configurable). Útil para acciones
 * relacionadas o un toggle de vista.
 */
export const Grouped: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ButtonGroup aria-label="Vista">
        <Button variant="outline">Lista</Button>
        <Button variant="outline">Tarjetas</Button>
        <Button variant="outline">Tabla</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Acciones">
        <Button>Guardar</Button>
        <Button variant="outline">Duplicar</Button>
        <Button variant="ghost">Cancelar</Button>
      </ButtonGroup>
    </div>
  ),
};

/**
 * `asChild`: renderiza como el elemento hijo (aquí un `<a>`, en tu app sería
 * `next/link`) conservando estilos, ref y handlers del Button. Polimorfismo
 * sin wrappers, sin perder el modelo versionado.
 */
export const AsChildLink: S = {
  render: () => (
    <Button asChild variant="primary">
      <a href="https://example.com" target="_blank" rel="noreferrer">Ir al catálogo</a>
    </Button>
  ),
};
