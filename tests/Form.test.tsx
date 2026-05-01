import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, FormField, Switch, Checkbox, Radio } from '../src/components/Form';

describe('Form controls', () => {
  it('Input shows aria-invalid when invalid', () => {
    render(<Input invalid placeholder="x" />);
    expect(screen.getByPlaceholderText('x')).toHaveAttribute('aria-invalid', 'true');
  });

  it('FormField renders label, hint, error', () => {
    render(<FormField label="SKU" htmlFor="sku" hint="Hint" error="Required"><Input id="sku" /></FormField>);
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.queryByText('Hint')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('Checkbox toggles and renders compound .check structure', () => {
    const onChange = vi.fn();
    const { container } = render(<Checkbox onChange={onChange}>Acepto</Checkbox>);
    const label = container.querySelector('label.check');
    expect(label).not.toBeNull();
    expect(label!.querySelector('.check__box')).not.toBeNull();
    expect(screen.getByText('Acepto')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('Radio renders compound .check.check--radio structure', () => {
    const { container } = render(<Radio name="x" value="a">Opción A</Radio>);
    const label = container.querySelector('label.check.check--radio');
    expect(label).not.toBeNull();
    expect(label!.querySelector('.check__box')).not.toBeNull();
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('Switch renders track and is a checkbox under the hood', () => {
    const { container } = render(<Switch defaultChecked>Activar</Switch>);
    expect(container.querySelector('label.switch')).not.toBeNull();
    expect(container.querySelector('.switch__track')).not.toBeNull();
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText('Activar')).toBeInTheDocument();
  });
});
