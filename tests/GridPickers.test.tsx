import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YearPicker, MonthPicker } from '../src/components/Pickers';

describe('YearPicker', () => {
  it('shows the localized placeholder when empty', () => {
    render(<YearPicker value={null} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Selecciona el año');
  });

  it('opens the decade grid, dims boundary years, selects a year', () => {
    const onChange = vi.fn();
    render(<YearPicker value={2025} onChange={onChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('2025');
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('2020-2029')).toBeInTheDocument();
    // Boundary years are dimmed (is-out) and the selected one highlighted.
    expect(screen.getByRole('button', { name: '2019' }).className).toContain('is-out');
    expect(screen.getByRole('button', { name: '2030' }).className).toContain('is-out');
    expect(screen.getByRole('button', { name: '2025' }).className).toContain('is-selected');
    fireEvent.click(screen.getByRole('button', { name: '2027' }));
    expect(onChange).toHaveBeenCalledWith(2027);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates decades and respects min/max', () => {
    render(<YearPicker value={2025} minYear={2024} maxYear={2027} onChange={() => {}} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('button', { name: '2023' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2026' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Década anterior' }));
    expect(screen.getByText('2010-2019')).toBeInTheDocument();
  });

  it('dismisses on outside pointer-down', () => {
    render(
      <>
        <YearPicker value={null} onChange={() => {}} />
        <button>fuera</button>
      </>,
    );
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'fuera' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('MonthPicker', () => {
  it('shows localized placeholder and formatted value', () => {
    const { rerender } = render(<MonthPicker value={null} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Selecciona el mes');
    rerender(<MonthPicker value={new Date(2026, 4, 1)} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Mayo 2026');
  });

  it('opens the month grid, marks the selected month, selects another', () => {
    const onChange = vi.fn();
    render(<MonthPicker value={new Date(2026, 4, 1)} onChange={onChange} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mayo' }).className).toContain('is-selected');
    fireEvent.click(screen.getByRole('button', { name: 'Julio' }));
    expect(onChange).toHaveBeenCalledOnce();
    const d = onChange.mock.calls[0][0] as Date;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates years and respects maxDate', () => {
    render(<MonthPicker value={new Date(2026, 0, 1)} maxDate={new Date(2026, 5, 30)} onChange={() => {}} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('button', { name: 'Agosto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Marzo' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Año siguiente' }));
    expect(screen.getByText('2027')).toBeInTheDocument();
  });
});
