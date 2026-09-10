'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { CalendarIcon, X, Check } from './Icons';
import { Spinner } from './Display';
import { resolveDateFormat, formatDate, parseDate, maskDateInput, dateFormatPlaceholder, startOfMonth, isSameDay, type DateFormat } from '../utils/dateFormat';
import { CalendarView, focusCalendar } from './CalendarView';
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
  /**
   * Async pattern: called on every change of the typed query — including the
   * reset to `''` after a selection or clear, so the consumer can restore the
   * base list for the next open. The consumer fetches and re-passes
   * `options`; debouncing stays on the consumer side (the kit imposes no
   * network policy). When provided, client-side filtering is skipped — the
   * source already filtered, and re-filtering with the default substring
   * match would hide fuzzy/accent-insensitive server results. Pass an
   * explicit `filter` to layer client filtering back on top.
   */
  onQueryChange?: (query: string) => void;
  /**
   * Marks the options as in-flight. While `true` and there is nothing to
   * show, the listbox renders a loading row instead of `emptyMessage`, so a
   * pending fetch never flashes "no results". Options already on screen stay
   * visible (stale-while-revalidate).
   */
  loading?: boolean;
  /**
   * Fires when focus truly LEAVES the combobox, for validate-on-blur at the
   * consumer. Guarded against internal focus moves (input ↔ clear button) via
   * `relatedTarget`, so it does not misfire mid-interaction. Options never take
   * focus (mousedown `preventDefault` + `aria-activedescendant` keyboard nav),
   * so a `contains` check on the root is sufficient.
   */
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

const defaultFilter = <T,>(o: ComboboxOption<T>, q: string) =>
  o.label.toLowerCase().includes(q.toLowerCase());

