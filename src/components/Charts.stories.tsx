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

export const Donut: StoryObj = {
  render: () => (
    <div style={{ width: 280 }}>
      <DonutChart
        recharts={Recharts as any}
        data={[
          { name: 'Eléctrico', value: 42 },
          { name: 'Plomería', value: 28 },
          { name: 'Pintura', value: 18 },
          { name: 'Construcción', value: 12 },
        ]}
        centerLabel="Categorías"
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
