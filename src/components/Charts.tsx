'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

/**
 * Lightweight chart wrappers. We do NOT bundle Recharts — the host app provides it
 * and passes the modules in via the `recharts` prop so consumers only pay for what they use.
 *
 * Recharts is treated as an implicit peer dependency: install it in the host
 * app if you use any chart component. Use **recharts ≥ 3** — earlier versions use
 * `defaultProps` on function components, which logs a deprecation warning under
 * React 19. recharts 3 removed them; these wrappers use default parameters, so on
 * recharts 3.8+ the console stays clean (verified).
 *
 * Usage in a Next.js client component:
 *
 *   import * as Recharts from 'recharts';
 *   import { LineChart } from '@misael703/ui';
 *   <LineChart recharts={Recharts} data={...} dataKey="value" categoryKey="month" />
 */

// Structural mirror of the Recharts public API. `any` is intentional here:
// each Recharts component has a different prop shape, and typing them
// exhaustively would mean depending on `recharts` types — which would force
// consumers to install recharts even when they don't use any chart.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RechartsComp = React.ComponentType<any>;

export type RechartsLike = {
  ResponsiveContainer: RechartsComp;
  LineChart: RechartsComp;
  AreaChart: RechartsComp;
  BarChart: RechartsComp;
  PieChart: RechartsComp;
  Line: RechartsComp;
  Area: RechartsComp;
  Bar: RechartsComp;
  Pie: RechartsComp;
  Cell: RechartsComp;
  CartesianGrid: RechartsComp;
  XAxis: RechartsComp;
  YAxis: RechartsComp;
  Tooltip: RechartsComp;
  Legend: RechartsComp;
};

const PALETTE = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-primary-900)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  '#6b7e95',
  '#d4a574',
];

/** Tooltip chrome shared by every chart. */
export interface ChartTooltipConfig {
  /**
   * Cap the tooltip width so long content wraps instead of overflowing a narrow
   * (mobile) chart. Default `min(220px, 90vw)`. Number = px; or any CSS length.
   */
  maxWidth?: number | string;
  /** Let the tooltip escape the chart's plotting box. Default: recharts (stays inside). */
  allowEscapeViewBox?: { x?: boolean; y?: boolean };
}

export interface BaseChartProps<D = any> {
  recharts: RechartsLike;
  data: D[];
  height?: number;
  className?: string;
  ariaLabel?: string;
  /** Tooltip sizing/positioning. By default the tooltip caps its width and wraps. */
  tooltip?: ChartTooltipConfig;
  /**
   * recharts' keyboard-navigation layer (puts `tabindex=0` on the svg + arrow-key
   * navigation). Default `true`. Set `false` for a non-actionable chart so it's
   * not a Tab stop / not focusable (no drill-down → nothing to navigate to).
   */
  accessibilityLayer?: boolean;
}

// Mirror of Recharts' AxisInterval. Controls how category ticks thin on
// collision so dense series (e.g. daily points) don't crowd the axis.
export type AxisInterval =
  | number
  | 'preserveStart'
  | 'preserveEnd'
  | 'preserveStartEnd'
  | 'equidistantPreserveStart'
  | 'equidistantPreserveEnd';

// Shared cartesian controls (Line/Area/Bar). DonutChart/Sparkline don't have a
// category axis, so they keep BaseChartProps.
export interface CartesianChartProps<D = any> extends BaseChartProps<D> {
  categoryKey: keyof D & string;
  series: Array<{ key: keyof D & string; label?: string; color?: string }>;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Format each category-axis tick label, e.g. shorten `2026-05-23`. → XAxis.tickFormatter */
  xTickFormatter?: (value: string) => string;
  /** Thin out category ticks on collision. → XAxis.interval. Default `preserveStartEnd`. */
  xTickInterval?: AxisInterval;
  /** Rotate category-axis labels N degrees (anchors end + reserves height so they don't clip). */
  xTickAngle?: number;
  /** Format numeric values (value-axis ticks + tooltip). */
  valueFormatter?: (value: number) => string;
  /**
   * Allow fractional value-axis ticks. Default: auto — `false` when every series
   * value is an integer (count data → no `0.25` ticks), `true` otherwise. Pass
   * explicitly to override the auto-detection.
   */
  allowDecimals?: boolean;
  /**
   * Format the category label in the tooltip. Defaults to `xTickFormatter` so the
   * tooltip matches the axis (e.g. both show `18 jun`, not the raw `2026-06-18`).
   */
  tooltipLabelFormatter?: (value: string) => string;
}

