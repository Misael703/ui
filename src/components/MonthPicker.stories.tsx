import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { MonthPicker, type MonthPickerProps } from './Pickers';

function Controlled(args: MonthPickerProps) {
  const [m, setM] = React.useState<Date | null>(args.value);
  return <MonthPicker {...args} value={m} onChange={setM} />;
}

const meta = {
  title: 'Components/MonthPicker',
  component: MonthPicker,
  tags: ['autodocs'],
  args: { value: new Date(2026, 4, 1), onChange: fn() },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof MonthPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Month picker: 3×4 month grid, navigation by year. */
export const Default: Story = {};
