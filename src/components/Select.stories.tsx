import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Form';

// Hoisted: children hold React elements.
const OPTIONS = (
  <>
    <option value="pending">Pendiente</option>
    <option value="paid">Pagado</option>
  </>
);

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: { children: OPTIONS },
  argTypes: {
    invalid: { control: 'boolean' },
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
