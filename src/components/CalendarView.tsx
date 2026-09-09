'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight, ChevronDown } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { startOfMonth, addMonths, isSameDay, buildMonthGrid6 } from '../utils/dateFormat';

/**
 * The ONE calendar (v3.9.0) behind DatePicker, DateRangePicker, MonthPicker
 * and YearPicker. Three views — days, months, years — with one header: prev /
 * next as square ghost buttons and the title as a button with a chevron that
 * climbs a level (days → months → years); picking a year descends to months,
 * a month to days, until `leaf` is reached and the pick is reported.
 *
 * Internal: not exported from the barrel. Each picker owns the popover,
 * the value and the range semantics; this only draws and navigates.
 */
export type CalendarLeaf = 'days' | 'months' | 'years';
type Mode = CalendarLeaf;

export interface DayState {
  selected?: boolean;
  /** Part of a range band (multi-day). */
  band?: boolean;
  /** Round the band's left / right edge (range ends and row edges). */
  roundL?: boolean;
  roundR?: boolean;
}

export interface CalendarViewProps {
  /** Any date inside the displayed month (normalised to its first day). */
  month: Date;
  onMonthChange: (first: Date) => void;
  /** The deepest view: `'days'` (default) reports days, `'months'` reports months, `'years'` reports years. */
  leaf?: CalendarLeaf;
  onSelectDay?: (d: Date) => void;
  onSelectMonth?: (first: Date) => void;
  onSelectYear?: (year: number) => void;
  /** Per-day decoration (selection, range band). `col` is 0 = Monday … 6 = Sunday. */
  dayState?: (d: Date, col: number) => DayState | null | undefined;
  isDayDisabled?: (d: Date) => boolean;
  onHoverDay?: (d: Date | null) => void;
  /** Highlight in the months / years grids (the picker's value). */
  selectedMonth?: Date | null;
  selectedYear?: number | null;
  isMonthDisabled?: (first: Date) => boolean;
  isYearDisabled?: (year: number) => boolean;
  /** Hide prev / next (a multi-panel range shows prev only on the first, next only on the last). */
  navPrev?: boolean;
  navNext?: boolean;
  className?: string;
}

const COLS = 7;
const YEARS_PER_PAGE = 12;

/**
 * Move focus from a picker's field into its (portaled) calendar — the grid's
 * tab stop, else the first nav button. Pickers call it on ArrowDown, the
 * combobox convention: the popover lives at the end of the body, so Tab
 * alone would walk the whole page before reaching it.
 */
export function focusCalendar(root: HTMLElement | null): boolean {
  // In priority order (a combined selector would return the first in DOM
  // order — the nav button — instead of the grid's tab stop).
  const target = root?.querySelector<HTMLElement>('.calview__grid [tabindex="0"]')
    ?? root?.querySelector<HTMLElement>('.calview__grid button:not(:disabled)')
    ?? root?.querySelector<HTMLElement>('.calview__navbtn');
  if (!target) return false;
  target.focus();
  return true;
}

function yearPageStart(year: number): number {
  // Pages of twelve starting one before the decade: 2019 … 2030 for the 2020s,
  // the same window the YearPicker always showed.
  return Math.floor(year / 10) * 10 - 1;
}

