import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../src/components/Form';

describe('PasswordInput', () => {
  const toggle = () => screen.getByRole('button');
  const field = (c: HTMLElement) => c.querySelector('input') as HTMLInputElement;

  it('starts hidden and toggles to text on click; aria-label reflects the action', () => {
    const { container } = render(<PasswordInput defaultValue="secreto" />);
    expect(field(container).type).toBe('password');
    expect(toggle()).toHaveAttribute('aria-label', 'Mostrar contraseña');
    fireEvent.click(toggle());
    expect(field(container).type).toBe('text');
    expect(toggle()).toHaveAttribute('aria-label', 'Ocultar contraseña');
  });

  it('is keyboard-operable (Enter and Space)', () => {
    const { container } = render(<PasswordInput />);
    fireEvent.keyDown(toggle(), { key: 'Enter' });
    expect(field(container).type).toBe('text');
    fireEvent.keyDown(toggle(), { key: ' ' });
    expect(field(container).type).toBe('password');
  });

  it('respects defaultVisible', () => {
    const { container } = render(<PasswordInput defaultVisible />);
    expect(field(container).type).toBe('text');
  });

  it('controlled: uses `visible` and fires `onVisibleChange` without owning state', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<PasswordInput visible={false} onVisibleChange={onChange} />);
    expect(field(container).type).toBe('password');
    fireEvent.click(toggle());
    expect(onChange).toHaveBeenCalledWith(true);
    expect(field(container).type).toBe('password'); // still driven by the prop
    rerender(<PasswordInput visible={true} onVisibleChange={onChange} />);
    expect(field(container).type).toBe('text');
  });

  it('forwards ref to the real <input> and passes Input props through', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} autoComplete="new-password" invalid />);
    expect(ref.current?.tagName).toBe('INPUT');
    expect(ref.current).toHaveAttribute('autocomplete', 'new-password');
    expect(ref.current).toHaveAttribute('aria-invalid', 'true');
  });

  it('never exposes a raw type prop (owned internally)', () => {
    // @ts-expect-error `type` is Omit-ed from the props on purpose.
    render(<PasswordInput type="email" />);
  });

  it('custom show/hide labels override the locale default', () => {
    render(<PasswordInput showLabel="Ver" hideLabel="Esconder" />);
    expect(toggle()).toHaveAttribute('aria-label', 'Ver');
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-label', 'Esconder');
  });

  it('disabled: the toggle is not operable and the input is disabled', () => {
    const onChange = vi.fn();
    const { container } = render(<PasswordInput disabled onVisibleChange={onChange} />);
    expect(toggle()).toHaveAttribute('tabindex', '-1');
    fireEvent.click(toggle());
    expect(onChange).not.toHaveBeenCalled();
    expect(field(container).type).toBe('password');
    expect(field(container)).toBeDisabled();
  });
});
