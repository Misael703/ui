import type { Meta, StoryObj } from '@storybook/react';
import { CalendarHeatmap } from './Metrics';

// 12 weeks of synthetic daily activity (deterministic).
const HEAT = Array.from({ length: 84 }, (_, i) => ({
  date: `d${i}`,
  value: Math.round((Math.sin(i / 3) + 1) * 4) % 9,
}));

const meta = {
  title: 'Components/CalendarHeatmap',
  component: CalendarHeatmap,
  tags: ['autodocs'],
  args: { data: HEAT },
} satisfies Meta<typeof CalendarHeatmap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => <CalendarHeatmap {...a} rows={7} ariaLabel="actividad últimas 12 semanas" />,
};
