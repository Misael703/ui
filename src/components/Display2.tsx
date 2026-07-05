'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ArrowUp, ArrowDown, Minus } from './Icons';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

// ---------- Avatar ------------------------------------------------------
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  name?: string;             // for initials fallback
  size?: 24 | 32 | 40 | 48 | 64;
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy';
}

function initials(name: string) {
  if (name.startsWith('+')) return name;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function Avatar({ src, alt, name, size = 32, shape = 'circle', status, className, style, ...rest }: AvatarProps) {
  return (
    <span
      className={cx('avatar', `avatar--${shape}`, className)}
      style={{ width: size, height: size, fontSize: size * 0.42, ...style }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? name ?? ''} />
      ) : (
        <span className="avatar__initials">{name ? initials(name) : '?'}</span>
      )}
      {status && <span className={cx('avatar__status', `avatar__status--${status}`)} aria-label={status} />}
    </span>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({ children, max = 4, size = 32, className }: AvatarGroupProps) {
  const arr = React.Children.toArray(children);
  const shown = arr.slice(0, max);
  const overflow = arr.length - shown.length;
  return (
    <div className={cx('avatar-group', className)}>
      {shown.map((c, i) => <span key={i} style={{ marginLeft: i === 0 ? 0 : -size * 0.3, zIndex: shown.length - i }}>{c}</span>)}
      {overflow > 0 && (
        <Avatar name={`+${overflow}`} size={size} className="avatar--overflow" />
      )}
    </div>
  );
}

// ---------- Menu (dropdown) accesible -----------------------------------
export interface MenuItemProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: string;
}

export interface MenuProps {
  trigger: React.ReactElement;
  items: Array<MenuItemProps | { type: 'separator' } | { type: 'label'; label: React.ReactNode }>;
  align?: 'start' | 'end';
  className?: string;
}

export function Menu({ trigger, items, align = 'start', className }: MenuProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  // Positions within `items` that are focusable menu items (no
  // separators/labels/disabled). `active` indexes into this list.
  const enabledIdx = items
    .map((it, i) => ('type' in it ? -1 : it.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const pos = usePopoverPosition(wrapRef, panelRef, {
    open,
    side: 'bottom',
    align,
    offset: 6,
  });

  const focusTrigger = React.useCallback(() => {
    wrapRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
  }, []);

  // Outside-click closes; Escape is handled on the panel so it can also
  // return focus to the trigger (WAI-ARIA menu button pattern).
  useDismiss({
    open,
    onDismiss: () => setOpen(false),
    refs: [wrapRef, panelRef],
    closeOnEscape: false,
  });

  React.useEffect(() => {
    if (open) setActive(0);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const realIdx = enabledIdx[active];
    if (realIdx != null) itemRefs.current[realIdx]?.focus();
  }, [open, active, enabledIdx]);

  const select = (i: number) => {
    const it = items[i];
    if (!it || 'type' in it || it.disabled) return;
    it.onSelect?.();
    setOpen(false);
    focusTrigger();
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      focusTrigger();
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, enabledIdx.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(enabledIdx.length - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const realIdx = enabledIdx[active];
      if (realIdx != null) select(realIdx);
    }
  };

  const triggerEl = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen((o) => !o);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      trigger.props.onKeyDown?.(e);
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <span ref={wrapRef} className={cx('menu', className)} style={{ display: 'inline-block' }}>
      {triggerEl}
      {open && (
        <Portal>
          <div
            ref={panelRef}
            role="menu"
            className="menu__panel"
            onKeyDown={onPanelKeyDown}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
          >
            {items.map((it, i) => {
              if ('type' in it && it.type === 'separator') return <div key={i} className="menu__sep" role="separator" />;
              if ('type' in it && it.type === 'label') return <div key={i} className="menu__label">{it.label}</div>;
              const item = it as MenuItemProps;
              const isActive = enabledIdx[active] === i;
              return (
                <button
                  key={i}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  type="button"
                  role="menuitem"
                  tabIndex={isActive ? 0 : -1}
                  disabled={item.disabled}
                  className={cx('menu__item', isActive && 'is-active', item.destructive && 'is-destructive')}
                  onMouseEnter={() => setActive(enabledIdx.indexOf(i))}
                  onClick={() => select(i)}
                >
                  {item.icon && <span className="menu__icon" aria-hidden="true">{item.icon}</span>}
                  <span className="menu__body">
                    <span className="menu__label-row">
                      <span>{item.label}</span>
                      {item.shortcut && <kbd className="menu__kbd">{item.shortcut}</kbd>}
                    </span>
                    {item.description && <span className="menu__desc">{item.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </span>
  );
}

// ---------- Stat / MiniStat ---------------------------------------------
export interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: { dir: 'up' | 'down' | 'flat'; value: string };
  align?: 'start' | 'center';
  className?: string;
}

export function Stat({ label, value, hint, trend, align = 'start', className }: StatProps) {
  return (
    <div className={cx('stat', `stat--${align}`, className)}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
      {(hint || trend) && (
        <span className="stat__foot">
          {trend && (
            <span className={cx('stat__trend', `stat__trend--${trend.dir}`)}>
              {/* Same arrow set as DeltaBadge (Arrow*, Minus) so trend
                  iconography is single-sourced across Stat and StatCard. */}
              {trend.dir === 'up' ? <ArrowUp size={12} /> : trend.dir === 'down' ? <ArrowDown size={12} /> : <Minus size={12} />} {trend.value}
            </span>
          )}
          {hint && <span className="stat__hint">{hint}</span>}
        </span>
      )}
    </div>
  );
}
