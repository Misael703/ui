'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { CalendarIcon, ChevronLeft, ChevronRight, X, Check } from './Icons';
import { resolveDateFormat, formatDate, parseDate, dateFormatPlaceholder, startOfMonth, addMonths, isSameDay, buildMonthGrid, type DateFormat } from '../utils/dateFormat';
import { useLocale } from '../locale/LocaleProvider';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

// ---------- Combobox -----------------------------------------------------
export interface ComboboxOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps<T = string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  emptyMessage?: string;
  filter?: (option: ComboboxOption<T>, query: string) => boolean;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  /**
   * Whether the trigger is a typeable text input that filters options.
   * Default `true` (the searchable Combobox). Set `false` for a non-typing
   * picker: button trigger + the same kit-styled listbox, no filter, full
   * list always. Closes the gap between native `<Select>` (jarring native
   * dropdown) and the searchable Combobox — same visual register, no input.
   */
  searchable?: boolean;
  /**
   * Custom renderer for each option's content in the listbox. Receives the
   * option; return any node (e.g. an id `Badge` + the name). Falls back to
   * `label` (+ `description`) when omitted. The searchable input still shows
   * `label` as text — only the listbox rows are customized.
   */
  renderOption?: (option: ComboboxOption<T>) => React.ReactNode;
}

const defaultFilter = <T,>(o: ComboboxOption<T>, q: string) =>
  o.label.toLowerCase().includes(q.toLowerCase());

export function Combobox<T = string>({
  value, onChange, options, placeholder,
  emptyMessage, filter = defaultFilter,
  className, invalid, disabled, id,
  searchable = true, renderOption,
}: ComboboxProps<T>) {
  const locale = useLocale();
  const ph = placeholder ?? locale['common.search'];
  const empty = emptyMessage ?? locale['common.noResults'];
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  // Stable per-instance listbox id so multiple Comboboxes don't collide on aria-controls.
  const reactId = React.useId();
  const listboxId = `${id ?? reactId}-listbox`;

  const selected = React.useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );
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

  // Escape is handled by the input's onKeyDown; here we only need
  // outside-click (closeOnEscape: false avoids a double close).
  useDismiss({
    open,
    onDismiss: () => setOpen(false),
    refs: [wrapRef, listRef],
    closeOnEscape: false,
  });

  // Choose the active descendant on open (and on query change while open).
  // With a confirmed value and no active query, start on the SELECTED option
  // — not index 0 — so the keyboard cursor and the highlighted row agree and
  // the selection scrolls into view. Typing resets to the first match.
  React.useEffect(() => {
    if (!open) return;
    if (!query && value != null) {
      const idx = filtered.findIndex((o) => o.value === value);
      setActive(idx >= 0 ? idx : 0);
    } else {
      setActive(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- default only on open/query transitions; filtered/value read intentionally from closure
  }, [query, open]);

  // Keep the active option in view — on open (jump to the selected row) and
  // as the keyboard cursor moves. Adjusts only the listbox's own scrollTop,
  // never the page: the list is portaled, so scrollIntoView could scroll an
  // ancestor instead.
  React.useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelectorAll<HTMLElement>('[role="option"]')[active];
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [open, active]);

  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      // Only navigate when the listbox is open (no-op otherwise).
      if (!open) return;
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      // Only commit when the listbox is open — without this gate, Enter on
      // a button trigger that just opened would race with the open and
      // immediately select the first option.
      if (!open) return;
      e.preventDefault();
      const opt = filtered[active];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        setQuery('');
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={cx('combobox', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      {searchable ? (
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className="combobox__input"
          placeholder={ph}
          disabled={disabled}
          value={open ? query : selected?.label ?? ''}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKey}
        />
      ) : (
        // Non-typing trigger: button shaped like `.combobox__input` (same
        // border / radius / chevron) so the two variants line up visually.
        // No clear button — the user re-picks from the listbox instead.
        <button
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className="combobox__trigger"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKey}
        >
          {selected ? (
            <span className="combobox__trigger-label">{selected.label}</span>
          ) : (
            <span className="combobox__trigger-placeholder">{ph}</span>
          )}
        </button>
      )}
      {searchable && selected && !open && (
        <button
          type="button"
          className="combobox__clear"
          onClick={() => { onChange(null); setQuery(''); inputRef.current?.focus(); }}
          aria-label={locale['picker.clearSelection']}
        ><X size={16} /></button>
      )}
      {open && (
        <Portal>
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className={cx('combobox__list', 'is-floating')}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            visibility: pos.ready ? 'visible' : 'hidden',
          }}
        >
          {filtered.length === 0 ? (
            <li className="combobox__empty">{empty}</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={String(o.value)}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled}
                className={cx('combobox__option', i === active && 'is-active', o.value === value && 'is-selected', o.disabled && 'is-disabled')}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (o.disabled) return;
                  onChange(o.value);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <span className="combobox__option-content">
                  {renderOption ? (
                    renderOption(o)
                  ) : (
                    <>
                      <span className="combobox__option-label">{o.label}</span>
                      {o.description && <span className="combobox__option-desc">{o.description}</span>}
                    </>
                  )}
                </span>
                {/* Unambiguous selected marker — distinguishes the confirmed
                    value from the keyboard/hover `active` highlight even when
                    their backgrounds are close in a given palette. */}
                {o.value === value && <Check size={16} className="combobox__option-check" aria-hidden="true" />}
              </li>
            ))
          )}
        </ul>
        </Portal>
      )}
    </div>
  );
}

