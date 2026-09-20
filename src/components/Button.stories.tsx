import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonGroup, IconButton } from './Button';
import { ArrowLeft, ChevronDown, X, Search } from './Icons';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Guardar pedido', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'subtle', 'danger', 'success', 'warning', 'link'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type S = StoryObj<typeof Button>;

export const Default: S = {};
export const Secondary: S = { args: { variant: 'secondary' } };
export const Outline: S = { args: { variant: 'outline' } };
export const Ghost: S = { args: { variant: 'ghost' } };
export const Danger: S = { args: { variant: 'danger' } };
export const Success: S = { args: { variant: 'success', children: 'Confirmar pago' } };
export const Warning: S = { args: { variant: 'warning', children: 'Continuar con stock bajo' } };
export const Loading: S = { args: { loading: true, children: 'Procesando…' } };
export const Disabled: S = { args: { disabled: true } };

/**
 * **`variant="link"`** — text affordance (transparent, underline on hover).
 * Unlike the surface variants it does NOT animate a press on `:active` (no
 * scale, no shadow) — a text link doesn't get "pressed". Click it to confirm
 * it doesn't shrink.
 */
export const Link: S = { args: { variant: 'link', iconLeft: <ArrowLeft size={16} />, children: 'Volver a órdenes' } };
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
 * Primary vs Secondary. Switch the toolbar **Preset → El Alba**: the kit
 * inverts the colors ONLY in that preset and ONLY on buttons — primary
 * becomes deep orange (`#b84300` + white, 5.47:1 AA) and secondary becomes
 * the brand blue (`#002f87` + white, 11.96:1). Links/focus/badges are not
 * inverted.
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
 * `ButtonGroup`: groups buttons as a segmented control (the internal
 * borders collapse; `role="group"`, configurable). Useful for related
 * actions or a view toggle.
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
 * `asChild`: renders as the child element (here an `<a>`, in your app it
 * would be `next/link`) while keeping the Button's styles, ref and
 * handlers. Polymorphism without wrappers, without losing the versioned
 * model.
 */
export const AsChildLink: S = {
  render: () => (
    <Button asChild variant="primary">
      <a href="https://example.com" target="_blank" rel="noreferrer">Ir al catálogo</a>
    </Button>
  ),
};

export const IconButtons: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton icon={<Search size={16} />} aria-label="Buscar" />
      <IconButton icon={<ChevronDown size={16} />} aria-label="Más opciones" variant="outline" />
      <IconButton icon={<X size={16} />} aria-label="Cerrar" variant="ghost" size="sm" />
      <IconButton icon={<Search size={18} />} aria-label="Buscar" variant="primary" size="lg" />
      <IconButton icon={<X size={16} />} aria-label="Procesando" loading />
    </div>
  ),
};
