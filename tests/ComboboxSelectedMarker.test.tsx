import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Combobox } from '../src/components/Pickers';

/**
 * Selected vs active disambiguation (v1.39.0). The confirmed value carries an
 * unambiguous check marker; the keyboard/hover `active` highlight is
 * background-only. On open with a value, the active descendant starts ON the
 * selected option (not index 0), so a freshly-opened list shows a single,
 * clearly-marked row.
 *
 * Must FAIL before the fix: selected and active were both bare backgrounds
 * (indistinguishable when the palette makes them close), and active defaulted
 * to index 0 even with a value — reading as "two selected".
 */
const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];

const open = () => fireEvent.focus(screen.getByRole('combobox'));

describe('Combobox selected marker + active-on-open', () => {
  it('marks ONLY the selected option with a check', () => {
    render(<Combobox value="b" onChange={() => {}} options={options} />);
    open();
    const opts = screen.getAllByRole('option');
    expect(opts[1].querySelector('.combobox__option-check')).not.toBeNull(); // Banana
    expect(opts[0].querySelector('.combobox__option-check')).toBeNull();
    expect(opts[2].querySelector('.combobox__option-check')).toBeNull();
  });

  it('starts the active descendant on the selected option, not index 0', () => {
    render(<Combobox value="b" onChange={() => {}} options={options} />);
    open();
    const opts = screen.getAllByRole('option');
    expect(opts[1].className).toContain('is-active');
    expect(opts[0].className).not.toContain('is-active');
  });

  it('without a value: active is the first option and nothing is checked', () => {
    const { container } = render(<Combobox value={null} onChange={() => {}} options={options} />);
    open();
    const opts = screen.getAllByRole('option');
    expect(opts[0].className).toContain('is-active');
    expect(container.querySelector('.combobox__option-check')).toBeNull();
  });

  it('arrowing down moves active off the selected, which keeps its check', () => {
    render(<Combobox value="b" onChange={() => {}} options={options} />);
    const input = screen.getByRole('combobox');
    open();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const opts = screen.getAllByRole('option');
    expect(opts[2].className).toContain('is-active'); // moved to Cherry
    expect(opts[1].className).not.toContain('is-active'); // Banana no longer active
    expect(opts[1].querySelector('.combobox__option-check')).not.toBeNull(); // ...but still checked
  });

  it('aria-selected tracks the value (a11y), independent of active', () => {
    render(<Combobox value="b" onChange={() => {}} options={options} />);
    open();
    const opts = screen.getAllByRole('option');
    expect(opts[1]).toHaveAttribute('aria-selected', 'true');
    expect(opts[0]).toHaveAttribute('aria-selected', 'false');
  });
});
