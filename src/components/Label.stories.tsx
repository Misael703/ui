import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Form';

const meta = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Nombre', htmlFor: 'name' },
  argTypes: {
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
