import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Rating, type RatingProps } from './Commerce';

function Controlled(args: RatingProps) {
  const [value, setValue] = React.useState(args.value);
  return <Rating {...args} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Components/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: { value: 3, max: 5, allowHalf: true, size: 20, onChange: fn() },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
