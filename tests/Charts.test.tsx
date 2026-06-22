import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LineChart, AreaChart, BarChart, DonutChart, Sparkline } from '../src/components/Charts';

const indexCss = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * The chart wrappers inject recharts via the `recharts` prop. We pass a MOCK
 * recharts whose components record the props they receive, so we can assert the
 * exact contract the wrapper hands to recharts (radius tuple, XAxis interval/
 * formatter/angle, Line type, Tooltip formatter) — no real recharts, no DOM
 * sizing needed. This is precisely the surface the despachos bugs were about.
 */
type Captured = { tag: string; props: Record<string, any> };

function makeRecharts(capture: Captured[]) {
  const mk = (tag: string) => (props: Record<string, any>) => {
    capture.push({ tag, props });
    return React.createElement('div', { 'data-tag': tag }, props.children ?? null);
  };
  return {
    ResponsiveContainer: (props: any) => React.createElement('div', null, props.children),
    LineChart: mk('LineChart'), AreaChart: mk('AreaChart'), BarChart: mk('BarChart'), PieChart: mk('PieChart'),
    Line: mk('Line'), Area: mk('Area'), Bar: mk('Bar'), Pie: mk('Pie'), Cell: mk('Cell'),
    CartesianGrid: mk('CartesianGrid'), XAxis: mk('XAxis'), YAxis: mk('YAxis'),
    Tooltip: mk('Tooltip'), Legend: mk('Legend'),
  } as any;
}

const data = [{ d: '2026-05-01', ventas: 10 }, { d: '2026-05-02', ventas: 0 }, { d: '2026-05-03', ventas: 7 }];
const series = [{ key: 'ventas' as const, label: 'Ventas' }];
const find = (cap: Captured[], tag: string) => cap.filter((c) => c.tag === tag);

describe('BarChart radius is orientation-aware', () => {
  it('vertical bars (columns) round the top — [R,R,0,0]', () => {
    const cap: Captured[] = [];
    render(<BarChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    expect(find(cap, 'Bar')[0].props.radius).toEqual([4, 4, 0, 0]);
  });

  it('horizontal bars round the value end (right) — [0,R,R,0]', () => {
    const cap: Captured[] = [];
    render(<BarChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} layout="horizontal" />);
    expect(find(cap, 'Bar')[0].props.radius).toEqual([0, 4, 4, 0]);
  });

  it('stacked: only the outermost segment carries the end radius', () => {
    const cap: Captured[] = [];
    const two = [{ key: 'a' as const }, { key: 'b' as const }];
    render(<BarChart recharts={makeRecharts(cap)} data={[{ d: 'x', a: 1, b: 2 }] as any} categoryKey="d" series={two as any} stacked />);
    const bars = find(cap, 'Bar');
    expect(bars[0].props.radius).toEqual([0, 0, 0, 0]); // inner segment, square
    expect(bars[1].props.radius).toEqual([4, 4, 0, 0]); // outermost, rounded
  });
});

describe('Category X-axis tick controls', () => {
  it('defaults to interval=preserveStartEnd (auto-thin dense axes)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    // LineChart: the only XAxis is the category axis.
    expect(find(cap, 'XAxis')[0].props.interval).toBe('preserveStartEnd');
  });

  it('passes xTickFormatter + a custom interval through to the category axis', () => {
    const cap: Captured[] = [];
    const fmt = (v: string) => v.slice(5);
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} xTickFormatter={fmt} xTickInterval={2} />);
    const x = find(cap, 'XAxis')[0].props;
    expect(x.tickFormatter).toBe(fmt);
    expect(x.interval).toBe(2);
  });

  it('xTickAngle rotates labels with end anchor + reserved height', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} xTickAngle={-45} />);
    const x = find(cap, 'XAxis')[0].props;
    expect(x.angle).toBe(-45);
    expect(x.textAnchor).toBe('end');
    expect(x.height).toBe(56);
  });

  it('on horizontal bars the category axis is the Y axis (formatter applies, no rotation)', () => {
    const cap: Captured[] = [];
    const fmt = (v: string) => v.toUpperCase();
    render(<BarChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} layout="horizontal" xTickFormatter={fmt} xTickAngle={-45} />);
    const y = find(cap, 'YAxis')[0].props;
    expect(y.tickFormatter).toBe(fmt);
    expect(y.angle).toBeUndefined(); // horizontal category labels are not rotated
  });
});

