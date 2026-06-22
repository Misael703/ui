import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '../src/components/AdvancedPickers';

// June 2026 starts on a Monday, so the first week is 1(Mon)..7(Sun).
const RANGE = { from: new Date(2026, 5, 1), to: new Date(2026, 5, 10) };

const openWith = (props: Record<string, unknown>) => {
  const utils = render(<DateRangePicker format="dmy" {...props} />);
  fireEvent.click(utils.container.querySelector('.daterange__trigger') as HTMLElement);
  return utils;
};
const day = (n: number) =>
  [...document.querySelectorAll('.daterange__day')].find((b) => b.textContent === String(n)) as HTMLElement;

beforeEach(() => { document.body.innerHTML = ''; });

describe('DateRangePicker — continuous band (always-on)', () => {
  it('paints a band across the span with rounded ends at endpoints and row edges', () => {
    openWith({ value: RANGE, onChange: () => {}, months: 1 });
    // Endpoints: selected circle + band, rounded on the span side.
    expect(day(1).className).toContain('is-selected');
    expect(day(1).className).toContain('is-band');
    expect(day(1).className).toContain('is-band-start');
    expect(day(10).className).toContain('is-selected');
    expect(day(10).className).toContain('is-band-end');
    // Row edges: Sunday (7, col 6) ends the row band; Monday (8, col 0) starts the next.
    expect(day(7).className).toContain('is-band-end');
    expect(day(7).className).not.toContain('is-selected');
    expect(day(8).className).toContain('is-band-start');
    // Mid-row day: band, but neither end.
    expect(day(5).className).toContain('is-band');
    expect(day(5).className).not.toContain('is-band-start');
    expect(day(5).className).not.toContain('is-band-end');
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
