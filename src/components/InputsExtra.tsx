'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { X } from './Icons';
import { getBrand } from '../brand';

// ---------- Slider ------------------------------------------------------
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (v: number) => string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, onChange, min = 0, max = 100, step = 1, showValue, formatValue, className, ...rest },
  ref
) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cx('slider', className)}>
      <input
        ref={ref}
        type="range"
        className="slider__input"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        {...rest}
      />
      {showValue && (
        <span className="slider__value">{formatValue ? formatValue(value) : value}</span>
      )}
    </div>
  );
});

// ---------- Progress (linear + circular) --------------------------------
export interface ProgressProps {
  value: number;       // 0–100
  variant?: 'blue' | 'orange' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Progress({ value, variant = 'blue', showLabel, size = 'md', className }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cx('progress', size === 'sm' && 'progress--sm', className)}>
      <div className={cx('progress__bar', `progress__bar--${variant}`)} style={{ width: `${v}%` }} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} />
      {showLabel && <span className="progress__label">{Math.round(v)}%</span>}
    </div>
  );
}

export interface ProgressCircleProps {
  value: number;
  size?: number;
  stroke?: number;
  variant?: 'blue' | 'orange' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export function ProgressCircle({ value, size = 64, stroke = 6, variant = 'blue', showLabel = true, className }: ProgressCircleProps) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  const colorVar = {
    blue: 'var(--color-brand-blue)',
    orange: 'var(--color-brand-orange)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  }[variant];
  return (
    <div className={cx('progress-circle', className)} style={{ width: size, height: size }} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-subtle)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={colorVar} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 320ms var(--ease-standard, ease-out)' }}
        />
      </svg>
      {showLabel && <span className="progress-circle__label">{Math.round(v)}%</span>}
    </div>
  );
}

// ---------- Tag input ---------------------------------------------------
export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  separator?: RegExp;
  maxTags?: number;
  validate?: (tag: string) => boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TagInput({
  value, onChange, placeholder = 'Escribe y Enter…',
  separator = /[,\s]+/, maxTags, validate, disabled, className, id,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('');

  const addTags = (raw: string) => {
    const next = raw.split(separator).map((t) => t.trim()).filter(Boolean);
    if (next.length === 0) return;
    let merged = [...value];
    for (const t of next) {
      if (validate && !validate(t)) continue;
      if (merged.includes(t)) continue;
      if (maxTags && merged.length >= maxTags) break;
      merged.push(t);
    }
    onChange(merged);
    setDraft('');
  };

  return (
    <div className={cx('tag-input', disabled && 'is-disabled', className)} onClick={(e) => {
      const input = (e.currentTarget.querySelector('input') as HTMLInputElement);
      input?.focus();
    }}>
      {value.map((t, i) => (
        <span key={`${t}-${i}`} className="tag-input__tag">
          {t}
          <button type="button" aria-label={`Quitar ${t}`} onClick={() => onChange(value.filter((_, idx) => idx !== i))}><X size={12} /></button>
        </span>
      ))}
      <input
        id={id}
        className="tag-input__field"
        value={draft}
        disabled={disabled}
        placeholder={value.length === 0 ? placeholder : ''}
        onChange={(e) => {
          const v = e.target.value;
          if (separator.test(v)) addTags(v);
          else setDraft(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && draft.trim()) {
            e.preventDefault();
            addTags(draft);
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && addTags(draft)}
      />
    </div>
  );
}

// ---------- MoneyInput (CLP-friendly, but accepts any locale) -----------
export interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number | null;
  onChange: (v: number | null) => void;
  currency?: string;          // 'CLP' | 'USD' | 'EUR' | …
  locale?: string;            // 'es-CL' | …
  invalid?: boolean;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onChange, currency, locale, invalid, className, disabled, ...rest },
  ref
) {
  const brand = getBrand();
  const resolvedCurrency = currency ?? brand.currency;
  const resolvedLocale = locale ?? brand.locale;
  const [focus, setFocus] = React.useState(false);
  const display = value == null
    ? ''
    : focus
      ? String(value)
      : new Intl.NumberFormat(resolvedLocale, { style: 'currency', currency: resolvedCurrency, maximumFractionDigits: 0 }).format(value);
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      className={cx('input', invalid && 'is-invalid', className)}
      value={display}
      disabled={disabled}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d-]/g, '');
        if (!cleaned || cleaned === '-') return onChange(null);
        const n = Number(cleaned);
        onChange(Number.isFinite(n) ? n : null);
      }}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

// ---------- PhoneInput (CL default, prefix + digits) --------------------
export interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, prefix, invalid, disabled, className, id, placeholder = '9 1234 5678' }: PhoneInputProps) {
  const resolvedPrefix = prefix ?? getBrand().phonePrefix;
  return (
    <div className={cx('phone-input', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <span className="phone-input__prefix">{resolvedPrefix}</span>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        className="phone-input__field"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/[^\d ]/g, ''))}
        aria-invalid={invalid || undefined}
      />
    </div>
  );
}

// ---------- TimePicker (HH:mm) ------------------------------------------
export interface TimePickerProps {
  value: string;            // 'HH:mm'
  onChange: (v: string) => void;
  step?: number;            // minutes
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TimePicker({ value, onChange, step = 15, invalid, disabled, className, id }: TimePickerProps) {
  return (
    <input
      id={id}
      type="time"
      step={step * 60}
      className={cx('input', invalid && 'is-invalid', className)}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid || undefined}
    />
  );
}

// ---------- RadioGroup / CheckboxGroup ---------------------------------
export interface OptionItem<T = string> { value: T; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean }

export interface RadioGroupProps<T = string> {
  value: T | null;
  onChange: (v: T) => void;
  options: OptionItem<T>[];
  name: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function RadioGroup<T = string>({ value, onChange, options, name, orientation = 'vertical', className }: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" className={cx('option-group', `option-group--${orientation}`, className)}>
      {options.map((o) => (
        <label key={String(o.value)} className={cx('option-row', o.disabled && 'is-disabled')}>
          <input
            type="radio"
            className="radio"
            name={name}
            checked={o.value === value}
            disabled={o.disabled}
            onChange={() => onChange(o.value)}
          />
          <span className="option-row__body">
            <span className="option-row__label">{o.label}</span>
            {o.description && <span className="option-row__desc">{o.description}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

export interface CheckboxGroupProps<T = string> {
  value: T[];
  onChange: (v: T[]) => void;
  options: OptionItem<T>[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function CheckboxGroup<T = string>({ value, onChange, options, orientation = 'vertical', className }: CheckboxGroupProps<T>) {
  const set = new Set(value);
  return (
    <div role="group" className={cx('option-group', `option-group--${orientation}`, className)}>
      {options.map((o) => (
        <label key={String(o.value)} className={cx('option-row', o.disabled && 'is-disabled')}>
          <input
            type="checkbox"
            className="checkbox"
            checked={set.has(o.value)}
            disabled={o.disabled}
            onChange={() => {
              if (set.has(o.value)) onChange(value.filter((v) => v !== o.value));
              else onChange([...value, o.value]);
            }}
          />
          <span className="option-row__body">
            <span className="option-row__label">{o.label}</span>
            {o.description && <span className="option-row__desc">{o.description}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
