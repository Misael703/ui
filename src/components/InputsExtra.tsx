'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { X, Clock } from './Icons';
import { getBrand } from '../brand';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

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
    blue: 'var(--color-primary)',
    orange: 'var(--color-secondary)',
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
  value, onChange, placeholder,
  separator = /[,\s]+/, maxTags, validate, disabled, className, id,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('');
  const locale = useLocale();
  const ph = placeholder ?? locale['tagsInput.placeholder'];

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
          <button type="button" aria-label={format(locale['tagsInput.remove'], { tag: t })} onClick={() => onChange(value.filter((_, idx) => idx !== i))}><X size={12} /></button>
        </span>
      ))}
      <input
        id={id}
        className="tag-input__field"
        value={draft}
        disabled={disabled}
        placeholder={value.length === 0 ? ph : ''}
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
  return (
    <div className={cx('phone-input', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      {prefix && <span className="phone-input__prefix">{prefix}</span>}
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

// ---------- TimePicker (custom popover, HH:mm[:ss] / hour) --------------
export type TimeGranularity = 'hour' | 'minute' | 'second';

const pad2 = (n: number) => String(n).padStart(2, '0');
const rangeBy = (end: number, step: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < end; i += step) out.push(i);
  return out;
};
// Parse 'HH', 'HH:mm' or 'HH:mm:ss' into a [h, m, s] tuple; missing parts → 0.
const parseTime = (v: string): [number, number, number] => {
  const [h, m, s] = v.split(':');
  return [Number(h) || 0, Number(m) || 0, Number(s) || 0];
};

export interface TimePickerProps {
  /**
   * Time of day. String format follows `granularity`: `'minute'` → `'HH:mm'`
   * (e.g. `'14:37'`), `'second'` → `'HH:mm:ss'` (e.g. `'14:37:09'`),
   * `'hour'` → `'HH:00'` (e.g. `'14:00'`).
   */
  value: string;
  onChange: (v: string) => void;
  /**
   * Precision of the control. Default `'minute'`.
   * - `'minute'`: hour + minute columns; value `HH:mm`.
   * - `'second'`: hour + minute + second columns; value `HH:mm:ss`.
   * - `'hour'`: a single hour column; value `HH:00`.
   */
  granularity?: TimeGranularity;
  /**
   * Increment of the finest column, in units of `granularity` (minutes /
   * seconds / hours). Omit for `1` (every value of the unit — e.g. any minute).
   * `step` thins that column: `granularity='minute'` + `step={15}` → minutes
   * `00 15 30 45`. Coarser columns always step by 1.
   */
  step?: number;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

// One scrollable column of the picker. A listbox with roving `aria-activedescendant`
// (the container is the single tab stop) so a 60-item column adds one focus stop,
// not sixty; Arrow/Home/End move + commit, and the active cell is centered.
function TimeColumn({ label, values, selected, idBase, onSelect }: {
  label: string;
  values: number[];
  selected: number;
  idBase: string;
  onSelect: (v: number) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && active) list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
  }, [selected]);
  const idx = Math.max(0, values.indexOf(selected));
  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = idx;
    if (e.key === 'ArrowDown') next = (idx + 1) % values.length;
    else if (e.key === 'ArrowUp') next = (idx - 1 + values.length) % values.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = values.length - 1;
    else return;
    e.preventDefault();
    onSelect(values[next]);
  };
  return (
    <div
      ref={listRef}
      className="timepicker__col kit-scrollbar"
      role="listbox"
      aria-label={label}
      tabIndex={0}
      aria-activedescendant={`${idBase}-${selected}`}
      onKeyDown={onKeyDown}
    >
      {values.map((v) => (
        <div
          key={v}
          id={`${idBase}-${v}`}
          role="option"
          aria-selected={v === selected}
          className={cx('timepicker__cell', v === selected && 'is-selected')}
          onClick={() => onSelect(v)}
        >{pad2(v)}</div>
      ))}
    </div>
  );
}

export function TimePicker({ value, onChange, granularity = 'minute', step, invalid, disabled, className, id }: TimePickerProps) {
  const t = useLocale();
  const reactId = React.useId();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const [h, m, s] = parseTime(value);
  const unitStep = step && step > 0 ? step : 1;
  const showMinutes = granularity !== 'hour';
  const showSeconds = granularity === 'second';
  // `step` thins the finest column for the chosen granularity; coarser ones step by 1.
  const hours = rangeBy(24, granularity === 'hour' ? unitStep : 1);
  const minutes = rangeBy(60, granularity === 'minute' ? unitStep : 1);
  const seconds = rangeBy(60, unitStep);

  const compose = (hh: number, mm: number, ss: number): string =>
    granularity === 'hour' ? `${pad2(hh)}:00`
      : granularity === 'minute' ? `${pad2(hh)}:${pad2(mm)}`
      : `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;

  const pos = usePopoverPosition(wrapRef, popoverRef, { open, side: 'bottom', align: 'start', offset: 4 });
  useDismiss({ open, onDismiss: () => setOpen(false), refs: [wrapRef, popoverRef], returnFocusRef: triggerRef });

  const label = value ? compose(h, m, s) : t['picker.selectTime'];

  return (
    <div ref={wrapRef} className={cx('timepicker', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="timepicker__trigger"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className="timepicker__icon" aria-hidden="true"><Clock size={16} /></span>
      </button>
      {open && (
        <Portal>
        <div
          ref={popoverRef}
          className={cx('timepicker__popover', 'is-floating')}
          role="dialog"
          aria-label={t['picker.selectTime']}
          style={{ position: 'fixed', top: pos.top, left: pos.left, visibility: pos.ready ? 'visible' : 'hidden' }}
        >
          <div className="timepicker__cols">
            <TimeColumn label={t['picker.hours']} idBase={`${reactId}-h`} values={hours} selected={h}
              onSelect={(hh) => onChange(compose(hh, m, s))} />
            {showMinutes && (
              <TimeColumn label={t['picker.minutes']} idBase={`${reactId}-m`} values={minutes} selected={m}
                onSelect={(mm) => onChange(compose(h, mm, s))} />
            )}
            {showSeconds && (
              <TimeColumn label={t['picker.seconds']} idBase={`${reactId}-s`} values={seconds} selected={s}
                onSelect={(ss) => onChange(compose(h, m, ss))} />
            )}
          </div>
        </div>
        </Portal>
      )}
    </div>
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
  /** Accessible name for the group (announced as "<label>, radio group" by screen readers). */
  label?: string;
  className?: string;
}

export function RadioGroup<T = string>({ value, onChange, options, name, orientation = 'vertical', label, className }: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('option-group', `option-group--${orientation}`, className)}>
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
