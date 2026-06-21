import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatePicker } from '../src/components/Pickers';
import { DateRangePicker } from '../src/components/AdvancedPickers';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('DatePicker field consistency (matches .input/.select)', () => {
  it('the wrapper IS the field — same border + radius tokens as .input', () => {
    const wrap = css.match(/\.datepicker\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(wrap).toMatch(/border:\s*1px solid var\(--border-strong\)/);
    expect(wrap).toMatch(/border-radius:\s*var\(--radius-md\)/);
    expect(wrap).toMatch(/min-height:\s*var\(--field-min-h/);
  });

  it('the calendar toggle is an integrated muted icon, not a grey segment', () => {
    const toggle = css.match(/(?:^|\})\s*\.datepicker__toggle\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(toggle).toMatch(/background:\s*transparent/);
    expect(toggle).toMatch(/border:\s*none/);
    expect(toggle).toMatch(/color:\s*var\(--fg-subtle\)/);
    // no longer paints its own --bg-subtle box
    expect(toggle).not.toMatch(/background:\s*var\(--bg-subtle\)/);
  });

  it('the input is borderless/transparent inside the field', () => {
    const input = css.match(/\.datepicker__input\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(input).toMatch(/border:\s*none/);
    expect(input).toMatch(/background:\s*transparent/);
  });

  // The date-input family fills its container (like .input/.select width:100%)
  // so it composes in grids/forms instead of leaving a fit-content gap. With a
  // wrapper border, border-box keeps width:100% from overflowing by the border.
  it('the picker family fills its container (width:100%, no fit-content)', () => {
    const datepicker = css.match(/\.datepicker\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(datepicker).toMatch(/width:\s*100%/);
    expect(datepicker).toMatch(/box-sizing:\s*border-box/);
    expect(datepicker).not.toMatch(/width:\s*fit-content/);

    const timepicker = css.match(/\.timepicker\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(timepicker).toMatch(/width:\s*100%/);

    const gridpicker = css.match(/\.gridpicker\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(gridpicker).toMatch(/width:\s*100%/);
    expect(gridpicker).not.toMatch(/width:\s*fit-content/);

    // DateRangePicker fills via a block wrapper + a full-width trigger.
    const daterange = css.match(/\.daterange\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(daterange).toMatch(/display:\s*block/);
    const drTrigger = css.match(/\.daterange__trigger\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(drTrigger).toMatch(/width:\s*100%/);

    // No fit-content left anywhere in the picker family.
    expect(css).not.toMatch(/\.(datepicker|timepicker|gridpicker)\s*\{[^}]*fit-content/);
  });
});

/**
 * `isDateDisabled` predicate (v1.40.0). A day for which it returns `true`
 * renders disabled — greyed (`is-disabled`), native-`disabled` (so Tab skips
 * it and it can't be clicked), and never emitted via `onChange`. Composes with
 * `minDate`/`maxDate`. The deterministic tests below use a `getDate()`-based
 * predicate (no week-layout dependency); the real "disable Sundays" use case
 * (`d => d.getDay() === 0`) runs the exact same code path.
 *
 * Must FAIL before the fix: the prop doesn't exist; only min/max gate days.
 */
const VIEW = new Date(2026, 5, 10); // June 2026, fixes the visible month

const openDay = (n: number) => {
  fireEvent.focus(screen.getByRole('textbox'));
  return screen.getByRole('button', { name: String(n) });
};

describe('DatePicker isDateDisabled', () => {
  it('disables the day the predicate marks, leaves others enabled', () => {
    render(<DatePicker value={VIEW} onChange={() => {}} isDateDisabled={(d) => d.getDate() === 15} />);
    const d15 = openDay(15);
    const d16 = screen.getByRole('button', { name: '16' });
    expect(d15).toBeDisabled();
    expect(d15.className).toContain('is-disabled');
    expect(d16).not.toBeDisabled();
    expect(d16.className).not.toContain('is-disabled');
  });

  it('never fires onChange for a disabled day', () => {
    const onChange = vi.fn();
    render(<DatePicker value={VIEW} onChange={onChange} isDateDisabled={(d) => d.getDate() === 15} />);
    const d15 = openDay(15);
    fireEvent.click(d15);
    expect(onChange).not.toHaveBeenCalled();
    // a non-disabled day still selects
    fireEvent.click(screen.getByRole('button', { name: '16' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('composes with minDate: predicate-disabled AND out-of-range days are both off', () => {
    render(
      <DatePicker
        value={VIEW}
        onChange={() => {}}
        minDate={new Date(2026, 5, 10)}
        isDateDisabled={(d) => d.getDate() === 20}
      />
    );
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled();   // before minDate
    expect(screen.getByRole('button', { name: '20' })).toBeDisabled();  // predicate
    expect(screen.getByRole('button', { name: '15' })).not.toBeDisabled(); // valid
  });

  it('disables every Sunday with the day-of-week predicate', () => {
    render(<DatePicker value={VIEW} onChange={() => {}} isDateDisabled={(d) => d.getDay() === 0} />);
    fireEvent.focus(screen.getByRole('textbox'));
    // June 2026: the 7th, 14th, 21st, 28th are Sundays.
    for (const n of [7, 14, 21, 28]) {
      expect(screen.getByRole('button', { name: String(n) }), `day ${n}`).toBeDisabled();
    }
    // a Monday (the 8th) stays enabled
    expect(screen.getByRole('button', { name: '8' })).not.toBeDisabled();
  });
});

describe('DateRangePicker isDateDisabled', () => {
  it('a range endpoint cannot land on a disabled day', () => {
    const onApply = vi.fn();
    render(
      <DateRangePicker
        defaultValue={{ from: null, to: null }}
        onApply={onApply}
        isDateDisabled={(d) => d.getDate() === 15}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Seleccionar rango/i }));
    // Two month panels → a "15" in each; every one must be disabled.
    const fifteens = screen.getAllByRole('button', { name: '15' });
    expect(fifteens.length).toBeGreaterThan(0);
    fifteens.forEach((b) => expect(b).toBeDisabled());
    fireEvent.click(fifteens[0]); // no-op (disabled)
    // No valid range was started → Apply stays disabled.
    const apply = screen.getByText('Aplicar') as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
  });
});
