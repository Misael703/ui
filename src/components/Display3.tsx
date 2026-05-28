'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Avatar } from './Display2';
import { ChevronRight, ChevronDown } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { startOfMonth, addMonths, isSameDay } from '../utils/dateFormat';

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
export type TimelineDensity = 'default' | 'compact';

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /**
   * Visual density (v1.28.0). `compact` shrinks the marker, gap and font
   * sizes for use in cards / list summaries; semantically identical.
   */
  density?: TimelineDensity;
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ className, density = 'default', ...rest }, ref) {
    return <ol ref={ref} className={cx('timeline', density === 'compact' && 'timeline--compact', className)} {...rest} />;
  }
);

/**
 * Progress state of a Timeline entry (v1.28.0), orthogonal to `tone`.
 * - `done` — completed: filled marker (in `tone` color), solid connector above.
 * - `current` — happening now: ringed/pulsing marker, solid connector above.
 * - `pending` — not started: hollow muted marker, **dashed** connector above.
 *
 * Use it to scan progress on a list of events that grow over time (a despachos
 * order accumulating envíos/retiros until the last marks it complete). Default
 * (state omitted) keeps the 1.x look exactly.
 */
export type TimelineState = 'done' | 'current' | 'pending';

/**
 * Visual emphasis for the entry's marker (v1.30.0), orthogonal to `state` and
 * `tone`. Default markers are 24×24 hollow with a tone-colored border, ideal
 * for the operational events that fill a timeline. `milestone` upgrades the
 * marker to 32×32 filled in the `tone` color with a subtle halo — for the
 * "anchor" events that the rest of the timeline hangs from (e.g. "Orden
 * creada" at the top of an order detail). Without this the hollow markers of
 * the operational events out-shout the anchor, inverting the hierarchy.
 *
 * `milestone` keeps the `state` semantics: a `pending` milestone stays hollow
 * (muted, no halo), preserving "not yet" while still occupying the larger
 * anchor slot. A `current` milestone gets the pulse halo (overrides the
 * static one).
 */
export type TimelineVariant = 'default' | 'milestone';

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  icon?: React.ReactNode;
  tone?: StatusTone;
  title: React.ReactNode;
  meta?: React.ReactNode;
  /** Progress state (see {@link TimelineState}). Optional. */
  state?: TimelineState;
  /**
   * Trailing slot on the title row, aligned to the right (v1.28.0). Useful for
   * a Badge marking event type (envío / retiro / nota), a timestamp on the
   * right edge, or a small action chip.
   */
  right?: React.ReactNode;
  /** Visual emphasis (see {@link TimelineVariant}). Optional, default unchanged. */
  variant?: TimelineVariant;
}

