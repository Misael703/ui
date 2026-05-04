'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils/cx';
import { CalendarIcon, ChevronLeft, ChevronRight, X, Check, Search } from './Icons';
import { resolveDateFormat, formatDate, type DateFormat } from '../utils/dateFormat';

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
  value, onChange, options, placeholder = 'Buscar…',
  emptyMessage = 'Sin resultados', filter = dfilter,
  invalid, disabled, className, id, maxVisibleChips = 3,
}: MultiComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const reactId = React.useId();
  const listboxId = `${id ?? reactId}-listbox`;
  // Build the lookup Set once per `value` change, not on every keystroke or
  // hover-driven re-render.
  const selSet = React.useMemo(() => new Set(value), [value]);

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
            <button type="button" aria-label={`Quitar ${o.label}`} onClick={(e) => { e.stopPropagation(); toggle(o.value); }}><X size={12} /></button>
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
          placeholder={selectedItems.length === 0 ? placeholder : ''}
          disabled={disabled}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKey}
        />
      </div>
      {open && typeof document !== 'undefined' && createPortal(
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="multicombo__list"
          style={coords ? { position: 'absolute', top: coords.top, left: coords.left, width: coords.width } : { position: 'absolute', visibility: 'hidden' }}
        >
          {filtered.length === 0 ? (
            <li className="multicombo__empty">{emptyMessage}</li>
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
        </ul>,
        document.body
      )}
    </div>
  );
}

// ---------- DateRangePicker --------------------------------------------
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function buildMonthGrid(view: Date, offset: number) {
  const m = addMonths(view, offset);
  const startDow = (m.getDay() + 6) % 7;
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(m.getFullYear(), m.getMonth(), d));
  return { m, cells };
}
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export interface DateRange { from: Date | null; to: Date | null }

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (v: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: Array<{ label: string; range: () => DateRange }>;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  /**
   * Display format. Default `'auto'` derives from `configureBrand().locale`.
   */
  format?: DateFormat;
}

export function DateRangePicker({
  value, onChange, minDate, maxDate, presets,
  invalid, disabled, className, id, format = 'auto',
}: DateRangePickerProps) {
  const fmt = resolveDateFormat(format);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => startOfMonth(value.from ?? new Date()));
  const [hover, setHover] = React.useState<Date | null>(null);
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

  React.useEffect(() => {
    if (!open || !wrapRef.current) return;
    const t = wrapRef.current.getBoundingClientRect();
    setCoords({ top: t.bottom + 6 + window.scrollY, left: t.left + window.scrollX });
  }, [open]);

  // Each panel renders ~42 Date cells. Without memoization, every
  // setHover() triggered a full rebuild of both panels' grids on every
  // mouse movement over the calendar. Memo keyed on `view` only.
  const monthGrid0 = React.useMemo(() => buildMonthGrid(view, 0), [view]);
  const monthGrid1 = React.useMemo(() => buildMonthGrid(view, 1), [view]);

  const isDisabled = (d: Date) =>
    (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) ||
    (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()));

  const inRange = (d: Date) => {
    if (!value.from) return false;
    const end = value.to ?? hover;
    if (!end) return isSameDay(d, value.from);
    const a = value.from < end ? value.from : end;
    const b = value.from < end ? end : value.from;
    return d >= new Date(a.getFullYear(), a.getMonth(), a.getDate()) &&
           d <= new Date(b.getFullYear(), b.getMonth(), b.getDate());
  };

  const click = (d: Date) => {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: d, to: null });
    } else {
      const from = value.from;
      if (d < from) onChange({ from: d, to: from });
      else onChange({ from, to: d });
    }
  };

  const label = value.from
    ? value.to
      ? `${formatDate(value.from, fmt)} → ${formatDate(value.to, fmt)}`
      : `${formatDate(value.from, fmt)} → …`
    : 'Seleccionar rango';

  const renderMonth = (offset: number) => {
    const { m, cells } = offset === 0 ? monthGrid0 : monthGrid1;
    return (
      <div className="daterange__month">
        <div className="daterange__title">{MONTHS[m.getMonth()]} {m.getFullYear()}</div>
        <div className="daterange__grid">
          {WEEKDAYS.map((w, i) => <span key={i} className="daterange__dow">{w}</span>)}
          {cells.map((d, i) => {
            if (!d) return <span key={`b${i}`} />;
            const sel = (value.from && isSameDay(d, value.from)) || (value.to && isSameDay(d, value.to));
            const ir = inRange(d);
            const today = isSameDay(d, new Date());
            const off = isDisabled(d);
            return (
              <button
                key={i}
                type="button"
                className={cx('daterange__day', sel && 'is-selected', ir && !sel && 'is-range', today && 'is-today', off && 'is-disabled')}
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

  return (
    <div ref={wrapRef} className={cx('daterange', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <button
        id={id}
        type="button"
        className="daterange__trigger"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="daterange__icon" aria-hidden="true"><CalendarIcon size={16} /></span>
        <span>{label}</span>
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className="daterange__popover"
          role="dialog"
          onMouseLeave={() => setHover(null)}
          style={coords ? { position: 'absolute', top: coords.top, left: coords.left } : { position: 'absolute', visibility: 'hidden' }}
        >
          {presets && presets.length > 0 && (
            <ul className="daterange__presets">
              {presets.map((p, i) => (
                <li key={i}>
                  <button type="button" onClick={() => { onChange(p.range()); setOpen(false); }}>{p.label}</button>
                </li>
              ))}
            </ul>
          )}
          <div className="daterange__panes">
            <div className="daterange__nav">
              <button type="button" onClick={() => setView((v) => addMonths(v, -1))} aria-label="Mes anterior"><ChevronLeft size={16} /></button>
              <span />
              <button type="button" onClick={() => setView((v) => addMonths(v, 1))} aria-label="Mes siguiente"><ChevronRight size={16} /></button>
            </div>
            <div className="daterange__months">
              {renderMonth(0)}
              {renderMonth(1)}
            </div>
            <div className="daterange__actions">
              <button type="button" className="daterange__clear" onClick={() => onChange({ from: null, to: null })}>Limpiar</button>
              <button type="button" className="daterange__apply" onClick={() => setOpen(false)} disabled={!value.from || !value.to}>Aplicar</button>
            </div>
          </div>
        </div>,
        document.body
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
  placeholder = 'Buscar comandos…',
  emptyMessage = 'Sin resultados',
}: CommandPaletteProps) {
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
    <div className="cmdk__overlay" role="dialog" aria-modal="true" aria-label="Paleta de comandos" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmdk__panel">
        <div className="cmdk__searchbar">
          <span className="cmdk__icon" aria-hidden="true"><Search size={16} /></span>
          <input
            ref={inputRef}
            className="cmdk__input"
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="cmdk__esc">Esc</kbd>
        </div>
        <ul ref={listRef} className="cmdk__list" role="listbox">
          {flat.length === 0 && <li className="cmdk__empty">{emptyMessage}</li>}
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
