import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Form';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Buscar pedido…' },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: { invalid: true },
};

/** Interactive playground: use the Controls panel to try `invalid` and `disabled`. */
export const Playground: Story = {
  args: { placeholder: 'SKU del producto', invalid: false, disabled: false },
};
