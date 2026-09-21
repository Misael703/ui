import type { Meta, StoryObj } from '@storybook/react';
import { FormField, Input } from './Form';

// Hoisted: children hold React elements.
const EMAIL_INPUT = <Input id="email" />;
const EMAIL_INPUT_INVALID = <Input id="email-error" defaultValue="no-es-mail" invalid />;

const meta = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: {
    label: 'Correo',
    hint: 'Usamos tu correo para la factura',
    children: EMAIL_INPUT,
  },
  argTypes: {
    required: { control: 'boolean' },
  },
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  args: { required: true },
};

export const WithError: Story = {
  args: {
    hint: undefined,
    error: 'Formato inválido',
    children: EMAIL_INPUT_INVALID,
  },
};
