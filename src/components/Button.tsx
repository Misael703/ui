import * as React from 'react';
import { cx } from '../utils/cx';
import { Slot, Slottable } from './Primitives';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'danger'
  | 'success'
  | 'warning'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  /**
   * Render as the provided single child element instead of `<button>`
   * (e.g. `next/link`'s `<a>`). The kit's classes, ref and handlers are
   * merged onto that element; `iconLeft`/`iconRight`/loading are preserved.
   */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    iconLeft,
    iconRight,
    fullWidth = false,
    className,
    disabled,
    children,
    asChild = false,
    ...rest
  },
  ref
) {
  const cls = cx(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--block',
    loading && 'is-loading',
    className
  );

  if (asChild) {
    const blocked = disabled || loading;
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={cls}
        aria-busy={loading || undefined}
        aria-disabled={blocked || undefined}
        data-disabled={blocked || undefined}
        {...rest}
      >
        {loading && <span className="spinner spinner--inverse" aria-hidden="true" />}
        {!loading && iconLeft}
        <Slottable>{children}</Slottable>
        {!loading && iconRight}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner spinner--inverse" aria-hidden="true" />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
});

// ---------- ButtonGroup --------------------------------------------------
export const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ButtonGroup({ className, role = 'group', ...rest }, ref) {
    return <div ref={ref} role={role} className={cx('btn-group', className)} {...rest} />;
  }
);