// ---------- DatePicker (text + calendar popover) -------------------------
export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  id?: string;
  /**
   * Display & parse format. Default `'auto'` derives from `configureBrand().locale`
   * (e.g. `es-CL` → `dd-mm-aaaa`, `en-US` → `mm-dd-aaaa`, `ja-JP` → `aaaa-mm-dd`).
   */
  format?: DateFormat;
}

export function DatePicker({
  value, onChange, minDate, maxDate, placeholder,
  disabled, invalid, className, id, format = 'auto',
}: DatePickerProps) {
  const locale = useLocale();
  const fmt = resolveDateFormat(format);
  const ph = placeholder ?? dateFormatPlaceholder(fmt);
  const weekdays = locale['picker.weekdaysShort'];
  const months = locale['calendar.months'];
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => startOfMonth(value ?? new Date()));
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Portaled to body (escapes overflow ancestors) with flip/clamp and
  // scroll/resize reposition — same primitive as Combobox above. No
  // returnFocusRef: the input opens on focus, so refocusing it on close
  // would immediately reopen the calendar (Combobox omits it for the same
  // reason). Escape still closes via useDismiss's default handler.
  const pos = usePopoverPosition(wrapRef, popoverRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 4,
  });

  useDismiss({
    open,
    onDismiss: () => setOpen(false),
    refs: [wrapRef, popoverRef],
  });

  React.useEffect(() => {
    if (value) setView(startOfMonth(value));
  }, [value]);

  const { cells } = buildMonthGrid(view, 0);

  const isDisabled = (d: Date) =>
    (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) ||
    (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()));

  return (
    <div ref={wrapRef} className={cx('datepicker', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <input
        id={id}
        type="text"
        className="datepicker__input"
        placeholder={ph}
        disabled={disabled}
        value={value ? formatDate(value, fmt) : ''}
        onChange={(e) => {
          const d = parseDate(e.target.value, fmt);
          onChange(d);
        }}
        onFocus={() => setOpen(true)}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="datepicker__toggle"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-label={locale['picker.openCalendar']}
      ><CalendarIcon size={16} /></button>
      {open && (
        <Portal>
        <div
          ref={popoverRef}
          className={cx('datepicker__popover', 'is-floating')}
          role="dialog"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            visibility: pos.ready ? 'visible' : 'hidden',
          }}
        >
          <div className="datepicker__nav">
            <button type="button" onClick={() => setView((v) => addMonths(v, -1))} aria-label={locale['calendar.prevMonth']}><ChevronLeft size={16} /></button>
            <span className="datepicker__title">{months[view.getMonth()]} {view.getFullYear()}</span>
            <button type="button" onClick={() => setView((v) => addMonths(v, 1))} aria-label={locale['calendar.nextMonth']}><ChevronRight size={16} /></button>
          </div>
          <div className="datepicker__grid">
            {weekdays.map((w, i) => <span key={i} className="datepicker__dow">{w}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={`b${i}`} />;
              const sel = value && isSameDay(d, value);
              const today = isSameDay(d, new Date());
              const off = isDisabled(d);
              return (
                <button
                  key={i}
                  type="button"
                  className={cx('datepicker__day', sel && 'is-selected', today && 'is-today', off && 'is-disabled')}
                  disabled={!!off}
                  onClick={() => { onChange(d); setOpen(false); }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}

// ---------- FileUpload (drop zone) ---------------------------------------
export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  disabled?: boolean;
  className?: string;
  hint?: React.ReactNode;
  /** Accessible name for the drop zone (e.g. "Subir foto de perfil"). */
  'aria-label'?: string;
}

export function FileUpload({
  onFiles, accept, multiple = false, maxSize, disabled, className, hint,
  'aria-label': ariaLabel,
}: FileUploadProps) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();
  const locale = useLocale();
  const handle = (list: FileList | null) => {
    if (!list) return;
    let arr = Array.from(list);
    if (maxSize) arr = arr.filter((f) => f.size <= maxSize);
    if (!multiple) arr = arr.slice(0, 1);
    onFiles(arr);
  };
  return (
    <div
      className={cx('file-upload', drag && 'is-drag', disabled && 'is-disabled', className)}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) handle(e.dataTransfer.files); }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-describedby={hint ? hintId : undefined}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      <div className="file-upload__icon" aria-hidden="true">⤴</div>
      <div className="file-upload__title">{locale['fileUpload.title']}</div>
      {hint && <div id={hintId} className="file-upload__hint">{hint}</div>}
    </div>
  );
}

// ---------- GridPickerField (shared shell: YearPicker / MonthPicker) ------
interface GridCell {
  key: string;
  label: React.ReactNode;
  selected?: boolean;
  /** Dimmed (outside the current decade) — YearPicker only. */
  outside?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface GridPickerFieldProps {
  rootClass: string;
  displayValue: string;
  placeholder: string;
  ariaLabel: string;
  navTitle: React.ReactNode;
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  cells: GridCell[];
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
}

function GridPickerField({
  rootClass, displayValue, placeholder, ariaLabel, navTitle,
  prevLabel, nextLabel, onPrev, onNext, cells,
  disabled, invalid, id, className,
}: GridPickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Same floating primitive as DatePicker (Portal + flip/clamp + dismiss).
  const pos = usePopoverPosition(wrapRef, popoverRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 4,
  });
  useDismiss({ open, onDismiss: () => setOpen(false), refs: [wrapRef, popoverRef] });

  return (
    <div
      ref={wrapRef}
      className={cx(rootClass, 'gridpicker', invalid && 'is-invalid', disabled && 'is-disabled', className)}
    >
      <input
        id={id}
        type="text"
        readOnly
        className="gridpicker__input"
        placeholder={placeholder}
        disabled={disabled}
        value={displayValue}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="gridpicker__toggle"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <CalendarIcon size={16} />
      </button>
      {open && (
        <Portal>
          <div
            ref={popoverRef}
            className={cx('gridpicker__popover', 'is-floating')}
            role="dialog"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
          >
            <div className="gridpicker__nav">
              <button type="button" onClick={onPrev} aria-label={prevLabel}><ChevronLeft size={16} /></button>
              <span className="gridpicker__title">{navTitle}</span>
              <button type="button" onClick={onNext} aria-label={nextLabel}><ChevronRight size={16} /></button>
            </div>
            <div className="gridpicker__grid">
              {cells.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={cx('gridpicker__cell', c.selected && 'is-selected', c.outside && 'is-out')}
                  disabled={c.disabled}
                  onClick={() => { c.onSelect(); setOpen(false); }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ---------- YearPicker ---------------------------------------------------
export interface YearPickerProps {
  value: number | null;
  onChange: (year: number | null) => void;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
}

export function YearPicker({
  value, onChange, minYear, maxYear, placeholder,
  disabled, invalid, id, className,
}: YearPickerProps) {
  const t = useLocale();
  const base = value ?? new Date().getFullYear();
  const [decade, setDecade] = React.useState(Math.floor(base / 10) * 10);

  React.useEffect(() => {
    if (value != null) setDecade(Math.floor(value / 10) * 10);
  }, [value]);

  const cells: GridCell[] = Array.from({ length: 12 }, (_, i) => {
    const year = decade - 1 + i;
    return {
      key: String(year),
      label: year,
      selected: value === year,
      outside: year < decade || year > decade + 9,
      disabled: (minYear != null && year < minYear) || (maxYear != null && year > maxYear),
      onSelect: () => onChange(year),
    };
  });

  return (
    <GridPickerField
      rootClass="yearpicker"
      displayValue={value != null ? String(value) : ''}
      placeholder={placeholder ?? t['picker.selectYear']}
      ariaLabel={t['picker.openCalendar']}
      navTitle={`${decade}-${decade + 9}`}
      prevLabel={t['picker.prevDecade']}
      nextLabel={t['picker.nextDecade']}
      onPrev={() => setDecade((d) => d - 10)}
      onNext={() => setDecade((d) => d + 10)}
      cells={cells}
      disabled={disabled}
      invalid={invalid}
      id={id}
      className={className}
    />
  );
}

// ---------- MonthPicker --------------------------------------------------
export interface MonthPickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
}

export function MonthPicker({
  value, onChange, minDate, maxDate, placeholder,
  disabled, invalid, id, className,
}: MonthPickerProps) {
  const t = useLocale();
  const months = t['calendar.months'];
  const base = value ?? new Date();
  const [year, setYear] = React.useState(base.getFullYear());

  React.useEffect(() => {
    if (value) setYear(value.getFullYear());
  }, [value]);

  const monthStart = (y: number, m: number) => new Date(y, m, 1);
  const outOfRange = (m: number) =>
    (minDate != null && monthStart(year, m) < monthStart(minDate.getFullYear(), minDate.getMonth())) ||
    (maxDate != null && monthStart(year, m) > monthStart(maxDate.getFullYear(), maxDate.getMonth()));

  const cells: GridCell[] = months.map((name, m) => ({
    key: String(m),
    label: name,
    selected: !!value && value.getFullYear() === year && value.getMonth() === m,
    disabled: outOfRange(m),
    onSelect: () => onChange(new Date(year, m, 1)),
  }));

  return (
    <GridPickerField
      rootClass="monthpicker"
      displayValue={value ? `${months[value.getMonth()]} ${value.getFullYear()}` : ''}
      placeholder={placeholder ?? t['picker.selectMonth']}
      ariaLabel={t['picker.openCalendar']}
      navTitle={String(year)}
      prevLabel={t['picker.prevYear']}
      nextLabel={t['picker.nextYear']}
      onPrev={() => setYear((y) => y - 1)}
      onNext={() => setYear((y) => y + 1)}
      cells={cells}
      disabled={disabled}
      invalid={invalid}
      id={id}
      className={className}
    />
  );
}
