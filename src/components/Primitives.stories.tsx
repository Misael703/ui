import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Primitives';

export default { title: 'Layout/Separator', tags: ['autodocs'] } as Meta;

export const Horizontal: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <p style={{ margin: 0 }}>Sección anterior con su contenido.</p>
      <Separator />
      <p style={{ margin: 0 }}>Sección siguiente, separada por una línea horizontal.</p>
    </div>
  ),
};

export const Vertical: StoryObj = {
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

export const NoDecorativo: StoryObj = {
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
