import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { Slider, type SliderProps } from './InputsExtra';

function Controlled(args: SliderProps) {
  const [v, setV] = React.useState(args.value);
  return <Slider {...args} value={v} onChange={setV} />;
}

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: { value: 40, min: 0, max: 100, onChange: fn() },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };
