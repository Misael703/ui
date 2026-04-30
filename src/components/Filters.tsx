'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronDown, ChevronUp, X } from './Icons';

// ---------- FilterPanel -------------------------------------------------
export interface FilterPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  onClearAll?: () => void;
  activeCount?: number;
}

export function FilterPanel({ title = 'Filtros', onClearAll, activeCount, className, children, ...rest }: FilterPanelProps) {
  return (
    <aside className={cx('filter-panel', className)} aria-label="Filtros" {...rest}>
      <div className="filter-panel__head">
        <span className="filter-panel__title">
          {title}
          {typeof activeCount === 'number' && activeCount > 0 && (
            <span className="filter-panel__count">{activeCount}</span>
          )}
        </span>
        {onClearAll && activeCount !== undefined && activeCount > 0 && (
          <button type="button" className="filter-panel__clear" onClick={onClearAll}>
            Limpiar
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
  if (selectedCount <= 0) return null;
  return (
    <div className={cx('bulk-bar', className)} role="region" aria-label="Acciones en lote" {...rest}>
      <div className="bulk-bar__count">
        {label ?? `${selectedCount} seleccionado${selectedCount === 1 ? '' : 's'}`}
        {onClear && (
          <button type="button" className="bulk-bar__clear" aria-label="Deseleccionar todo" onClick={onClear}>
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
  value, options, onChange, label = 'Ordenar por', className, id,
}: SortDropdownProps<T>) {
  return (
    <label className={cx('sort-dropdown', className)}>
      <span className="sort-dropdown__label">{label}</span>
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
