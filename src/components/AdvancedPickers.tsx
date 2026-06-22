'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X, Check, Search } from './Icons';
import { resolveDateFormat, formatDate, parseDate, dateFormatPlaceholder, startOfMonth, addMonths, isSameDay, buildMonthGrid6, type DateFormat } from '../utils/dateFormat';
import { useLocale } from '../locale/LocaleProvider';
import { format as formatMsg } from '../locale/messages';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

// ---------- MultiCombobox -----------------------------------------------
export interface MultiComboboxOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface MultiComboboxProps<T = string> {
  value: T[];
  onChange: (v: T[]) => void;
  options: MultiComboboxOption<T>[];
  placeholder?: string;
  emptyMessage?: string;
  filter?: (option: MultiComboboxOption<T>, query: string) => boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  maxVisibleChips?: number;
}

const dfilter = <T,>(o: MultiComboboxOption<T>, q: string) =>
  o.label.toLowerCase().includes(q.toLowerCase());

export function MultiCombobox<T = string>({
  value, onChange, options, placeholder,
  emptyMessage, filter = dfilter,
  invalid, disabled, className, id, maxVisibleChips = 3,
}: MultiComboboxProps<T>) {
  const locale = useLocale();
  const ph = placeholder ?? locale['common.search'];
  const empty = emptyMessage ?? locale['common.noResults'];
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const reactId = React.useId();
  const listboxId = `${id ?? reactId}-listbox`;
  // Build the lookup Set once per `value` change, not on every keystroke or
  // hover-driven re-render.
  const selSet = React.useMemo(() => new Set(value), [value]);

  const filtered = React.useMemo(
    () => (query ? options.filter((o) => filter(o, query)) : options),
    [options, query, filter]
  );

  const pos = usePopoverPosition(wrapRef, listRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 4,
    matchAnchorWidth: true,
  });

  // Escape is handled by the input's onKeyDown; only outside-click here.
  useDismiss({
    open,
    onDismiss: () => setOpen(false),
    refs: [wrapRef, listRef],
    closeOnEscape: false,
  });

  const toggle = (v: T) => {
    if (selSet.has(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[active];
      if (opt && !opt.disabled) { toggle(opt.value); setQuery(''); }
    } else if (e.key === 'Escape') { setOpen(false); }
    else if (e.key === 'Backspace' && !query && value.length) { onChange(value.slice(0, -1)); }
  };

  const selectedItems = options.filter((o) => selSet.has(o.value));
  const visible = selectedItems.slice(0, maxVisibleChips);
  const overflow = selectedItems.length - visible.length;

  return (
    <div ref={wrapRef} className={cx('multicombo', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <div className="multicombo__chips" onClick={() => inputRef.current?.focus()}>
        {visible.map((o) => (
          <span key={String(o.value)} className="multicombo__chip">
            {o.label}
            <button type="button" aria-label={formatMsg(locale['combobox.remove'], { label: o.label })} onClick={(e) => { e.stopPropagation(); toggle(o.value); }}><X size={12} /></button>
          </span>
        ))}
        {overflow > 0 && <span className="multicombo__chip multicombo__chip--more">+{overflow}</span>}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className="multicombo__input"
          placeholder={selectedItems.length === 0 ? ph : ''}
          disabled={disabled}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKey}
        />
      </div>
      {open && (
        <Portal>
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className={cx('multicombo__list', 'is-floating')}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            visibility: pos.ready ? 'visible' : 'hidden',
          }}
        >
          {filtered.length === 0 ? (
            <li className="multicombo__empty">{empty}</li>
          ) : (
            filtered.map((o, i) => {
              const checked = selSet.has(o.value);
              return (
                <li
                  key={String(o.value)}
                  role="option"
                  aria-selected={checked}
                  aria-disabled={o.disabled}
                  className={cx('multicombo__option', i === active && 'is-active', checked && 'is-selected', o.disabled && 'is-disabled')}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => { e.preventDefault(); if (!o.disabled) toggle(o.value); }}
                >
                  <span className={cx('multicombo__check', checked && 'is-checked')} aria-hidden="true">{checked ? <Check size={14} /> : null}</span>
                  <span className="multicombo__option-body">
                    <span className="multicombo__option-label">{o.label}</span>
                    {o.description && <span className="multicombo__option-desc">{o.description}</span>}
                  </span>
                </li>
              );
            })
          )}
        </ul>
        </Portal>
      )}
    </div>
  );
}

