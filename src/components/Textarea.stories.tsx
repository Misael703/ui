import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Form';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { placeholder: 'Notas del pedido', rows: 4 },
  argTypes: {
    invalid: { control: 'boolean' },
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
