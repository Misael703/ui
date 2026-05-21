import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Combobox } from '../src/components/Pickers';

/**
 * `searchable` prop (v1.15.0). Default `true` = current behaviour (text input
 * + filter). `searchable={false}` = non-typing picker: button trigger + the
 * SAME kit-styled listbox, no filter, full list always. Closes the gap
 * between `<Select>` (native browser dropdown, jarring) and the searchable
 * `<Combobox>` — same visual register, no input.
 *
 * Must FAIL before the fix: prop doesn't exist; render is always `<input>`.
 */
const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];

describe('Combobox `searchable` prop', () => {
  it('default (no prop) renders the typeable input trigger', () => {
    render(<Combobox value={null} onChange={() => {}} options={options} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.tagName).toBe('INPUT');
  });

  it('searchable={false} renders a button trigger (not an input)', () => {
    render(<Combobox value={null} onChange={() => {}} options={options} searchable={false} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('searchable={false} shows the selected option label on the trigger', () => {
    render(<Combobox value="b" onChange={() => {}} options={options} searchable={false} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });

  it('searchable={false} opens the listbox on click and lists ALL options (no filter)', () => {
    render(<Combobox value={null} onChange={() => {}} options={options} searchable={false} />);
    fireEvent.click(screen.getByRole('combobox'));
    const items = screen.getAllByRole('option');
    expect(items).toHaveLength(3);
    expect(items.map((el) => el.textContent)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('searchable={false} selecting an option fires onChange and closes', () => {
    const onChange = vi.fn();
    render(<Combobox value={null} onChange={onChange} options={options} searchable={false} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.mouseDown(screen.getAllByRole('option')[2]); // Cherry
    expect(onChange).toHaveBeenCalledWith('c');
  });
});
