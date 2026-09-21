import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Form';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  // `Switch` has no `label` prop — the label is `children`.
  args: { children: 'Notificaciones', defaultChecked: true },
  argTypes: {
    invalid: { control: 'boolean' },
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