export function CalendarView({
  month, onMonthChange, leaf = 'days',
  onSelectDay, onSelectMonth, onSelectYear,
  dayState, isDayDisabled, onHoverDay,
  selectedMonth, selectedYear, isMonthDisabled, isYearDisabled,
  navPrev = true, navNext = true, className,
}: CalendarViewProps): React.JSX.Element {
  const t = useLocale();
  const weekdays = t['picker.weekdaysShort'];
  const monthNames = t['calendar.months'];
  const view = React.useMemo(() => startOfMonth(month), [month]);
  const [mode, setMode] = React.useState<Mode>(leaf);
  // The years page follows the displayed month until the user pages it.
  const [yearPage, setYearPage] = React.useState(() => yearPageStart(view.getFullYear()));
  React.useEffect(() => { setYearPage(yearPageStart(view.getFullYear())); }, [view]);
  const gridRef = React.useRef<HTMLDivElement>(null);
  // After a page change the focused button unmounts; this remembers which
  // cell should take focus in the next grid (keyboard navigation across pages).
  // Either a cell index (arrow overflow) or a day key `y-m-d` (PageUp/Down
  // keeps the same day of the month, clamped to the month's length).
  const pendingFocus = React.useRef<number | string | null>(null);
  React.useEffect(() => {
    if (pendingFocus.current == null) return;
    const want = pendingFocus.current;
    pendingFocus.current = null;
    const btns = [...(gridRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])];
    const target = typeof want === 'string'
      ? btns.find((b) => b.dataset.day === want)
      : btns.find((b) => Number(b.dataset.idx) === want);
    target?.focus();
  });
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const today = new Date();
  const { cells } = React.useMemo(() => buildMonthGrid6(view, 0), [view]);
  const year = view.getFullYear();

  // ----- header ------------------------------------------------------------
  const climb = () => {
    if (mode === 'days') setMode('months');
    else if (mode === 'months') setMode('years');
  };
  const canClimb = mode !== 'years';
  const prev = () => {
    if (mode === 'days') onMonthChange(addMonths(view, -1));
    else if (mode === 'months') onMonthChange(new Date(year - 1, view.getMonth(), 1));
    else setYearPage((p) => p - YEARS_PER_PAGE);
  };
  const next = () => {
    if (mode === 'days') onMonthChange(addMonths(view, 1));
    else if (mode === 'months') onMonthChange(new Date(year + 1, view.getMonth(), 1));
    else setYearPage((p) => p + YEARS_PER_PAGE);
  };
  const title = mode === 'days'
    ? `${monthNames[view.getMonth()]} ${year}`
    : mode === 'months' ? String(year) : `${yearPage}–${yearPage + YEARS_PER_PAGE - 1}`;
  const prevLabel = mode === 'days' ? t['calendar.prevMonth'] : mode === 'months' ? t['picker.prevYear'] : t['picker.prevDecade'];
  const nextLabel = mode === 'days' ? t['calendar.nextMonth'] : mode === 'months' ? t['picker.nextYear'] : t['picker.nextDecade'];

  // ----- selection ---------------------------------------------------------
  const pickMonth = (m: number, y = year) => {
    const first = new Date(y, m, 1);
    if (leaf === 'months') { onSelectMonth?.(first); return; }
    onMonthChange(first);
    setMode('days');
  };
  const pickYear = (y: number) => {
    if (leaf === 'years') { onSelectYear?.(y); return; }
    onMonthChange(new Date(y, view.getMonth(), 1));
    setMode('months');
  };

  // ----- keyboard ----------------------------------------------------------
  // Roving focus inside the grid: arrows move by cell / row, Home / End to the
  // row edges, PageUp / PageDown page the view, Escape climbs back down a
  // level (days ← months ← years); in the leaf view Escape bubbles to the
  // popover's dismiss.
  const onGridKey = (e: React.KeyboardEvent, idx: number, total: number, cols: number, onPage: (dir: -1 | 1) => void, date?: Date) => {
    let target: number | null = null;
    const page = (dir: -1 | 1) => {
      e.preventDefault();
      if (date) {
        // Same day of the month in the adjacent month, clamped (31 → 30).
        const m = addMonths(startOfMonth(date), dir);
        const last = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
        pendingFocus.current = dayKey(new Date(m.getFullYear(), m.getMonth(), Math.min(date.getDate(), last)));
      } else pendingFocus.current = idx;
      onPage(dir);
    };
    switch (e.key) {
      case 'ArrowLeft': target = idx - 1; break;
      case 'ArrowRight': target = idx + 1; break;
      case 'ArrowUp': target = idx - cols; break;
      case 'ArrowDown': target = idx + cols; break;
      case 'Home': target = idx - (idx % cols); break;
      case 'End': target = idx + (cols - 1 - (idx % cols)); break;
      case 'PageUp': page(-1); return;
      case 'PageDown': page(1); return;
      case 'Escape':
        if (mode !== leaf) { e.preventDefault(); e.stopPropagation(); setMode(mode === 'years' ? 'months' : 'days'); }
        return;
      default: return;
    }
    e.preventDefault();
    if (target < 0 || target >= total) {
      // Off the grid: page and land on the same column / a sensible cell.
      pendingFocus.current = target < 0 ? target + total : target - total;
      onPage(target < 0 ? -1 : 1);
      return;
    }
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(`button[data-idx="${target}"]`);
    if (btn && !btn.disabled) btn.focus();
    else if (btn) {
      // Disabled / outside cell: keep walking in the same direction.
      const step = target > idx ? 1 : -1;
      let n = target + step;
      while (n >= 0 && n < total) {
        const b = gridRef.current?.querySelector<HTMLButtonElement>(`button[data-idx="${n}"]`);
        if (b && !b.disabled) { b.focus(); return; }
        n += step;
      }
    }
  };

  // ----- grids -------------------------------------------------------------
  // One tab stop per grid: the selected cell, else the first enabled one; the
  // rest are reachable with the arrows. A focus-capture handler below moves
  // the stop to whatever was last focused.
  const firstEnabledDay = (() => {
    let sel = -1, first = -1;
    cells.forEach(({ date: d, outside }, i) => {
      if (outside || isDayDisabled?.(d)) return;
      if (first < 0) first = i;
      if (sel < 0 && dayState?.(d, i % COLS)?.selected) sel = i;
    });
    return sel >= 0 ? sel : first;
  })();
  const daysGrid = (
    <div ref={gridRef} className="calview__grid calview__grid--days" role="grid">
      {weekdays.map((w, i) => <span key={`w${i}`} className="calview__dow" aria-hidden="true">{w}</span>)}
      {cells.map(({ date: d, outside }, i) => {
        // Adjacent-month days: greyed context, not selectable (fixed 6 rows).
        if (outside) return <span key={i} className="calview__day is-outside" aria-hidden="true">{d.getDate()}</span>;
        const st = dayState?.(d, i % COLS) ?? null;
        const off = !!isDayDisabled?.(d);
        const isToday = isSameDay(d, today);
        return (
          <button
            key={i}
            type="button"
            data-idx={i}
            data-day={dayKey(d)}
            tabIndex={i === firstEnabledDay ? 0 : -1}
            className={cx(
              'calview__day',
              st?.selected && 'is-selected',
              st?.band && 'is-band',
              st?.roundL && 'is-rl',
              st?.roundR && 'is-rr',
              isToday && 'is-today',
              off && 'is-disabled',
            )}
            disabled={off}
            aria-pressed={st?.selected || undefined}
            aria-current={isToday ? 'date' : undefined}
            onMouseEnter={onHoverDay ? () => onHoverDay(d) : undefined}
            onMouseLeave={onHoverDay ? () => onHoverDay(null) : undefined}
            onClick={() => onSelectDay?.(d)}
            onKeyDown={(e) => onGridKey(e, i, cells.length, COLS, (dir) => onMonthChange(addMonths(view, dir)), d)}
          >{d.getDate()}</button>
        );
      })}
    </div>
  );

  const monthsGrid = (
    <div ref={gridRef} className="calview__grid calview__grid--cells" role="grid">
      {monthNames.map((name, m) => {
        const first = new Date(year, m, 1);
        const sel = leaf === 'months'
          ? !!selectedMonth && selectedMonth.getFullYear() === year && selectedMonth.getMonth() === m
          : view.getMonth() === m;
        const current = today.getFullYear() === year && today.getMonth() === m;
        const off = !!isMonthDisabled?.(first);
        return (
          <button
            key={m}
            type="button"
            data-idx={m}
            tabIndex={m === (leaf === 'months' && selectedMonth && selectedMonth.getFullYear() === year ? selectedMonth.getMonth() : view.getMonth()) ? 0 : -1}
            className={cx('calview__cell', sel && 'is-selected', current && 'is-current', off && 'is-disabled')}
            disabled={off}
            aria-pressed={sel || undefined}
            onClick={() => pickMonth(m)}
            onKeyDown={(e) => onGridKey(e, m, 12, 3, (dir) => onMonthChange(new Date(year + dir, view.getMonth(), 1)))}
          >{leaf === 'months' ? name : name.slice(0, 3)}</button>
        );
      })}
    </div>
  );

  const yearsGrid = (
    <div ref={gridRef} className="calview__grid calview__grid--cells" role="grid">
      {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPage + i).map((y, i) => {
        const decade = Math.floor((yearPage + 1) / 10) * 10;
        const sel = leaf === 'years' ? selectedYear === y : year === y;
        const off = !!isYearDisabled?.(y);
        return (
          <button
            key={y}
            type="button"
            data-idx={i}
            tabIndex={(sel || (selectedYear == null && leaf === 'years' && y === today.getFullYear()) || (leaf !== 'years' && y === year)) ? 0 : -1}
            className={cx('calview__cell', sel && 'is-selected', today.getFullYear() === y && 'is-current', (y < decade || y > decade + 9) && 'is-out', off && 'is-disabled')}
            disabled={off}
            aria-pressed={sel || undefined}
            onClick={() => pickYear(y)}
            onKeyDown={(e) => onGridKey(e, i, YEARS_PER_PAGE, 3, (dir) => setYearPage((p) => p + dir * YEARS_PER_PAGE))}
          >{y}</button>
        );
      })}
    </div>
  );

  // Roving tabindex: the grid is one tab stop; the first focusable cell (or
  // the selected one) carries tabIndex 0. Done via a focus handler on the grid
  // wrapper to keep the render simple.
  const onGridFocusCapture = (e: React.FocusEvent) => {
    const btns = gridRef.current?.querySelectorAll<HTMLButtonElement>('button[data-idx]');
    if (!btns) return;
    btns.forEach((b) => { b.tabIndex = b === e.target ? 0 : -1; });
  };

  return (
    <div className={cx('calview', `calview--${mode}`, className)} onFocusCapture={onGridFocusCapture}>
      <div className="calview__nav">
        {navPrev ? (
          <button type="button" className="calview__navbtn" onClick={prev} aria-label={prevLabel}><ChevronLeft size={16} /></button>
        ) : <span className="calview__navbtn calview__navbtn--ghost" aria-hidden="true" />}
        <button
          type="button"
          className="calview__title"
          onClick={canClimb ? climb : undefined}
          aria-label={canClimb ? `${title}. ${t['daterange.jumpMonth']}` : undefined}
          aria-disabled={!canClimb || undefined}
        >
          <span>{title}</span>
          {canClimb && <ChevronDown size={14} aria-hidden="true" />}
        </button>
        {navNext ? (
          <button type="button" className="calview__navbtn" onClick={next} aria-label={nextLabel}><ChevronRight size={16} /></button>
        ) : <span className="calview__navbtn calview__navbtn--ghost" aria-hidden="true" />}
      </div>
      {mode === 'days' ? daysGrid : mode === 'months' ? monthsGrid : yearsGrid}
    </div>
  );
}
