import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { RadioGroup, type RadioGroupProps, type OptionItem } from './InputsExtra';

const RADIO_OPTIONS: OptionItem[] = [
  { value: 'retiro', label: 'Retiro en tienda' },
  { value: 'delivery', label: 'Entrega a domicilio' },
  { value: 'obra', label: 'Entrega en obra' },
];

function Controlled(args: RadioGroupProps) {
  const [v, setV] = React.useState(args.value);
  return <RadioGroup {...args} value={v} onChange={setV} />;
}

const meta: Meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { name: 'envio', options: RADIO_OPTIONS, value: 'retiro', onChange: fn() },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
};
export default meta;
type Story = StoryObj<RadioGroupProps>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };
