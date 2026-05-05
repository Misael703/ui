'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Drawer } from './Overlay';
import { Heart, Minus, Plus, Star, Trash, X, Check } from './Icons';
import { getBrand } from '../brand';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

// ---------- Rating ------------------------------------------------------
export interface RatingProps {
  value: number;          // 0..max
  max?: number;           // default 5
  /** Si se pasa, se vuelve interactivo. */
  onChange?: (value: number) => void;
  size?: number;
  /** Permite medias estrellas (display only). */
  allowHalf?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Rating({
  value, max = 5, onChange, size = 16, allowHalf = true, className, ariaLabel,
}: RatingProps) {
  const isInteractive = !!onChange;
  return (
    <div
      className={cx('rating', isInteractive && 'rating--interactive', className)}
      role={isInteractive ? 'slider' : 'img'}
      aria-label={ariaLabel ?? `${value} de ${max} estrellas`}
      aria-valuenow={isInteractive ? value : undefined}
      aria-valuemin={isInteractive ? 0 : undefined}
      aria-valuemax={isInteractive ? max : undefined}
    >
      {Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        const fill = value >= idx ? 1 : (allowHalf && value >= idx - 0.5 ? 0.5 : 0);
        return (
          <button
            key={i}
            type="button"
            className={cx('rating__star', fill === 1 && 'is-full', fill === 0.5 && 'is-half')}
            disabled={!isInteractive}
            onClick={() => onChange?.(idx)}
            aria-label={`${idx} ${idx === 1 ? 'estrella' : 'estrellas'}`}
          >
            <Star size={size} />
          </button>
        );
      })}
    </div>
  );
}

// ---------- PriceDisplay -----------------------------------------------
export interface PriceDisplayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  amount: number;
  /** Precio original tachado (para descuentos). */
  compareAt?: number;
  /** ISO 4217. Default desde `getBrand().currency`. */
  currency?: string;
  /** BCP 47. Default desde `getBrand().locale`. */
  locale?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Muestra "% off" si hay compareAt. Default: true. */
  showDiscount?: boolean;
}

export function PriceDisplay({
  amount, compareAt, currency, locale,
  size = 'md', showDiscount = true, className, ...rest
}: PriceDisplayProps) {
  const brand = getBrand();
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale ?? brand.locale, { style: 'currency', currency: currency ?? brand.currency, maximumFractionDigits: 0 }).format(n);

  const hasDiscount = compareAt != null && compareAt > amount;
  const discount = hasDiscount ? Math.round(((compareAt - amount) / compareAt) * 100) : 0;

  return (
    <div className={cx('price', `price--${size}`, className)} {...rest}>
      <span className="price__amount">{fmt(amount)}</span>
      {hasDiscount && (
        <>
          <span className="price__compare"><del>{fmt(compareAt)}</del></span>
          {showDiscount && discount > 0 && (
            <span className="price__discount">-{discount}%</span>
          )}
        </>
      )}
    </div>
  );
}

// ---------- QuantitySelector (compacto) --------------------------------
export interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
}

