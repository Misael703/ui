import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '../src/components/AdvancedPickers';
import { DatePicker } from '../src/components/Pickers';
import { buildMonthGrid6 } from '../src/utils/dateFormat';

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
  it('endpoints emerge from the circle (half-cell), row edges round, mid-row bridges', () => {
    openWith({ value: RANGE, onChange: () => {}, months: 1 });
    // Endpoint with circle: band is a half-cell that meets the circle at center
    // (is-bl-mid / is-br-mid), not a full rounded cap on the outer side.
    expect(day(1).className).toContain('is-selected');
    expect(day(1).className).toContain('is-band');
    expect(day(1).className).toContain('is-bl-mid');
    expect(day(1).className).not.toContain('is-bl-cap');
    expect(day(10).className).toContain('is-selected');
    expect(day(10).className).toContain('is-br-mid');
    // Row edges: Sunday (7, col 6) caps the row band on the right; Monday (8,
    // col 0) caps the next row on the left.
    expect(day(7).className).toContain('is-br-cap');
    expect(day(7).className).not.toContain('is-selected');
    expect(day(8).className).toContain('is-bl-cap');
    // Mid-row day bridges both sides (no cap, no circle).
    expect(day(5).className).toContain('is-band');
    expect(day(5).className).toContain('is-bl-join');
    expect(day(5).className).toContain('is-br-join');
  });

  it('a lone endpoint (no range yet) shows no band', () => {
    openWith({ value: { from: new Date(2026, 5, 15), to: null }, onChange: () => {}, months: 1 });
    expect(day(15).className).toContain('is-selected');
    expect(day(15).className).not.toContain('is-band');
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
