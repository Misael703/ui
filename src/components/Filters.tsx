'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronDown, ChevronUp, X, Filter } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Drawer } from './Overlay';
import { Button, IconButton } from './Button';
import { Chip } from './Display';
import { ToolbarActions, type ToolbarAction } from './ToolbarActions';
export type { ToolbarAction } from './ToolbarActions';
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

export type FilterBarLayout = 'inline' | 'collapse' | 'drawer';

/** One applied filter, for the chips row (v3.8.0). `key` matches the `key` of the FilterField it belongs to. */
export interface AppliedFilter {
  key: string;
  label: React.ReactNode;
  value?: React.ReactNode;
  onRemove?: () => void;
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Right-aligned, read-only slot for the RESULT of the filters — the row
   * count ("12 pedidos"), a total, or a Skeleton while it loads. Sits at the
   * fields' baseline, at the end of the row, and wraps together with `actions`.
   * Rendered as a live region (`role="status"`), so a screen reader hears the
   * new count when a filter changes — the only signal that the filter acted.
   * Not an action: `actions` is for controls (Limpiar, Exportar); this is a
   * datum, and a datum lives next to what produces it.
   */
  summary?: React.ReactNode;
  /** Right-aligned slot for row-level actions (e.g. clear-all, export). */
  actions?: React.ReactNode;
  /**
   * Actions that may leave the bar on a phone (v3.7.0). Above 600px they
   * render inline after `actions` as tertiary buttons (ghost `sm` + icon);
   * below, they collapse into a "⋯" menu. Put Exportar here; keep Limpiar in
   * `actions` — it is contextual and must stay visible when filters apply.
   */
  overflow?: ToolbarAction[];
  /**
   * Sort control for the bar (v3.7.0). On a phone the table is cards and
   * has no header row, so header sorting is unreachable: the bar renders a
   * `SortDropdown` in its trailing group. `sortOn` says when — `'mobile'`
   * (default, below 600px only: on a desk the header sorts) or `'always'`.
   */
  sort?: SortDropdownProps;
  sortOn?: 'mobile' | 'always';
  /**
   * How the fields show above 600px (v3.8.0) — the "how much do you hide"
   * scale, each step with a cost:
   * - `'inline'` (default): every field, wrapping when the row is full. Zero
   *   clicks, every applied value in view. Right until the set wraps.
   * - `'collapse'`: the first N fields inline, the rest behind a "Más
   *   filtros" toggle. N comes from `visibleCount`. The bar MEASURES itself
   *   and collapses only when the full set does not fit one line — a set
   *   that fits shows whole and has no toggle.
   * - `'drawer'`: the fields live behind the funnel button; `pinned` keeps
   *   some in the bar (the search box). Applied state is invisible here, so
   *   `applied` (the chips row) is required — a dev warning says so.
   * Omitting `layout` with a `visibleCount` means `'collapse'` (3.7.0 compat).
   */
  layout?: FilterBarLayout;
  /**
   * The same choice below 600px. Default `'drawer'`: an expanded bar on a
   * phone is a column of fields that pushes the table off-screen.
   */
  mobileLayout?: FilterBarLayout;
  /**
   * With `layout="collapse"`: how many fields stay inline when collapsed. A
   * number is a cap (the daily filters, search first) — the bar shows
   * `min(visibleCount, capacity)`; `'auto'` (default) shows as many as fit
   * the first line next to the toggle, priority+ style.
   */
  visibleCount?: number | 'auto';
  /**
   * With `layout="drawer"`: fields that stay in the bar (typically the
   * search box). Everything in `children` goes behind the funnel.
   */
  pinned?: React.ReactNode;
  /**
   * The filters currently holding a value (v3.8.0). Rendered as a row of
   * removable chips under the fields ("Estado: Pendiente ×"), and used to
   * derive the badges on the funnel and the "Más filtros" toggle (an applied
   * filter never hides silently). The bar cannot know the values — it does
   * not own them — so the consumer lists them. Required with `'drawer'`.
   */
  applied?: AppliedFilter[];
  /** @deprecated 3.8.0 — derived from `applied`. Kept as a fallback badge count for the toggle. */
  hiddenActiveCount?: number;
  /** Start expanded (uncontrolled; the toggle owns the state after mount). */
  defaultExpanded?: boolean;
  /** @deprecated 3.8.0 — use `mobileLayout`. */
  mobile?: 'drawer' | 'inline';
  /** @deprecated 3.8.0 — derived from `applied`. Kept as a fallback badge count for the funnel. */
  activeCount?: number;
  /** Min field width (px) before the row wraps; fields grow from it. Default 160. */
  minColWidth?: number;
  /**
   * Fixed column count instead of width-driven auto-fit. Use for a
   * deterministic N-up row rather than wrapping by available width.
   */
  columns?: number;
}

