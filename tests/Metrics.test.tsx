import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DeltaBadge,
  StatCard,
  Meter,
  Sparkbar,
  ProportionBar,
  BulletChart,
  CalendarHeatmap,
} from '../src/components/Metrics';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('DeltaBadge', () => {
  it('a positive value reads as a green "up" delta', () => {
    const { container } = render(<DeltaBadge value={12.4} />);
    const badge = container.querySelector('.delta-badge')!;
    expect(badge.className).toContain('delta-badge--pos');
    expect(badge.getAttribute('aria-label')).toMatch(/^subió/);
    // signed percent, comma decimal (es)
    expect(badge.textContent).toContain('+12,4%');
  });

  it('a negative value reads as a red "down" delta', () => {
    const { container } = render(<DeltaBadge value={-3.1} />);
    expect(container.querySelector('.delta-badge')!.className).toContain('delta-badge--neg');
    expect(container.querySelector('.delta-badge')!.getAttribute('aria-label')).toMatch(/^bajó/);
  });

  it('zero (within neutralThreshold) is flat/neutral', () => {
    const { container } = render(<DeltaBadge value={0} />);
    expect(container.querySelector('.delta-badge')!.className).toContain('delta-badge--flat');
  });

  it('invert flips the tone for higher-is-worse metrics (up → red)', () => {
    const { container } = render(<DeltaBadge value={5} invert />);
    expect(container.querySelector('.delta-badge')!.className).toContain('delta-badge--neg');
  });

  it('a custom format replaces the default percent label', () => {
    const { container } = render(<DeltaBadge value={2400} format={(v) => `+${v} pedidos`} />);
    expect(container.querySelector('.delta-badge')!.textContent).toContain('+2400 pedidos');
  });

  it('tone colors map to the semantic success/danger tokens', () => {
    expect(css).toMatch(/\.delta-badge--pos\s*\{[^}]*color:\s*var\(--color-success\)/);
    expect(css).toMatch(/\.delta-badge--neg\s*\{[^}]*color:\s*var\(--color-danger\)/);
  });
});

describe('StatCard', () => {
  it('renders label, value and a delta badge from the delta prop', () => {
    const { container, getByText } = render(<StatCard label="Ventas" value="$1,2M" delta={8.2} caption="vs. ayer" />);
    expect(getByText('Ventas')).toBeTruthy();
    expect(getByText('$1,2M')).toBeTruthy();
    expect(getByText('vs. ayer')).toBeTruthy();
    expect(container.querySelector('.delta-badge--pos')).toBeTruthy();
  });

  it('accent sets the category modifier + data-accent for the left edge', () => {
    const { container } = render(<StatCard label="X" value="1" accent="cat-3" />);
    const card = container.querySelector('.metric-card')!;
    expect(card.className).toContain('metric-card--cat-3');
    expect(card.getAttribute('data-accent')).toBe('cat-3');
  });

  it('omits the foot row when there is no delta nor caption', () => {
    const { container } = render(<StatCard label="X" value="1" />);
    expect(container.querySelector('.metric-card__foot')).toBeNull();
  });
});

