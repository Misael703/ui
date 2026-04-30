'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Avatar } from './Display2';
import { ChevronRight, ChevronDown } from './Icons';

// ---------- UserCell ----------------------------------------------------
export interface UserCellProps extends React.HTMLAttributes<HTMLDivElement> {
  name: React.ReactNode;
  meta?: React.ReactNode;        // role / email / etc.
  avatarSrc?: string;
  avatarAlt?: string;
  size?: 24 | 32 | 40 | 48;
}

export function UserCell({ name, meta, avatarSrc, avatarAlt, size = 32, className, ...rest }: UserCellProps) {
  const initialsName = typeof name === 'string' ? name : undefined;
  return (
    <div className={cx('user-cell', className)} {...rest}>
      <Avatar src={avatarSrc} alt={avatarAlt} name={initialsName} size={size} />
      <div className="user-cell__body">
        <div className="user-cell__name">{name}</div>
        {meta && <div className="user-cell__meta">{meta}</div>}
      </div>
    </div>
  );
}

// ---------- StatusIndicator (pulsing dot) ------------------------------
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  pulse?: boolean;
  label?: React.ReactNode;
}

export function StatusIndicator({ tone = 'success', pulse, label, className, ...rest }: StatusIndicatorProps) {
  return (
    <span className={cx('status-indicator', className)} role="status" {...rest}>
      <span className={cx('status-indicator__dot', `status-indicator__dot--${tone}`, pulse && 'is-pulsing')} aria-hidden="true" />
      {label && <span className="status-indicator__label">{label}</span>}
    </span>
  );
}

// ---------- Timeline ----------------------------------------------------
export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ className, ...rest }, ref) {
    return <ol ref={ref} className={cx('timeline', className)} {...rest} />;
  }
);

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  icon?: React.ReactNode;
  tone?: StatusTone;
  title: React.ReactNode;
  meta?: React.ReactNode;
}

export function TimelineItem({ icon, tone = 'neutral', title, meta, children, className, ...rest }: TimelineItemProps) {
  return (
    <li className={cx('timeline__item', className)} {...rest}>
      <span className={cx('timeline__marker', `timeline__marker--${tone}`)} aria-hidden="true">
        {icon}
      </span>
      <div className="timeline__body">
        <div className="timeline__title">{title}</div>
        {meta && <div className="timeline__meta">{meta}</div>}
        {children && <div className="timeline__content">{children}</div>}
      </div>
    </li>
  );
}

// ---------- Tree --------------------------------------------------------
export interface TreeNodeData {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeNodeData[];
  meta?: React.ReactNode;
}

export interface TreeProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  nodes: TreeNodeData[];
  defaultExpanded?: string[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function Tree({ nodes, defaultExpanded = [], selectedId, onSelect, className, ...rest }: TreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpanded));
  const toggle = (id: string) => {
    setExpanded((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  return (
    <ul role="tree" className={cx('tree', className)} {...rest}>
      {nodes.map((n) => (
        <TreeNode key={n.id} node={n} depth={0} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}

interface TreeNodeProps {
  node: TreeNodeData;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

function TreeNode({ node, depth, expanded, toggle, selectedId, onSelect }: TreeNodeProps) {
  const hasChildren = !!(node.children && node.children.length);
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  return (
    <li role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={isSelected} className="tree__node">
      <div
        className={cx('tree__row', isSelected && 'is-selected')}
        style={{ paddingLeft: `calc(var(--space-2) + var(--space-4) * ${depth})` }}
        onClick={() => onSelect?.(node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="tree__chev"
            aria-label={isOpen ? 'Colapsar' : 'Expandir'}
            onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="tree__chev tree__chev--placeholder" aria-hidden="true" />
        )}
        {node.icon && <span className="tree__icon" aria-hidden="true">{node.icon}</span>}
        <span className="tree__label">{node.label}</span>
        {node.meta && <span className="tree__meta">{node.meta}</span>}
      </div>
      {hasChildren && isOpen && (
        <ul role="group" className="tree__children">
          {node.children!.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------- Calendar (vista mes completa, no picker) -------------------
export interface CalendarEvent {
  date: Date;
  label: React.ReactNode;
  tone?: StatusTone;
  onClick?: () => void;
}

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mes a mostrar. Default: mes actual. */
  month?: Date;
  events?: CalendarEvent[];
  onMonthChange?: (m: Date) => void;
  onDayClick?: (d: Date) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar({ month: monthProp, events = [], onMonthChange, onDayClick, className, ...rest }: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(() => startOfMonth(monthProp ?? new Date()));
  const month = monthProp ? startOfMonth(monthProp) : internalMonth;
  const setMonth = (m: Date) => {
    if (!monthProp) setInternalMonth(m);
    onMonthChange?.(m);
  };

  const today = new Date();

  // primer día visible: lunes anterior al primer día del mes
  const firstDay = startOfMonth(month);
  const firstWeekday = (firstDay.getDay() + 6) % 7; // domingo=0 → 6, lunes=1 → 0
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstWeekday);

  const days: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const eventsByDay = React.useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = `${ev.date.getFullYear()}-${ev.date.getMonth()}-${ev.date.getDate()}`;
      const list = m.get(key) ?? [];
      list.push(ev);
      m.set(key, list);
    }
    return m;
  }, [events]);

  return (
    <div className={cx('calendar', className)} {...rest}>
      <div className="calendar__head">
        <button type="button" className="calendar__nav" aria-label="Mes anterior" onClick={() => setMonth(addMonths(month, -1))}>
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="calendar__title">{MONTHS_FULL[month.getMonth()]} {month.getFullYear()}</div>
        <button type="button" className="calendar__nav" aria-label="Mes siguiente" onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="calendar__grid calendar__weekdays">
        {WEEKDAYS.map((w) => <div key={w} className="calendar__weekday">{w}</div>)}
      </div>
      <div className="calendar__grid">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === month.getMonth();
          const isToday = isSameDay(d, today);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const dayEvents = eventsByDay.get(key) ?? [];
          return (
            <button
              key={i}
              type="button"
              className={cx('calendar__day', !inMonth && 'is-out', isToday && 'is-today')}
              onClick={() => onDayClick?.(d)}
            >
              <span className="calendar__daynum">{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <div className="calendar__events">
                  {dayEvents.slice(0, 2).map((ev, idx) => (
                    <span
                      key={idx}
                      className={cx('calendar__event', `calendar__event--${ev.tone ?? 'neutral'}`)}
                      onClick={(e) => { e.stopPropagation(); ev.onClick?.(); }}
                    >
                      {ev.label}
                    </span>
                  ))}
                  {dayEvents.length > 2 && <span className="calendar__more">+{dayEvents.length - 2}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
