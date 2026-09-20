import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from './Gallery';

const IMAGES = [
  { src: 'https://picsum.photos/id/1011/600/600', alt: 'Vista 1' },
  { src: 'https://picsum.photos/id/1012/600/600', alt: 'Vista 2' },
  { src: 'https://picsum.photos/id/1013/600/600', alt: 'Vista 3' },
  { src: 'https://picsum.photos/id/1014/600/600', alt: 'Vista 4' },
];

const meta = {
  title: 'Components/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  args: { images: IMAGES },
  argTypes: {
    thumbnailPosition: { control: 'inline-radio', options: ['bottom', 'left'] },
  },
} satisfies Meta<typeof ImageGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ maxWidth: 480 }}>
      <ImageGallery {...a} />
    </div>
  ),
};

export const ThumbsLeft: Story = {
  args: { thumbnailPosition: 'left' },
  render: (a) => (
    <div style={{ maxWidth: 600 }}>
      <ImageGallery {...a} />
    </div>
  ),
};