const DEFAULT_X_INTERVAL: AxisInterval = 'preserveStartEnd';

// Recharts XAxis/YAxis are `any`-typed (structural mirror), so tick controls go
// in as a spread. `rotate` is off when the category axis is the Y axis
// (horizontal bars: those labels are already horizontal).
function categoryTickProps(
  opts: Pick<CartesianChartProps, 'xTickFormatter' | 'xTickInterval' | 'xTickAngle'>,
  rotate = true,
): Record<string, unknown> {
  const props: Record<string, unknown> = { interval: opts.xTickInterval ?? DEFAULT_X_INTERVAL };
  if (opts.xTickFormatter) props.tickFormatter = opts.xTickFormatter;
  if (rotate && opts.xTickAngle) {
    props.angle = opts.xTickAngle;
    props.textAnchor = 'end';
    props.height = 56; // reserve room so the rotated label isn't clipped
  }
  return props;
}

// Value axis: `allowDecimals` (count data → integer-only ticks) + optional
// numeric tick formatter.
function valueAxisProps(valueFormatter: ((v: number) => string) | undefined, allowDecimals: boolean): Record<string, unknown> {
  const props: Record<string, unknown> = { allowDecimals };
  if (valueFormatter) props.tickFormatter = (v: number) => valueFormatter(Number(v));
  return props;
}

// Tooltip box style: the kit chrome + a width cap with wrapping so long content
// (long labels / many series) doesn't overflow a narrow chart. `min(220px, 90vw)`
// stays inside on mobile and caps to 220px on desktop.
const TOOLTIP_BASE_STYLE = { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 } as const;

function tooltipContentStyle(tooltip?: ChartTooltipConfig): Record<string, unknown> {
  return { ...TOOLTIP_BASE_STYLE, maxWidth: tooltip?.maxWidth ?? 'min(220px, 90vw)', whiteSpace: 'normal' };
}

function tooltipChrome(tooltip?: ChartTooltipConfig): Record<string, unknown> {
  return tooltip?.allowEscapeViewBox ? { allowEscapeViewBox: tooltip.allowEscapeViewBox } : {};
}

// Tooltip: value formatter + a category-label formatter that defaults to the
// axis tick formatter (so the hovered label matches the axis).
function tooltipProps(
  valueFormatter: ((v: number) => string) | undefined,
  tooltipLabelFormatter: ((v: string) => string) | undefined,
  xTickFormatter: ((v: string) => string) | undefined,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (valueFormatter) props.formatter = (v: unknown) => valueFormatter(Number(v));
  const labelFormatter = tooltipLabelFormatter ?? xTickFormatter;
  if (labelFormatter) props.labelFormatter = (v: unknown) => labelFormatter(String(v));
  return props;
}

// True when every plotted value is an integer → drives the `allowDecimals` auto-
// detection (count series shouldn't get `0.25`-style ticks).
function allIntegerValues<D>(data: D[], keys: string[]): boolean {
  for (const row of data) {
    for (const k of keys) {
      const v = (row as Record<string, unknown>)[k];
      if (typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v)) return false;
    }
  }
  return true;
}

// ---------- LineChart ---------------------------------------------------
export interface LineChartProps<D = any> extends CartesianChartProps<D> {
  smooth?: boolean;
  /** Interpolation. `monotone` smooths (default, back-compat); `linear` draws honest
   *  straight segments — recommended for counts/stepped series (no phantom humps over zeros). */
  curve?: 'linear' | 'monotone';
}

