import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery, Lightbox } from './Gallery';
import { Button } from './Button';

export default { title: 'Patterns/Gallery', tags: ['autodocs'] } as Meta;

const images = [
  { src: 'https://picsum.photos/id/1011/600/600', alt: 'Vista 1' },
  { src: 'https://picsum.photos/id/1012/600/600', alt: 'Vista 2' },
  { src: 'https://picsum.photos/id/1013/600/600', alt: 'Vista 3' },
  { src: 'https://picsum.photos/id/1014/600/600', alt: 'Vista 4' },
];

export const Default: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ImageGallery images={images} />
    </div>
  ),
};

export const ThumbsLeft: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <ImageGallery images={images} thumbnailPosition="left" />
    </div>
  ),
};

/**
 * Visor a pantalla completa controlado. `role="dialog"` + `aria-modal`;
 * Esc cierra, ←/→ navegan (cuando se pasa `onChange`). Click en el backdrop
 * cierra; click en la imagen no.
 */
export const LightboxViewer: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [index, setIndex] = React.useState(0);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir visor</Button>
        <Lightbox
          open={open}
          onClose={() => setOpen(false)}
          images={images}
          index={index}
          onChange={setIndex}
        />
      </>
    );
  },
};