const MOBILE_QUERY = '(max-width: 600px)';

/**
 * How many `minColWidth` fields fit on the bar's first line next to the
 * trailing group: `floor((bar − end + gap) / (min + gap))`. `null` until the
 * bar has a measured width (server render, jsdom): the caller treats null as
 * "everything fits" so the first paint shows every field and collapses on
 * mount rather than the other way round. Re-measures on resize.
 */
function useFilterCapacity(
  barRef: React.RefObject<HTMLDivElement | null>,
  endRef: React.RefObject<HTMLDivElement | null>,
  minColWidth: number,
  enabled: boolean,
): number | null {
  const [capacity, setCapacity] = React.useState<number | null>(null);
  const measure = React.useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    const cs = getComputedStyle(bar);
    const inner = bar.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0');
    if (!(inner > 0)) { setCapacity(null); return; }
    const gap = parseFloat(cs.columnGap || '') || 16;
    const end = endRef.current?.offsetWidth ?? 0;
    const n = Math.floor((inner - end + gap) / (minColWidth + gap));
    setCapacity((prev) => (prev === n ? prev : n));
  }, [barRef, endRef, minColWidth]);
  React.useLayoutEffect(() => {
    if (!enabled) return;
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    if (barRef.current) ro.observe(barRef.current);
    if (endRef.current) ro.observe(endRef.current);
    return () => ro.disconnect();
  }, [enabled, measure, barRef, endRef]);
  return enabled ? capacity : null;
}

let warnedDrawerWithoutApplied = false;

/** React keys from `Children.toArray` carry a ".$" prefix; strip it to compare with `AppliedFilter.key`. */
const childKey = (el: React.ReactNode): string | null =>
  React.isValidElement(el) && el.key != null ? String(el.key).replace(/^\.\$/, '') : null;

