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

  it('FormField auto-generates id and wires label htmlFor + input id', () => {
    const { container } = render(
      <FormField label="Email"><Input placeholder="x" /></FormField>
    );
    const label = container.querySelector('label.label');
    const input = screen.getByPlaceholderText('x');
    expect(label).not.toBeNull();
    const labelFor = label!.getAttribute('for');
    expect(labelFor).toBeTruthy();
    expect(input).toHaveAttribute('id', labelFor!);
  });

  it('FormField wires aria-describedby to the input from hint and error ids', () => {
    const { container } = render(
      <FormField label="Email" hint="Te servirá para login" error="Inválido">
        <Input placeholder="x" />
      </FormField>
    );
    const input = screen.getByPlaceholderText('x');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // Error id should be present (hint is suppressed when error is shown).
    const errorEl = container.querySelector('[role="alert"]');
    expect(errorEl).not.toBeNull();
    expect(describedBy).toContain(errorEl!.getAttribute('id')!);
  });

  it('Checkbox forwards aria-invalid when invalid', () => {
    render(<Checkbox invalid />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('Checkbox indeterminate sets the property and aria-checked="mixed"', () => {
    const { container } = render(<Checkbox indeterminate />);
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(input.indeterminate).toBe(true);
    expect(input).toHaveAttribute('aria-checked', 'mixed');
  });

  it('Switch forwards aria-invalid when invalid', () => {
    render(<Switch invalid />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
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

  it('Switch renders track and exposes role="switch" for screen readers', () => {
    const { container } = render(<Switch defaultChecked>Activar</Switch>);
    expect(container.querySelector('label.switch')).not.toBeNull();
    expect(container.querySelector('.switch__track')).not.toBeNull();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByText('Activar')).toBeInTheDocument();
  });
});
