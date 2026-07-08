import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Combobox } from '../src/components/Pickers';
import { PhoneInput } from '../src/components/InputsExtra';

/**
 * `onBlur` forwarding for validate-on-blur (v1.78.0). PhoneInput forwards it
 * straight to the input; Combobox guards it with `relatedTarget` so it only
 * fires on a REAL exit, not on internal focus moves (input ↔ clear button).
 */
const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
];

describe('Combobox onBlur (guarded)', () => {
  it('fires when focus leaves the widget (relatedTarget outside the root)', () => {
    const onBlur = vi.fn();
    render(
      <div>
        <Combobox value={null} onChange={() => {}} options={options} onBlur={onBlur} />
        <button>outside</button>
      </div>
    );
    const input = screen.getByRole('combobox');
    fireEvent.blur(input, { relatedTarget: screen.getByText('outside') });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire on an internal focus move (relatedTarget inside the root)', () => {
    const onBlur = vi.fn();
    render(<Combobox value={null} onChange={() => {}} options={options} onBlur={onBlur} />);
    const input = screen.getByRole('combobox');
    const root = input.closest('.combobox') as HTMLElement;
    // Stand in for the clear button: a focus target that lives inside the root.
    const inner = document.createElement('button');
    root.appendChild(inner);
    fireEvent.blur(input, { relatedTarget: inner });
    expect(onBlur).not.toHaveBeenCalled();
  });

  it('treats focus leaving to nowhere (relatedTarget null) as a real exit', () => {
    const onBlur = vi.fn();
    render(<Combobox value={null} onChange={() => {}} options={options} onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole('combobox'), { relatedTarget: null });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe('PhoneInput onBlur', () => {
  it('forwards onBlur from the underlying input', () => {
    const onBlur = vi.fn();
    const { container } = render(<PhoneInput value="" onChange={() => {}} onBlur={onBlur} />);
    fireEvent.blur(container.querySelector('input') as HTMLInputElement);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