// ---------- DateRangePicker --------------------------------------------
export interface DateRange { from: Date | null; to: Date | null }

export interface DateRangePickerProps {
  /** Controlled value. Omit to make the picker uncontrolled (see `defaultValue`). */
  value?: DateRange;
  /**
   * In legacy mode, fires on every day click. In apply mode (when `onApply` is
   * provided), fires only at apply time so a controlled `value` can stay in sync.
   */
  onChange?: (v: DateRange) => void;
  /** Initial value when uncontrolled. Ignored if `value` is provided. */
  defaultValue?: DateRange;
  /**
   * Opt-in: enables apply mode. Day clicks only mutate an internal draft; the
   * consumer is notified when the user confirms (button "Apply" or a preset).
   * Closing the popover without applying reverts the draft to the last applied
   * value. Useful when each commit triggers a server-side query.
   */
  onApply?: (v: DateRange) => void;
  /** Fires on open/close transitions. */
  onOpenChange?: (open: boolean) => void;
  minDate?: Date;
  maxDate?: Date;
  /**
   * Disable arbitrary days (holidays, blackout dates, specific weekdays). A
   * day for which this returns `true` renders disabled — greyed, not
   * focusable, not clickable. Composes with `minDate`/`maxDate`. A range
   * endpoint can never land on a disabled day; a disabled day that falls
   * inside an otherwise-valid span stays greyed but is included visually
   * (the span is allowed). E.g. disable Sundays: `d => d.getDay() === 0`.
   */
  isDateDisabled?: (date: Date) => boolean;
  presets?: Array<{ label: string; range: () => DateRange }>;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  /**
   * Display format. Default `'auto'` derives from `configureBrand().locale`.
   */
  format?: DateFormat;
  /**
   * Report-grade: show editable "Desde"/"Hasta" text inputs above the calendar
   * so the user can type an exact range. Off by default — a simple filter is
   * usually fine with presets + clicking.
   */
  showInputs?: boolean;
  /**
   * Report-grade: replace the static month title with a "MMMM de YYYY ▾" button
   * that opens a month/year jump menu (instead of clicking the arrows N times).
   */
  monthDropdown?: boolean;
  /** Number of month panels. Default `2`; `1` is the compact single-month layout. */
  months?: 1 | 2;
  /**
   * Start with a preset active (by its label, e.g. `"Este mes"`). Must match a
   * `presets` entry — the picker initializes the range to that preset and shows
   * its name on the trigger. Uncontrolled init only (when controlled, drive
   * `value` yourself; this still sets the initial trigger name). Ignored if it
   * doesn't match any preset.
   */
  defaultPreset?: string;
}

const EMPTY_RANGE: DateRange = { from: null, to: null };

// ---------- Common date-range presets -----------------------------------
export type DateRangePresetKey =
  | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek'
  | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear';

export interface DateRangePresetItem {
  key: DateRangePresetKey;
  label: string;
  range: () => DateRange;
}

const DEFAULT_PRESET_LABELS: Record<DateRangePresetKey, string> = {
  today: 'Hoy', yesterday: 'Ayer', thisWeek: 'Esta semana', lastWeek: 'Semana anterior',
  thisMonth: 'Este mes', lastMonth: 'Mes anterior', thisYear: 'Este año', lastYear: 'Año anterior',
};

const PRESET_ORDER: DateRangePresetKey[] = [
  'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear',
];

