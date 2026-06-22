import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DateRangePicker, dateRangePresets } from '../src/components/AdvancedPickers';
import { DatePicker } from '../src/components/Pickers';
import { buildMonthGrid6 } from '../src/utils/dateFormat';

const DAY = 86_400_000;

// June 2026 starts on a Monday, so the first week is 1(Mon)..7(Sun).
const RANGE = { from: new Date(2026, 5, 1), to: new Date(2026, 5, 10) };

const openWith = (props: Record<string, unknown>) => {
  const utils = render(<DateRangePicker format="dmy" {...props} />);
  fireEvent.click(utils.container.querySelector('.daterange__trigger') as HTMLElement);
  return utils;
};
// Only the in-month days are buttons; adjacent-month days are greyed spans.
const day = (n: number) =>
  [...document.querySelectorAll('button.daterange__day')].find((b) => b.textContent === String(n)) as HTMLElement;

beforeEach(() => { document.body.innerHTML = ''; });

describe('DateRangePicker — continuous band (always-on)', () => {
  it('rounds (square radius) only at the range ends + row edges; mid-row stays square', () => {
    openWith({ value: RANGE, onChange: () => {}, months: 1 });
    // Range start (1) rounds left only; range end (10) rounds right only.
    expect(day(1).className).toContain('is-selected');
    expect(day(1).className).toContain('is-band');
    expect(day(1).className).toContain('is-rl');
    expect(day(1).className).not.toContain('is-rr');
    expect(day(10).className).toContain('is-selected');
    expect(day(10).className).toContain('is-rr');
    expect(day(10).className).not.toContain('is-rl');
    // Row edges: Sunday (7, col 6) rounds right; Monday (8, col 0) rounds left.
    expect(day(7).className).toContain('is-rr');
    expect(day(7).className).not.toContain('is-selected');
    expect(day(7).className).not.toContain('is-rl');
    expect(day(8).className).toContain('is-rl');
    // Mid-row day: square on both sides (bridges into the band).
    expect(day(5).className).toContain('is-band');
    expect(day(5).className).not.toContain('is-rl');
    expect(day(5).className).not.toContain('is-rr');
  });

  it('a lone endpoint (no range yet) shows no band but a fully-rounded square', () => {
    openWith({ value: { from: new Date(2026, 5, 15), to: null }, onChange: () => {}, months: 1 });
    expect(day(15).className).toContain('is-selected');
    expect(day(15).className).not.toContain('is-band');
    // Lone selection rounds all four corners (square block).
    expect(day(15).className).toContain('is-rl');
    expect(day(15).className).toContain('is-rr');
  });
});

