import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { TimePicker, type TimePickerProps } from './InputsExtra';

function Controlled(args: TimePickerProps) {
  const [v, setV] = React.useState(args.value);
  return <TimePicker {...args} value={v} onChange={setV} />;
}

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  args: { value: '09:30', onChange: fn() },
  argTypes: {
    granularity: { control: 'inline-radio', options: ['hour', 'minute', 'second'] },
  },
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };

/**
 * `granularity` sets the precision. The control is an on-brand custom
 * popover (spinner columns), not the browser's native control. `'minute'`
 * (default) shows hour + minute columns and accepts any minute (e.g. 14:37);
 * `'second'` adds a seconds column (HH:mm:ss); `'hour'` is a single column
 * (value HH:00). `step` thins the finest column for the chosen granularity.
 */
export const Granularity: Story = {
  render: () => {
    const [minute, setMinute] = React.useState('14:37');
    const [second, setSecond] = React.useState('14:37:09');
    const [hour, setHour] = React.useState('14:00');
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 280 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Minuto (cualquiera) — {minute}</span>
          <TimePicker value={minute} onChange={setMinute} granularity="minute" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Segundo — {second}</span>
          <TimePicker value={second} onChange={setSecond} granularity="second" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Solo hora — {hour}</span>
          <TimePicker value={hour} onChange={setHour} granularity="hour" />
        </label>
      </div>
    );
  },
};
