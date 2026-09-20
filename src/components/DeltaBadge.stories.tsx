import type { Meta, StoryObj } from '@storybook/react';
import { DeltaBadge } from './Metrics';

const meta = {
  title: 'Components/DeltaBadge',
  component: DeltaBadge,
  tags: ['autodocs'],
  args: { value: 12 },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    invert: { control: 'boolean' },
    showIcon: { control: 'boolean' },
  },
} satisfies Meta<typeof DeltaBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <DeltaBadge {...a} value={12.4} />
      <DeltaBadge {...a} value={-3.1} />
      <DeltaBadge {...a} value={0} />
      <DeltaBadge {...a} value={8.5} invert />
      <DeltaBadge {...a} value={-4.2} invert />
      <DeltaBadge {...a} value={2400} format={(v) => `${v > 0 ? '+' : ''}${v} pedidos`} />
      <DeltaBadge {...a} value={12.4} size="sm" />
    </div>
  ),
};