export function TimelineItem({ icon, tone = 'neutral', title, meta, children, state, right, variant, className, ...rest }: TimelineItemProps) {
  return (
    <li
      className={cx(
        'timeline__item',
        state && `timeline__item--${state}`,
        variant === 'milestone' && 'timeline__item--milestone',
        className,
      )}
      data-state={state}
      {...rest}
    >
      <span
        className={cx(
          'timeline__marker',
          `timeline__marker--${tone}`,
          variant === 'milestone' && 'timeline__marker--milestone',
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="timeline__body">
        {right != null ? (
          // Title row wrapper only renders when there's a trailing slot, so
          // the DOM stays byte-identical for existing consumers (back-compat).
          <div className="timeline__title-row">
            <div className="timeline__title">{title}</div>
            <div className="timeline__right">{right}</div>
          </div>
        ) : (
          <div className="timeline__title">{title}</div>
        )}
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

function firstNodeId(nodes: TreeNodeData[]): string | undefined {
  return nodes[0]?.id;
}

export function Tree({
  nodes,
  defaultExpanded = [],
  selectedId,
  onSelect,
  className,
  onKeyDown,
  ...rest
}: TreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpanded));
  const [activeId, setActiveId] = React.useState<string | undefined>(undefined);
  const rootRef = React.useRef<HTMLUListElement>(null);

  // Roving tabindex: one treeitem is tabbable at a time. Falls back to the
  // selected node, then the first node, so the tree is reachable on first Tab.
  const effectiveActive = activeId ?? selectedId ?? firstNodeId(nodes);

  const toggle = React.useCallback((id: string) => {
    setExpanded((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleItems = (): HTMLElement[] =>
    Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []);

  const focusItem = (el: HTMLElement | undefined): void => {
    if (!el) return;
    setActiveId(el.dataset.treeId);
    el.focus();
  };

  // WAI-ARIA TreeView keyboard model. Focus lives on the treeitem element;
  // querySelectorAll returns items in DOM order, which equals visual order
  // (collapsed branches are not rendered, so they are not navigable).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    onKeyDown?.(e);
    const targetEl = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    if (!targetEl || !rootRef.current?.contains(targetEl)) return;
    const list = visibleItems();
    const idx = list.indexOf(targetEl);
    if (idx === -1) return;
    const id = targetEl.dataset.treeId;
    if (!id) return;
    const depth = Number(targetEl.dataset.depth ?? 0);
    const expandedAttr = targetEl.getAttribute('aria-expanded');
    const hasChildren = expandedAttr !== null;
    const isOpen = expandedAttr === 'true';

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem(list[Math.min(idx + 1, list.length - 1)]);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(list[Math.max(idx - 1, 0)]);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(list[0]);
        break;
      case 'End':
        e.preventDefault();
        focusItem(list[list.length - 1]);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasChildren && !isOpen) toggle(id);
        else if (hasChildren && isOpen) focusItem(list[idx + 1]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (hasChildren && isOpen) {
          toggle(id);
        } else {
          for (let i = idx - 1; i >= 0; i--) {
            const candidate = list[i];
            if (candidate && Number(candidate.dataset.depth ?? 0) < depth) {
              focusItem(candidate);
              break;
            }
          }
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(id);
        break;
      default:
        break;
    }
  };

  return (
    <ul
      ref={rootRef}
      role="tree"
      className={cx('tree', className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {nodes.map((n) => (
        <TreeNode
          key={n.id}
          node={n}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          selectedId={selectedId}
          activeId={effectiveActive}
          onSelect={onSelect}
          onFocusItem={setActiveId}
        />
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
  activeId?: string;
  onSelect?: (id: string) => void;
  onFocusItem: (id: string) => void;
}

function TreeNode({
  node,
  depth,
  expanded,
  toggle,
  selectedId,
  activeId,
  onSelect,
  onFocusItem,
}: TreeNodeProps) {
  const hasChildren = !!(node.children && node.children.length);
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const isActive = activeId === node.id;
  return (
    <li role="none" className="tree__node">
      <div
        role="treeitem"
        data-tree-id={node.id}
        data-depth={depth}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={isSelected}
        tabIndex={isActive ? 0 : -1}
        className={cx('tree__row', isSelected && 'is-selected')}
        style={{ paddingLeft: `calc(var(--space-2) + var(--space-4) * ${depth})` }}
        onClick={() => {
          onFocusItem(node.id);
          onSelect?.(node.id);
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="tree__chev"
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
            <TreeNode
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              activeId={activeId}
              onSelect={onSelect}
              onFocusItem={onFocusItem}
            />
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

export function Calendar({ month: monthProp, events = [], onMonthChange, onDayClick, className, ...rest }: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(() => startOfMonth(monthProp ?? new Date()));
  const month = monthProp ? startOfMonth(monthProp) : internalMonth;
  const t = useLocale();
  const weekdays = t['calendar.weekdays'];
  const months = t['calendar.months'];
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
        <button type="button" className="calendar__nav" aria-label={t['calendar.prevMonth']} onClick={() => setMonth(addMonths(month, -1))}>
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="calendar__title">{months[month.getMonth()]} {month.getFullYear()}</div>
        <button type="button" className="calendar__nav" aria-label={t['calendar.nextMonth']} onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="calendar__grid calendar__weekdays">
        {weekdays.map((w) => <div key={w} className="calendar__weekday">{w}</div>)}
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