describe('Meter', () => {
  it('exposes role=meter with aria range values (not a progressbar)', () => {
    const { container } = render(<Meter label="Stock" value={72} max={100} />);
    const track = container.querySelector('[role="meter"]')!;
    expect(track.getAttribute('aria-valuenow')).toBe('72');
    expect(track.getAttribute('aria-valuemin')).toBe('0');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('fill width is the value position within [min,max]', () => {
    const { container } = render(<Meter value={30} min={0} max={120} showValue={false} />);
    const fill = container.querySelector('.meter__fill') as HTMLElement;
    expect(fill.style.width).toBe('25%');
  });

  it('optimum=high: above high is success, between is warn, below low is danger', () => {
    const hi = render(<Meter value={90} low={20} high={80} optimum="high" />);
    expect(hi.container.querySelector('.meter__fill')!.className).toContain('meter__fill--pos');
    const mid = render(<Meter value={50} low={20} high={80} optimum="high" />);
    expect(mid.container.querySelector('.meter__fill')!.className).toContain('meter__fill--warn');
    const lo = render(<Meter value={10} low={20} high={80} optimum="high" />);
    expect(lo.container.querySelector('.meter__fill')!.className).toContain('meter__fill--neg');
  });

  it('optimum=low inverts: below low is good', () => {
    const { container } = render(<Meter value={10} low={20} high={80} optimum="low" />);
    expect(container.querySelector('.meter__fill')!.className).toContain('meter__fill--pos');
  });

  it('no thresholds → plain primary fill', () => {
    const { container } = render(<Meter value={60} />);
    expect(container.querySelector('.meter__fill')!.className).toContain('meter__fill--primary');
  });

  it('clamps an out-of-range value to the track', () => {
    const { container } = render(<Meter value={150} max={100} showValue={false} />);
    expect((container.querySelector('.meter__fill') as HTMLElement).style.width).toBe('100%');
  });
});

describe('Sparkbar', () => {
  it('renders one bar per datum, scaled to the max', () => {
    const { container } = render(<Sparkbar data={[5, 10, 0]} />);
    const bars = container.querySelectorAll('.sparkbar__bar');
    expect(bars.length).toBe(3);
    expect((bars[1] as HTMLElement).style.height).toBe('100%'); // the max
    expect((bars[0] as HTMLElement).style.height).toBe('50%');
  });

  it('highlightLast marks the final bar', () => {
    const { container } = render(<Sparkbar data={[1, 2, 3]} highlightLast />);
    const bars = container.querySelectorAll('.sparkbar__bar');
    expect(bars[2].className).toContain('sparkbar__bar--last');
    expect(bars[0].className).not.toContain('sparkbar__bar--last');
  });
});

describe('ProportionBar', () => {
  it('segment widths are the share of the total', () => {
    const { container } = render(
      <ProportionBar segments={[{ label: 'A', value: 60 }, { label: 'B', value: 40 }]} showLegend={false} />
    );
    const segs = container.querySelectorAll('.proportion__seg');
    expect((segs[0] as HTMLElement).style.width).toBe('60%');
    expect((segs[1] as HTMLElement).style.width).toBe('40%');
  });

  it('legend shows the rounded percent per segment', () => {
    const { getByText } = render(
      <ProportionBar segments={[{ label: 'Pagado', value: 75 }, { label: 'Resto', value: 25 }]} />
    );
    expect(getByText('75%')).toBeTruthy();
    expect(getByText('25%')).toBeTruthy();
  });
});

describe('BulletChart', () => {
  it('measure width and target position map to the scale', () => {
    const { container } = render(<BulletChart value={50} target={80} max={100} />);
    expect((container.querySelector('.bullet__measure') as HTMLElement).style.width).toBe('50%');
    expect((container.querySelector('.bullet__target') as HTMLElement).style.left).toBe('80%');
  });

  it('renders one shaded band per qualitative range', () => {
    const { container } = render(<BulletChart value={50} max={100} ranges={[40, 70, 100]} />);
    expect(container.querySelectorAll('.bullet__band').length).toBe(3);
  });

  it('omits the target tick when no target given', () => {
    const { container } = render(<BulletChart value={50} max={100} />);
    expect(container.querySelector('.bullet__target')).toBeNull();
  });
});

describe('CalendarHeatmap', () => {
  it('renders one cell per datum plus a legend ramp', () => {
    const data = Array.from({ length: 14 }, (_, i) => ({ value: i }));
    const { container } = render(<CalendarHeatmap data={data} rows={7} />);
    expect(container.querySelectorAll('.heatmap__grid .heatmap__cell').length).toBe(14);
    // legend = LEVELS + 1 swatches (0..4)
    expect(container.querySelectorAll('.heatmap__legend-cell').length).toBe(5);
  });

  it('a zero-value cell uses the empty muted background, not the hue', () => {
    const { container } = render(<CalendarHeatmap data={[{ value: 0 }, { value: 9 }]} max={9} legend={false} />);
    const cells = container.querySelectorAll('.heatmap__grid .heatmap__cell');
    expect((cells[0] as HTMLElement).style.background).toContain('--bg-muted');
    expect((cells[1] as HTMLElement).style.background).toContain('--color-primary');
  });
});
