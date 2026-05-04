'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils/cx';
import { CalendarIcon, ChevronLeft, ChevronRight, X } from './Icons';
import { resolveDateFormat, formatDate, parseDate, dateFormatPlaceholder, type DateFormat } from '../utils/dateFormat';

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
  value, onChange, options, placeholder = 'Buscar…',
  emptyMessage = 'Sin resultados', filter = defaultFilter,
  className, invalid, disabled, id,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number } | null>(null);
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

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  React.useEffect(() => {
    if (!open || !wrapRef.current) return;
    const t = wrapRef.current.getBoundingClientRect();
    setCoords({ top: t.bottom + 4 + window.scrollY, left: t.left + window.scrollX, width: t.width });
  }, [open]);

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
        placeholder={placeholder}
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
          aria-label="Limpiar selección"
        ><X size={16} /></button>
      )}
      {open && typeof document !== 'undefined' && createPortal(
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="combobox__list"
          style={coords ? { position: 'absolute', top: coords.top, left: coords.left, width: coords.width } : { position: 'absolute', visibility: 'hidden' }}
        >
          {filtered.length === 0 ? (
            <li className="combobox__empty">{emptyMessage}</li>
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
        </ul>,
        document.body
      )}
    </div>
  );
}

// ---------- DatePicker (text + calendar popover) -------------------------
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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
  const fmt = resolveDateFormat(format);
  const ph = placeholder ?? dateFormatPlaceholder(fmt);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => startOfMonth(value ?? new Date()));
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Position popover relative to trigger; portal'd to body so overflow ancestors
  // don't clip and absolute coords (document-relative) match the offset parent.
  React.useEffect(() => {
    if (!open || !wrapRef.current) return;
    const t = wrapRef.current.getBoundingClientRect();
    setCoords({ top: t.bottom + 4 + window.scrollY, left: t.left + window.scrollX });
  }, [open]);

  React.useEffect(() => {
    if (value) setView(startOfMonth(value));
  }, [value]);

  const monthStart = view;
  const startDow = (monthStart.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));

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
        aria-label="Abrir calendario"
      ><CalendarIcon size={16} /></button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className="datepicker__popover"
          role="dialog"
          style={coords ? { position: 'absolute', top: coords.top, left: coords.left } : { position: 'absolute', visibility: 'hidden' }}
        >
          <div className="datepicker__nav">
            <button type="button" onClick={() => setView((v) => addMonths(v, -1))} aria-label="Mes anterior"><ChevronLeft size={16} /></button>
            <span className="datepicker__title">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button type="button" onClick={() => setView((v) => addMonths(v, 1))} aria-label="Mes siguiente"><ChevronRight size={16} /></button>
          </div>
          <div className="datepicker__grid">
            {WEEKDAYS.map((w, i) => <span key={i} className="datepicker__dow">{w}</span>)}
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
        </div>,
        document.body
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
      <div className="file-upload__title">Arrastra archivos o haz clic</div>
      {hint && <div id={hintId} className="file-upload__hint">{hint}</div>}
    </div>
  );
}
