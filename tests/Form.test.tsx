import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, FormField, Switch, Checkbox } from '../src/components/Form';

describe('Form controls', () => {
  it('Input shows aria-invalid when invalid', () => {
    render(<Input invalid placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveAttribute('aria-invalid', 'true');
  });

  it('FormField renders label, hint, error', () => {
    render(<FormField label="SKU" htmlFor="sku" hint="Hint" error="Required"><Input id="sku" /></FormField>);
    expect(screen.getByText('SKU')).toBeInTheDocument();
    // error takes precedence over hint
    expect(screen.queryByText('Hint')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('Checkbox toggles', () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('Switch is a checkbox under the hood', () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
