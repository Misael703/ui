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
  /** Resolved from `rowHref(row)` — makes the row a navigable link. */
  href?: string;
  /** Resolved from `onRowClick(row)` — makes the row activate a callback. */
  onActivate?: () => void;
  /** Accessible name for the stretched row control (e.g. "Ver Taladro"). */
  actionLabel?: string;
  /** Full-control escape hatch (see `DataTableProps.renderRow`). */
  renderRow?: (args: {
    row: T;
    cells: React.ReactNode;
    rowKey: string;
  }) => React.ReactNode;
}

function DataTableRowImpl<T>({
  row, rowK, selected, selectable, selectAriaLabel, columns, onToggle,
  href, onActivate, actionLabel, renderRow,
}: DataTableRowProps<T>) {
  const interactive = !renderRow && (!!href || !!onActivate);

  const cells = (
    <>
      {selectable && (
        <td className={cx(interactive && 'data-table__cell--above')}>
          <Checkbox
            checked={selected}
            onChange={() => onToggle(rowK)}
            aria-label={selectAriaLabel}
          />
        </td>
      )}
      {columns.map((c, ci) => {
        const align = c.align ?? (c.numeric ? 'right' : 'left');
        const value = c.accessor
          ? c.accessor(row)
          : (row as Record<string, unknown>)[c.key] as React.ReactNode;
        // data-label is consumed by the .data-table--cards CSS to surface
        // the column header as an inline label on each row when the table
        // collapses to a card layout on narrow viewports. Non-string
        // headers (e.g. JSX) can't be projected through `attr()` so we
        // omit the attribute and the cell renders without a visible label.
        const label = typeof c.header === 'string' ? c.header : undefined;
        return (
          <td
            key={c.key}
            // `table__align-*` makes alignment authoritative for ANY cell
            // content. `text-align` alone silently fails for a block/flex
            // child (e.g. an action column of buttons → floated left); the
            // class adds the matching `margin` auto so element children
            // honor `align` too. Left cells emit no extra class → byte-
            // identical to pre-1.10.0 (zero regression for the default).
            className={cx(
              c.numeric && 'table__num',
              align !== 'left' && `table__align-${align}`,
            )}
            style={{ textAlign: align }}
            data-label={label}
          >
            {/* Stretched row control: a real <a>/<button> in the first
                data cell, overlaying the whole row (the <tr> is the
                positioned ancestor). Keyboard-operable + SR-labelled +
                valid table markup — no role hacks, no onClick-only div.
                Visually empty; the cells stay the visible content. Other
                interactive cell content opts above it via
                `data-table__cell--above` (stretched-link pattern). */}
            {interactive && ci === 0 && (
              href ? (
                <a
                  href={href}
                  className="data-table__rowlink"
                  aria-label={actionLabel}
                  onClick={onActivate}
                />
              ) : (
                <button
                  type="button"
                  className="data-table__rowlink"
                  aria-label={actionLabel}
                  onClick={onActivate}
                />
              )
            )}
            {value as React.ReactNode}
          </td>
        );
      })}
    </>
  );

  if (renderRow) return <>{renderRow({ row, cells, rowKey: rowK })}</>;

  return (
    <tr className={cx(selected && 'is-selected', interactive && 'is-clickable')}>
      {cells}
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
  /**
   * Sticky-position the table header so it stays visible while the body
   * scrolls. The wrapper itself becomes the vertical scroll container
   * (the table is already overflow-x:auto, so an outer scroller can't reach
   * the header). Defaults to `max-height: 70vh`; override by passing a
   * `className` with a different `max-height`. Do NOT wrap `<DataTable>` in
   * your own `overflow-y:auto` container — that breaks the sticky context.
   */
  stickyHeader?: boolean;
  /**
   * Layout for narrow viewports (`<600px`):
   * - `'table'` (default): the table scrolls horizontally inside its wrapper.
   * - `'cards'`: each row collapses to a stacked card with the column
   *   header as an inline label per cell. Requires string `header` values
   *   for the labels to appear; non-string headers render without a label.
   */
  mobileLayout?: 'table' | 'cards';
  /** Accessible name announced by screen readers (e.g. "Pedidos abiertos"). */
  ariaLabel?: string;
  /**
   * Builds the accessible label for the per-row checkbox so screen-reader
   * users can tell rows apart. Defaults to the row's key. Provide this
   * when the key isn't human-readable (e.g. a UUID).
   */
  rowLabel?: (row: T) => string;
  /**
   * Body density. Default `'compact'` (v1.10.0): a readable-dense register
   * (~30px rows, `--text-xs`, single-line cells) — the right default for
   * the data-heavy screens this kit serves ("default = product"). Pass
   * `'comfortable'` to opt back into the pre-1.10.0 airy 14px/16px rows
   * (which wrap to two lines).
   */
  density?: 'comfortable' | 'compact';
  /**
   * Makes every row a navigable link. The kit renders a real, keyboard-
   * operable, screen-reader-labelled `<a>` stretched over the row — valid
   * table markup (no `role` hacks, no `asChild` on `<tr>`, never an
   * onClick-only div). One Tab stop per row; Enter activates; the focus
   * ring shows on the row. Additive; combinable with `onRowClick`.
   */
  rowHref?: (row: T) => string;
  /**
   * Makes every row activate a callback (pointer **and** keyboard).
   * Renders a real stretched `<button>` with the same a11y guarantees as
   * `rowHref`. Prefer `rowHref` when the action is navigation.
   */
  onRowClick?: (row: T) => void;
  /**
   * Full-control escape hatch — the render-prop polymorphism the kit uses
   * for data/array-driven components (cf. `AppShell.linkAs`; deliberately
   * NOT `asChild`, which would emit invalid markup on `<tr>`). Receives the
   * row, the kit-rendered `cells`, and the row key; return your own row
   * element (e.g. a framework `<Link>` wrapping a `<tr>`). When set,
   * `rowHref`/`onRowClick` are ignored (you own row interactivity & a11y).
   */
  renderRow?: (args: {
    row: T;
    cells: React.ReactNode;
    rowKey: string;
  }) => React.ReactNode;
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
  empty, error, loading, stickyHeader, mobileLayout = 'table',
  ariaLabel, rowLabel, className,
  density = 'compact', rowHref, onRowClick, renderRow,
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
    <div
      className={cx(
        'table-wrap',
        stickyHeader && 'table-wrap--sticky',
        mobileLayout === 'cards' && 'table-wrap--cards',
        className,
      )}
    >
      <table
        className={cx(
          'table data-table',
          density === 'comfortable' && 'table--comfortable',
        )}
        aria-label={ariaLabel}
      >
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
              const href = rowHref?.(r);
              const onActivate = onRowClick ? () => onRowClick(r) : undefined;
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
                  href={href}
                  onActivate={onActivate}
                  actionLabel={format(t['table.rowAction'], { label })}
                  renderRow={renderRow}
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
  const reactId = React.useId();
  const triggerId = `accordion-trigger-${reactId}`;
  const panelId = `accordion-panel-${reactId}`;
  return (
    <div className={cx('accordion__item', isOpen && 'is-open')}>
      <button
        type="button"
        id={triggerId}
        className="accordion__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => ctx.toggle(id)}
      >
        <span>{title}</span>
        <span className="accordion__chev" aria-hidden="true"><ChevronDown size={14} /></span>
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="accordion__panel"
        >
          {children}
        </div>
      )}
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

// ---------- TablePagination ---------------------------------------------
// Convenience wrapper that pairs a page-size selector with a Pagination
// row. Use it under a DataTable when the table is paginated externally.
import { Pagination } from './Inputs';

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** If set, renders a page-size selector. Omit for fixed-size pagination. */
  onPageSizeChange?: (size: number) => void;
  /** Options shown in the page-size selector. Default `[10, 25, 50, 100]`. */
  pageSizeOptions?: readonly number[];
  className?: string;
}

export function TablePagination({
  page, pageSize, total, onPageChange,
  onPageSizeChange, pageSizeOptions = [10, 25, 50, 100],
  className,
}: TablePaginationProps) {
  const t = useLocale();
  const selectId = React.useId();
  return (
    <div className={cx('table-pagination', className)}>
      {onPageSizeChange && (
        <label className="table-pagination__size" htmlFor={selectId}>
          <span>{t['pagination.rowsPerPage']}</span>
          <select
            id={selectId}
            className="select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      )}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
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
