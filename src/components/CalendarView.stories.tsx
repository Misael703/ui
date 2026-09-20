import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CalendarView } from './CalendarView';
import { isSameDay } from '../utils/dateFormat';

interface CalArgs { leaf: 'days' | 'months' | 'years'; range: boolean; disableSundays: boolean; single: boolean }

const meta = {
  title: 'Components/CalendarView',
  component: CalendarView,
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarView>;
export default meta;
type Story = StoryObj<CalArgs>;

/**
 * **Calendar playground.** The single `CalendarView` (v3.9.0) shared by
 * `DatePicker`, `DateRangePicker`, `MonthPicker` and `YearPicker`, on its
 * own. The header is the same across the three views: prev/next as square
 * ghost buttons and the title as a button with a chevron that climbs a
 * level (days → months → years); picking a year descends to months, a
 * month to days, until `leaf` is reached. Today carries a dot, the selected
 * day a filled circle; a range renders as a band with rounded ends.
 * Keyboard: arrows, Home/End, PageUp/PageDown, Escape climbs a level.
 */
export const Playground: Story = {
  name: 'Playground · calendar',
  args: { leaf: 'days', range: true, disableSundays: false, single: true },
  argTypes: {
    leaf: { control: 'inline-radio', options: ['days', 'months', 'years'], description: 'Leaf view: what it reports (DatePicker = days · MonthPicker = months · YearPicker = years)' },
    range: { control: 'boolean', description: 'Paints a range from the 3rd to the 12th with a band' },
    disableSundays: { control: 'boolean' },
    single: { control: 'boolean', description: 'One panel; off shows two panels like DateRangePicker' },
  },
  render: (a) => {
    const [month, setMonth] = React.useState(() => new Date(2026, 8, 1));
    const [picked, setPicked] = React.useState<Date | null>(new Date(2026, 8, 9));
    const from = new Date(2026, 8, 3), to = new Date(2026, 8, 12);
    const dayState = (d: Date, col: number) => {
      if (!a.range) return { selected: !!picked && isSameDay(d, picked) };
      const sel = isSameDay(d, from) || isSameDay(d, to);
      const band = d >= from && d <= to;
      return { selected: sel, band, roundL: band ? (col === 0 || isSameDay(d, from)) : sel, roundR: band ? (col === 6 || isSameDay(d, to)) : sel };
    };
    const panel = (offset: number, n: number) => (
      <CalendarView
        key={offset}
        leaf={a.leaf}
        month={new Date(month.getFullYear(), month.getMonth() + offset, 1)}
        onMonthChange={(m) => setMonth(new Date(m.getFullYear(), m.getMonth() - offset, 1))}
        navPrev={offset === 0}
        navNext={offset === n - 1}
        dayState={dayState}
        isDayDisabled={a.disableSundays ? (d) => d.getDay() === 0 : undefined}
        onSelectDay={setPicked}
        selectedMonth={picked}
        selectedYear={picked?.getFullYear() ?? null}
      />
    );
    const n = a.single ? 1 : 2;
    return (
      <div style={{ display: 'inline-grid', gridAutoFlow: 'column', gap: 24, padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
        {Array.from({ length: n }, (_, i) => panel(i, n))}
      </div>
    );
  },
};
