import * as React from 'react';
import { cx } from '../utils/cx';
import { X } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { Slot } from './Primitives';
import type { Extensible } from '../utils/types';

export type CategoryAccent = 'cat-1' | 'cat-2' | 'cat-3' | 'cat-4' | 'cat-5' | 'cat-6';
export type CardAccent =
  | 'brand' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  | CategoryAccent;

export type CardVariant = 'card' | 'inset';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  accent?: Extensible<CardAccent>;
  /**
   * Surface mode (v3.4.0). `'card'` (default): the floating surface — border,
   * radius, `--shadow-card` lift — for a SELF-CONTAINED OBJECT that reads as a
   * unit (a metric, a product, an order summary). `'inset'`: a sunken panel
   * on `--bg-subtle` with no border and no shadow — for GROUPING (a form
   * section, related fields, a summary strip). Same header/body/footer API.
   * Rule of thumb: if it would not make sense to drag it somewhere else on
   * its own, it is a section, not a card — use `inset`. A DataTable never
   * goes inside either: it owns its own surface.
   */
  variant?: CardVariant;
  /**
   * Render as the provided single child element instead of `<div>` (e.g.
   * a clickable card as `next/link`'s `<a>`). Card classes, ref and handlers
   * are merged onto it. Default `false` (identical behavior).
   */
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, accent, variant = 'card', className, asChild = false, ...rest },
  ref
) {
  const cls = cx(
    'card',
    variant === 'inset' && 'card--inset',
    interactive && 'card--interactive',
    accent && `card--accent-${accent}`,
    className
  );
  if (asChild) {
    return <Slot ref={ref as React.Ref<HTMLElement>} className={cls} {...rest} />;
  }
  return <div ref={ref} className={cls} {...rest} />;
});

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hairline under the header (off by default — a card already has a border and a shadow; the title register does the separating). */
  divider?: boolean;
  /**
   * `'label'` (v4.1.0): the caps micro-label register (same as `Badge tone="label"`)
   * for a SECTION rubric ("Resumen", "Cliente y entrega"). The default is the
   * title register (16/600) for an OBJECT's name ("Pedido #1042").
   */
  tone?: 'label';
}
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, divider, tone, ...rest }, ref) {
    return <div ref={ref} className={cx('card__header', tone === 'label' && 'card__header--label', divider && 'card__header--divided', className)} {...rest} />;
  }
);

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('card__body', className)} {...rest} />;
  }
);

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hairline above the footer (v4.1.0: off by default) — for a "totals" edge. */
  divider?: boolean;
}
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, divider, ...rest }, ref) {
    return <div ref={ref} className={cx('card__footer', divider && 'card__footer--divided', className)} {...rest} />;
  }
);

// ---------- Badge --------------------------------------------------------
export type BadgeVariant =
  | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  | CategoryAccent;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Extensible<BadgeVariant>;
  dot?: boolean;
  /**
   * Pulsing status dot. Lets ONE component cover a "status" column
   * (previously you had to mix `StatusIndicator` + `Badge`, which read
   * inconsistently). Implies a dot. Respects `prefers-reduced-motion`.
   */
  pulse?: boolean;
  /**
   * Typographic register. `'data'` (default) is the quiet data-chip:
   * sentence case, tinted, no hard border — it reads as metadata in a
   * dense table. `'label'` is the brand micro-label: uppercase texture
   * for eyebrows, kickers and short tags. Opt into `'label'` only when
   * the badge is a label, not a value.
   */
  tone?: 'data' | 'label';
  /**
   * Surface intensity, orthogonal to `variant` (which is the colour
   * role). `'soft'` (default) is the tinted chip. `'solid'` is a filled
   * chip (the variant's deep tone + white text). `'outline'` is a hairline
   * chip (transparent fill, the variant's deep tone for text + border).
   * `variant="neutral" appearance="solid"` is the dark/ink tag. Supersedes
   * the legacy `variant="solid"` / `"solid-orange"` magic strings (still
   * supported, not removed).
   */
  appearance?: 'soft' | 'solid' | 'outline';
}

export function Badge({
  variant = 'neutral', dot, pulse, tone = 'data', appearance = 'soft', className, children, ...rest
}: BadgeProps) {
  const showDot = dot || pulse;
  return (
    <span
      className={cx(
        'badge',
        `badge--${variant}`,
        tone === 'label' && 'badge--label',
        appearance !== 'soft' && `badge--app-${appearance}`,
        className
      )}
      {...rest}
    >
      {showDot && (
        <span
          className={cx('badge__dot', pulse && 'is-pulsing')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ---------- Alert --------------------------------------------------------
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: Extensible<AlertVariant>;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', title, icon, onClose, className, children, ...rest }: AlertProps) {
  const t = useLocale();
  return (
    <div role="alert" className={cx('alert', `alert--${variant}`, className)} {...rest}>
      {icon && <span className="alert__icon" aria-hidden="true">{icon}</span>}
      <div className="alert__body">
        {title && <div className="alert__title">{title}</div>}
        {children && <div className="alert__desc">{children}</div>}
      </div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label={t['alert.close']}>
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
  const t = useLocale();
  return (
    <span
      role="status"
      aria-label={t['spinner.loading']}
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

export function Chip({ active, onRemove, removeLabel, className, children, ...rest }: ChipProps) {
  const t = useLocale();
  return (
    <span className={cx('chip', active && 'chip--active', className)} {...rest}>
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          className="chip__close"
          aria-label={removeLabel ?? t['chip.remove']}
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
