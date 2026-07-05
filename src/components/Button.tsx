import * as React from 'react';
import { cx } from '../utils/cx';
import { Slot, Slottable } from './Primitives';
import type { Extensible } from '../utils/types';

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

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Known variants autocomplete; any string is accepted for consumer-defined
   *  variants (style `.btn--<value>` outside `@layer elalba`). */
  variant?: Extensible<ButtonVariant>;
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
        tabIndex={blocked ? -1 : undefined}
        {...rest}
      >
        {loading && <span className="spinner spinner--current" aria-hidden="true" />}
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
      {loading && <span className="spinner spinner--current" aria-hidden="true" />}
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

// ---------- IconButton ---------------------------------------------------
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The icon to render (the button has no text). */
  icon: React.ReactNode;
  /** Accessible name — required, since an icon-only button has no visible label. */
  'aria-label': string;
  /** Known variants autocomplete; any string is accepted (see `Button`). Default `ghost`. */
  variant?: Extensible<ButtonVariant>;
  /** Square sizes (36 / 44 / 52px) via `.btn--icon`. */
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Square, icon-only button — the affordance blocks used to hand-roll. Reuses the
 * Button surface (`.btn--icon` + a variant) so padding, focus ring, hover and
 * disabled are handled once. `aria-label` is required.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'ghost', size = 'md', loading = false, className, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cx('btn', 'btn--icon', `btn--${variant}`, `btn--${size}`, loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner spinner--current" aria-hidden="true" /> : icon}
    </button>
  );
});
