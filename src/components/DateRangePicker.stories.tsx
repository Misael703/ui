import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DateRangePicker, dateRangePresets, type DateRangePickerProps, type DateRange } from './AdvancedPickers';

const EMPTY_RANGE: DateRange = { from: null, to: null };

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function Controlled(args: DateRangePickerProps) {
  const [r, setR] = React.useState<DateRange>(args.value ?? EMPTY_RANGE);
  return <DateRangePicker {...args} value={r} onChange={setR} />;
}

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  args: {
    value: EMPTY_RANGE,
    onChange: fn(),
    presets: [
      { label: 'Últimos 7 días', range: () => ({ from: addDays(-6), to: new Date() }) },
      { label: 'Últimos 30 días', range: () => ({ from: addDays(-29), to: new Date() }) },
      { label: 'Este mes', range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
    ],
  },
  argTypes: {
    format: { control: 'inline-radio', options: ['auto', 'iso', 'dmy', 'mdy'] },
    months: { control: 'inline-radio', options: [1, 2] },
  },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Report-grade config: editable inputs, a preset seeded on load, and the
 * compact single-month layout. Opt-in — a simple filter (Default) stays lean
 * with just presets.
 */
export const ReportRange: Story = {
  name: 'Report range',
  render: () => {
    const [r, setR] = React.useState<DateRange>({ from: startOfMonth(new Date()), to: new Date() });
    return (
      <DateRangePicker
        value={r}
        onChange={setR}
        showInputs
        months={1}
        defaultPreset="Este mes"
        presets={dateRangePresets()}
      />
    );
  },
};

/**
 * Apply mode (uncontrolled): day clicks only mutate an internal draft; the
 * consumer is notified via `onApply` only when the user confirms (the
 * "Aplicar" button or a preset). Closing without applying reverts the draft
 * to the last applied value.
 */
export const ApplyMode: Story = {
  name: 'Apply mode',
  render: () => {
    const [applied, setApplied] = React.useState<DateRange>({ from: addDays(-29), to: new Date() });
    const [hits, setHits] = React.useState(0);
    const fmt = (d: Date | null) => d ? d.toISOString().slice(0, 10) : '—';
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
        <DateRangePicker
          defaultValue={{ from: addDays(-29), to: new Date() }}
          onApply={(r) => { setApplied(r); setHits((n) => n + 1); }}
          presets={[
            { label: 'Últimos 7 días', range: () => ({ from: addDays(-6), to: new Date() }) },
            { label: 'Últimos 30 días', range: () => ({ from: addDays(-29), to: new Date() }) },
            { label: 'Este mes', range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
          ]}
        />
        <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-mono, monospace)' }}>
          <div>último onApply: {fmt(applied.from)} → {fmt(applied.to)}</div>
          <div style={{ color: 'var(--fg-muted)' }}>disparos: {hits}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
          Clickea dos días dentro del calendario: no se dispara <code>onApply</code> y el botón superior
          sigue mostrando el último rango confirmado. Aplica con el botón "Aplicar" o un preset.
          Cierra con Escape o clickeando afuera — el draft revierte al último aplicado.
        </div>
      </div>
    );
  },
};