export function QuantitySelector({
  value, onChange, min = 1, max, step = 1, disabled, size = 'md', className, id,
}: QuantitySelectorProps) {
  const t = useLocale();
  const set = (next: number) => {
    let v = next;
    if (typeof min === 'number') v = Math.max(min, v);
    if (typeof max === 'number') v = Math.min(max, v);
    onChange(v);
  };
  const dec = () => set(value - step);
  const inc = () => set(value + step);
  return (
    <div className={cx('qty', `qty--${size}`, disabled && 'is-disabled', className)}>
      <button
        type="button"
        className="qty__btn"
        aria-label={t['commerce.decreaseQty']}
        onClick={dec}
        disabled={disabled || (typeof min === 'number' && value <= min)}
      >
        <Minus size={14} />
      </button>
      <input
        id={id}
        type="number"
        className="qty__input"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => set(Number(e.target.value))}
        aria-label={t['commerce.quantity']}
      />
      <button
        type="button"
        className="qty__btn"
        aria-label={t['commerce.increaseQty']}
        onClick={inc}
        disabled={disabled || (typeof max === 'number' && value >= max)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// ---------- VariantSelector --------------------------------------------
export interface VariantOption<T = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
  /** Color hex/rgb para chips de tipo "color". */
  swatch?: string;
}

export interface VariantSelectorProps<T = string> {
  label?: React.ReactNode;
  options: VariantOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** 'chip' (default), 'swatch' (círculos de color). */
  appearance?: 'chip' | 'swatch';
  className?: string;
}

export function VariantSelector<T extends string | number = string>({
  label, options, value, onChange, appearance = 'chip', className,
}: VariantSelectorProps<T>) {
  return (
    <div className={cx('variants', className)}>
      {label && <div className="variants__label">{label}</div>}
      <div className={cx('variants__options', `variants__options--${appearance}`)} role="radiogroup">
        {options.map((o) => {
          const selected = value === o.value;
          if (appearance === 'swatch') {
            return (
              <button
                key={String(o.value)}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={o.disabled}
                className={cx('variants__swatch', selected && 'is-selected', o.disabled && 'is-disabled')}
                style={{ background: o.swatch }}
                title={typeof o.label === 'string' ? o.label : String(o.value)}
                aria-label={typeof o.label === 'string' ? o.label : String(o.value)}
                onClick={() => onChange(o.value)}
              >
                {selected && <Check size={14} />}
              </button>
            );
          }
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={o.disabled}
              className={cx('variants__chip', selected && 'is-selected', o.disabled && 'is-disabled')}
              onClick={() => onChange(o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- WishlistButton ---------------------------------------------
export interface WishlistButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  active?: boolean;
  onToggle?: (next: boolean) => void;
  size?: number;
}

export function WishlistButton({ active = false, onToggle, size = 20, className, ...rest }: WishlistButtonProps) {
  const t = useLocale();
  return (
    <button
      type="button"
      className={cx('wishlist', active && 'is-active', className)}
      aria-label={active ? t['commerce.removeFavorite'] : t['commerce.addFavorite']}
      aria-pressed={active}
      onClick={() => onToggle?.(!active)}
      {...rest}
    >
      <Heart size={size} />
    </button>
  );
}

// ---------- PromoCodeInput ---------------------------------------------
export interface PromoCodeInputProps {
  /** Validador async. Resuelve con un mensaje de éxito o lanza un Error con el mensaje. */
  onApply: (code: string) => Promise<string>;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
  id?: string;
}

export function PromoCodeInput({
  onApply, placeholder,
  buttonLabel, className, id,
}: PromoCodeInputProps) {
  const [code, setCode] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);
  const t = useLocale();
  const ph = placeholder ?? t['commerce.promoPlaceholder'];
  const btn = buttonLabel ?? t['commerce.applyCoupon'];

  const apply = async () => {
    if (!code.trim()) return;
    setState('loading');
    setMessage(null);
    try {
      const msg = await onApply(code.trim());
      setState('success');
      setMessage(msg);
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : t['commerce.promoInvalid']);
    }
  };

  return (
    <div className={cx('promo', state === 'success' && 'is-success', state === 'error' && 'is-error', className)}>
      <div className="promo__row">
        <input
          id={id}
          type="text"
          className="input promo__input"
          value={code}
          placeholder={ph}
          disabled={state === 'loading' || state === 'success'}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); if (state !== 'idle') setState('idle'); }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
        />
        <button
          type="button"
          className="btn btn--primary btn--md"
          disabled={!code.trim() || state === 'loading' || state === 'success'}
          onClick={apply}
        >
          {state === 'loading' ? <span className="spinner spinner--inverse" aria-hidden="true" /> : btn}
        </button>
      </div>
      {message && <div className={cx('promo__message', `promo__message--${state}`)}>{message}</div>}
    </div>
  );
}

// ---------- FreeShippingProgress ---------------------------------------
export interface FreeShippingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Subtotal actual del cart. */
  current: number;
  /** Threshold para envío gratis. */
  threshold: number;
  currency?: string;
  locale?: string;
  achievedMessage?: React.ReactNode;
}

export function FreeShippingProgress({
  current, threshold, currency, locale,
  achievedMessage,
  className, ...rest
}: FreeShippingProgressProps) {
  const brand = getBrand();
  const t = useLocale();
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale ?? brand.locale, { style: 'currency', currency: currency ?? brand.currency, maximumFractionDigits: 0 }).format(n);

  const pct = Math.min(100, (current / threshold) * 100);
  const remaining = Math.max(0, threshold - current);
  const achieved = current >= threshold;
  const successMsg = achievedMessage ?? t['commerce.shippingAchieved'];

  return (
    <div className={cx('shipping-progress', achieved && 'is-achieved', className)} {...rest}>
      <div className="shipping-progress__text">
        {achieved ? successMsg : <>{t['commerce.shippingPrefix']}<strong>{fmt(remaining)}</strong>{t['commerce.shippingSuffix']}</>}
      </div>
      <div className="shipping-progress__track" aria-hidden="true">
        <div className="shipping-progress__bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---------- CartDrawer + line items ------------------------------------
export interface CartLineItem {
  id: string;
  name: React.ReactNode;
  variant?: React.ReactNode;
  image?: string;
  unitPrice: number;
  quantity: number;
}

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartLineItem[];
  onQuantityChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  onCheckout?: () => void;
  freeShippingThreshold?: number;
  currency?: string;
  locale?: string;
}

export function CartDrawer({
  open, onClose, items,
  onQuantityChange, onRemove, onCheckout,
  freeShippingThreshold, currency, locale,
}: CartDrawerProps) {
  const brand = getBrand();
  const t = useLocale();
  const resolvedCurrency = currency ?? brand.currency;
  const resolvedLocale = locale ?? brand.locale;
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const fmt = (n: number) =>
    new Intl.NumberFormat(resolvedLocale, { style: 'currency', currency: resolvedCurrency, maximumFractionDigits: 0 }).format(n);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t['commerce.cartTitle']}
      footer={
        <div className="cart__footer">
          {freeShippingThreshold != null && (
            <FreeShippingProgress current={subtotal} threshold={freeShippingThreshold} currency={resolvedCurrency} locale={resolvedLocale} />
          )}
          <div className="cart__totals">
            <span>{t['commerce.subtotal']}</span>
            <strong>{fmt(subtotal)}</strong>
          </div>
          <button type="button" className="btn btn--primary btn--lg btn--block" disabled={items.length === 0} onClick={onCheckout}>
            {t['commerce.checkout']}
          </button>
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="cart__empty">{t['commerce.cartEmpty']}</div>
      ) : (
        <ul className="cart__list">
          {items.map((it) => (
            <li key={it.id} className="cart__item">
              <div className="cart__item-media">
                {it.image ? <img src={it.image} alt="" /> : <div className="cart__item-placeholder" />}
              </div>
              <div className="cart__item-body">
                <div className="cart__item-name">{it.name}</div>
                {it.variant && <div className="cart__item-variant">{it.variant}</div>}
                <div className="cart__item-price">{fmt(it.unitPrice)}</div>
              </div>
              <div className="cart__item-actions">
                {onQuantityChange ? (
                  <QuantitySelector
                    size="sm"
                    value={it.quantity}
                    onChange={(q) => onQuantityChange(it.id, q)}
                  />
                ) : (
                  <span className="cart__item-qty">x{it.quantity}</span>
                )}
                {onRemove && (
                  <button
                    type="button"
                    className="cart__item-remove"
                    aria-label={t['commerce.removeFromCart']}
                    onClick={() => onRemove(it.id)}
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

// ---------- OrderSummary ------------------------------------------------
export interface OrderLineRow {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Aplica estilo de total (negrita, más grande). */
  emphasis?: boolean;
}

export interface OrderSummaryProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'title'> {
  rows: OrderLineRow[];
  title?: React.ReactNode;
}

export function OrderSummary({ rows, title, className, ...rest }: OrderSummaryProps) {
  return (
    <div className={cx('order-summary', className)}>
      {title && <div className="order-summary__title">{title}</div>}
      <dl className="order-summary__list" {...rest}>
        {rows.map((r, i) => (
          <div key={i} className={cx('order-summary__row', r.emphasis && 'is-emphasis')}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------- AddressForm (CL defaults) ----------------------------------
export interface Address {
  fullName: string;
  rut?: string;
  phone: string;
  street: string;
  number: string;
  apartment?: string;
  region: string;
  comuna: string;
  notes?: string;
}

export interface AddressFormProps {
  value: Partial<Address>;
  onChange: (value: Partial<Address>) => void;
  showRut?: boolean;
  className?: string;
  /** Lista de regiones a mostrar en el select. */
  regions?: readonly string[];
}

export function AddressForm({ value, onChange, showRut = true, className, regions }: AddressFormProps) {
  const resolvedRegions = regions ?? [];
  const set = (k: keyof Address, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className={cx('address-form', className)}>
      <div className="form-field">
        <label className="label" htmlFor="addr-fullName">Nombre completo</label>
        <input id="addr-fullName" className="input" value={value.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} />
      </div>
      {showRut && (
        <div className="form-field">
          <label className="label" htmlFor="addr-rut">RUT</label>
          <input id="addr-rut" className="input" value={value.rut ?? ''} onChange={(e) => set('rut', e.target.value)} placeholder="12.345.678-9" />
        </div>
      )}
      <div className="form-field">
        <label className="label" htmlFor="addr-phone">Teléfono</label>
        <input id="addr-phone" className="input" value={value.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+56 9 1234 5678" />
      </div>
      <div className="address-form__row">
        <div className="form-field">
          <label className="label" htmlFor="addr-street">Calle</label>
          <input id="addr-street" className="input" value={value.street ?? ''} onChange={(e) => set('street', e.target.value)} />
        </div>
        <div className="form-field">
          <label className="label" htmlFor="addr-number">Número</label>
          <input id="addr-number" className="input" value={value.number ?? ''} onChange={(e) => set('number', e.target.value)} />
        </div>
        <div className="form-field">
          <label className="label" htmlFor="addr-apt">Depto/Casa</label>
          <input id="addr-apt" className="input" value={value.apartment ?? ''} onChange={(e) => set('apartment', e.target.value)} />
        </div>
      </div>
      <div className="address-form__row">
        <div className="form-field">
          <label className="label" htmlFor="addr-region">Región</label>
          <select id="addr-region" className="select" value={value.region ?? ''} onChange={(e) => set('region', e.target.value)}>
            <option value="">Selecciona…</option>
            {resolvedRegions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="label" htmlFor="addr-comuna">Comuna</label>
          <input id="addr-comuna" className="input" value={value.comuna ?? ''} onChange={(e) => set('comuna', e.target.value)} />
        </div>
      </div>
      <div className="form-field">
        <label className="label" htmlFor="addr-notes">Notas para el despacho (opcional)</label>
        <textarea id="addr-notes" className="textarea" value={value.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2} />
      </div>
    </div>
  );
}

// ---------- CompareTable -----------------------------------------------
export interface CompareItem {
  id: string;
  name: React.ReactNode;
  image?: string;
  price?: React.ReactNode;
}

export interface CompareAttribute {
  key: string;
  label: React.ReactNode;
  /** Valor por item, indexado por id. */
  values: Record<string, React.ReactNode>;
}

export interface CompareTableProps extends React.HTMLAttributes<HTMLTableElement> {
  items: CompareItem[];
  attributes: CompareAttribute[];
  onRemove?: (id: string) => void;
}

export function CompareTable({ items, attributes, onRemove, className, ...rest }: CompareTableProps) {
  const t = useLocale();
  return (
    <div className={cx('compare', className)}>
      <table className="compare__table" {...rest}>
        <thead>
          <tr>
            <th />
            {items.map((it) => (
              <th key={it.id} scope="col">
                <div className="compare__head">
                  {it.image && <img src={it.image} alt="" className="compare__img" />}
                  <div className="compare__name">{it.name}</div>
                  {it.price && <div className="compare__price">{it.price}</div>}
                  {onRemove && (
                    <button
                      type="button"
                      className="compare__remove"
                      aria-label={format(t['commerce.removeItem'], { name: typeof it.name === 'string' ? it.name : 'item' })}
                      onClick={() => onRemove(it.id)}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.key}>
              <th scope="row" className="compare__attr">{attr.label}</th>
              {items.map((it) => (
                <td key={it.id} className="compare__cell">{attr.values[it.id] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
