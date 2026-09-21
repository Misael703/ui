import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Primitives';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  args: { orientation: 'horizontal', decorative: true },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <p style={{ margin: 0 }}>Sección anterior con su contenido.</p>
      <Separator />
      <p style={{ margin: 0 }}>Sección siguiente, separada por una línea horizontal.</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 24 }}>
      <span>Inicio</span>
      <Separator orientation="vertical" />
      <span>Productos</span>
      <Separator orientation="vertical" />
      <span>Contacto</span>
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <p style={{ margin: 0 }}>El primer texto.</p>
      <Separator decorative={false} aria-label="separador semántico" />
      <p style={{ margin: 0 }}>
        El segundo texto. Cuando <code>decorative=false</code>, el separador queda expuesto a screen
        readers como elemento estructural.
      </p>
    </div>
  ),
};
