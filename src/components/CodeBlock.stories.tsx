import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './Code';

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  args: { children: 'npm install @misael703/ui', language: 'bash' },
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <CodeBlock {...a} filename="install.sh">
      {`npm install @misael703/ui
npm run storybook`}
    </CodeBlock>
  ),
};

export const NoHeader: Story = {
  render: () => (
    <CodeBlock>
      {`const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);`}
    </CodeBlock>
  ),
};