export function FilterBar({
  summary, actions, overflow, sort, sortOn = 'mobile',
  layout, mobileLayout, visibleCount = 'auto', pinned, applied,
  hiddenActiveCount = 0, defaultExpanded = false,
  mobile, activeCount = 0,
  minColWidth = 160, columns, className, children, style, ...rest
}: FilterBarProps): React.JSX.Element {
  const t = useLocale();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const narrow = useMediaQuery(MOBILE_QUERY);
  const barRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  // Effective layout: 3.7.0 props map onto the modes (visibleCount alone
  // meant "collapse"; `mobile` was the phone choice).
  const deskLayout: FilterBarLayout = layout ?? (typeof visibleCount === 'number' ? 'collapse' : 'inline');
  const phoneLayout: FilterBarLayout = mobileLayout ?? (mobile === 'inline' ? deskLayout : 'drawer');
  const mode: FilterBarLayout = narrow ? phoneLayout : deskLayout;

  if (mode === 'drawer' && applied == null && !warnedDrawerWithoutApplied) {
    warnedDrawerWithoutApplied = true;
    console.warn('[FilterBar] layout="drawer" hides the applied state: pass `applied` so the values show as chips.');
  }

  const sortEl = sort != null && (sortOn === 'always' || narrow) ? <SortDropdown {...sort} className={cx('filter-bar__sort', sort.className)} /> : null;
  const all = React.Children.toArray(children);

  // Collapse: measure, and only fold when the whole set does not fit.
  const capacity = useFilterCapacity(barRef, endRef, minColWidth, mode === 'collapse' && !columns);
  const fits = capacity == null || capacity >= all.length;
  const cap = capacity == null ? all.length : Math.max(1, capacity);
  const n = typeof visibleCount === 'number' ? Math.max(1, Math.min(visibleCount, cap)) : cap;
  const collapsible = mode === 'collapse' && !fits && n < all.length;
  const shown = collapsible && !expanded ? all.slice(0, n) : all;
  const hiddenKeys = new Set(collapsible && !expanded ? all.slice(n).map(childKey) : []);
  const hiddenBadge = applied != null ? applied.filter((a) => hiddenKeys.has(a.key)).length : hiddenActiveCount;
  const appliedCount = applied != null ? applied.length : activeCount;

  const toggle = collapsible ? (
    <button
      type="button"
      className="filter-bar__toggle"
      aria-expanded={expanded}
      onClick={() => setExpanded((e) => !e)}
    >
      {expanded ? t['filterBar.less'] : t['filterBar.more']}
      {!expanded && hiddenBadge > 0 && <span className="filter-bar__toggle-badge">{hiddenBadge}</span>}
      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  ) : null;

  const drawerTrigger = mode === 'drawer' ? (
    <span className="filter-bar__drawer-toggle">
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        icon={<Filter size={18} />}
        aria-label={appliedCount > 0 ? `${t['filterBar.filters']} (${appliedCount})` : t['filterBar.filters']}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        onClick={() => setSheetOpen(true)}
      />
      {appliedCount > 0 && <span className="filter-bar__toggle-badge" aria-hidden="true">{appliedCount}</span>}
    </span>
  ) : null;

  const gridVars = {
    ...(columns ? { '--filter-cols': String(columns) } : { '--filter-col-min': `${minColWidth}px` }),
    ...style,
  } as React.CSSProperties;
  const hasEnd = toggle != null || summary != null || actions != null || (overflow != null && overflow.length > 0) || (sortEl != null && !narrow);
  return (
    <div
      ref={barRef}
      className={cx('filter-bar', 'fields--dense', columns ? 'filter-bar--fixed-cols' : undefined, `filter-bar--${mode}`, className)}
      style={gridVars}
      data-layout={mode}
      {...rest}
    >
      {mode === 'drawer' ? (
        <>
          {drawerTrigger}
          {/* Pinned fields stay in the bar; on a phone the sort control sits
              by the funnel and the trailing group wraps under it. */}
          {pinned != null && <div className="filter-bar__fields filter-bar__pinned">{pinned}</div>}
          {narrow && sortEl}
          <Drawer
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={t['filterBar.filters']}
            footer={<Button onClick={() => setSheetOpen(false)}>{t['filterBar.done']}</Button>}
          >
            <div className="filter-bar__sheet fields--dense">{all}</div>
          </Drawer>
        </>
      ) : (
        <>
          <div className="filter-bar__fields">{shown}</div>
          {narrow && sortEl}
        </>
      )}
      {/* One trailing group, so the toggle, the count and the actions wrap
          TOGETHER: as separate flex items the actions could drop to a new line
          while the count stayed up with the fields — a readout split from its
          buttons. */}
      {hasEnd && (
        <div ref={endRef} className="filter-bar__end">
          {toggle}
          {!narrow && sortEl}
          {/* A status message (WCAG 4.1.3): when a filter changes, the new count is
              the only signal that it acted; role="status" announces it politely
              without stealing focus. Any node fits — a Skeleton while loading. */}
          {summary != null && <div className="filter-bar__summary" role="status">{summary}</div>}
          {(actions != null || (overflow != null && overflow.length > 0)) && (
            <div className="filter-bar__actions">
              {actions}
              {overflow != null && <ToolbarActions actions={overflow} />}
            </div>
          )}
        </div>
      )}
      {/* Applied chips: the values in one glance, removable, whatever the
          layout hides. Full-width line under the fields. */}
      {applied != null && applied.length > 0 && (
        <div className="filter-bar__applied" aria-label={t['filterBar.applied']}>
          {applied.map((a) => (
            <Chip key={a.key} onRemove={a.onRemove}>
              {a.label}{a.value != null && <>: {a.value}</>}
            </Chip>
          ))}
        </div>
      )}
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