describe('valueFormatter (value axis + tooltip)', () => {
  it('feeds the numeric Y axis tickFormatter and the tooltip formatter', () => {
    const cap: Captured[] = [];
    const money = (n: number) => `$${n}`;
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} valueFormatter={money} />);
    expect(typeof find(cap, 'YAxis')[0].props.tickFormatter).toBe('function');
    expect(find(cap, 'YAxis')[0].props.tickFormatter(10)).toBe('$10');
    expect(typeof find(cap, 'Tooltip')[0].props.formatter).toBe('function');
  });

  it('is omitted when not provided (no formatter prop leaks)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    expect(find(cap, 'YAxis')[0].props.tickFormatter).toBeUndefined();
    expect(find(cap, 'Tooltip')[0].props.formatter).toBeUndefined();
  });
});

describe('LineChart curve (interpolation)', () => {
  it('defaults to monotone (smooth, back-compat)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    expect(find(cap, 'Line')[0].props.type).toBe('monotone');
  });

  it('smooth={false} → linear (existing API still works)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} smooth={false} />);
    expect(find(cap, 'Line')[0].props.type).toBe('linear');
  });

  it('curve takes precedence over smooth', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} smooth curve="linear" />);
    expect(find(cap, 'Line')[0].props.type).toBe('linear');
  });

  it('AreaChart honors curve too', () => {
    const cap: Captured[] = [];
    render(<AreaChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} curve="linear" />);
    expect(find(cap, 'Area')[0].props.type).toBe('linear');
  });
});

describe('DonutChart formatters', () => {
  it('nameFormatter rewrites legend labels', () => {
    const cap: Captured[] = [];
    const { getByText } = render(
      <DonutChart
        recharts={makeRecharts(cap)}
        data={[{ name: 'V_REGION', value: 5 }]}
        nameFormatter={(n) => n.replace('_', ' ')}
      />
    );
    expect(getByText('V REGION')).toBeTruthy();
  });

  it('tooltip formatter returns [value, name] both formatted', () => {
    const cap: Captured[] = [];
    render(
      <DonutChart
        recharts={makeRecharts(cap)}
        data={[{ name: 'A', value: 5 }]}
        nameFormatter={(n) => `name:${n}`}
        valueFormatter={(v) => `$${v}`}
      />
    );
    const f = find(cap, 'Tooltip')[0].props.formatter;
    expect(f(5, 'A')).toEqual(['$5', 'name:A']);
  });
});

const decimalData = [{ d: 'a', ventas: 1.5 }, { d: 'b', ventas: 2 }];

describe('Value axis allowDecimals (count data → integer ticks)', () => {
  it('auto: an all-integer series sets allowDecimals=false on the value axis', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    expect(find(cap, 'YAxis')[0].props.allowDecimals).toBe(false);
  });

  it('auto: any fractional value keeps allowDecimals=true', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={decimalData} categoryKey="d" series={series} />);
    expect(find(cap, 'YAxis')[0].props.allowDecimals).toBe(true);
  });

  it('an explicit allowDecimals overrides the auto-detection', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} allowDecimals />);
    expect(find(cap, 'YAxis')[0].props.allowDecimals).toBe(true);
  });

  it('BarChart horizontal: the numeric value axis (XAxis) carries allowDecimals', () => {
    const cap: Captured[] = [];
    render(<BarChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} layout="horizontal" />);
    const valueX = find(cap, 'XAxis').find((c) => c.props.type === 'number')!;
    expect(valueX.props.allowDecimals).toBe(false);
  });
});

