'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronUp, ChevronDown, ChevronRight, MoreVertical } from './Icons';
import { Checkbox } from './Form';
import { Popover } from './Popover';
import { Button } from './Button';
import { useVirtualRows } from '../hooks/useVirtualRows';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

// Truncation wrapper style: the column width is passed as a CSS variable (not
// an inline `max-width`) so the `mobileLayout="cards"` reset can override it —
// an inline max-width would beat the stylesheet and keep clipping on mobile.
// The line count for the clamp variant is inline (a per-column dynamic value).
type ClipStyle = React.CSSProperties & { '--table-cell-max'?: string };
function clipStyle(width: number | string | undefined, clampLines: number | undefined): ClipStyle {
  const style: ClipStyle = {};
  if (width != null) style['--table-cell-max'] = typeof width === 'number' ? `${width}px` : width;
  if (clampLines != null) style.WebkitLineClamp = clampLines;
  return style;
}

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
  /** Row expansion (resolved from `DataTableProps.renderExpanded`). */
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: (k: string) => void;
  expandLabel?: string;
  detailId?: string;
}

function DataTableRowImpl<T>({
  row, rowK, selected, selectable, selectAriaLabel, columns, onToggle,
  href, onActivate, actionLabel, renderRow,
  expandable, expanded, onToggleExpand, expandLabel, detailId,
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
      {expandable && (
        <td className={cx(interactive && 'data-table__cell--above')}>
          <button
            type="button"
            className="data-table__expand-btn"
            aria-expanded={expanded}
            // Only reference the panel while it exists in the DOM — a
            // collapsed row's aria-controls would point at a missing id.
            aria-controls={expanded ? detailId : undefined}
            aria-label={expandLabel}
            onClick={() => onToggleExpand?.(rowK)}
          >
            <ChevronRight size={16} />
          </button>
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
        const clampLines = typeof c.truncate === 'number' ? c.truncate : undefined;
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
            // Full value on hover — only when it's a primitive string; a JSX
            // cell manages its own title (the kit can't stringify an arbitrary
            // node). Set only while truncating, so non-truncated cells are
            // byte-identical to before.
            title={c.truncate && typeof value === 'string' ? value : undefined}
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
            {c.truncate ? (
              // The cap lives on this inner wrapper, not the <td>: under
              // table-layout:auto a <td> width is only a hint, but a child's
              // max-width bounds the column's max-content, so this is a HARD cap.
              <span
                className={cx('table__cell-clip', clampLines != null ? 'table__cell-clip--clamp' : 'table__cell-clip--line')}
                style={clipStyle(c.width, clampLines)}
              >
                {value as React.ReactNode}
              </span>
            ) : (
              value as React.ReactNode
            )}
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
  /**
   * Aggregate cell for this column (a total, a count, a "Total" label).
   * When ANY column sets it, the table renders a `<tfoot>` row styled like
   * the header band; in bounded (`maxHeight`) mode it stays pinned to the
   * bottom of the scroll box, so totals remain visible while rows scroll.
   * Aggregating is the consumer's job (the kit never sums for you — rows
   * may be a server page, and the page total ≠ the dataset total).
   * Only rendered with actual rows: the error / loading / empty states
   * have nothing meaningful to total. Hidden in `mobileLayout="cards"`
   * (cells lose their column geometry there, like the header does).
   */
  footer?: React.ReactNode;
  /**
   * Clip the cell so it can NEVER stretch the column (a hard cap even under
   * `table-layout: auto`, which the table uses — there a `<td>` width is only a
   * hint and long content still overflows).
   * - `true` → single line with an ellipsis.
   * - `n` (number) → clamp to `n` lines (`-webkit-line-clamp`).
   * Unspaced strings are broken (`overflow-wrap: anywhere`) so a long token never
   * overflows. The cap width comes from this column's `width` (else a 240px
   * default, overridable via the `--table-cell-max` CSS var). Not applied in
   * `mobileLayout="cards"` — cards already wrap and show the value in full.
   * When the cell value is a primitive string the full text is exposed via a
   * native `title` on hover; for cells that return a `ReactNode` (JSX) the kit
   * cannot derive a title — pass your own `title` on the rendered element.
   */
  truncate?: boolean | number;
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
   * Keep the table header pinned while rows scroll past it
   * (`position: sticky`). The header sticks to the nearest scrolling
   * ancestor: pair it with `maxHeight` to scroll inside a bounded box, or
   * leave `maxHeight` unset to let the header stick to an outer scroller
   * (a `Modal` body, the page) — one scroll, no nested scrollbar.
   *
   * NOTE: a wide table needs its own horizontal scroll, which only exists in
   * the bounded (`maxHeight`) mode. Without `maxHeight` the wrap is not a
   * scroll container, so a wider-than-container table overflows its parent —
   * use `maxHeight` for wide tables, or keep the table within its width.
   */
  stickyHeader?: boolean;
  /**
   * Cap the table's height and scroll its body inside a bounded box (the
   * wrap becomes the vertical scroll container). Accepts any CSS length
   * (`'70vh'`, `480`, `'30rem'`). Combine with `stickyHeader` for a
   * scroll-region table whose header stays pinned to the box. Leaving this
   * unset (with `stickyHeader`) makes the header stick to an outer scroller
   * instead — see `stickyHeader`.
   */
  maxHeight?: string | number;
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
  /**
   * Row expansion: renders a detail panel under the row (an order's line
   * items, an audit trail). Setting it adds a chevron toggle column; the
   * open panel is an extra `<tr>` spanning every column, recessed on the
   * header's grey band. Controlled like selection: pair with
   * `expandedKeys`/`onExpandedChange`. The toggle is a real `<button>`
   * (`aria-expanded` + `aria-controls` while open) and stays clickable on
   * interactive rows (above the stretched row link). In
   * `mobileLayout="cards"` the detail renders as its own card under the
   * row's card.
   */
  renderExpanded?: (row: T) => React.ReactNode;
  expandedKeys?: Set<string>;
  onExpandedChange?: (keys: Set<string>) => void;
  /**
   * Hides columns by key without mutating the canonical `columns` array —
   * the consumer keeps ONE column definition and toggles a `Set`. Header,
   * cells, totals footer, colSpans and mobile cards all follow. Pair with
   * `<ColumnToggle>` in the toolbar for the ready-made visibility menu.
   * Hiding every column is the consumer's foot-gun to avoid
   * (`ColumnToggle` already prevents it by disabling the last one).
   */
  hiddenColumnKeys?: Set<string>;
  /**
   * Fixed-height row windowing for large client-side datasets (1k-50k
   * rows): only the rows around the viewport hit the DOM; the rest become
   * two pixel-exact spacers. Requires `maxHeight` (the bounded scroller is
   * the measuring viewport) and UNIFORM row heights — it silently disables
   * itself when combined with `renderExpanded` (detail panels change row
   * heights) or `mobileLayout="cards"` (cards re-flow every row), because
   * a correct full render beats a broken windowed one. Selection,
   * select-all and sorting keep operating on the FULL `rows` array — only
   * the DOM is windowed. Prefer server pagination when you have it; this
   * is for the genuinely client-side big list.
   */
  virtualizeRows?: { rowHeight: number; overscan?: number };
  /**
   * Toolbar / filter zone that shares the table's rounded surface. When
   * set, the DataTable renders it INSIDE its own border+radius+overflow
   * surface (`.table-surface`): the toolbar is clipped to the radius,
   * there is exactly one divider between it and the header, and the
   * header band's corner-rounding is dropped so the strip is clean in the
   * corner — no card-border + filter-border + header-top stack, no seam.
   * Accepts any node (`<TableToolbar>`, `<FilterBar>`, a custom row). The
   * legacy sibling pattern (`<TableToolbar/><DataTable/>`) still works.
   */
  toolbar?: React.ReactNode;
  /**
   * Surface chrome mode. Default `'card'`: the table draws its own
   * border + radius (and `--table-elevation` if set), the standalone
   * surface. `'flush'`: drops that chrome so the table sits clean inside
   * a parent that already owns the surface (a `<Card>`) without doubling
   * the border or nesting a radius. Use `'flush'` for the embedded-in-Card
   * case; leave the default for standalone tables.
   */
  surface?: 'card' | 'flush';
  className?: string;
}

/**
 * Tabular data renderer with optional sorting, selection, error/empty/
 * loading states.
 *
 * State priority (only one body state renders at a time):
 *   error > loading > empty > rows
 *
 * Large datasets: prefer server pagination; for genuinely client-side big
 * lists use `virtualizeRows` (fixed-height windowing, v1.51.0).
 */
export function DataTable<T>({
  columns: allColumns, rows, rowKey,
  sort, onSortChange,
  selectable, selectedKeys, onSelectionChange,
  empty, error, loading, stickyHeader, maxHeight, mobileLayout = 'table',
  ariaLabel, rowLabel, className,
  density = 'compact', rowHref, onRowClick, renderRow, toolbar,
  renderExpanded, expandedKeys, onExpandedChange,
  hiddenColumnKeys, virtualizeRows,
  surface = 'card',
}: DataTableProps<T>) {
  const t = useLocale();
  // Everything below sees only the visible columns; hiding is a pure
  // pre-filter so header/cells/footer/colSpans stay in sync for free.
  const columns = React.useMemo(
    () => (hiddenColumnKeys?.size ? allColumns.filter((c) => !hiddenColumnKeys.has(c.key)) : allColumns),
    [allColumns, hiddenColumnKeys]
  );
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedKeys?.has(rowKey(r)));
  const someSelected = selectable && !allSelected && rows.some((r) => selectedKeys?.has(rowKey(r)));
  const headerCbRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = !!someSelected;
  }, [someSelected]);

  // On-scroll header elevation (bounded `maxHeight` + `stickyHeader` only).
  // A zero-height sentinel sits at the top of the inner scroll container; an
  // IntersectionObserver flips `stuck` when it leaves the scroller's top, so
  // the sticky header gains a soft drop shadow once content scrolls beneath
  // it. IO (not a scroll listener) → no per-frame work; SSR/jsdom-safe via
  // the `typeof` guard. Ancestor-stick mode keeps the flush header (the
  // outer scroller isn't ours to observe).
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = React.useState(false);
  const elevatable = stickyHeader && maxHeight != null;
  React.useEffect(() => {
    if (!elevatable) { setStuck(false); return; }
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { root, threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [elevatable]);

  // Latest-props ref so toggleRow stays referentially stable across selection
  // changes. Without this, every selection update would create a new
  // toggleRow, defeating React.memo on DataTableRow.
  const propsRef = React.useRef({ rows, rowKey, selectedKeys, onSelectionChange, expandedKeys, onExpandedChange });
  propsRef.current = { rows, rowKey, selectedKeys, onSelectionChange, expandedKeys, onExpandedChange };

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

  const toggleExpand = React.useCallback((k: string) => {
    const { expandedKeys, onExpandedChange } = propsRef.current;
    if (!onExpandedChange) return;
    const next = new Set(expandedKeys);
    if (next.has(k)) next.delete(k); else next.add(k);
    onExpandedChange(next);
  }, []);

  const expandable = renderExpanded != null;
  // Stable per-table id base for the detail panels' aria-controls wiring.
  const tableId = React.useId();
  const totalCols = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  // Row windowing — gated to the combinations where fixed-height math is
  // actually true (see the prop's JSDoc). When the gate is off the hook is
  // inert and returns the full range, so there is ONE render path below.
  const virtual =
    virtualizeRows != null && maxHeight != null && !expandable && mobileLayout !== 'cards';
  const vrange = useVirtualRows(scrollRef, {
    count: rows.length,
    rowHeight: virtualizeRows?.rowHeight ?? 1,
    overscan: virtualizeRows?.overscan,
    enabled: virtual,
  });

  const onSort = (col: Column<T>) => {
    if (!col.sortable || !onSortChange) return;
    if (!sort || sort.key !== col.key) onSortChange({ key: col.key, dir: 'asc' });
    else if (sort.dir === 'asc') onSortChange({ key: col.key, dir: 'desc' });
    else onSortChange(null);
  };

  const tableEl = (
      <table
        className={cx(
          'table data-table',
          density === 'comfortable' && 'table--comfortable',
        )}
        aria-label={ariaLabel}
        // With windowing the DOM row count lies to assistive tech; declare
        // the real dataset size (+1 = the header row, per the ARIA spec).
        aria-rowcount={virtual ? rows.length + 1 : undefined}
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
            {/* Visually empty but properly named: it IS the column header
                of the toggle column (a `td` here would lose the thead band
                and sticky CSS, which target `thead th`). */}
            {expandable && <th scope="col" style={{ width: 36 }} aria-label={t['table.expandColumn']} />}
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
                colSpan={totalCols}
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
                {expandable && <td aria-hidden="true" />}
                {columns.map((c) => <td key={c.key}><div className="skel" style={{ height: 12, width: '70%' }} /></td>)}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={totalCols} style={{ padding: 32 }}>
                {empty ?? <div style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>{t['table.empty']}</div>}
              </td>
            </tr>
          ) : (
            <>
            {virtual && vrange.padTop > 0 && (
              <tr className="data-table__spacer" aria-hidden="true">
                <td colSpan={totalCols} style={{ height: vrange.padTop }} />
              </tr>
            )}
            {(virtual ? rows.slice(vrange.start, vrange.end) : rows).map((r) => {
              const k = rowKey(r);
              const label = rowLabel ? rowLabel(r) : k;
              const href = rowHref?.(r);
              const onActivate = onRowClick ? () => onRowClick(r) : undefined;
              const expanded = expandable && !!expandedKeys?.has(k);
              const detailId = `${tableId}-detail-${k}`;
              return (
                <React.Fragment key={k}>
                  <DataTableRow
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
                    expandable={expandable}
                    expanded={expanded}
                    onToggleExpand={toggleExpand}
                    expandLabel={format(t['table.expandRow'], { label })}
                    detailId={detailId}
                  />
                  {expanded && (
                    <tr className="data-table__detail">
                      <td colSpan={totalCols} id={detailId}>
                        {renderExpanded(r)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {virtual && vrange.padBottom > 0 && (
              <tr className="data-table__spacer" aria-hidden="true">
                <td colSpan={totalCols} style={{ height: vrange.padBottom }} />
              </tr>
            )}
            </>
          )}
        </tbody>
        {columns.some((c) => c.footer != null) && !error && !loading && rows.length > 0 && (
          <tfoot>
            <tr>
              {selectable && <td />}
              {expandable && <td aria-hidden="true" />}
              {columns.map((c) => {
                const align = c.align ?? (c.numeric ? 'right' : 'left');
                return (
                  <td
                    key={c.key}
                    className={cx(
                      c.numeric && 'table__num',
                      align !== 'left' && `table__align-${align}`,
                    )}
                    style={{ textAlign: align }}
                  >
                    {c.footer}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
  );
  // Bounded mode (`maxHeight`): the table lives in an inner scroll
  // container, while the outer `.table-wrap` keeps the border/radius and
  // `overflow: hidden` clips it cleanly — including the sticky header's
  // paint and the scrollbar corners. (A single element that is BOTH the
  // rounded box AND the sticky scroll container can't clip the sticky paint
  // to its radius in Chrome; splitting the two does, because the outer
  // clipping element is no longer the sticky's scroll container.)
  const wrap = (
    <div
      className={cx(
        'table-wrap',
        stickyHeader && 'table-wrap--sticky',
        maxHeight != null && 'table-wrap--scroll',
        mobileLayout === 'cards' && 'table-wrap--cards',
        surface === 'flush' && toolbar == null && 'table-wrap--flush',
        className,
      )}
    >
      {maxHeight != null
        ? (
          <div
            ref={scrollRef}
            className={cx('table-wrap__scroll', stuck && 'is-stuck')}
            style={{ maxHeight }}
          >
            {elevatable && <div ref={sentinelRef} className="table-wrap__sentinel" aria-hidden="true" />}
            {tableEl}
          </div>
        )
        : tableEl}
    </div>
  );
  // No toolbar → byte-identical legacy output. With a toolbar, the
  // DataTable owns the single rounded+clipped+bordered surface; the inner
  // .table-wrap defers its border/radius (CSS) and stays the scroll/sticky
  // context, so existing behaviour is untouched.
  return toolbar == null ? wrap : (
    <div className={cx('table-surface', surface === 'flush' && 'table-surface--flush')}>
      <div className="table-surface__bar">{toolbar}</div>
      {wrap}
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

// ---------- ColumnToggle ---------------------------------------------------
export interface ColumnToggleProps {
  /**
   * The CANONICAL column list (pass the same array the table gets, or a
   * `{key, header}` subset) — the menu lists every column regardless of
   * current visibility. Non-string headers render as-is in the menu.
   */
  columns: Array<{ key: string; header: React.ReactNode }>;
  hiddenKeys: Set<string>;
  onChange: (keys: Set<string>) => void;
  /** Trigger label. Defaults to the `table.columns` locale string. */
  label?: React.ReactNode;
  className?: string;
}

/**
 * Ready-made column-visibility menu for the table toolbar: a button that
 * opens a checkbox list, driving `DataTable.hiddenColumnKeys`. The popover
 * stays open across toggles (multi-adjust without reopening). The last
 * visible column's checkbox is disabled — a table with zero columns is a
 * broken state no menu should be able to reach.
 */
export function ColumnToggle({ columns, hiddenKeys, onChange, label, className }: ColumnToggleProps) {
  const t = useLocale();
  const visibleCount = columns.length - columns.filter((c) => hiddenKeys.has(c.key)).length;
  const toggle = (key: string) => {
    const next = new Set(hiddenKeys);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange(next);
  };
  return (
    <Popover
      className={className}
      placement="bottom"
      align="end"
      ariaLabel={t['table.columns']}
      trigger={<Button type="button" variant="secondary" size="sm">{label ?? t['table.columns']}</Button>}
    >
      <div className="column-toggle" role="group" aria-label={t['table.columns']}>
        {columns.map((c) => {
          const visible = !hiddenKeys.has(c.key);
          // Checkbox already renders a <label> wrapper with `children` as
          // the label text — wrapping it in another label would nest labels
          // (invalid HTML). Compose via children instead.
          return (
            <Checkbox
              key={c.key}
              className="column-toggle__item"
              checked={visible}
              disabled={visible && visibleCount === 1}
              onChange={() => toggle(c.key)}
            >
              {c.header}
            </Checkbox>
          );
        })}
      </div>
    </Popover>
  );
}
