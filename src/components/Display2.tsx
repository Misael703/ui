'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronUp, ChevronDown } from './Icons';

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
  const ref = React.useRef<HTMLDivElement>(null);

  const enabledIdx = items
    .map((it, i) => 'type' in it ? -1 : (it.disabled ? -1 : i))
    .filter((i) => i >= 0);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (i: number) => {
    const it = items[i];
    if (!it || 'type' in it) return;
    if (it.disabled) return;
    it.onSelect?.();
    setOpen(false);
  };

  const triggerEl = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen((o) => !o);
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <div ref={ref} className={cx('menu', className)} style={{ position: 'relative', display: 'inline-block' }}>
      {triggerEl}
      {open && (
        <div role="menu" className={cx('menu__panel', `menu__panel--${align}`)}>
          {items.map((it, i) => {
            if ('type' in it && it.type === 'separator') return <div key={i} className="menu__sep" role="separator" />;
            if ('type' in it && it.type === 'label') return <div key={i} className="menu__label">{it.label}</div>;
            const item = it as MenuItemProps;
            const isActive = enabledIdx[active] === i;
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
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
      )}
    </div>
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
              {trend.dir === 'up' ? <ChevronUp size={12} /> : trend.dir === 'down' ? <ChevronDown size={12} /> : '–'} {trend.value}
            </span>
          )}
          {hint && <span className="stat__hint">{hint}</span>}
        </span>
      )}
    </div>
  );
}