export function LineChart<D = any>({
  recharts: R, data, categoryKey, series,
  height = 280, className, ariaLabel,
  showGrid = true, showLegend = true, smooth = true, curve,
  xTickFormatter, xTickInterval, xTickAngle, valueFormatter, allowDecimals, tooltipLabelFormatter, tooltip, accessibilityLayer = true,
}: LineChartProps<D>) {
  const lineType = curve ?? (smooth ? 'monotone' : 'linear');
  const allowDec = allowDecimals ?? !allIntegerValues(data, series.map((s) => s.key));
  return (
    <div className={cx('chart', className)} role="img" aria-label={ariaLabel}>
      <R.ResponsiveContainer width="100%" height={height}>
        <R.LineChart data={data} accessibilityLayer={accessibilityLayer} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {showGrid && <R.CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />}
          <R.XAxis dataKey={categoryKey} stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...categoryTickProps({ xTickFormatter, xTickInterval, xTickAngle })} />
          <R.YAxis stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...valueAxisProps(valueFormatter, allowDec)} />
          <R.Tooltip contentStyle={tooltipContentStyle(tooltip)} {...tooltipChrome(tooltip)} {...tooltipProps(valueFormatter, tooltipLabelFormatter, xTickFormatter)} />
          {showLegend && <R.Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <R.Line
              key={s.key}
              type={lineType}
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
  showGrid = true, showLegend = true, smooth = true, curve, stacked,
  xTickFormatter, xTickInterval, xTickAngle, valueFormatter, allowDecimals, tooltipLabelFormatter, tooltip, accessibilityLayer = true,
}: AreaChartProps<D>) {
  const lineType = curve ?? (smooth ? 'monotone' : 'linear');
  const allowDec = allowDecimals ?? !allIntegerValues(data, series.map((s) => s.key));
  return (
    <div className={cx('chart', className)} role="img" aria-label={ariaLabel}>
      <R.ResponsiveContainer width="100%" height={height}>
        <R.AreaChart data={data} accessibilityLayer={accessibilityLayer} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {showGrid && <R.CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />}
          <R.XAxis dataKey={categoryKey} stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...categoryTickProps({ xTickFormatter, xTickInterval, xTickAngle })} />
          <R.YAxis stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...valueAxisProps(valueFormatter, allowDec)} />
          <R.Tooltip contentStyle={tooltipContentStyle(tooltip)} {...tooltipChrome(tooltip)} {...tooltipProps(valueFormatter, tooltipLabelFormatter, xTickFormatter)} />
          {showLegend && <R.Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <R.Area
              key={s.key}
              type={lineType}
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
export interface BarChartProps<D = any> extends CartesianChartProps<D> {
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

const BAR_RADIUS = 4;

export function BarChart<D = any>({
  recharts: R, data, categoryKey, series,
  height = 280, className, ariaLabel,
  layout = 'vertical', stacked, showGrid = true, showLegend = true,
  xTickFormatter, xTickInterval, xTickAngle, valueFormatter, allowDecimals, tooltipLabelFormatter, tooltip, accessibilityLayer = true,
}: BarChartProps<D>) {
  const isHorizontal = layout === 'horizontal';
  const allowDec = allowDecimals ?? !allIntegerValues(data, series.map((s) => s.key));
  // Radius must round the VALUE end: top for columns ([tl,tr,br,bl] → [R,R,0,0]),
  // right for horizontal bars ([0,R,R,0]). The old hardcoded [4,4,0,0] left
  // horizontal bars rounded-top / pointed-bottom.
  const endRadius = isHorizontal ? [0, BAR_RADIUS, BAR_RADIUS, 0] : [BAR_RADIUS, BAR_RADIUS, 0, 0];
  const lastIdx = series.length - 1;
  const catTicks = categoryTickProps({ xTickFormatter, xTickInterval, xTickAngle });
  const catTicksNoRotate = categoryTickProps({ xTickFormatter, xTickInterval, xTickAngle }, false);
  return (
    <div className={cx('chart', className)} role="img" aria-label={ariaLabel}>
      <R.ResponsiveContainer width="100%" height={height}>
        <R.BarChart data={data} accessibilityLayer={accessibilityLayer} layout={isHorizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          {showGrid && <R.CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={isHorizontal} horizontal={!isHorizontal} />}
          {isHorizontal ? (
            <>
              <R.XAxis type="number" stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...valueAxisProps(valueFormatter, allowDec)} />
              <R.YAxis dataKey={categoryKey} type="category" stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} width={96} {...catTicksNoRotate} />
            </>
          ) : (
            <>
              <R.XAxis dataKey={categoryKey} stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...catTicks} />
              <R.YAxis stroke="var(--fg-subtle)" fontSize={12} tickLine={false} axisLine={false} {...valueAxisProps(valueFormatter, allowDec)} />
            </>
          )}
          <R.Tooltip contentStyle={tooltipContentStyle(tooltip)} {...tooltipChrome(tooltip)} cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipProps(valueFormatter, tooltipLabelFormatter, xTickFormatter)} />
          {showLegend && <R.Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => {
            // Stacked: only the outermost (last) segment carries the end radius;
            // inner segments stay square so the stack reads as one bar.
            const barRadius = stacked ? (i === lastIdx ? endRadius : [0, 0, 0, 0]) : endRadius;
            return (
              <R.Bar
                key={s.key}
                dataKey={s.key}
                name={s.label ?? s.key}
                stackId={stacked ? '1' : undefined}
                fill={s.color ?? PALETTE[i % PALETTE.length]}
                radius={barRadius}
                maxBarSize={48}
              />
            );
          })}
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
  /** Format slice names in tooltip + legend, e.g. `V_REGION` → `V Región` (no need to pre-map the data). */
  nameFormatter?: (name: string) => string;
  /** Format slice values in the tooltip. */
  valueFormatter?: (value: number) => string;
}

