import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DeltaBadge,
  StatCard,
  Meter,
  Sparkbar,
  ProportionBar,
  BulletChart,
  CalendarHeatmap,
} from './Metrics';
import { formatCurrency } from '../utils/format';
import { ShoppingCart, Wallet, Users, Package } from './Icons';

export default { title: 'Data/Metrics', tags: ['autodocs'] } as Meta;

const row: React.CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 };

export const Delta: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <DeltaBadge value={12.4} />
      <DeltaBadge value={-3.1} />
      <DeltaBadge value={0} />
      <DeltaBadge value={8.5} invert />
      <DeltaBadge value={-4.2} invert />
      <DeltaBadge value={2400} format={(v) => `${v > 0 ? '+' : ''}${v} pedidos`} />
      <DeltaBadge value={12.4} size="sm" />
    </div>
  ),
};

const trendData = [12, 18, 14, 22, 19, 28, 24, 31, 27, 35];

export const Cards: StoryObj = {
  render: () => (
    <div style={row}>
      <StatCard
        accent="cat-2"
        icon={<Wallet size={16} />}
        label="Ventas hoy"
        value={formatCurrency(1284500)}
        delta={8.2}
        caption="vs. ayer"
        chart={<Sparkbar data={trendData} highlightLast height={36} />}
      />
      <StatCard
        accent="cat-1"
        icon={<ShoppingCart size={16} />}
        label="Pedidos"
        value="342"
        delta={-4.1}
        caption="vs. ayer"
      />
      <StatCard
        accent="cat-4"
        icon={<Users size={16} />}
        label="Clientes nuevos"
        value="28"
        delta={0}
        caption="estable"
      />
      <StatCard
        accent="cat-5"
        icon={<Package size={16} />}
        label="Margen de error"
        value="1,8%"
        delta={3.4}
        deltaInvert
        caption="vs. semana"
      />
    </div>
  ),
};

// Async loading: label/icon stay (a KPI's identity is known before its number),
// value + delta become skeletons and the card is aria-busy.
export const CardsLoading: StoryObj = {
  render: () => (
    <div style={row}>
      <StatCard accent="cat-2" icon={<Wallet size={16} />} label="Ventas hoy" value="—" loading />
      <StatCard accent="cat-1" icon={<ShoppingCart size={16} />} label="Pedidos" value="—" loading />
      <StatCard accent="cat-4" icon={<Users size={16} />} label="Clientes nuevos" value="—" loading />
    </div>
  ),
};

export const Meters: StoryObj = {
  render: () => (
    <div style={col}>
      <Meter label="Stock cemento" value={72} low={20} high={80} optimum="high" valueLabel="72 / 100 sacos" />
      <Meter label="Presupuesto usado" value={88} low={70} high={90} optimum="low" valueLabel="88%" />
      <Meter label="Capacidad bodega" value={45} low={30} high={85} optimum="middle" />
      <Meter label="Avance simple (sin umbrales)" value={60} />
    </div>
  ),
};

export const Bars: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
      <Sparkbar data={trendData} ariaLabel="tendencia ventas" />
      <Sparkbar data={trendData} highlightLast color="var(--cat-2)" />
      <div style={{ width: 200 }}>
        <Sparkbar data={[4, 8, 6, 10, 7, 12, 9, 14]} highlightLast height={48} />
      </div>
    </div>
  ),
};

export const Proportion: StoryObj = {
  render: () => (
    <div style={col}>
      <ProportionBar
        ariaLabel="estado de cobros"
        segments={[
          { label: 'Pagado', value: 62 },
          { label: 'Pendiente', value: 28 },
          { label: 'Vencido', value: 10 },
        ]}
      />
      <ProportionBar
        height={14}
        segments={[
          { label: 'Cemento', value: 40 },
          { label: 'Fierro', value: 25 },
          { label: 'Áridos', value: 20 },
          { label: 'Otros', value: 15 },
        ]}
      />
    </div>
  ),
};

export const Bullets: StoryObj = {
  render: () => (
    <div style={col}>
      <BulletChart label="Ventas vs. meta" value={234} target={260} ranges={[150, 220, 300]} valueLabel="$234K" tone="primary" />
      <BulletChart label="Satisfacción" value={88} target={90} ranges={[60, 80, 100]} valueLabel="88%" tone="success" />
      <BulletChart label="Tiempo de despacho" value={52} target={40} ranges={[30, 50, 70]} valueLabel="52 min" tone="warning" />
    </div>
  ),
};

export const Heatmap: StoryObj = {
  render: () => {
    // 12 weeks of synthetic daily activity (deterministic).
    const data = Array.from({ length: 84 }, (_, i) => ({
      date: `d${i}`,
      value: Math.round((Math.sin(i / 3) + 1) * 4) % 9,
    }));
    return <CalendarHeatmap data={data} rows={7} ariaLabel="actividad últimas 12 semanas" />;
  },
};

// A composed mini-dashboard to validate the pieces read well together.
export const Dashboard: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', maxWidth: 920 }}>
      <StatCard accent="cat-2" icon={<Wallet size={16} />} label="Ingresos" value={formatCurrency(4820000)} delta={12.4} caption="vs. mes anterior" chart={<Sparkbar data={trendData} highlightLast />} />
      <StatCard accent="cat-1" icon={<ShoppingCart size={16} />} label="Pedidos" value="1.284" delta={-2.3} caption="vs. mes anterior" />
      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 16, padding: 16, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-surface)' }}>
        <ProportionBar segments={[{ label: 'Pagado', value: 62 }, { label: 'Pendiente', value: 28 }, { label: 'Vencido', value: 10 }]} />
        <Meter label="Meta mensual" value={82} low={50} high={90} optimum="high" valueLabel="82%" />
      </div>
    </div>
  ),
};
