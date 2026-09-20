import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './Display2';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  subcomponents: { AvatarGroup },
  tags: ['autodocs'],
  args: { name: 'Satoru Gojo', size: 32, shape: 'circle' },
  argTypes: {
    size: { control: 'inline-radio', options: [24, 32, 40, 48, 64] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
    status: { control: 'inline-radio', options: ['online', 'offline', 'busy'] },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="Satoru Gojo" />
      <Avatar name="Acme Supply Co" size={40} />
      <Avatar name="Acme Co" size={48} />
      <Avatar name="JN" status="online" />
      <Avatar src="https://i.pravatar.cc/64?img=12" alt="Cliente" size={48} />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="MO" />
      <Avatar name="JN" />
      <Avatar name="CP" />
      <Avatar name="DV" />
      <Avatar name="LR" />
    </AvatarGroup>
  ),
};