export function DonutChart({
  recharts: R, data, height = 240, className, ariaLabel,
  centerLabel, showLegend = true, innerRadius = 60, outerRadius = 88,
  nameFormatter, valueFormatter, tooltip, accessibilityLayer = true,
}: DonutChartProps) {
  // Recharts Tooltip formatter returns [formattedValue, formattedName].
  const tooltipProps = (nameFormatter || valueFormatter)
    ? { formatter: (v: unknown, n: unknown) => [valueFormatter ? valueFormatter(Number(v)) : v, nameFormatter ? nameFormatter(String(n)) : n] }
    : {};
  return (
    <div className={cx('chart chart--donut', className)} role="img" aria-label={ariaLabel}>
      <div className="chart__donut-area" style={{ height }}>
        <R.ResponsiveContainer width="100%" height="100%">
          <R.PieChart accessibilityLayer={accessibilityLayer}>
            <R.Tooltip contentStyle={tooltipContentStyle(tooltip)} {...tooltipChrome(tooltip)} {...tooltipProps} />
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
              <span className="chart__legend-label">{nameFormatter ? nameFormatter(d.name) : d.name}</span>
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
  /**
   * Show a hover dot. Default `false` — a sparkline is glanceable/non-interactive
   * (the fine detail lives in the big LineChart). When off there's no active dot
   * to clip at the edges/base; when on, the margins are widened so it isn't cut.
   */
  interactive?: boolean;
  /** Tooltip sizing/positioning (only used when `interactive`). */
  tooltip?: ChartTooltipConfig;
  className?: string;
  ariaLabel?: string;
}

export function Sparkline<D = any>({
  recharts: R, data, dataKey,
  width = 120, height = 32, color = 'var(--color-primary)',
  fill = true, interactive = false, tooltip, className, ariaLabel,
}: SparklineProps<D>) {
  // No hover dot by default (it clips against the tiny margins at the first/last
  // point and the baseline). When interactive, leave room so it can't be cut off.
  const margin = interactive ? { top: 4, right: 4, bottom: 4, left: 4 } : { top: 2, right: 0, bottom: 2, left: 0 };
  return (
    <div className={cx('sparkline', interactive && 'sparkline--interactive', className)} role="img" aria-label={ariaLabel} style={{ width, height }}>
      <R.ResponsiveContainer width="100%" height="100%">
        <R.AreaChart data={data} accessibilityLayer={interactive} margin={margin}>
          {interactive && <R.Tooltip contentStyle={tooltipContentStyle(tooltip)} {...tooltipChrome(tooltip)} />}
          <R.Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={fill ? color : 'none'}
            fillOpacity={fill ? 0.18 : 0}
            isAnimationActive={false}
            activeDot={interactive ? { r: 2.5, strokeWidth: 0, fill: color } : false}
          />
        </R.AreaChart>
      </R.ResponsiveContainer>
    </div>
  );
}
