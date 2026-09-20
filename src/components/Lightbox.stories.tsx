import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Lightbox, type LightboxProps } from './Gallery';
import { Button } from './Button';

const IMAGES = [
  { src: 'https://picsum.photos/id/1011/600/600', alt: 'Vista 1' },
  { src: 'https://picsum.photos/id/1012/600/600', alt: 'Vista 2' },
  { src: 'https://picsum.photos/id/1013/600/600', alt: 'Vista 3' },
  { src: 'https://picsum.photos/id/1014/600/600', alt: 'Vista 4' },
];

function Launcher(args: LightboxProps) {
  const [open, setOpen] = React.useState(args.open);
  const [index, setIndex] = React.useState(args.index);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir visor</Button>
      <Lightbox {...args} open={open} index={index} onClose={() => setOpen(false)} onChange={setIndex} />
    </>
  );
}

const meta = {
  title: 'Components/Lightbox',
  component: Lightbox,
  tags: ['autodocs'],
  args: { open: false, images: IMAGES, index: 0, onClose: () => {} },
  render: (a) => <Launcher {...a} />,
} satisfies Meta<typeof Lightbox>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Full-screen controlled viewer. `role="dialog"` + `aria-modal`; Esc
 * closes, ←/→ navigate (when `onChange` is passed). A click on the backdrop
 * closes; a click on the image doesn't.
 */
export const Default: Story = {};