describe('DateRangePicker — showInputs (opt-in)', () => {
  it('renders the Desde/Hasta fields only when enabled', () => {
    openWith({ value: RANGE, onChange: () => {}, showInputs: true });
    expect(document.querySelectorAll('.daterange__field-input').length).toBe(2);
  });

  it('no inputs by default', () => {
    openWith({ value: RANGE, onChange: () => {} });
    expect(document.querySelectorAll('.daterange__field-input').length).toBe(0);
  });

  it('typing a valid date in "Desde" commits the parsed range', () => {
    const onChange = vi.fn();
    openWith({ value: RANGE, onChange, showInputs: true });
    const fromInput = document.querySelectorAll('.daterange__field-input')[0] as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: '05-06-2026' } });
    fireEvent.blur(fromInput, { target: { value: '05-06-2026' } });
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls.at(-1)![0];
    expect(next.from.getFullYear()).toBe(2026);
    expect(next.from.getMonth()).toBe(5);
    expect(next.from.getDate()).toBe(5);
  });

  it('an unparseable date reverts the field instead of committing', () => {
    const onChange = vi.fn();
    openWith({ value: RANGE, onChange, showInputs: true });
    const fromInput = document.querySelectorAll('.daterange__field-input')[0] as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: 'xx-yy-zzzz' } });
    fireEvent.blur(fromInput, { target: { value: 'xx-yy-zzzz' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('DateRangePicker — monthDropdown (opt-in)', () => {
  it('shows a month/year trigger instead of the static title; selecting jumps the view', () => {
    openWith({ value: RANGE, onChange: () => {}, monthDropdown: true, months: 1 });
    const trigger = document.querySelector('.daterange__monthjump-trigger') as HTMLElement;
    expect(trigger.textContent).toMatch(/2026/);
    // No static title when the dropdown owns the label.
    expect(document.querySelector('.daterange__title')).toBeNull();
    // Open the menu and jump to January.
    fireEvent.click(trigger);
    const menu = document.querySelector('.daterange__menu');
    expect(menu).not.toBeNull();
    const jan = [...document.querySelectorAll('.daterange__menu-month')].find((b) => b.textContent === 'Ene') as HTMLElement;
    fireEvent.click(jan);
    expect((document.querySelector('.daterange__monthjump-trigger') as HTMLElement).textContent).toMatch(/Enero/);
  });
});

describe('buildMonthGrid6 — fixed 6-row grid with adjacent days', () => {
  it('always returns 42 cells regardless of the month shape', () => {
    // Feb 2026 (28 days, starts Sunday) is a worst-case short month; still 42.
    expect(buildMonthGrid6(new Date(2026, 1, 1)).cells.length).toBe(42);
    // A 6-week month stays 42 too.
    expect(buildMonthGrid6(new Date(2026, 7, 1)).cells.length).toBe(42);
  });

  it('tags leading/trailing days as outside and the month days as inside', () => {
    const { cells } = buildMonthGrid6(new Date(2026, 1, 1)); // February 2026
    const inside = cells.filter((c) => !c.outside);
    expect(inside.length).toBe(28); // Feb 2026
    expect(inside[0].date.getDate()).toBe(1);
    expect(inside[0].date.getMonth()).toBe(1);
    // First cell is a leading day from January (outside).
    expect(cells[0].outside).toBe(true);
    expect(cells[0].date.getMonth()).toBe(0);
    // Last cell is a trailing day from March (outside).
    expect(cells[41].outside).toBe(true);
    expect(cells[41].date.getMonth()).toBe(2);
  });
});

describe('Date pickers — stable height (adjacent days rendered, not selectable)', () => {
  it('DateRangePicker renders a full 42-cell grid; outside days are greyed non-buttons', () => {
    openWith({ value: RANGE, onChange: () => {}, months: 1 });
    const grid = document.querySelector('.daterange__grid') as HTMLElement;
    // 7 weekday headers + 42 day cells.
    expect(grid.querySelectorAll('.daterange__day').length).toBe(42);
    const outside = grid.querySelectorAll('.daterange__day.is-outside');
    expect(outside.length).toBeGreaterThan(0);
    outside.forEach((el) => expect(el.tagName).toBe('SPAN'));
  });

  it('DatePicker renders a full 42-cell grid too', () => {
    const { container } = render(<DatePicker value={new Date(2026, 1, 10)} onChange={() => {}} />);
    fireEvent.focus(container.querySelector('.datepicker__input') as HTMLElement);
    expect(document.querySelectorAll('.datepicker__day').length).toBe(42);
    expect(document.querySelectorAll('.datepicker__day.is-outside').length).toBeGreaterThan(0);
  });
});

describe('dateRangePresets — common analytics presets', () => {
  const get = (k: string) => dateRangePresets().find((p) => p.key === k)!.range();

  it('returns the 8 presets in order with Spanish labels by default', () => {
    const p = dateRangePresets();
    expect(p.map((x) => x.key)).toEqual(['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear']);
    expect(p.find((x) => x.key === 'lastMonth')!.label).toBe('Mes anterior');
    expect(p.find((x) => x.key === 'thisWeek')!.label).toBe('Esta semana');
  });

  it('today is a single day; yesterday is exactly the day before', () => {
    const today = get('today');
    expect(today.from!.getTime()).toBe(today.to!.getTime());
    const y = get('yesterday');
    expect(y.from!.getTime()).toBe(y.to!.getTime());
    expect(Math.round((today.from!.getTime() - y.from!.getTime()) / DAY)).toBe(1);
  });

  it('thisWeek / lastWeek are Monday-anchored; lastWeek is a full Mon–Sun', () => {
    expect(get('thisWeek').from!.getDay()).toBe(1); // Monday
    const lw = get('lastWeek');
    expect(lw.from!.getDay()).toBe(1);
    expect(lw.to!.getDay()).toBe(0); // Sunday
    expect(Math.round((lw.to!.getTime() - lw.from!.getTime()) / DAY)).toBe(6);
  });

  it('thisMonth starts on the 1st; lastMonth is the full previous month', () => {
    expect(get('thisMonth').from!.getDate()).toBe(1);
    const lm = get('lastMonth');
    expect(lm.from!.getDate()).toBe(1);
    expect(lm.from!.getMonth()).toBe(lm.to!.getMonth());
    // the day after `to` rolls into the next month → `to` was the last day
    expect(new Date(lm.to!.getFullYear(), lm.to!.getMonth(), lm.to!.getDate() + 1).getDate()).toBe(1);
  });

  it('include picks a subset/order and labels can be overridden', () => {
    const p = dateRangePresets({ include: ['thisYear', 'today'], labels: { today: 'Hoy!' } });
    expect(p.map((x) => x.key)).toEqual(['thisYear', 'today']);
    expect(p[1].label).toBe('Hoy!');
  });
});

function ControlledRange({ presets }: { presets: { label: string; range: () => { from: Date | null; to: Date | null } }[] }) {
  const [r, setR] = React.useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  return <DateRangePicker value={r} onChange={setR} format="dmy" presets={presets} />;
}

describe('DateRangePicker — active preset name on the trigger (Bsale-style)', () => {
  it('shows the preset label while it is active, the range after a manual change', () => {
    const presets = [{ label: 'Este mes', range: () => ({ from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) }) }];
    render(<ControlledRange presets={presets} />);
    const trigger = () => document.querySelector('.daterange__trigger') as HTMLElement;
    fireEvent.click(trigger());
    fireEvent.click([...document.querySelectorAll('.daterange__presets button')].find((b) => b.textContent === 'Este mes') as HTMLElement);
    expect(trigger().textContent).toContain('Este mes');
    // Reopen and pick a day manually → the trigger drops the preset name for the range.
    fireEvent.click(trigger());
    fireEvent.click([...document.querySelectorAll('button.daterange__day')].find((b) => b.textContent === '15') as HTMLElement);
    expect(trigger().textContent).not.toContain('Este mes');
    expect(trigger().textContent).toContain('→');
  });

  it('defaultPreset starts active: name on the trigger + range applied', () => {
    const presets = [{ label: 'Este mes', range: () => ({ from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) }) }];
    const { container } = render(<DateRangePicker defaultPreset="Este mes" presets={presets} format="dmy" />);
    const trigger = container.querySelector('.daterange__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Este mes');
    // The range was seeded too: opening shows day 1 selected.
    fireEvent.click(trigger);
    const d1 = [...document.querySelectorAll('button.daterange__day')].find((b) => b.textContent === '1') as HTMLElement;
    expect(d1.className).toContain('is-selected');
  });

  it('the active preset stays highlighted in the list (is-active)', () => {
    const presets = [
      { label: 'Hoy', range: () => ({ from: new Date(2026, 5, 22), to: new Date(2026, 5, 22) }) },
      { label: 'Este mes', range: () => ({ from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) }) },
    ];
    const { container } = render(<DateRangePicker defaultPreset="Hoy" presets={presets} />);
    fireEvent.click(container.querySelector('.daterange__trigger') as HTMLElement);
    const btns = [...document.querySelectorAll('.daterange__presets button')];
    expect(btns.find((b) => b.textContent === 'Hoy')!.className).toContain('is-active');
    expect(btns.find((b) => b.textContent === 'Este mes')!.className).not.toContain('is-active');
  });

  it('an unmatched defaultPreset is ignored', () => {
    const presets = [{ label: 'Este mes', range: () => ({ from: new Date(2026, 5, 1), to: new Date(2026, 5, 30) }) }];
    const { container } = render(<DateRangePicker defaultPreset="No existe" presets={presets} />);
    expect((container.querySelector('.daterange__trigger') as HTMLElement).textContent).not.toContain('No existe');
  });
});

describe('DateRangePicker — months prop', () => {
  it('renders two panels by default, one when months={1}', () => {
    const two = openWith({ value: RANGE, onChange: () => {} });
    expect(document.querySelectorAll('.daterange__month').length).toBe(2);
    two.unmount();
    document.body.innerHTML = '';
    openWith({ value: RANGE, onChange: () => {}, months: 1 });
    expect(document.querySelectorAll('.daterange__month').length).toBe(1);
  });
});
