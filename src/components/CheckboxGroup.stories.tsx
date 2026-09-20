import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { CheckboxGroup, type CheckboxGroupProps, type OptionItem } from './InputsExtra';

const CHECK_OPTIONS: OptionItem[] = [
  { value: 'factura', label: 'Enviar factura' },
  { value: 'boleta', label: 'Enviar boleta' },
  { value: 'guia', label: 'Enviar guía de despacho' },
];

function Controlled(args: CheckboxGroupProps) {
  const [v, setV] = React.useState(args.value);
  return <CheckboxGroup {...args} value={v} onChange={setV} />;
}

const meta: Meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  args: { options: CHECK_OPTIONS, value: ['factura'], onChange: fn() },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
};
export default meta;
type Story = StoryObj<CheckboxGroupProps>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };
