'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { formatNumber } from '../utils/format';
import { ArrowUp, ArrowDown, Minus } from './Icons';
import { Skeleton } from './Display';
import type { CardAccent } from './Display';

/**
 * Dashboard data-communication primitives. Everything here is CSS-only — no
 * recharts dependency — so consumers can drop dense micro-viz into cards and
 * table cells without paying for a chart library. The heavyweight charts
 * (Line/Area/Bar/Donut) still live in Charts.tsx behind the BYO-recharts seam.
 */

// ---------- DeltaBadge --------------------------------------------------
// A sign-driven variation pill: ▲ +12,4% (good) / ▼ −3,1% (bad) / – 0% (flat).
// Pulls the trend logic that used to be locked inside Stat into a reusable
// atom for table cells, cards, anywhere. `invert` flips the tone (not the
// arrow) for "higher is worse" metrics like error rate or cost.
export type DeltaTone = 'pos' | 'neg' | 'flat';

export interface DeltaBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The variation. Sign drives direction + tone; magnitude is formatted. */
  value: number;
  /** Full-label formatter (incl. sign). Default: signed percent, e.g. `+12,4%`. */
  format?: (value: number) => string;
  /** Higher-is-worse: an increase shows ▲ but in red (cost, error rate, churn). */
  invert?: boolean;
  /** |value| ≤ this renders flat/neutral. Default 0. */
  neutralThreshold?: number;
  /** Hide the directional arrow, keep the colored number. */
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const SIGNED_PERCENT = (v: number): string => {
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${formatNumber(Math.abs(v), { maximumFractionDigits: 1 })}%`;
};

export function DeltaBadge({
  value, format = SIGNED_PERCENT, invert = false, neutralThreshold = 0,
  showIcon = true, size = 'md', className, ...rest
}: DeltaBadgeProps) {
  const dir: 'up' | 'down' | 'flat' =
    value > neutralThreshold ? 'up' : value < -neutralThreshold ? 'down' : 'flat';
  const tone: DeltaTone =
    dir === 'flat' ? 'flat' : dir === 'up' ? (invert ? 'neg' : 'pos') : (invert ? 'pos' : 'neg');
  const Icon = dir === 'up' ? ArrowUp : dir === 'down' ? ArrowDown : Minus;
  const verb = dir === 'up' ? 'subió' : dir === 'down' ? 'bajó' : 'sin cambio';
  const text = format(value);

  return (
    <span
      className={cx('delta-badge', `delta-badge--${tone}`, size === 'sm' && 'delta-badge--sm', className)}
      aria-label={`${verb} ${text}`}
      {...rest}
    >
      {showIcon && <Icon size={size === 'sm' ? 11 : 13} aria-hidden />}
      <span className="delta-badge__text">{text}</span>
    </span>
  );
}

// ---------- StatCard ----------------------------------------------------
// The flagship KPI atom: leading icon + label, a large tabular value, a
// DeltaBadge + comparison caption, and an optional chart slot (Sparkline /
// Sparkbar). A standalone surface (does not depend on Card) so it composes in
// any grid. `accent` tints the left edge with a category hue.
export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Convenience: renders a DeltaBadge. Omit and pass `deltaNode` for full control. */
  delta?: number;
  deltaFormat?: (value: number) => string;
  deltaInvert?: boolean;
  /** Escape hatch when `delta` isn't enough (custom node in the delta slot). */
  deltaNode?: React.ReactNode;
  /** Caption next to the delta, e.g. "vs. mes anterior". */
  caption?: React.ReactNode;
  /** Small leading glyph rendered in a tinted chip. */
  icon?: React.ReactNode;
  /** Accent tint + border. A category hue (`cat-1`…`cat-6`) for grouping, or a
   *  semantic role (`danger`, `success`, …) for a KPI in an alarm/health state. */
  accent?: CardAccent;
  /** Micro-viz slot (Sparkline / Sparkbar / ProportionBar). */
  chart?: React.ReactNode;
  /**
   * Skeleton the value + delta while data is loading. The label/icon stay (a
   * KPI's identity is known before its number is), and the card is marked
   * `aria-busy`. Metric surfaces feed on async data, so this is first-class.
   */
  loading?: boolean;
}

export function StatCard({
  label, value, delta, deltaFormat, deltaInvert, deltaNode, caption, icon, accent, chart, loading,
  className, ...rest
}: StatCardProps) {
  const deltaEl =
    deltaNode ??
    (delta !== undefined ? <DeltaBadge value={delta} format={deltaFormat} invert={deltaInvert} size="sm" /> : null);

  if (loading) {
    return (
      <div
        className={cx('metric-card', accent && `metric-card--${accent}`, className)}
        data-accent={accent}
        aria-busy="true"
        {...rest}
      >
        <div className="metric-card__head">
          {icon && <span className="metric-card__icon" aria-hidden>{icon}</span>}
          <span className="metric-card__label">{label}</span>
        </div>
        <div className="metric-card__value"><Skeleton width="55%" height={26} /></div>
        <div className="metric-card__foot"><Skeleton width={64} height={13} rounded /></div>
      </div>
    );
  }

  return (
    <div
      className={cx('metric-card', accent && `metric-card--${accent}`, className)}
      data-accent={accent}
      {...rest}
    >
      <div className="metric-card__head">
        {icon && <span className="metric-card__icon" aria-hidden>{icon}</span>}
        <span className="metric-card__label">{label}</span>
      </div>
      <div className="metric-card__value">{value}</div>
      {(deltaEl || caption) && (
        <div className="metric-card__foot">
          {deltaEl}
          {caption && <span className="metric-card__caption">{caption}</span>}
        </div>
      )}
      {chart && <div className="metric-card__chart">{chart}</div>}
    </div>
  );
}

// ---------- Meter -------------------------------------------------------
// A value within a range, with optional qualitative thresholds that drive the
// fill tone. Distinct from Progress: `role="meter"` is a static measurement
// (stock level, budget used, capacity), not a task advancing to 100%.
export type MeterOptimum = 'low' | 'high' | 'middle';

export interface MeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  min?: number;
  max?: number;
  /** Lower threshold boundary (for tone zones). */
  low?: number;
  /** Upper threshold boundary (for tone zones). */
  high?: number;
  /** Where "good" lives. Default `high` (more is better). */
  optimum?: MeterOptimum;
  label?: React.ReactNode;
  /** Value caption. String or formatter; default shows `value/max`. */
  valueLabel?: React.ReactNode | ((value: number, max: number) => React.ReactNode);
  showValue?: boolean;
  size?: 'sm' | 'md';
}

function meterTone(value: number, low: number | undefined, high: number | undefined, optimum: MeterOptimum): DeltaTone | 'warn' {
  if (low === undefined && high === undefined) return 'pos'; // no thresholds → neutral-positive (primary)
  const lo = low ?? -Infinity;
  const hi = high ?? Infinity;
  if (optimum === 'high') return value >= hi ? 'pos' : value >= lo ? 'warn' : 'neg';
  if (optimum === 'low') return value <= lo ? 'pos' : value <= hi ? 'warn' : 'neg';
  return value >= lo && value <= hi ? 'pos' : 'warn'; // middle
}

export function Meter({
  value, min = 0, max = 100, low, high, optimum = 'high',
  label, valueLabel, showValue = true, size = 'md', className, ...rest
}: MeterProps) {
  const clamped = Math.min(Math.max(value, min), max);
  const pct = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
  const tone = meterTone(value, low, high, optimum);
  const hasThresholds = low !== undefined || high !== undefined;
  const caption =
    typeof valueLabel === 'function' ? valueLabel(value, max)
    : valueLabel !== undefined ? valueLabel
    : `${formatNumber(value)} / ${formatNumber(max)}`;

  return (
    <div className={cx('meter', size === 'sm' && 'meter--sm', className)} {...rest}>
      {(label || showValue) && (
        <div className="meter__head">
          {label && <span className="meter__label">{label}</span>}
          {showValue && <span className="meter__value">{caption}</span>}
        </div>
      )}
      <div
        className="meter__track"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : undefined}
      >
        <div
          className={cx('meter__fill', hasThresholds ? `meter__fill--${tone}` : 'meter__fill--primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------- Sparkbar ----------------------------------------------------
// Inline mini bars, CSS-only. The bar counterpart to Sparkline — drop a
// distribution into a table cell or StatCard without recharts.
export interface SparkbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  data: number[];
  height?: number;
  /** Scale ceiling. Default: max of `data`. */
  max?: number;
  color?: string;
  /** Emphasize the most recent bar (full opacity + secondary hue). */
  highlightLast?: boolean;
  /** Gap between bars in px. Default 2. */
  gap?: number;
  ariaLabel?: string;
}

export function Sparkbar({
  data, height = 32, max, color = 'var(--color-primary)', highlightLast = false,
  gap = 2, ariaLabel, className, style, ...rest
}: SparkbarProps) {
  const ceiling = max ?? Math.max(1, ...data.map((d) => (Number.isFinite(d) ? d : 0)));
  return (
    <div
      className={cx('sparkbar', className)}
      role="img"
      aria-label={ariaLabel}
      style={{ height, gap, ...style }}
      {...rest}
    >
      {data.map((d, i) => {
        const isLast = highlightLast && i === data.length - 1;
        const h = ceiling > 0 ? Math.max(2, (Math.max(0, d) / ceiling) * 100) : 2;
        return (
          <span
            key={i}
            className={cx('sparkbar__bar', isLast && 'sparkbar__bar--last')}
            style={{ height: `${h}%`, background: isLast ? 'var(--color-secondary)' : color }}
          />
        );
      })}
    </div>
  );
}

// ---------- ProportionBar -----------------------------------------------
// A single 100%-stacked bar for an inline category breakdown (paid / pending /
// overdue) — the lightweight alternative to a donut when you just need shares.
export interface ProportionSegment {
  label: string;
  value: number;
  color?: string;
}

export interface ProportionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  segments: ProportionSegment[];
  /** Denominator override (e.g. show partial fill against a known total). */
  total?: number;
  showLegend?: boolean;
  showPercent?: boolean;
  height?: number;
  ariaLabel?: string;
}

const CAT_HUES = ['var(--cat-1)', 'var(--cat-2)', 'var(--cat-4)', 'var(--cat-5)', 'var(--cat-3)', 'var(--cat-6)'];

export function ProportionBar({
  segments, total, showLegend = true, showPercent = true, height = 10,
  ariaLabel, className, ...rest
}: ProportionBarProps) {
  const sum = total ?? segments.reduce((a, s) => a + Math.max(0, s.value), 0);
  const pctOf = (v: number) => (sum > 0 ? (Math.max(0, v) / sum) * 100 : 0);

  return (
    <div className={cx('proportion', className)} {...rest}>
      <div className="proportion__track" role="img" aria-label={ariaLabel} style={{ height }}>
        {segments.map((s, i) => {
          const pct = pctOf(s.value);
          if (pct <= 0) return null;
          return (
            <span
              key={s.label}
              className="proportion__seg"
              style={{ width: `${pct}%`, background: s.color ?? CAT_HUES[i % CAT_HUES.length] }}
              title={`${s.label}: ${formatNumber(s.value)}`}
            />
          );
        })}
      </div>
      {showLegend && (
        <ul className="proportion__legend">
          {segments.map((s, i) => (
            <li key={s.label} className="proportion__legend-item">
              <span className="proportion__swatch" style={{ background: s.color ?? CAT_HUES[i % CAT_HUES.length] }} />
              <span className="proportion__legend-label">{s.label}</span>
              {showPercent && <span className="proportion__legend-pct">{formatNumber(pctOf(s.value), { maximumFractionDigits: 0 })}%</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- BulletChart -------------------------------------------------
// Stephen Few's bullet graph (2006): a compact actual-vs-target bar over
// qualitative ranges. Communicates more per pixel than a gauge — built for
// dense KPI rows. CSS-only.
export type BulletTone = 'primary' | 'success' | 'warning' | 'danger';

export interface BulletChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  /** Comparative marker (the vertical tick). */
  target?: number;
  min?: number;
  /** Scale end. Default: max of value/target/ranges. */
  max?: number;
  /** Qualitative range boundaries (ascending). Shaded light→dark behind the bar. */
  ranges?: number[];
  label?: React.ReactNode;
  valueLabel?: React.ReactNode;
  tone?: BulletTone;
  height?: number;
  ariaLabel?: string;
}

export function BulletChart({
  value, target, min = 0, max, ranges = [], label, valueLabel, tone = 'primary',
  height = 22, ariaLabel, className, ...rest
}: BulletChartProps) {
  const scaleMax = max ?? Math.max(value, target ?? 0, ...ranges, 1);
  const span = scaleMax - min || 1;
  const toPct = (v: number) => Math.min(100, Math.max(0, ((v - min) / span) * 100));
  // Build cumulative band stops so each qualitative band has increasing tint.
  const sortedRanges = [...ranges].sort((a, b) => a - b);
  const bands = sortedRanges.map((r, i) => ({ from: i === 0 ? min : sortedRanges[i - 1], to: r, level: i }));

  return (
    <div className={cx('bullet', className)} {...rest}>
      {(label || valueLabel) && (
        <div className="bullet__head">
          {label && <span className="bullet__label">{label}</span>}
          {valueLabel && <span className="bullet__value">{valueLabel}</span>}
        </div>
      )}
      <div
        className="bullet__track"
        role="img"
        aria-label={ariaLabel ?? (typeof label === 'string' ? `${label}: ${value}${target !== undefined ? ` de ${target}` : ''}` : undefined)}
        style={{ height }}
      >
        {bands.map((b) => (
          <span
            key={b.level}
            className="bullet__band"
            style={{ left: `${toPct(b.from)}%`, width: `${toPct(b.to) - toPct(b.from)}%`, opacity: 0.12 + b.level * 0.1 }}
          />
        ))}
        <span className={cx('bullet__measure', `bullet__measure--${tone}`)} style={{ width: `${toPct(value)}%` }} />
        {target !== undefined && <span className="bullet__target" style={{ left: `${toPct(target)}%` }} aria-hidden />}
      </div>
    </div>
  );
}

// ---------- CalendarHeatmap ---------------------------------------------
// An intensity grid (GitHub-contributions style): cells tinted by value into
// discrete buckets. Column-major fill (each column = a week, rows = weekdays).
export interface HeatmapCell {
  /** Optional key/date for accessibility + keys. */
  date?: string;
  label?: React.ReactNode;
  value: number;
}

export interface CalendarHeatmapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  data: HeatmapCell[];
  /** Rows in the grid (column-major flow). Default 7 (weekdays). */
  rows?: number;
  /** Intensity ceiling. Default: max of `data`. */
  max?: number;
  /** Base hue tinted by intensity. Default primary. */
  color?: string;
  cellSize?: number;
  gap?: number;
  legend?: boolean;
  ariaLabel?: string;
}

const LEVELS = 4; // intensity buckets above zero

export function CalendarHeatmap({
  data, rows = 7, max, color = 'var(--color-primary)', cellSize = 13, gap = 3,
  legend = true, ariaLabel, className, style, ...rest
}: CalendarHeatmapProps) {
  const ceiling = max ?? Math.max(1, ...data.map((d) => (Number.isFinite(d.value) ? d.value : 0)));
  const bucket = (v: number): number => {
    if (v <= 0) return 0;
    return Math.min(LEVELS, Math.ceil((v / ceiling) * LEVELS));
  };
  // opacity ramp per bucket so the base hue reads light→saturated.
  const tint = (level: number) => (level === 0 ? 'var(--bg-muted)' : color);
  const opacity = (level: number) => (level === 0 ? 1 : 0.25 + (level / LEVELS) * 0.75);

  return (
    <div className={cx('heatmap', className)} {...rest}>
      <div
        className="heatmap__grid"
        role="img"
        aria-label={ariaLabel}
        style={{
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gridAutoColumns: `${cellSize}px`,
          gap,
          ...style,
        }}
      >
        {data.map((d, i) => {
          const level = bucket(d.value);
          return (
            <span
              key={d.date ?? i}
              className="heatmap__cell"
              style={{ background: tint(level), opacity: opacity(level), borderRadius: 'var(--radius-sm)' }}
              title={d.label != null ? String(d.label) : d.date ? `${d.date}: ${formatNumber(d.value)}` : formatNumber(d.value)}
            />
          );
        })}
      </div>
      {legend && (
        <div className="heatmap__legend">
          <span className="heatmap__legend-text">menos</span>
          {Array.from({ length: LEVELS + 1 }, (_, l) => (
            <span key={l} className="heatmap__cell heatmap__legend-cell" style={{ background: tint(l), opacity: opacity(l), borderRadius: 'var(--radius-sm)' }} />
          ))}
          <span className="heatmap__legend-text">más</span>
        </div>
      )}
    </div>
  );
}
