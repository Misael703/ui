import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { WishlistButton, type WishlistButtonProps } from './Commerce';

function Controlled(args: WishlistButtonProps) {
  const [active, setActive] = React.useState(args.active);
  return <WishlistButton {...args} active={active} onToggle={setActive} />;
}

const meta = {
  title: 'Components/WishlistButton',
  component: WishlistButton,
  tags: ['autodocs'],
  args: { active: false, size: 20, onToggle: fn() },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof WishlistButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
