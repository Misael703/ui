import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { YearPicker, type YearPickerProps } from './Pickers';

function Controlled(args: YearPickerProps) {
  const [y, setY] = React.useState<number | null>(args.value);
  return <YearPicker {...args} value={y} onChange={setY} />;
}

const meta = {
  title: 'Components/YearPicker',
  component: YearPicker,
  tags: ['autodocs'],
  args: { value: 2025, onChange: fn(), minYear: 2000, maxYear: 2030 },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof YearPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Year picker: decade grid with `<<`/`>>`, edge years dimmed. */
export const Default: Story = {};
