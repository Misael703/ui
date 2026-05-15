import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from './Gallery';

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
