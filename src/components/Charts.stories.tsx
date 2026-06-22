import type { Meta, StoryObj } from '@storybook/react';
import * as Recharts from 'recharts';
import { LineChart, AreaChart, BarChart, DonutChart, Sparkline } from './Charts';

export default { title: 'Data Display/Charts', tags: ['autodocs'] } as Meta;

const monthlyData = [
  { mes: 'Ene', ventas: 4200, devoluciones: 320 },
  { mes: 'Feb', ventas: 3800, devoluciones: 280 },
  { mes: 'Mar', ventas: 5100, devoluciones: 410 },
  { mes: 'Abr', ventas: 4900, devoluciones: 350 },
  { mes: 'May', ventas: 6200, devoluciones: 480 },
  { mes: 'Jun', ventas: 5800, devoluciones: 420 },
];

export const Linea: StoryObj = {
  render: () => (
    <div style={{ width: 600 }}>
      <LineChart
        recharts={Recharts as any}
        data={monthlyData}
        categoryKey="mes"
        series={[
          { key: 'ventas', label: 'Ventas' },
          { key: 'devoluciones', label: 'Devoluciones' },
        ]}
      />
    </div>
  ),
};

export const Area: StoryObj = {
  render: () => (
    <div style={{ width: 600 }}>
      <AreaChart
        recharts={Recharts as any}
        data={monthlyData}
        categoryKey="mes"
        series={[
          { key: 'ventas', label: 'Ventas' },
          { key: 'devoluciones', label: 'Devoluciones' },
        ]}
        stacked
      />
    </div>
  ),
};

export const Barras: StoryObj = {
  render: () => (
    <div style={{ width: 600 }}>
      <BarChart
        recharts={Recharts as any}
        data={monthlyData}
        categoryKey="mes"
        series={[{ key: 'ventas', label: 'Ventas' }]}
      />
    </div>
  ),
};

// Non-actionable chart (no drill-down): opt out of recharts' keyboard layer so the
// svg isn't a Tab stop. The keyboard focus ring (when enabled) is :focus-visible only.
export const BarrasSinTabStop: StoryObj = {
  render: () => (
    <div style={{ width: 600 }}>
      <BarChart
        recharts={Recharts as any}
        data={monthlyData}
        categoryKey="mes"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        accessibilityLayer={false}
      />
    </div>
  ),
};

// Horizontal bars: the value end (right) is rounded, not the top.
export const BarrasHorizontal: StoryObj = {
  render: () => (
    <div style={{ width: 600 }}>
      <BarChart
        recharts={Recharts as any}
        data={monthlyData}
        categoryKey="mes"
        series={[{ key: 'ventas', label: 'Ventas' }]}
        layout="horizontal"
        valueFormatter={(n) => `$${n.toLocaleString('es-CL')}`}
      />
    </div>
  ),
};

// Count data with a small max (1): the value axis auto-detects integers and shows
// only whole ticks (0, 1) — no 0.25/0.5/0.75.
export const BarrasConteo: StoryObj = {
  render: () => (
    <div style={{ width: 480 }}>
      <BarChart
        recharts={Recharts as any}
        data={[
          { estado: 'Anuladas', n: 1 },
          { estado: 'Reembolsadas', n: 0 },
          { estado: 'Rechazadas', n: 1 },
        ]}
        categoryKey="estado"
        series={[{ key: 'n', label: 'Pedidos' }]}
        showLegend={false}
      />
    </div>
  ),
};

// Decimal data: auto-detection leaves allowDecimals=true, so fractional ticks show.
export const Decimales: StoryObj = {
  render: () => (
    <div style={{ width: 560 }}>
      <LineChart
        recharts={Recharts as any}
        data={[
          { mes: 'Ene', ticket: 12.4 },
          { mes: 'Feb', ticket: 13.7 },
          { mes: 'Mar', ticket: 12.9 },
          { mes: 'Abr', ticket: 14.2 },
        ]}
        categoryKey="mes"
        series={[{ key: 'ticket', label: 'Ticket promedio (UF)' }]}
        showLegend={false}
      />
    </div>
  ),
};

// Dense daily series with long ISO labels: thinned + rotated + formatted ticks,
// an honest `linear` curve, AND a formatted tooltip label (shows `18 may`, not the
// raw ISO — the tooltip reuses xTickFormatter by default).
const dailyData = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  // deterministic-ish counts with some zeros
  const v = [0, 3, 0, 7, 12, 5, 0, 9][i % 8] + (i % 5);
  return { fecha: `2026-05-${String(day).padStart(2, '0')}`, ventas: v };
});

export const LineaDensa: StoryObj = {
  render: () => (
    <div style={{ width: 700 }}>
      <LineChart
        recharts={Recharts as any}
        data={dailyData}
        categoryKey="fecha"
        series={[{ key: 'ventas', label: 'Ventas diarias' }]}
        curve="linear"
        xTickFormatter={(v) => v.slice(8)}
        xTickAngle={-45}
        xTickInterval="preserveStartEnd"
        showLegend={false}
      />
    </div>
  ),
};

export const Donut: StoryObj = {
  render: () => (
    <div style={{ width: 280 }}>
      <DonutChart
        recharts={Recharts as any}
        data={[
          { name: 'V_REGION', value: 42 },
          { name: 'RM_METROPOLITANA', value: 28 },
          { name: 'VIII_BIOBIO', value: 18 },
          { name: 'IV_COQUIMBO', value: 12 },
        ]}
        centerLabel="Regiones"
        nameFormatter={(n) => n.replace(/_/g, ' ')}
        valueFormatter={(v) => `${v}%`}
      />
    </div>
  ),
};

export const SparklineDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'inline-block' }}>
      <Sparkline
        recharts={Recharts as any}
        data={monthlyData}
        dataKey="ventas"
        width={120}
        height={32}
      />
    </div>
  ),
};
