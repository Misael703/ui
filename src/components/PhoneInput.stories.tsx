import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { PhoneInput, type PhoneInputProps } from './InputsExtra';

function Controlled(args: PhoneInputProps) {
  const [v, setV] = React.useState(args.value ?? '');
  return <PhoneInput {...args} value={v} onChange={setV} />;
}

const meta = {
  title: 'Components/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  // v4.4.0 dropped the built-in default placeholder — set one explicitly so
  // the story isn't a blank field.
  args: { value: '', prefix: '+1', placeholder: '201 555 0100', onChange: fn() },
} satisfies Meta<typeof PhoneInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };
