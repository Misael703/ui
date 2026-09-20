import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DatePicker, type DatePickerProps } from './Pickers';

function Controlled(args: DatePickerProps) {
  const [d, setD] = React.useState<Date | null>(args.value);
  return (
    <div>
      <DatePicker {...args} value={d} onChange={setD} />
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-muted)' }}>
        Format derives from <code>configureBrand().locale</code> (default <code>es-CL</code> → <code>dd-mm-aaaa</code>).
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { value: null, onChange: fn() },
  argTypes: { format: { control: 'inline-radio', options: ['auto', 'iso', 'dmy', 'mdy'] } },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * `isDateDisabled` takes a `(date) => boolean` predicate. Days it flags true
 * render greyed, non-clickable and out of the tab order. Composes with
 * `minDate`/`maxDate`. Here Sundays are disabled (`d => d.getDay() === 0`) —
 * the rule shows up on the calendar itself, not in a hint.
 */
export const DisabledDays: Story = {
  render: () => {
    const [d, setD] = React.useState<Date | null>(null);
    return (
      <div>
        <DatePicker value={d} onChange={setD} isDateDisabled={(date) => date.getDay() === 0} />
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-muted)' }}>
          Sundays disabled via <code>isDateDisabled</code>.
        </p>
      </div>
    );
  },
};

export const Formats: Story = {
  render: () => {
    const [d, setD] = React.useState<Date | null>(new Date(2026, 4, 2));
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 320 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <strong>auto (es-CL → dmy)</strong>
          <DatePicker value={d} onChange={setD} format="auto" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <strong>iso</strong>
          <DatePicker value={d} onChange={setD} format="iso" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <strong>explicit dmy</strong>
          <DatePicker value={d} onChange={setD} format="dmy" />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <strong>explicit mdy</strong>
          <DatePicker value={d} onChange={setD} format="mdy" />
        </label>
      </div>
    );
  },
};