// Local-midnight helpers so the ranges are date-only (no time component).
const midnight = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const shiftDays = (d: Date, days: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const mondayOf = (d: Date): Date => shiftDays(d, -((d.getDay() + 6) % 7)); // Monday = week start

// "This …" spans from the start of the period to today; "… anterior" is the full
// previous period. Evaluated lazily (on click) so they're always relative to now.
const PRESET_RANGES: Record<DateRangePresetKey, () => DateRange> = {
  today: () => { const t = midnight(new Date()); return { from: t, to: t }; },
  yesterday: () => { const y = shiftDays(midnight(new Date()), -1); return { from: y, to: y }; },
  thisWeek: () => { const t = midnight(new Date()); return { from: mondayOf(t), to: t }; },
  lastWeek: () => { const m = mondayOf(midnight(new Date())); return { from: shiftDays(m, -7), to: shiftDays(m, -1) }; },
  thisMonth: () => { const t = midnight(new Date()); return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }; },
  lastMonth: () => { const t = new Date(); return { from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) }; },
  thisYear: () => { const t = midnight(new Date()); return { from: new Date(t.getFullYear(), 0, 1), to: t }; },
  lastYear: () => { const t = new Date(); return { from: new Date(t.getFullYear() - 1, 0, 1), to: new Date(t.getFullYear() - 1, 11, 31) }; },
};

export interface DateRangePresetsOptions {
  /** Pick a subset and order. Default: all eight in a sensible order. */
  include?: DateRangePresetKey[];
  /** Override labels (e.g. for i18n). Defaults are Spanish. */
  labels?: Partial<Record<DateRangePresetKey, string>>;
}

/**
 * The common analytics date-range presets (Bsale-style): today, yesterday,
 * this/last week, this/last month, this/last year. Pass straight to
 * `<DateRangePicker presets={dateRangePresets()} />` so consumers don't
 * re-derive the (fiddly) "previous week/month" boundaries each time.
 */
export function dateRangePresets(opts: DateRangePresetsOptions = {}): DateRangePresetItem[] {
  return (opts.include ?? PRESET_ORDER).map((key) => ({
    key,
    label: opts.labels?.[key] ?? DEFAULT_PRESET_LABELS[key],
    range: PRESET_RANGES[key],
  }));
}

