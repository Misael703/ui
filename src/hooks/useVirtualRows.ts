'use client';
import * as React from 'react';

/**
 * Fixed-height row windowing, zero dependencies. Renders only the rows
 * inside (viewport + overscan) and replaces the rest with two pixel-exact
 * spacers, so a 10k-row table costs ~40 DOM rows.
 *
 * Deliberately FIXED-height only: variable heights need a measurement
 * cache (tanstack-virtual territory) and the kit's dense table rows are
 * uniform by design. Anything that breaks uniformity (row expansion,
 * mobile cards, wrapping `comfortable` cells) must not be combined with
 * this — `DataTable` gates those combinations off automatically.
 */
export interface UseVirtualRowsOptions {
  /** Total row count (the full dataset length, not the rendered window). */
  count: number;
  /** Fixed pixel height of every row. The math trusts it: measure once in devtools. */
  rowHeight: number;
  /** Extra rows rendered above/below the viewport. Default 6. */
  overscan?: number;
  /**
   * When `false` the hook is inert and returns the full range with zero
   * padding — callers keep one uniform render path instead of forking on
   * "virtual or not" (hooks can't be called conditionally).
   */
  enabled?: boolean;
}

export interface VirtualRowsRange {
  /** First rendered index (inclusive). */
  start: number;
  /** Last rendered index (exclusive). */
  end: number;
  /** Pixel height of the spacer above the window. */
  padTop: number;
  /** Pixel height of the spacer below the window. */
  padBottom: number;
}

/**
 * Rows visible before the first measurement (SSR / first paint, where the
 * scroller's clientHeight is unknown). Tall enough to fill any reasonable
 * bounded table once, without rendering thousands server-side.
 */
const INITIAL_WINDOW = 40;

export function useVirtualRows(
  scrollRef: React.RefObject<HTMLElement | null>,
  { count, rowHeight, overscan = 6, enabled = true }: UseVirtualRowsOptions
): VirtualRowsRange {
  const [range, setRange] = React.useState({ start: 0, end: Math.min(count, INITIAL_WINDOW) });

  React.useEffect(() => {
    if (!enabled) return;
    const el = scrollRef.current;
    if (!el) return;

    const compute = () => {
      // Quantized by row: setRange bails on identical ranges, so scrolling
      // inside the same row window costs zero re-renders.
      const visible = Math.ceil((el.clientHeight || 0) / rowHeight);
      const first = Math.floor(el.scrollTop / rowHeight);
      const start = Math.max(0, first - overscan);
      const end = Math.min(count, first + visible + overscan);
      setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    compute();
    el.addEventListener('scroll', compute, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(compute) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', compute);
      ro?.disconnect();
    };
  }, [enabled, scrollRef, count, rowHeight, overscan]);

  if (!enabled) return { start: 0, end: count, padTop: 0, padBottom: 0 };
  const start = Math.min(range.start, count);
  const end = Math.min(range.end, count);
  return {
    start,
    end,
    padTop: start * rowHeight,
    padBottom: (count - end) * rowHeight,
  };
}
