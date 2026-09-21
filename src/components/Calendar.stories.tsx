import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Calendar, type CalendarEvent } from './Display3';

// Hoisted for a stable reference across re-renders.
const CALENDAR_EVENTS: CalendarEvent[] = [
  { date: new Date(2026, 8, 16), label: 'Entrega pedido #1042', tone: 'info' },
  { date: new Date(2026, 8, 16), label: 'Visita cliente VIP', tone: 'warning' },
  { date: new Date(2026, 8, 18), label: 'Vencimiento factura', tone: 'danger' },
  { date: new Date(2026, 8, 21), label: 'Inventario', tone: 'success' },
  { date: new Date(2026, 8, 21), label: 'Reunión equipo', tone: 'info' },
  { date: new Date(2026, 8, 21), label: 'Capacitación', tone: 'neutral' },
];

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  args: { month: new Date(2026, 8, 16), events: CALENDAR_EVENTS, onDayClick: fn() },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ maxWidth: 720 }}>
      <Calendar {...a} />
    </div>
  ),
};