export function DateRangePicker({
  value, onChange, defaultValue, onApply, onOpenChange,
  minDate, maxDate, isDateDisabled, presets,
  invalid, disabled, className, id, format = 'auto',
  showInputs = false, monthDropdown = false, months = 2, defaultPreset,
}: DateRangePickerProps) {
  const locale = useLocale();
  const weekdays = locale['picker.weekdaysShort'];
  const monthNames = locale['calendar.months'];
  const fmt = resolveDateFormat(format);
  const isControlled = value !== undefined;
  const applyMode = !!onApply;
  // `defaultPreset` (by label) seeds the initial range + the trigger name. For an
  // uncontrolled picker it also sets the initial dates; controlled callers drive
  // `value` and this only sets the initial name.
  const matchedPreset = defaultPreset ? presets?.find((p) => p.label === defaultPreset) : undefined;
  const initial = isControlled
    ? (value as DateRange)
    : (matchedPreset ? matchedPreset.range() : (defaultValue ?? EMPTY_RANGE));
  const [draft, setDraft] = React.useState<DateRange>(initial);
  const [lastApplied, setLastApplied] = React.useState<DateRange>(initial);
  // Resync draft/lastApplied when controlled `value` changes externally.
  const vFrom = value?.from?.getTime() ?? 0;
  const vTo = value?.to?.getTime() ?? 0;
  React.useEffect(() => {
    if (!isControlled) return;
    setDraft(value as DateRange);
    setLastApplied(value as DateRange);
  }, [isControlled, vFrom, vTo]);
  // Legacy-controlled (no `onApply`) keeps prior semantics: `value` drives render
  // directly. Otherwise the draft is truth.
  const current: DateRange = isControlled && !applyMode ? (value as DateRange) : draft;
  // The trigger label shows the last-committed range in apply mode; in legacy it
  // tracks `current` (so live edits stay reflected, as before).
  const displayed: DateRange = applyMode ? lastApplied : current;
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => startOfMonth(initial.from ?? new Date()));
  const [hover, setHover] = React.useState<Date | null>(null);
  // Editable-inputs (showInputs) mirror the current range; the month-jump menu
  // (monthDropdown) tracks a year while the user browses it.
  const [fromText, setFromText] = React.useState('');
  const [toText, setToText] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuYear, setMenuYear] = React.useState(() => view.getFullYear());
  // The label of the preset that produced the current value (so the trigger can
  // show "Este mes" instead of the date range). Seeded from `defaultPreset`;
  // cleared on any manual change.
  const [appliedPreset, setAppliedPreset] = React.useState<string | null>(matchedPreset?.label ?? null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Portaled to body (escapes overflow ancestors) with flip/clamp and
  // scroll/resize reposition; Escape and outside-click return focus to the
  // trigger (a11y) — same primitive as MultiCombobox above.
  const pos = usePopoverPosition(wrapRef, popoverRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 6,
  });

  const closeWithoutCommit = React.useCallback(() => {
    if (applyMode) setDraft(lastApplied);
    setOpen(false);
    onOpenChange?.(false);
  }, [applyMode, lastApplied, onOpenChange]);

  useDismiss({
    open,
    onDismiss: closeWithoutCommit,
    refs: [wrapRef, popoverRef],
    returnFocusRef: triggerRef,
  });

  // Each panel renders ~42 Date cells. Without memoization, every
  // setHover() triggered a full rebuild of both panels' grids on every
  // mouse movement over the calendar. Memo keyed on `view` only.
  const monthGrid0 = React.useMemo(() => buildMonthGrid6(view, 0), [view]);
  const monthGrid1 = React.useMemo(() => buildMonthGrid6(view, 1), [view]);

  const isDisabled = (d: Date) =>
    !!(
      (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) ||
      (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) ||
      isDateDisabled?.(d)
    );

  const inRange = (d: Date) => {
    if (!current.from) return false;
    const end = current.to ?? hover;
    if (!end) return isSameDay(d, current.from);
    const a = current.from < end ? current.from : end;
    const b = current.from < end ? end : current.from;
    return d >= new Date(a.getFullYear(), a.getMonth(), a.getDate()) &&
           d <= new Date(b.getFullYear(), b.getMonth(), b.getDate());
  };

  // Ordered span ends (handles hover-preview when `to` is still null). Drives the
  // continuous-band rounding: a cell rounds left at `a`/week-start, right at
  // `b`/week-end.
  const spanBounds = (): { a: Date; b: Date } | null => {
    if (!current.from) return null;
    const end = current.to ?? hover;
    if (!end) return { a: current.from, b: current.from };
    return current.from <= end ? { a: current.from, b: end } : { a: end, b: current.from };
  };

  // Apply a new range honoring apply/legacy mode (same split as a day click).
  const setRange = (next: DateRange) => {
    if (applyMode) setDraft(next);
    else { onChange?.(next); setAppliedPreset(null); }
  };

  // Keep the editable inputs in sync with the current range.
  const curFrom = current.from?.getTime() ?? 0;
  const curTo = current.to?.getTime() ?? 0;
  React.useEffect(() => {
    setFromText(current.from ? formatDate(current.from, fmt) : '');
    setToText(current.to ? formatDate(current.to, fmt) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curFrom, curTo, fmt]);

  const commitInput = (which: 'from' | 'to', text: string) => {
    const parsed = parseDate(text, fmt);
    if (!parsed || isDisabled(parsed)) {
      // Revert the field to the current value's formatted form.
      if (which === 'from') setFromText(current.from ? formatDate(current.from, fmt) : '');
      else setToText(current.to ? formatDate(current.to, fmt) : '');
      return;
    }
    const next: DateRange = which === 'from'
      ? (current.to && current.to < parsed ? { from: current.to, to: parsed } : { from: parsed, to: current.to })
      : (current.from && parsed < current.from ? { from: parsed, to: current.from } : { from: current.from, to: parsed });
    setRange(next);
    setView(startOfMonth(parsed));
  };

  const jumpToMonth = (monthIndex: number) => {
    setView(new Date(menuYear, monthIndex, 1));
    setMenuOpen(false);
  };

  const click = (d: Date) => {
    let next: DateRange;
    if (!current.from || (current.from && current.to)) next = { from: d, to: null };
    else {
      const from = current.from;
      next = d < from ? { from: d, to: from } : { from, to: d };
    }
    // A manual day click in legacy mode commits immediately → drop any preset
    // name. In apply mode it only mutates the draft; the applied preset (shown on
    // the trigger) changes only when the user actually applies.
    if (applyMode) setDraft(next);
    else { onChange?.(next); setAppliedPreset(null); }
  };

  // Commits a range and closes. In apply mode this fires `onApply` (and `onChange`
  // when controlled, to keep `value` in sync). In legacy mode, only preset commits
  // propagate via `onChange`; the bare "Apply" button stays close-only as before.
  const commit = (next: DateRange, fromPreset = false, presetLabel: string | null = null) => {
    setAppliedPreset(fromPreset ? presetLabel : null);
    if (applyMode) {
      onApply!(next);
      setLastApplied(next);
      setDraft(next);
      if (isControlled) onChange?.(next);
    } else if (fromPreset) {
      onChange?.(next);
    }
    setOpen(false);
    onOpenChange?.(false);
  };

  const clear = () => {
    // "Limpiar" resetea el FILTRO, no solo el draft: en apply mode commitea el
    // rango vacío (dispara onApply + cierra). Antes solo reseteaba el draft y,
    // como "Aplicar" exige from+to, el estado limpio nunca se podía aplicar →
    // no se podía volver a "sin filtro".
    if (applyMode) commit(EMPTY_RANGE);
    else { onChange?.(EMPTY_RANGE); setAppliedPreset(null); }
  };

  const toggleOpen = () => {
    if (open) closeWithoutCommit();
    else { setOpen(true); onOpenChange?.(true); }
  };

  // Show the active preset's name (like Bsale) when one is applied; otherwise the
  // date range, or the placeholder when empty.
  const label = appliedPreset && displayed.from
    ? appliedPreset
    : displayed.from
      ? displayed.to
        ? `${formatDate(displayed.from, fmt)} → ${formatDate(displayed.to, fmt)}`
        : `${formatDate(displayed.from, fmt)} → …`
      : locale['picker.selectRange'];

  const renderMonth = (offset: number) => {
    const { month: m, cells } = offset === 0 ? monthGrid0 : monthGrid1;
    const bounds = spanBounds();
    // Only paint the band for a real (multi-day) span; a lone endpoint shows
    // just its circle.
    const isMultiDay = !!bounds && !isSameDay(bounds.a, bounds.b);
    return (
      <div className="daterange__month">
        {/* The dropdown owns the month label when enabled; otherwise a static title. */}
        {!monthDropdown && <div className="daterange__title">{monthNames[m.getMonth()]} {m.getFullYear()}</div>}
        <div className="daterange__grid">
          {weekdays.map((w, i) => <span key={i} className="daterange__dow">{w}</span>)}
          {cells.map(({ date: d, outside }, i) => {
            // Adjacent-month days: greyed, non-interactive context (keeps the grid
            // at a fixed 6 rows so the height never jumps).
            if (outside) return <span key={i} className="daterange__day is-outside" aria-hidden="true">{d.getDate()}</span>;
            const sel = (current.from && isSameDay(d, current.from)) || (current.to && isSameDay(d, current.to));
            const band = inRange(d) && isMultiDay;
            // Column 0 = Monday, 6 = Sunday (the 7 weekday headers offset by a
            // multiple of 7, so `i % 7` is the column).
            const col = i % 7;
            const leftEnd = band && !!bounds && isSameDay(d, bounds.a);
            const rightEnd = band && !!bounds && isSameDay(d, bounds.b);
            // Square model: round the outer corners only at the range ends and the
            // row edges (everything radius-sm); interior cells stay square and
            // bridge the gap. A lone selected day (no multi-day band) rounds all
            // four. is-rl/is-rr round both the band and the endpoint block.
            const roundL = band ? (col === 0 || leftEnd) : !!sel;
            const roundR = band ? (col === 6 || rightEnd) : !!sel;
            const today = isSameDay(d, new Date());
            const off = isDisabled(d);
            return (
              <button
                key={i}
                type="button"
                className={cx(
                  'daterange__day',
                  sel && 'is-selected',
                  band && 'is-band',
                  roundL && 'is-rl',
                  roundR && 'is-rr',
                  today && 'is-today',
                  off && 'is-disabled',
                )}
                disabled={!!off}
                onMouseEnter={() => setHover(d)}
                onClick={() => click(d)}
              >{d.getDate()}</button>
            );
          })}
        </div>
      </div>
    );
  };

  // Month/year jump menu (monthDropdown). Inline (not a Portal) — it lives inside
  // the already-portaled popover and is dismissed by selecting a month.
  const renderMonthMenu = () => (
    <div className="daterange__menu" role="dialog" aria-label={locale['daterange.jumpMonth']}>
      <div className="daterange__menu-year">
        <button type="button" onClick={() => setMenuYear((y) => y - 1)} aria-label={locale['picker.prevYear']}><ChevronLeft size={16} /></button>
        <span>{menuYear}</span>
        <button type="button" onClick={() => setMenuYear((y) => y + 1)} aria-label={locale['picker.nextYear']}><ChevronRight size={16} /></button>
      </div>
      <div className="daterange__menu-grid">
        {monthNames.map((name, idx) => (
          <button
            type="button"
            key={name}
            className={cx('daterange__menu-month', view.getMonth() === idx && view.getFullYear() === menuYear && 'is-current')}
            onClick={() => jumpToMonth(idx)}
          >{name.slice(0, 3)}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className={cx('daterange', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="daterange__trigger"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="daterange__icon" aria-hidden="true"><CalendarIcon size={16} /></span>
        <span>{label}</span>
      </button>
      {open && (
        <Portal>
        <div
          ref={popoverRef}
          className={cx('daterange__popover', 'is-floating', months === 1 && 'daterange__popover--compact')}
          role="dialog"
          onMouseLeave={() => setHover(null)}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            visibility: pos.ready ? 'visible' : 'hidden',
          }}
        >
          {presets && presets.length > 0 && (
            <ul className="daterange__presets">
              {presets.map((p, i) => (
                <li key={i}>
                  <button type="button" onClick={() => commit(p.range(), true, p.label)}>{p.label}</button>
                </li>
              ))}
            </ul>
          )}
          <div className="daterange__panes">
            {showInputs && (
              <div className="daterange__inputs">
                <label className="daterange__field">
                  <span className="daterange__field-label">{locale['daterange.from']}</span>
                  <input
                    type="text"
                    className="daterange__field-input"
                    // Cap the input's intrinsic width to the format length so the
                    // inputs row doesn't balloon wider than the calendar (the
                    // panes then hugs the calendar into a tight square).
                    size={dateFormatPlaceholder(fmt).length + 1}
                    value={fromText}
                    placeholder={dateFormatPlaceholder(fmt)}
                    onChange={(e) => setFromText(e.target.value)}
                    onBlur={(e) => commitInput('from', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitInput('from', (e.target as HTMLInputElement).value); }}
                  />
                </label>
                <label className="daterange__field">
                  <span className="daterange__field-label">{locale['daterange.to']}</span>
                  <input
                    type="text"
                    className="daterange__field-input"
                    size={dateFormatPlaceholder(fmt).length + 1}
                    value={toText}
                    placeholder={dateFormatPlaceholder(fmt)}
                    onChange={(e) => setToText(e.target.value)}
                    onBlur={(e) => commitInput('to', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitInput('to', (e.target as HTMLInputElement).value); }}
                  />
                </label>
              </div>
            )}
            <div className="daterange__nav">
              <button type="button" onClick={() => setView((v) => addMonths(v, -1))} aria-label={locale['calendar.prevMonth']}><ChevronLeft size={16} /></button>
              {monthDropdown ? (
                <div className="daterange__monthjump">
                  <button
                    type="button"
                    className="daterange__monthjump-trigger"
                    onClick={() => { setMenuYear(view.getFullYear()); setMenuOpen((o) => !o); }}
                    aria-haspopup="dialog"
                    aria-expanded={menuOpen}
                  >
                    <span>{monthNames[view.getMonth()]} {view.getFullYear()}</span>
                    <ChevronDown size={16} aria-hidden />
                  </button>
                  {menuOpen && renderMonthMenu()}
                </div>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => setView((v) => addMonths(v, 1))} aria-label={locale['calendar.nextMonth']}><ChevronRight size={16} /></button>
            </div>
            <div className={cx('daterange__months', months === 1 && 'daterange__months--single')}>
              {renderMonth(0)}
              {months === 2 && renderMonth(1)}
            </div>
            <div className="daterange__actions">
              <button type="button" className="daterange__clear" onClick={clear}>{locale['common.clear']}</button>
              <button type="button" className="daterange__apply" onClick={() => commit(current)} disabled={!current.from || !current.to}>{locale['common.apply']}</button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}

// ---------- Command Palette (⌘K) ----------------------------------------
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  group?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  onRun: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  hotkey?: string; // 'mod+k'
}

function matchesHotkey(e: KeyboardEvent, hk: string) {
  const parts = hk.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const mods = parts.slice(0, -1);
  if (e.key.toLowerCase() !== key) return false;
  for (const m of mods) {
    if (m === 'mod' && !(e.metaKey || e.ctrlKey)) return false;
    if (m === 'ctrl' && !e.ctrlKey) return false;
    if (m === 'meta' && !e.metaKey) return false;
    if (m === 'shift' && !e.shiftKey) return false;
    if (m === 'alt' && !e.altKey) return false;
  }
  return true;
}

export function CommandPalette({
  open, onClose, items,
  placeholder,
  emptyMessage,
}: CommandPaletteProps) {
  const locale = useLocale();
  const ph = placeholder ?? locale['picker.searchCommands'];
  const empty = emptyMessage ?? locale['common.noResults'];
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = [it.label, it.description, it.group, ...(it.keywords ?? [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  // group preserve order
  const grouped = React.useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, CommandItem[]>();
    for (const it of filtered) {
      const g = it.group ?? '';
      if (!map.has(g)) { map.set(g, []); order.push(g); }
      map.get(g)!.push(it);
    }
    return { order, map };
  }, [filtered]);

  const flat = filtered;

  React.useEffect(() => {
    if (open) {
      setQuery(''); setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => { setActive(0); }, [query]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const it = flat[active];
        if (it) { it.onRun(); onClose(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, flat, active, onClose]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;
  let idx = -1;
  return (
    <div className="cmdk__overlay" role="dialog" aria-modal="true" aria-label={locale['picker.commandPalette']} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmdk__panel">
        <div className="cmdk__searchbar">
          <span className="cmdk__icon" aria-hidden="true"><Search size={16} /></span>
          <input
            ref={inputRef}
            className="cmdk__input"
            value={query}
            placeholder={ph}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="cmdk__esc">Esc</kbd>
        </div>
        <ul ref={listRef} className="cmdk__list" role="listbox">
          {flat.length === 0 && <li className="cmdk__empty">{empty}</li>}
          {grouped.order.map((g) => (
            <React.Fragment key={g || '__none'}>
              {g && <li className="cmdk__group" aria-hidden="true">{g}</li>}
              {grouped.map.get(g)!.map((it) => {
                idx++;
                const i = idx;
                return (
                  <li
                    key={it.id}
                    role="option"
                    aria-selected={i === active}
                    data-cmd-idx={i}
                    className={cx('cmdk__item', i === active && 'is-active')}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => { e.preventDefault(); it.onRun(); onClose(); }}
                  >
                    {it.icon && <span className="cmdk__item-icon" aria-hidden="true">{it.icon}</span>}
                    <span className="cmdk__item-body">
                      <span className="cmdk__item-label">{it.label}</span>
                      {it.description && <span className="cmdk__item-desc">{it.description}</span>}
                    </span>
                    {it.shortcut && <kbd className="cmdk__kbd">{it.shortcut}</kbd>}
                  </li>
                );
              })}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}

export interface UseCommandPaletteOptions {
  hotkey?: string; // default 'mod+k'
}

export function useCommandPalette({ hotkey = 'mod+k' }: UseCommandPaletteOptions = {}) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (matchesHotkey(e, hotkey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hotkey]);
  return { open, setOpen, close: () => setOpen(false), toggle: () => setOpen((o) => !o) };
}