describe('Tooltip category-label formatting', () => {
  it('defaults the tooltip labelFormatter to xTickFormatter (axis ↔ tooltip match)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} xTickFormatter={(v) => `D${v}`} />);
    const lf = find(cap, 'Tooltip')[0].props.labelFormatter;
    expect(typeof lf).toBe('function');
    expect(lf('2026-05-01')).toBe('D2026-05-01');
  });

  it('tooltipLabelFormatter overrides the axis formatter', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} xTickFormatter={(v) => `X${v}`} tooltipLabelFormatter={(v) => `T${v}`} />);
    expect(find(cap, 'Tooltip')[0].props.labelFormatter('a')).toBe('Ta');
  });

  it('no labelFormatter when neither is provided (raw category, back-compat)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    expect(find(cap, 'Tooltip')[0].props.labelFormatter).toBeUndefined();
  });
});

describe('Sparkline hover dot', () => {
  it('disables the active dot by default (glanceable; nothing to clip)', () => {
    const cap: Captured[] = [];
    render(<Sparkline recharts={makeRecharts(cap)} data={data} dataKey="ventas" />);
    expect(find(cap, 'Area')[0].props.activeDot).toBe(false);
    expect(find(cap, 'Tooltip').length).toBe(0);
  });

  it('interactive enables a dot with widened margins + a tooltip', () => {
    const cap: Captured[] = [];
    render(<Sparkline recharts={makeRecharts(cap)} data={data} dataKey="ventas" interactive />);
    expect(find(cap, 'Area')[0].props.activeDot).toMatchObject({ r: 2.5 });
    expect(find(cap, 'AreaChart')[0].props.margin).toMatchObject({ top: 4, right: 4, bottom: 4, left: 4 });
    expect(find(cap, 'Tooltip').length).toBe(1);
  });
});

describe('Sparkline is inert when non-interactive', () => {
  it('the non-interactive sparkline has no --interactive class', () => {
    const cap: Captured[] = [];
    const { container } = render(<Sparkline recharts={makeRecharts(cap)} data={data} dataKey="ventas" />);
    expect(container.querySelector('.sparkline')!.classList.contains('sparkline--interactive')).toBe(false);
  });

  it('interactive adds the class that re-enables interaction', () => {
    const cap: Captured[] = [];
    const { container } = render(<Sparkline recharts={makeRecharts(cap)} data={data} dataKey="ventas" interactive />);
    expect(container.querySelector('.sparkline')!.classList.contains('sparkline--interactive')).toBe(true);
  });

  it('CSS: base sparkline is pointer-events:none, --interactive restores auto', () => {
    expect(indexCss).toMatch(/\.sparkline\s*\{[^}]*pointer-events:\s*none/);
    expect(indexCss).toMatch(/\.sparkline--interactive\s*\{[^}]*pointer-events:\s*auto/);
  });
});

describe('Tooltip sizing/positioning', () => {
  it('caps the tooltip width and wraps by default (no overflow on narrow charts)', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} />);
    const cs = find(cap, 'Tooltip')[0].props.contentStyle;
    expect(cs.maxWidth).toBe('min(220px, 90vw)');
    expect(cs.whiteSpace).toBe('normal');
    expect(find(cap, 'Tooltip')[0].props.allowEscapeViewBox).toBeUndefined();
  });

  it('tooltip.maxWidth overrides the default', () => {
    const cap: Captured[] = [];
    render(<LineChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} tooltip={{ maxWidth: 160 }} />);
    expect(find(cap, 'Tooltip')[0].props.contentStyle.maxWidth).toBe(160);
  });

  it('tooltip.allowEscapeViewBox is passed through (Bar)', () => {
    const cap: Captured[] = [];
    render(<BarChart recharts={makeRecharts(cap)} data={data} categoryKey="d" series={series} tooltip={{ allowEscapeViewBox: { x: true } }} />);
    expect(find(cap, 'Tooltip')[0].props.allowEscapeViewBox).toEqual({ x: true });
  });

  it('DonutChart also caps + wraps its tooltip', () => {
    const cap: Captured[] = [];
    render(<DonutChart recharts={makeRecharts(cap)} data={[{ name: 'A', value: 5 }]} />);
    expect(find(cap, 'Tooltip')[0].props.contentStyle.whiteSpace).toBe('normal');
  });
});
