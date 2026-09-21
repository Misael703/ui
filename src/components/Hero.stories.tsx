import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './Marketing';
import { Button } from './Button';

// Hoisted: an element created during render carries a fiber `_owner`, and
// Storybook's JSX source decorator recurses into nested arrays/objects — a
// fiber there is circular (stack overflow). Module scope has no owner.
const BRAND_ACTIONS = (
  <>
    <Button>Empezar a cotizar</Button>
    <Button variant="outline">Ver catálogo</Button>
  </>
);
const IMAGE_ACTIONS = <Button>Aprovechar</Button>;
const SUBTLE_ACTIONS = <Button>Conocer más</Button>;

const meta = {
  title: 'Components/Hero',
  component: Hero,
  tags: ['autodocs'],
  args: {
    eyebrow: 'Novedades',
    title: 'Materiales para tu proyecto',
    subtitle: 'Envío en 24h. Cotiza en línea o contáctanos.',
    actions: BRAND_ACTIONS,
    align: 'center',
    tone: 'brand',
    size: 'md',
  },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    tone: { control: 'select', options: ['brand', 'inverse', 'subtle', 'image'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Hero>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};

export const Image: Story = {
  args: {
    image: 'https://picsum.photos/id/1015/1200/400',
    eyebrow: 'Oferta de la semana',
    title: '20% off en herramientas eléctricas',
    subtitle: 'Solo esta semana',
    actions: IMAGE_ACTIONS,
    size: 'lg',
  },
};

export const Subtle: Story = {
  args: {
    tone: 'subtle',
    align: 'start',
    size: 'sm',
    eyebrow: undefined,
    title: '¿Eres empresa?',
    subtitle: 'Crea una cuenta corriente y obtén precios preferenciales.',
    actions: SUBTLE_ACTIONS,
  },
};
