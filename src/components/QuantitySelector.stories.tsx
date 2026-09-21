import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QuantitySelector, type QuantitySelectorProps } from './Commerce';

function Controlled(args: QuantitySelectorProps) {
  const [value, setValue] = React.useState(args.value);
  return <QuantitySelector {...args} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Components/QuantitySelector',
  component: QuantitySelector,
  tags: ['autodocs'],
  args: { value: 1, min: 1, max: 20, size: 'md', onChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof QuantitySelector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
