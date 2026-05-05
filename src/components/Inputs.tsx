import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

// ---------- NumberInput --------------------------------------------------
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'prefix'> {
  value?: number | null;
  onChange?: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  invalid?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onChange, min, max, step = 1, invalid, prefix, suffix, className, disabled, ...rest },
  ref
) {
  const t = useLocale();
  const set = (next: number | null) => {
    if (next == null) return onChange?.(null);
    let v = next;
    if (typeof min === 'number') v = Math.max(min, v);
    if (typeof max === 'number') v = Math.min(max, v);
    onChange?.(v);
  };
  const incr = (mult: number) => set((value ?? 0) + step * mult);
  return (
    <div className={cx('number-input', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <button type="button" className="number-input__btn" tabIndex={-1} aria-label={t['numberInput.decrement']} onClick={() => incr(-1)} disabled={disabled}>−</button>
      {prefix && <span className="number-input__affix">{prefix}</span>}
      <input
        ref={ref}
        type="number"
        className="number-input__field"
        value={value ?? ''}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => set(e.target.value === '' ? null : Number(e.target.value))}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {suffix && <span className="number-input__affix">{suffix}</span>}
      <button type="button" className="number-input__btn" tabIndex={-1} aria-label={t['numberInput.increment']} onClick={() => incr(1)} disabled={disabled}>+</button>
    </div>
  );
});

// ---------- Pagination ---------------------------------------------------
export interface PaginationProps {
  page: number;             // 1-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  className?: string;
}

function pageList(current: number, total: number, siblings: number): (number | '...')[] {
  if (total <= 1) return [1];
  const range = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out: (number | '...')[] = [1];
  if (start > 2) out.push('...');
  out.push(...range(start, end));
  if (end < total - 1) out.push('...');
  if (total > 1) out.push(total);
  return out;
}

export function Pagination({ page, pageSize, total, onPageChange, siblings = 1, className }: PaginationProps) {
  const t = useLocale();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = pageList(page, totalPages, siblings);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className={cx('pagination', className)} aria-label={t['pagination.label']}>
      <span className="pagination__info">{format(t['pagination.range'], { from, to, total })}</span>
      <button type="button" className="pagination__btn" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} aria-label={t['pagination.prev']}><ChevronLeft size={14} /></button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="pagination__ellipsis">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={cx('pagination__btn', p === page && 'is-active')}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button type="button" className="pagination__btn" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-label={t['pagination.next']}><ChevronRight size={14} /></button>
    </nav>
  );
}

// ---------- EmptyState ---------------------------------------------------
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx('empty', className)} role="status">
      {icon && <div className="empty__icon" aria-hidden="true">{icon}</div>}
      <div className="empty__title">{title}</div>
      {description && <div className="empty__desc">{description}</div>}
      {action}
    </div>
  );
}

// ---------- KPI / Stat card ----------------------------------------------
export interface KpiProps {
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: { value: string; trend: 'up' | 'down' | 'flat' };
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function Kpi({ label, value, delta, hint, icon, className }: KpiProps) {
  return (
    <div className={cx('kpi', className)}>
      <div className="kpi__head">
        <span className="kpi__label">{label}</span>
        {icon && <span className="kpi__icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className="kpi__value">{value}</div>
      <div className="kpi__foot">
        {delta && (
          <span className={cx('kpi__delta', `kpi__delta--${delta.trend}`)}>
            {delta.trend === 'up' ? <ChevronUp size={12} /> : delta.trend === 'down' ? <ChevronDown size={12} /> : '–'} {delta.value}
          </span>
        )}
        {hint && <span className="kpi__hint">{hint}</span>}
      </div>
    </div>
  );
}
