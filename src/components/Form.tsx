import * as React from 'react';
import { cx } from '../utils/cx';
import { Check as CheckIcon } from './Icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, iconLeft, iconRight, className, ...rest },
  ref
) {
  if (iconLeft || iconRight) {
    return (
      <div className={cx('input-wrap', invalid && 'is-invalid', className)}>
        {iconLeft && <span className="input-wrap__icon input-wrap__icon--left" aria-hidden="true">{iconLeft}</span>}
        <input
          ref={ref}
          className={cx('input', !!iconLeft && 'input--has-left', !!iconRight && 'input--has-right')}
          aria-invalid={invalid || undefined}
          {...rest}
        />
        {iconRight && <span className="input-wrap__icon input-wrap__icon--right" aria-hidden="true">{iconRight}</span>}
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cx('input', invalid && 'is-invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cx('textarea', invalid && 'is-invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={cx('select', invalid && 'is-invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  );
});

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered next to the checkbox. */
  children?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, children, ...rest },
  ref
) {
  return (
    <label className={cx('check', className)}>
      <input ref={ref} type="checkbox" {...rest} />
      <span className="check__box" aria-hidden="true">
        <CheckIcon size={14} strokeWidth={3} />
      </span>
      {children != null && <span>{children}</span>}
    </label>
  );
});

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label rendered next to the radio. */
  children?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, children, ...rest },
  ref
) {
  return (
    <label className={cx('check', 'check--radio', className)}>
      <input ref={ref} type="radio" {...rest} />
      <span className="check__box" aria-hidden="true" />
      {children != null && <span>{children}</span>}
    </label>
  );
});

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Optional label rendered next to the switch. */
  children?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, children, ...rest },
  ref
) {
  return (
    <label className={cx('switch', className)}>
      <input ref={ref} type="checkbox" {...rest} />
      <span className="switch__track" aria-hidden="true" />
      {children != null && <span>{children}</span>}
    </label>
  );
});

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required, className, children, ...rest },
  ref
) {
  return (
    <label ref={ref} className={cx('label', className)} {...rest}>
      {children}
      {required && <span aria-label="requerido" style={{ color: 'var(--color-danger)' }}> *</span>}
    </label>
  );
});

export interface FormFieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Override the auto-generated id (e.g. when the input is rendered outside FormField). */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, hint, error, required, htmlFor, children, className }: FormFieldProps) {
  const reactId = React.useId();
  const id = htmlFor ?? reactId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  // Inject id + aria-describedby into the single child element so screen readers
  // announce the helper/error text. Consumer-provided values win.
  const child = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{ id?: string; 'aria-describedby'?: string }>,
        {
          id: (children.props as { id?: string }).id ?? id,
          'aria-describedby':
            (children.props as { 'aria-describedby'?: string })['aria-describedby'] ?? describedBy,
        }
      )
    : children;

  return (
    <div className={cx('form-field', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {child}
      {hint && !error && <div id={hintId} className="form-field__hint">{hint}</div>}
      {error && <div id={errorId} className="form-field__error" role="alert">{error}</div>}
    </div>
  );
}

// ---------- InputGroup --------------------------------------------------
// Permite combinar un Input con addons a la izquierda/derecha.
// Uso: <InputGroup><InputGroupAddon>$</InputGroupAddon><Input /></InputGroup>
export const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function InputGroup({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('input-group', className)} {...rest} />;
  }
);

export const InputGroupAddon = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function InputGroupAddon({ className, ...rest }, ref) {
    return <span ref={ref} className={cx('input-group__addon', className)} {...rest} />;
  }
);
