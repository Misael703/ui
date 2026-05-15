import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from './Carousel';

export default { title: 'Media/Carousel', tags: ['autodocs'] } as Meta;

const Slide = ({ n, color }: { n: number; color: string }) => (
  <div
    style={{
      width: '100%',
      height: 280,
      background: color,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: 1,
    }}
  >
    Slide {n}
  </div>
);

export const Basico: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <Carousel ariaLabel="Demostración">
        <Slide n={1} color="var(--color-secondary)" />
        <Slide n={2} color="var(--color-primary)" />
        <Slide n={3} color="#0ea5e9" />
        <Slide n={4} color="#10b981" />
      </Carousel>
    </div>
  ),
};

export const Loop: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <Carousel loop ariaLabel="Loop">
        <Slide n={1} color="#6366f1" />
        <Slide n={2} color="#a855f7" />
        <Slide n={3} color="#ec4899" />
      </Carousel>
    </div>
  ),
};

export const Autoplay: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <Carousel loop autoplay autoplayInterval={2500} ariaLabel="Autoplay">
        <Slide n={1} color="#0f172a" />
        <Slide n={2} color="#1e293b" />
        <Slide n={3} color="#334155" />
      </Carousel>
    </div>
  ),
};
