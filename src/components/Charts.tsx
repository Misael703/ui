'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

/**
 * Lightweight chart wrappers. We do NOT bundle Recharts — the host app provides it
 * and passes the modules in via the `recharts` prop so consumers only pay for what they use.
 *
 * Usage in a Next.js client component:
 *
 *   import * as Recharts from 'recharts';
 *   import { LineChart } from '@misael703/elalba-ui';
 *   <LineChart recharts={Recharts} data={...} dataKey="value" categoryKey="month" />
 */

export type RechartsLike = {
  ResponsiveContainer: React.ComponentType<any>;
  LineChart: React.ComponentType<any>;
  AreaChart: React.ComponentType<any>;
  BarChart: React.ComponentType<any>;
  PieChart: React.ComponentType<any>;
  Line: React.ComponentType<any>;
  Area: React.ComponentType<any>;
  Bar: React.ComponentType<any>;
  Pie: React.ComponentType<any>;
  Cell: React.ComponentType<any>;
  CartesianGrid: React.ComponentType<any>;
  XAxis: React.ComponentType<any>;
  YAxis: React.ComponentType<any>;
  Tooltip: React.ComponentType<any>;
  Legend: React.ComponentType<any>;
};

const PALETTE = [
  'var(--color-brand-blue)',
  'var(--color-brand-orange)',
  'var(--color-blue-900)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  '#6b7e95',
  '#d4a574',
];

export interface BaseChartProps<D = any> {
  recharts: RechartsLike;
  data: D[];
  height?: number;
  className?: string;
  ariaLabel?: string;
}

// ---------- LineChart ---------------------------------------------------
export interface LineChartProps<D = any> extends BaseChartProps<D> {
  categoryKey: keyof D & string;
  series: Array<{ key: keyof D & string; label?: string; color?: string }>;
  showGrid?: boolean;
  showLegend?: boolean;
  smooth?: boolean;
}

export function LineChart<D = any>({
  recharts: R, data, categoryKey, series,
  height = 280, className, ariaLabel,
  showGrid = true, showLegend = true, smooth = true,
}: LineChartProps<D>) {
  return (
    <div className={cx('chart', className)} role="img" aria-label={ariaLabel}>
      <R.ResponsiveContainer width="100%" height={height}>
        <R.LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {showGrid && <R.CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />}
          <R.XAxis dataKey={categoryKey} stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
          <R.YAxis stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
          <R.Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
          {showLegend && <R.Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <R.Line
              key={s.key}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={s.color ?? PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </R.LineChart>
      </R.ResponsiveContainer>
    </div>
  );
}

// ---------- AreaChart ---------------------------------------------------
export interface AreaChartProps<D = any> extends LineChartProps<D> {
  stacked?: boolean;
}

export function AreaChart<D = any>({
  recharts: R, data, categoryKey, series,
  height = 280, className, ariaLabel,
  showGrid = true, showLegend = true, smooth = true, stacked,
}: AreaChartProps<D>) {
  return (
    <div className={cx('chart', className)} role="img" aria-label={ariaLabel}>
      <R.ResponsiveContainer width="100%" height={height}>
        <R.AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {showGrid && <R.CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />}
          <R.XAxis dataKey={categoryKey} stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
          <R.YAxis stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
          <R.Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
          {showLegend && <R.Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <R.Area
              key={s.key}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={s.key}
              name={s.label ?? s.key}
              stackId={stacked ? '1' : undefined}
              stroke={s.color ?? PALETTE[i % PALETTE.length]}
              fill={s.color ?? PALETTE[i % PALETTE.length]}
              fillOpacity={0.18}
              strokeWidth={2}
            />
          ))}
        </R.AreaChart>
      </R.ResponsiveContainer>
    </div>
  );
}

// ---------- BarChart ----------------------------------------------------
export interface BarChartProps<D = any> extends BaseChartProps<D> {
  categoryKey: keyof D & string;
  series: Array<{ key: keyof D & string; label?: string; color?: string }>;
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function BarChart<D = any>({
  recharts: R, data, categoryKey, series,
  height = 280, className, ariaLabel,
  layout = 'vertical', stacked, showGrid = true, showLegend = true,
}: BarChartProps<D>) {
  const isHorizontal = layout === 'horizontal';
  return (
    <div className={cx('chart', className)} role="img" aria-label={ariaLabel}>
      <R.ResponsiveContainer width="100%" height={height}>
        <R.BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {showGrid && <R.CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={isHorizontal} horizontal={!isHorizontal} />}
          {isHorizontal ? (
            <>
              <R.XAxis type="number" stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
              <R.YAxis dataKey={categoryKey} type="category" stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} width={96} />
            </>
          ) : (
            <>
              <R.XAxis dataKey={categoryKey} stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
              <R.YAxis stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} />
            </>
          )}
          <R.Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'var(--bg-subtle)' }} />
          {showLegend && <R.Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <R.Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              stackId={stacked ? '1' : undefined}
              fill={s.color ?? PALETTE[i % PALETTE.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </R.BarChart>
      </R.ResponsiveContainer>
    </div>
  );
}

// ---------- DonutChart --------------------------------------------------
export interface DonutChartProps extends Omit<BaseChartProps, 'data'> {
  data: Array<{ name: string; value: number; color?: string }>;
  centerLabel?: React.ReactNode;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  recharts: R, data, height = 240, className, ariaLabel,
  centerLabel, showLegend = true, innerRadius = 60, outerRadius = 88,
}: DonutChartProps) {
  return (
    <div className={cx('chart chart--donut', className)} role="img" aria-label={ariaLabel}>
      <div className="chart__donut-area" style={{ height }}>
        <R.ResponsiveContainer width="100%" height="100%">
          <R.PieChart>
            <R.Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
            <R.Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="var(--bg-surface)"
            >
              {data.map((d, i) => <R.Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />)}
            </R.Pie>
          </R.PieChart>
        </R.ResponsiveContainer>
        {centerLabel && <div className="chart__center">{centerLabel}</div>}
      </div>
      {showLegend && (
        <ul className="chart__legend" aria-hidden="true">
          {data.map((d, i) => (
            <li key={d.name} className="chart__legend-item">
              <span
                className="chart__legend-swatch"
                style={{ background: d.color ?? PALETTE[i % PALETTE.length] }}
              />
              <span className="chart__legend-label">{d.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Sparkline ---------------------------------------------------
export interface SparklineProps<D = any> {
  recharts: RechartsLike;
  data: D[];
  dataKey: keyof D & string;
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Sparkline<D = any>({
  recharts: R, data, dataKey,
  width = 120, height = 32, color = 'var(--color-brand-blue)',
  fill = true, className, ariaLabel,
}: SparklineProps<D>) {
  return (
    <div className={cx('sparkline', className)} role="img" aria-label={ariaLabel} style={{ width, height }}>
      <R.ResponsiveContainer width="100%" height="100%">
        <R.AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <R.Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={fill ? color : 'none'}
            fillOpacity={fill ? 0.18 : 0}
            isAnimationActive={false}
          />
        </R.AreaChart>
      </R.ResponsiveContainer>
    </div>
  );
}