export function Combobox<T = string>({
  value, onChange, options, placeholder,
  emptyMessage, filter,
  className, invalid, disabled, id,
  searchable = true, renderOption,
  onQueryChange, loading, onBlur,
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
  // Stable per-option id so aria-activedescendant can point the SR cursor at the
  // visually-highlighted row (APG combobox pattern).
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  const selected = React.useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );
  // Async mode (onQueryChange present) trusts the consumer's options as
  // already filtered; an explicit `filter` always wins over that default.
  const effectiveFilter = filter ?? (onQueryChange ? undefined : defaultFilter);
  const filtered = React.useMemo(
    () => (query && effectiveFilter ? options.filter((o) => effectiveFilter(o, query)) : options),
    [options, query, effectiveFilter]
  );

  // Single funnel for query updates so the async consumer hears every change,
  // including the kit's own resets to '' on select/clear.
  const updateQuery = (q: string) => {
    setQuery(q);
    onQueryChange?.(q);
  };

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
        updateQuery('');
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={cx('combobox', invalid && 'is-invalid', disabled && 'is-disabled', className)}
      onBlur={onBlur && ((e) => {
        // Only a real exit: suppress internal moves (input ↔ clear button).
        // relatedTarget is null when focus leaves to nowhere → treated as exit.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur(e);
      })}
    >
      {searchable ? (
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          className="combobox__input"
          placeholder={ph}
          disabled={disabled}
          value={open ? query : selected?.label ?? ''}
          onFocus={() => setOpen(true)}
          onChange={(e) => { updateQuery(e.target.value); setOpen(true); }}
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
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          className="combobox__trigger"
          disabled={disabled}
          title={selected?.label}
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
          onClick={() => { onChange(null); updateQuery(''); inputRef.current?.focus(); }}
          aria-label={locale['picker.clearSelection']}
        ><X size={16} /></button>
      )}
      {open && (
        <Portal>
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-busy={loading || undefined}
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
            loading ? (
              <li className="combobox__empty combobox__loading">
                <Spinner size="sm" aria-hidden="true" />
                {locale['common.loading']}…
              </li>
            ) : (
              <li className="combobox__empty">{empty}</li>
            )
          ) : (
            filtered.map((o, i) => (
              <li
                key={String(o.value)}
                id={optionId(i)}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled}
                className={cx('combobox__option', i === active && 'is-active', o.value === value && 'is-selected', o.disabled && 'is-disabled')}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (o.disabled) return;
                  onChange(o.value);
                  updateQuery('');
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
  /**
   * Disable arbitrary days (holidays, blackout dates, specific weekdays). A
   * day for which this returns `true` renders disabled — greyed, not
   * focusable (keyboard Tab skips it), not clickable, and never emitted via
   * `onChange`. Composes with `minDate`/`maxDate`: a day is disabled if it
   * falls outside the range OR the predicate marks it. E.g. disable Sundays:
   * `d => d.getDay() === 0`.
   */
  isDateDisabled?: (date: Date) => boolean;
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
  value, onChange, minDate, maxDate, isDateDisabled, placeholder,
  disabled, invalid, className, id, format = 'auto',
}: DatePickerProps) {
  const locale = useLocale();
  const fmt = resolveDateFormat(format);
  const ph = placeholder ?? dateFormatPlaceholder(fmt);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => startOfMonth(value ?? new Date()));
  // What the user is typing (v3.8.1). The input used to be driven straight by
  // `value`: every keystroke parsed a PARTIAL date → null → onChange(null) →
  // the input re-rendered empty and the characters vanished. The text is local
  // now; `value` only takes over when it changes to a different day (calendar
  // pick, external set), and the text snaps back to the last valid date on
  // blur if what was typed does not parse.
  const [text, setText] = React.useState(() => (value ? formatDate(value, fmt) : ''));
  React.useEffect(() => {
    const typed = parseDate(text, fmt);
    const same = value == null ? typed == null && text.trim() === '' : typed != null && isSameDay(typed, value);
    if (!same) setText(value ? formatDate(value, fmt) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from value only
  }, [value, fmt]);
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

  const isDisabled = (d: Date) =>
    !!(
      (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) ||
      (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) ||
      isDateDisabled?.(d)
    );

  return (
    <div ref={wrapRef} className={cx('datepicker', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <input
        id={id}
        type="text"
        className="datepicker__input"
        placeholder={ph}
        // Cap the input's intrinsic width to the format length (+1) so a
        // content-sized field (`width: fit-content`, an `auto` grid track)
        // hugs the calendar icon to the value instead of ballooning to the
        // native ~20-char default. `flex: 1` still fills a wider cell.
        size={ph.length + 1}
        disabled={disabled}
        value={text}
        inputMode="numeric"
        onChange={(e) => {
          // Live mask: digits only, separators as the groups fill, 8 digits max.
          const raw = maskDateInput(e.target.value, fmt);
          setText(raw);
          if (raw.trim() === '') { onChange(null); return; }
          // Commit only a COMPLETE date (8 digits): the parser accepts 1–4 digit
          // years, so "15-03-20" mid-typing would otherwise commit year 20.
          if (raw.replace(/\D/g, '').length !== 8) return;
          const d = parseDate(raw, fmt);
          if (d && !isDisabled(d)) onChange(d);
        }}
        onBlur={() => {
          // Incomplete or unparseable leftovers snap back to the last valid value.
          const complete = text.replace(/\D/g, '').length === 8 && parseDate(text, fmt) != null;
          if (text.trim() !== '' && !complete) setText(value ? formatDate(value, fmt) : '');
        }}
        onFocus={() => setOpen(true)}
        // ArrowDown hands focus to the calendar (keyboard entry into the portal).
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); requestAnimationFrame(() => focusCalendar(popoverRef.current)); } }}
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
          <CalendarView
            month={view}
            onMonthChange={setView}
            dayState={(d) => ({ selected: !!value && isSameDay(d, value) })}
            isDayDisabled={isDisabled}
            onSelectDay={(d) => { onChange(d); setOpen(false); }}
          />
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
interface GridPickerFieldProps {
  rootClass: string;
  displayValue: string;
  placeholder: string;
  ariaLabel: string;
  /** The popover body (a CalendarView in months / years leaf mode); `close` dismisses. */
  renderCalendar: (close: () => void) => React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
}

function GridPickerField({
  rootClass, displayValue, placeholder, ariaLabel, renderCalendar,
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
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); requestAnimationFrame(() => focusCalendar(popoverRef.current)); } }}
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
            {renderCalendar(() => setOpen(false))}
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
  const [view, setView] = React.useState(() => new Date(base, 0, 1));
  React.useEffect(() => { if (value != null) setView(new Date(value, 0, 1)); }, [value]);
  return (
    <GridPickerField
      rootClass="yearpicker"
      displayValue={value != null ? String(value) : ''}
      placeholder={placeholder ?? t['picker.selectYear']}
      ariaLabel={t['picker.openCalendar']}
      renderCalendar={(close) => (
        <CalendarView
          leaf="years"
          month={view}
          onMonthChange={setView}
          selectedYear={value}
          isYearDisabled={(y) => (minYear != null && y < minYear) || (maxYear != null && y > maxYear)}
          onSelectYear={(y) => { onChange(y); close(); }}
        />
      )}
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
  const [view, setView] = React.useState(() => startOfMonth(value ?? new Date()));
  React.useEffect(() => { if (value) setView(startOfMonth(value)); }, [value]);
  const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const outOfRange = (first: Date) =>
    (minDate != null && first < monthStart(minDate)) || (maxDate != null && first > monthStart(maxDate));
  return (
    <GridPickerField
      rootClass="monthpicker"
      displayValue={value ? `${months[value.getMonth()]} ${value.getFullYear()}` : ''}
      placeholder={placeholder ?? t['picker.selectMonth']}
      ariaLabel={t['picker.openCalendar']}
      renderCalendar={(close) => (
        <CalendarView
          leaf="months"
          month={view}
          onMonthChange={setView}
          selectedMonth={value}
          isMonthDisabled={outOfRange}
          onSelectMonth={(first) => { onChange(first); close(); }}
        />
      )}
      disabled={disabled}
      invalid={invalid}
      id={id}
      className={className}
    />
  );
}
