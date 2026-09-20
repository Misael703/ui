import type { Meta, StoryObj } from '@storybook/react';
import { UserCell } from './Display3';

const meta = {
  title: 'Components/UserCell',
  component: UserCell,
  tags: ['autodocs'],
  args: { name: 'Satoru Gojo', meta: 'satoru@example.com' },
  argTypes: {
    size: { control: 'inline-radio', options: [24, 32, 40, 48] },
  },
} satisfies Meta<typeof UserCell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <UserCell name="Satoru Gojo" meta="satoru.gojo@northwind.cl" />
      <UserCell name="Patricia Rojas" meta="Admin · Acme Co" size={40} />
      <UserCell name="JN" meta="Bodeguero" avatarSrc="https://i.pravatar.cc/64?img=12" />
    </div>
  ),
};
