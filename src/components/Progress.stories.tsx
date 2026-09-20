import type { Meta, StoryObj } from '@storybook/react';
import { Progress, ProgressCircle } from './InputsExtra';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  subcomponents: { ProgressCircle },
  tags: ['autodocs'],
  args: { value: 60 },
  argTypes: {
    variant: { control: 'select', options: ['blue', 'orange', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    showLabel: { control: 'boolean' },
  },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Circular: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <ProgressCircle value={25} />
      <ProgressCircle value={60} variant="orange" />
      <ProgressCircle value={92} variant="success" size={80} />
    </div>
  ),
};
