import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Layout';

const meta = {
  title: 'Components/Container',
  component: Container,
  tags: ['autodocs'],
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
  },
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <Container {...a}>
      <div style={{ padding: 24, background: 'var(--bg-subtle)', borderRadius: 8 }}>
        Contenido limitado por <code>size=&quot;{a.size}&quot;</code> y centrado horizontalmente.
      </div>
    </Container>
  ),
};
