'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { CalendarIcon, ChevronLeft, ChevronRight, X } from './Icons';
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
}

const defaultFilter = <T,>(o: ComboboxOption<T>, q: string) =>
  o.label.toLowerCase().includes(q.toLowerCase());

export function Combobox<T = string>({
  value, onChange, options, placeholder,
  emptyMessage, filter = defaultFilter,
  className, invalid, disabled, id,
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

  React.useEffect(() => { setActive(0); }, [query, open]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
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
      {selected && !open && (
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
            position: 'absolute',
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
                <span className="combobox__option-label">{o.label}</span>
                {o.description && <span className="combobox__option-desc">{o.description}</span>}
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
            position: 'absolute',
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
