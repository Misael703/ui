import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './Primitives';

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  args: { ratio: 16 / 9 },
} satisfies Meta<typeof AspectRatio>;
export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 360, border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden' }}>
    {children}
  </div>
);

export const Default: Story = {
  render: (a) => (
    <Frame>
      <AspectRatio {...a}>
        <img alt="" src="https://picsum.photos/seed/default/800/450" />
      </AspectRatio>
    </Frame>
  ),
};

export const Square: StoryObj = {
  render: () => (
    <Frame>
      <AspectRatio ratio={1}>
        <img alt="" src="https://picsum.photos/seed/square/600/600" />
      </AspectRatio>
    </Frame>
  ),
};

export const Widescreen16x9: StoryObj = {
  render: () => (
    <Frame>
      <AspectRatio ratio={16 / 9}>
        <img alt="" src="https://picsum.photos/seed/wide/800/450" />
      </AspectRatio>
    </Frame>
  ),
};

export const Portrait4x5: StoryObj = {
  render: () => (
    <Frame>
      <AspectRatio ratio={4 / 5}>
        <img alt="" src="https://picsum.photos/seed/portrait/640/800" />
      </AspectRatio>
    </Frame>
  ),
};

export const Embed: StoryObj = {
  render: () => (
    <div style={{ width: 480 }}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          title="ejemplo"
          src="about:blank"
          style={{ border: 0, background: 'var(--bg-subtle)' }}
        />
      </AspectRatio>
    </div>
  ),
};
