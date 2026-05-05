'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronUp, ChevronDown, MoreVertical } from './Icons';
import { Checkbox } from './Form';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

// ---------- DataTableRow (memoized) -------------------------------------
// Extracted as React.memo so unrelated parent re-renders don't churn through
// every row in the table. Combined with a ref-stable `onToggle`, only the
// row whose `selected` prop actually changed re-renders on toggle.
interface DataTableRowProps<T> {
  row: T;
  rowK: string;
  selected: boolean;
  selectable: boolean;
  selectAriaLabel: string;
  columns: Column<T>[];
  onToggle: (k: string) => void;
}

function DataTableRowImpl<T>({
  row, rowK, selected, selectable, selectAriaLabel, columns, onToggle,
}: DataTableRowProps<T>) {
  return (
    <tr className={cx(selected && 'is-selected')}>
      {selectable && (
        <td>
          <Checkbox
            checked={selected}
            onChange={() => onToggle(rowK)}
            aria-label={selectAriaLabel}
          />
        </td>
      )}
      {columns.map((c) => {
        const align = c.align ?? (c.numeric ? 'right' : 'left');
        const value = c.accessor
          ? c.accessor(row)
          : (row as Record<string, unknown>)[c.key] as React.ReactNode;
        return (
          <td
            key={c.key}
            className={cx(c.numeric && 'table__num')}
            style={{ textAlign: align }}
          >
            {value as React.ReactNode}
          </td>
        );
      })}
    </tr>
  );
}

// Cast preserves the generic signature through React.memo.
const DataTableRow = React.memo(DataTableRowImpl) as typeof DataTableRowImpl;

// ---------- DataTable ----------------------------------------------------
export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /**
   * Marks the column as numeric: cells get the `.table__num` class
   * (monospace + tabular alignment) and right-align by default.
   */
  numeric?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  /**
   * Sorting is uncontrolled inside the table — consumers re-order `rows`
   * in response to `onSortChange`. Stability of equal-keyed rows is the
   * caller's responsibility (use a stable sort like `Array.prototype.sort`
   * in V8/Node ≥ 12, or a tiebreaker on rowKey).
   */
  onSortChange?: (s: { key: string; dir: 'asc' | 'desc' } | null) => void;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  /**
   * "Select all" toggles only the rows currently passed to the component.
   * If the consumer paginates externally and only passes the visible page,
   * this selects the page — not the dataset across all pages.
   */
  onSelectionChange?: (keys: Set<string>) => void;
  empty?: React.ReactNode;
  /**
   * Renders an error state in place of the body. Takes precedence over
   * `loading`, `empty`, and rows. Use it when a fetch fails.
   */
  error?: React.ReactNode;
  loading?: boolean;
  /** Accessible name announced by screen readers (e.g. "Pedidos abiertos"). */
  ariaLabel?: string;
  /**
   * Builds the accessible label for the per-row checkbox so screen-reader
   * users can tell rows apart. Defaults to the row's key. Provide this
   * when the key isn't human-readable (e.g. a UUID).
   */
  rowLabel?: (row: T) => string;
  className?: string;
}

/**
 * Tabular data renderer with optional sorting, selection, error/empty/
 * loading states.
 *
 * State priority (only one body state renders at a time):
 *   error > loading > empty > rows
 *
 * Known limits (deferred to a later release):
 * - No virtualization; tested up to ~200 rows. For large datasets, plug
 *   in react-window/tanstack-virtual around the body rows.
 */
export function DataTable<T>({
  columns, rows, rowKey,
  sort, onSortChange,
  selectable, selectedKeys, onSelectionChange,
  empty, error, loading, ariaLabel, rowLabel, className,
}: DataTableProps<T>) {
  const t = useLocale();
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedKeys?.has(rowKey(r)));
  const someSelected = selectable && !allSelected && rows.some((r) => selectedKeys?.has(rowKey(r)));
  const headerCbRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = !!someSelected;
  }, [someSelected]);

  // Latest-props ref so toggleRow stays referentially stable across selection
  // changes. Without this, every selection update would create a new
  // toggleRow, defeating React.memo on DataTableRow.
  const propsRef = React.useRef({ rows, rowKey, selectedKeys, onSelectionChange });
  propsRef.current = { rows, rowKey, selectedKeys, onSelectionChange };

  const toggleAll = React.useCallback(() => {
    const { rows, rowKey, selectedKeys, onSelectionChange } = propsRef.current;
    if (!onSelectionChange) return;
    const allSel = rows.length > 0 && rows.every((r) => selectedKeys?.has(rowKey(r)));
    const next = new Set(selectedKeys);
    if (allSel) rows.forEach((r) => next.delete(rowKey(r)));
    else rows.forEach((r) => next.add(rowKey(r)));
    onSelectionChange(next);
  }, []);

  const toggleRow = React.useCallback((k: string) => {
    const { selectedKeys, onSelectionChange } = propsRef.current;
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(k)) next.delete(k); else next.add(k);
    onSelectionChange(next);
  }, []);

  const onSort = (col: Column<T>) => {
    if (!col.sortable || !onSortChange) return;
    if (!sort || sort.key !== col.key) onSortChange({ key: col.key, dir: 'asc' });
    else if (sort.dir === 'asc') onSortChange({ key: col.key, dir: 'desc' });
    else onSortChange(null);
  };

  return (
    <div className={cx('table-wrap', className)}>
      <table className="table data-table" aria-label={ariaLabel}>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" style={{ width: 40 }}>
                <Checkbox
                  ref={headerCbRef}
                  checked={!!allSelected}
                  onChange={toggleAll}
                  aria-label={t['table.selectAll']}
                />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const align = c.align ?? (c.numeric ? 'right' : 'left');
              const sortValue = c.sortable
                ? (active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none')
                : undefined;
              const headerInner = (
                <span className="data-table__th">
                  {c.header}
                  {c.sortable && (
                    <span className="data-table__sort" aria-hidden="true">
                      {active ? (sort!.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <MoreVertical size={12} />}
                    </span>
                  )}
                </span>
              );
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width, textAlign: align }}
                  aria-sort={sortValue}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      className="data-table__sort-btn"
                      onClick={() => onSort(c)}
                    >
                      {headerInner}
                    </button>
                  ) : headerInner}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="data-table__error"
                role="alert"
                style={{ padding: 32, textAlign: 'center' }}
              >
                {error}
              </td>
            </tr>
          ) : loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`s${i}`}>
                {selectable && <td><div className="skel" style={{ height: 14 }} /></td>}
                {columns.map((c) => <td key={c.key}><div className="skel" style={{ height: 12, width: '70%' }} /></td>)}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 32 }}>
                {empty ?? <div style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>{t['table.empty']}</div>}
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const k = rowKey(r);
              const label = rowLabel ? rowLabel(r) : k;
              return (
                <DataTableRow
                  key={k}
                  row={r}
                  rowK={k}
                  selected={!!selectedKeys?.has(k)}
                  selectable={!!selectable}
                  selectAriaLabel={format(t['table.selectRow'], { label })}
                  columns={columns}
                  onToggle={toggleRow}
                />
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
