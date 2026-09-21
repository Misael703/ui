import type { Meta, StoryObj } from '@storybook/react';
import { FreeShippingProgress } from './Commerce';

const meta = {
  title: 'Components/FreeShippingProgress',
  component: FreeShippingProgress,
  tags: ['autodocs'],
  args: { current: 28000, threshold: 50000 },
} satisfies Meta<typeof FreeShippingProgress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ maxWidth: 360 }}>
      <FreeShippingProgress {...a} />
    </div>
  ),
};
