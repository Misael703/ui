'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronDown, ChevronUp, X } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

// ---------- FilterPanel -------------------------------------------------
export interface FilterPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  onClearAll?: () => void;
  activeCount?: number;
}

export function FilterPanel({ title, onClearAll, activeCount, className, children, ...rest }: FilterPanelProps) {
  const t = useLocale();
  const heading = title ?? t['filters.panel'];
  return (
    <aside className={cx('filter-panel', className)} aria-label={t['filters.panel']} {...rest}>
      <div className="filter-panel__head">
        <span className="filter-panel__title">
          {heading}
          {typeof activeCount === 'number' && activeCount > 0 && (
            <span className="filter-panel__count">{activeCount}</span>
          )}
        </span>
        {onClearAll && activeCount !== undefined && activeCount > 0 && (
          <button type="button" className="filter-panel__clear" onClick={onClearAll}>
            {t['filters.clear']}
          </button>
        )}
      </div>
      <div className="filter-panel__body">{children}</div>
    </aside>
  );
}

export interface FilterSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  defaultOpen?: boolean;
}

export function FilterSection({ title, defaultOpen = true, children, className, ...rest }: FilterSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={cx('filter-section', className)} {...rest}>
      <button
        type="button"
        className="filter-section__head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="filter-section__body">{children}</div>}
    </div>
  );
}

// ---------- BulkActionBar ----------------------------------------------
export interface BulkActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Cantidad de items seleccionados. La barra se oculta si es 0. */
  selectedCount: number;
  /** Texto opcional, default: "{N} seleccionado(s)". */
  label?: React.ReactNode;
  onClear?: () => void;
}

export function BulkActionBar({ selectedCount, label, onClear, className, children, ...rest }: BulkActionBarProps) {
  const t = useLocale();
  if (selectedCount <= 0) return null;
  const countText = format(
    selectedCount === 1 ? t['filters.selectedOne'] : t['filters.selectedMany'],
    { n: selectedCount }
  );
  return (
    <div className={cx('bulk-bar', className)} role="region" aria-label={t['filters.bulkActions']} {...rest}>
      <div className="bulk-bar__count">
        {label ?? countText}
        {onClear && (
          <button type="button" className="bulk-bar__clear" aria-label={t['filters.deselectAll']} onClick={onClear}>
            <X size={14} />
          </button>
        )}
      </div>
      <div className="bulk-bar__actions">{children}</div>
    </div>
  );
}

// ---------- SortDropdown -----------------------------------------------
export interface SortOption<T = string> {
  value: T;
  label: React.ReactNode;
}

export interface SortDropdownProps<T = string> {
  value: T;
  options: SortOption<T>[];
  onChange: (value: T) => void;
  label?: React.ReactNode;
  className?: string;
  id?: string;
}

export function SortDropdown<T extends string = string>({
  value, options, onChange, label, className, id,
}: SortDropdownProps<T>) {
  const t = useLocale();
  return (
    <label className={cx('sort-dropdown', className)}>
      <span className="sort-dropdown__label">{label ?? t['filters.sortBy']}</span>
      <select
        id={id}
        className="sort-dropdown__select select"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {typeof o.label === 'string' ? o.label : String(o.value)}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- FilterBar / FilterField ------------------------------------
// Horizontal, dense filter row (the bar ON TOP of a table) — the counterpart
// to FilterPanel's vertical facet sidebar. Without this, consumers hand-roll
// a flex cluster: heterogeneous control heights + the kit's loud brand label
// register make a 7-field row wrap and look ragged. FilterBar owns the grid,
// applies `.fields--dense` (36px controls, kit-owned), and FilterField uses a
// deliberately quiet label register — without mutating the global `--tt-label`
// brand token, so forms elsewhere are untouched.

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Right-aligned slot for row-level actions (e.g. clear-all, export). */
  actions?: React.ReactNode;
  /** Min column width (px) before the responsive grid wraps. Default 160. */
  minColWidth?: number;
  /**
   * Fixed column count instead of width-driven auto-fit. Use for a
   * deterministic N-up row rather than wrapping by available width.
   */
  columns?: number;
}

export function FilterBar({
  actions, minColWidth = 160, columns, className, children, style, ...rest
}: FilterBarProps): React.JSX.Element {
  const gridVars = {
    ...(columns ? { '--filter-cols': String(columns) } : { '--filter-col-min': `${minColWidth}px` }),
    ...style,
  } as React.CSSProperties;
  return (
    <div
      className={cx('filter-bar', 'fields--dense', columns ? 'filter-bar--fixed-cols' : undefined, className)}
      style={gridVars}
      {...rest}
    >
      <div className="filter-bar__fields">{children}</div>
      {actions != null && <div className="filter-bar__actions">{actions}</div>}
    </div>
  );
}

export interface FilterFieldProps {
  label: React.ReactNode;
  /** Override the auto-generated id (when the control sets its own id). */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterField({
  label, htmlFor, children, className,
}: FilterFieldProps): React.JSX.Element {
  const reactId = React.useId();
  // Effective id, in priority order: explicit htmlFor → the control's own id
  // → a generated one. Used for BOTH the label's `for` and the control, so a
  // consumer-set id stays authoritative and the label still points at it.
  const childId = React.isValidElement(children)
    ? (children.props as { id?: string }).id
    : undefined;
  const id = htmlFor ?? childId ?? reactId;
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div className={cx('filter-field', className)}>
      <label htmlFor={id} className="filter-field__label">{label}</label>
      {child}
    </div>
  );
}
