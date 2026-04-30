'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

export interface ContextMenuItem {
  id: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

export function ContextMenu({ items, children, className, menuClassName, ariaLabel = 'Menú contextual' }: ContextMenuProps) {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);

  const close = () => setPos(null);

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
  };

  React.useEffect(() => {
    if (!pos) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [pos]);

  React.useEffect(() => {
    if (!pos || !menuRef.current) return;
    const r = menuRef.current.getBoundingClientRect();
    let x = pos.x;
    let y = pos.y;
    if (x + r.width > window.innerWidth) x = window.innerWidth - r.width - 8;
    if (y + r.height > window.innerHeight) y = window.innerHeight - r.height - 8;
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos]);

  const handleSelect = (item: ContextMenuItem) => {
    if (item.disabled || item.separator) return;
    item.onSelect?.();
    close();
  };

  return (
    <span className={cx('context-menu', className)} onContextMenu={onContextMenu}>
      {children}
      {pos && (
        <ul
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          className={cx('context-menu__menu', menuClassName)}
          style={{ position: 'fixed', top: pos.y, left: pos.x, zIndex: 'var(--z-popover, 1300)' as any }}
        >
          {items.map((item) =>
            item.separator ? (
              <li key={item.id} className="context-menu__separator" role="separator" />
            ) : (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={cx('context-menu__item', item.disabled && 'is-disabled', item.danger && 'context-menu__item--danger')}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                >
                  {item.icon && <span className="context-menu__icon">{item.icon}</span>}
                  <span className="context-menu__label">{item.label}</span>
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </span>
  );
}
