import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Form';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  // `Checkbox` has no `label` prop — the label is `children`, rendered next
  // to the input inside the component's own `<label>`.
  args: { children: 'Enviar factura', defaultChecked: true },
  argTypes: {
    invalid: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
