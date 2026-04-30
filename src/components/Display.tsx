import * as React from 'react';
import { cx } from '../utils/cx';
import { X } from './Icons';

export type CardAccent = 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  accent?: CardAccent;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, accent, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        'card',
        interactive && 'card--interactive',
        accent && `card--accent-${accent}`,
        className
      )}
      {...rest}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('card__header', className)} {...rest} />;
  }
);

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('card__body', className)} {...rest} />;
  }
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('card__footer', className)} {...rest} />;
  }
);

// ---------- Badge --------------------------------------------------------
export type BadgeVariant =
  | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ variant = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('badge', `badge--${variant}`, className)} {...rest}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

// ---------- Alert --------------------------------------------------------
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', title, icon, onClose, className, children, ...rest }: AlertProps) {
  return (
    <div role="alert" className={cx('alert', `alert--${variant}`, className)} {...rest}>
      {icon && <span className="alert__icon" aria-hidden="true">{icon}</span>}
      <div className="alert__body">
        {title && <div className="alert__title">{title}</div>}
        {children && <div className="alert__desc">{children}</div>}
      </div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar alerta">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// ---------- Skeleton & Spinner ------------------------------------------
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
}

export function Skeleton({ width, height, rounded, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cx('skel', className)}
      style={{ width, height, borderRadius: rounded ? 999 : undefined, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
}

export function Spinner({ size = 'md', inverse, className, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cx('spinner', size === 'lg' && 'spinner--lg', inverse && 'spinner--inverse', className)}
      {...rest}
    />
  );
}

// ---------- Chip + ChipGroup --------------------------------------------
export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

export function Chip({ active, onRemove, removeLabel = 'Quitar', className, children, ...rest }: ChipProps) {
  return (
    <span className={cx('chip', active && 'chip--active', className)} {...rest}>
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          className="chip__close"
          aria-label={removeLabel}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

export const ChipGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ChipGroup({ className, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cx('chip-group', className)}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}
        {...rest}
      />
    );
  }
);

// ---------- ProductCard -------------------------------------------------
export interface ProductCardProps extends React.HTMLAttributes<HTMLElement> {
  sku?: React.ReactNode;
  name: React.ReactNode;
  price?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  tag?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ProductCard({
  sku, name, price, image, imageAlt, tag, footer, className, ...rest
}: ProductCardProps) {
  return (
    <article className={cx('product-card', className)} {...rest}>
      {tag && <span className="product-card__tag">{tag}</span>}
      <div className="product-card__media">
        {image ? (
          <img src={image} alt={imageAlt ?? (typeof name === 'string' ? name : '')} />
        ) : (
          <div className="product-card__placeholder">{sku ? `[ ${sku} ]` : 'SKU'}</div>
        )}
      </div>
      <div className="product-card__body">
        {sku && <div className="product-card__sku">{sku}</div>}
        <h4 className="product-card__title">{name}</h4>
        {price && <div className="product-card__price">{price}</div>}
      </div>
      {footer && <div className="product-card__footer">{footer}</div>}
    </article>
  );
}
