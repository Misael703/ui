'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronUp, ChevronDown, MoreVertical } from './Icons';

// ---------- DataTable ----------------------------------------------------
export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  onSortChange?: (s: { key: string; dir: 'asc' | 'desc' } | null) => void;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  empty?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns, rows, rowKey,
  sort, onSortChange,
  selectable, selectedKeys, onSelectionChange,
  empty, loading, className,
}: DataTableProps<T>) {
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedKeys?.has(rowKey(r)));
  const someSelected = selectable && !allSelected && rows.some((r) => selectedKeys?.has(rowKey(r)));
  const headerCbRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = !!someSelected;
  }, [someSelected]);

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (allSelected) rows.forEach((r) => next.delete(rowKey(r)));
    else rows.forEach((r) => next.add(rowKey(r)));
    onSelectionChange(next);
  };

  const toggleRow = (k: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(k)) next.delete(k); else next.add(k);
    onSelectionChange(next);
  };

  const onSort = (col: Column<T>) => {
    if (!col.sortable || !onSortChange) return;
    if (!sort || sort.key !== col.key) onSortChange({ key: col.key, dir: 'asc' });
    else if (sort.dir === 'asc') onSortChange({ key: col.key, dir: 'desc' });
    else onSortChange(null);
  };

  return (
    <div className={cx('table-wrap', className)}>
      <table className="table data-table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 40 }}>
                <input
                  ref={headerCbRef}
                  type="checkbox"
                  className="checkbox"
                  checked={!!allSelected}
                  onChange={toggleAll}
                  aria-label="Seleccionar todo"
                />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  style={{ width: c.width, textAlign: c.align ?? 'left', cursor: c.sortable ? 'pointer' : undefined }}
                  aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => onSort(c)}
                >
                  <span className="data-table__th">
                    {c.header}
                    {c.sortable && (
                      <span className="data-table__sort">
                        {active ? (sort!.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <MoreVertical size={12} />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`s${i}`}>
                {selectable && <td><div className="skel" style={{ height: 14 }} /></td>}
                {columns.map((c) => <td key={c.key}><div className="skel" style={{ height: 12, width: '70%' }} /></td>)}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 32 }}>
                {empty ?? <div style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>Sin datos</div>}
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const k = rowKey(r);
              const sel = selectedKeys?.has(k);
              return (
                <tr key={k} className={cx(sel && 'is-selected')}>
                  {selectable && (
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={!!sel}
                        onChange={() => toggleRow(k)}
                        aria-label="Seleccionar fila"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align ?? 'left' }}>
                      {c.accessor ? c.accessor(r) : (r as any)[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Accordion ----------------------------------------------------
interface AccordionContextValue {
  open: Set<string>;
  toggle: (id: string) => void;
  multiple: boolean;
}
const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  multiple?: boolean;
  defaultOpen?: string[];
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ multiple = false, defaultOpen = [], children, className }: AccordionProps) {
  const [open, setOpen] = React.useState<Set<string>>(new Set(defaultOpen));
  const toggle = (id: string) => {
    setOpen((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };
  return (
    <AccordionContext.Provider value={{ open, toggle, multiple }}>
      <div className={cx('accordion', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, title, children }: { id: string; title: React.ReactNode; children: React.ReactNode }) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('<AccordionItem> must be used inside <Accordion>');
  const isOpen = ctx.open.has(id);
  return (
    <div className={cx('accordion__item', isOpen && 'is-open')}>
      <button
        type="button"
        className="accordion__trigger"
        aria-expanded={isOpen}
        onClick={() => ctx.toggle(id)}
      >
        <span>{title}</span>
        <span className="accordion__chev" aria-hidden="true"><ChevronDown size={14} /></span>
      </button>
      {isOpen && <div className="accordion__panel">{children}</div>}
    </div>
  );
}

// ---------- Breadcrumbs --------------------------------------------------
export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cx('breadcrumbs', className)}>
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              {it.href && !last ? <a href={it.href}>{it.label}</a> : <span aria-current={last ? 'page' : undefined}>{it.label}</span>}
              {!last && <span aria-hidden="true" className="breadcrumbs__sep">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------- TableToolbar -------------------------------------------------
// Barra superior que se compone arriba (o dentro de un wrapper) de un DataTable.
// Cualquier hijo con className "grow" se expande para empujar las acciones al lado.
export const TableToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TableToolbar({ className, ...rest }, ref) {
    return <div ref={ref} className={cx('table-toolbar', className)} {...rest} />;
  }
);
