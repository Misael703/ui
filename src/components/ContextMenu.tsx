'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Portal } from './Portal';
import { usePopoverPosition, type VirtualElement } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

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
  const [point, setPoint] = React.useState<{ x: number; y: number } | null>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const anchorRef = React.useRef<VirtualElement | null>(null);
  const open = point !== null;

  const close = () => setPoint(null);

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    // Virtual anchor: a zero-size rect under the cursor. usePopoverPosition
    // then handles viewport flip/clamp + body portal (escapes overflow).
    anchorRef.current = { getBoundingClientRect: () => new DOMRect(x, y, 0, 0) };
    setPoint({ x, y });
  };

  const pos = usePopoverPosition(anchorRef, menuRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 2,
  });

  useDismiss({ open, onDismiss: close, refs: [menuRef] });

  const handleSelect = (item: ContextMenuItem) => {
    if (item.disabled || item.separator) return;
    item.onSelect?.();
    close();
  };

  return (
    <span className={cx('context-menu', className)} onContextMenu={onContextMenu}>
      {children}
      {open && (
        <Portal>
          <ul
            ref={menuRef}
            role="menu"
            aria-label={ariaLabel}
            className={cx('context-menu__menu', 'is-floating', menuClassName)}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
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
        </Portal>
      )}
    </span>
  );
}
