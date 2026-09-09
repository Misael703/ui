import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView, focusCalendar } from '../src/components/CalendarView';
import { isSameDay } from '../src/utils/dateFormat';

/**
 * CalendarView (v3.9.0): the one calendar behind the four pickers. Header
 * (prev / title-button / next), three views, roving-focus keyboard.
 */
function Harness(props: Partial<React.ComponentProps<typeof CalendarView>> & { initial?: Date }) {
  const { initial = new Date(2026, 8, 1), ...rest } = props;
  const [month, setMonth] = React.useState(initial);
  return <CalendarView month={month} onMonthChange={setMonth} {...rest} />;
}
const title = () => screen.getByRole('button', { name: /Saltar a mes y año|^\d{4}–\d{4}$/ }) as HTMLButtonElement;
const day = (n: number) => [...document.querySelectorAll<HTMLButtonElement>('button.calview__day')].find((b) => b.textContent === String(n))!;

describe('CalendarView header', () => {
  it('prev / next page the month; the title climbs days → months → years and stops', () => {
    render(<Harness />);
    expect(title().textContent).toContain('Septiembre 2026');
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(title().textContent).toContain('Octubre 2026');
    fireEvent.click(title());
    expect(document.querySelectorAll('.calview__cell')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Año anterior' })).toBeInTheDocument();
    fireEvent.click(title());
    expect(title().textContent).toBe('2019–2030');
    expect(title()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Década siguiente' })).toBeInTheDocument();
  });
  it('picking a year descends to months, a month to days, and the view follows', () => {
    render(<Harness />);
    fireEvent.click(title()); fireEvent.click(title());
    fireEvent.click(screen.getByRole('button', { name: '2024' }));
    expect(title().textContent).toMatch(/^2024/);
    fireEvent.click(screen.getByRole('button', { name: 'Mar' }));
    expect(title().textContent).toContain('Marzo 2024');
    expect(document.querySelectorAll('button.calview__day').length + document.querySelectorAll('span.calview__day').length).toBe(42);
  });
  it('navPrev / navNext false render a spacer instead of the button', () => {
    render(<Harness navPrev={false} />);
    expect(screen.queryByRole('button', { name: 'Mes anterior' })).toBeNull();
    expect(document.querySelector('.calview__navbtn--ghost')).not.toBeNull();
  });
});

describe('CalendarView days', () => {
  it('marks today (aria-current="date"), the selected day (aria-pressed), and disables via isDayDisabled', () => {
    const today = new Date();
    const sel = new Date(2026, 8, 15);
    render(<Harness initial={today} dayState={(d) => ({ selected: isSameDay(d, sel) })} isDayDisabled={(d) => d.getDay() === 0} />);
    expect(day(today.getDate())).toHaveAttribute('aria-current', 'date');
    const sunday = [...document.querySelectorAll<HTMLButtonElement>('button.calview__day')].find((b) => b.disabled);
    expect(sunday).toBeDefined();
  });
  it('reports the clicked day', () => {
    const onSelectDay = vi.fn();
    render(<Harness onSelectDay={onSelectDay} />);
    fireEvent.click(day(15));
    expect(onSelectDay).toHaveBeenCalledOnce();
    expect(onSelectDay.mock.calls[0][0].getDate()).toBe(15);
  });
  it('one tab stop: the selected day (else the first enabled) has tabIndex 0', () => {
    render(<Harness dayState={(d) => ({ selected: d.getDate() === 15 && d.getMonth() === 8 })} />);
    expect(day(15).tabIndex).toBe(0);
    expect(day(16).tabIndex).toBe(-1);
  });
});

describe('CalendarView keyboard (roving focus)', () => {
  it('arrows move by day and week, Home / End to the row edges', () => {
    render(<Harness />);
    day(15).focus();
    fireEvent.keyDown(day(15), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(day(16));
    fireEvent.keyDown(day(16), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(day(23));
    fireEvent.keyDown(day(23), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(day(22));
    fireEvent.keyDown(day(22), { key: 'Home' });
    expect(document.activeElement).toBe(day(21)); // Monday 21 Sep 2026
    fireEvent.keyDown(day(21), { key: 'End' });
    expect(document.activeElement).toBe(day(27));
  });
  it('PageDown / PageUp page the month and keep the same day of the month (clamped)', () => {
    render(<Harness />);
    day(15).focus();
    fireEvent.keyDown(day(15), { key: 'PageDown' });
    expect(title().textContent).toContain('Octubre 2026');
    expect(document.activeElement).toBe(day(15));
    fireEvent.keyDown(day(15), { key: 'PageDown' }); // → Noviembre
    fireEvent.keyDown(day(15), { key: 'ArrowDown' }); fireEvent.keyDown(day(22), { key: 'ArrowDown' }); fireEvent.keyDown(day(29), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(day(30));
    fireEvent.keyDown(day(30), { key: 'PageUp' }); // → Octubre 30
    expect(title().textContent).toContain('Octubre 2026');
    expect(document.activeElement).toBe(day(30));
  });
  it('ArrowDown on the field hands focus to the calendar (focusCalendar)', () => {
    const { container } = render(<Harness />);
    expect(focusCalendar(container as HTMLElement)).toBe(true);
    expect(document.activeElement?.classList.contains('calview__day')).toBe(true);
  });
  it('Escape in months climbs back to days and does not bubble; in days it bubbles (popover dismiss)', () => {
    const outer = vi.fn();
    render(<div onKeyDown={outer}><Harness /></div>);
    fireEvent.click(title());
    const cell = screen.getByRole('button', { name: 'Sep' });
    fireEvent.keyDown(cell, { key: 'Escape' });
    expect(outer).not.toHaveBeenCalled();
    expect(document.querySelectorAll('button.calview__day').length).toBeGreaterThan(0);
    fireEvent.keyDown(day(15), { key: 'Escape' });
    expect(outer).toHaveBeenCalledOnce();
  });
});
