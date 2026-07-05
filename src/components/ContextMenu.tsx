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
  // `active` indexes into `enabledIdx` (the non-separator, non-disabled items) —
  // same roving-tabindex model as Menubar.
  const [active, setActive] = React.useState(0);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const anchorRef = React.useRef<VirtualElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const restoreRef = React.useRef<HTMLElement | null>(null);
  const open = point !== null;

  const enabledIdx = items
    .map((it, i) => (it.separator || it.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const close = () => setPoint(null);
  const closeAndRestore = () => {
    setPoint(null);
    restoreRef.current?.focus?.();
  };

  const openAt = (rect: DOMRect) => {
    // Remember focus so Escape/select can restore it (the keyboard trigger).
    restoreRef.current = document.activeElement as HTMLElement | null;
    // Virtual anchor: usePopoverPosition handles viewport flip/clamp + body portal.
    anchorRef.current = { getBoundingClientRect: () => rect };
    setActive(0);
    setPoint({ x: rect.left, y: rect.top });
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openAt(new DOMRect(e.clientX, e.clientY, 0, 0));
  };

  // Keyboard opener (Shift+F10 or the ContextMenu key), anchored to the element
  // that currently has focus inside the wrapper.
  const onWrapperKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
      e.preventDefault();
      openAt((e.target as HTMLElement).getBoundingClientRect());
    }
  };

  const pos = usePopoverPosition(anchorRef, menuRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 2,
  });

  useDismiss({ open, onDismiss: close, refs: [menuRef], closeOnEscape: false });

  // Move focus into the menu on open and follow `active` while open (the menu
  // keyboard contract requires focus to land on a menuitem).
  React.useEffect(() => {
    if (!open) return;
    const realIdx = enabledIdx[active];
    if (realIdx != null) itemRefs.current[realIdx]?.focus();
  }, [open, active, enabledIdx]);

  const handleSelect = (item: ContextMenuItem) => {
    if (item.disabled || item.separator) return;
    item.onSelect?.();
    closeAndRestore();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      closeAndRestore();
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
      const it = realIdx != null ? items[realIdx] : undefined;
      if (it) handleSelect(it);
    }
  };

  return (
    <span className={cx('context-menu', className)} onContextMenu={onContextMenu} onKeyDown={onWrapperKeyDown}>
      {children}
      {open && (
        <Portal>
          <ul
            ref={menuRef}
            role="menu"
            aria-label={ariaLabel}
            className={cx('context-menu__menu', 'is-floating', menuClassName)}
            onKeyDown={onMenuKeyDown}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
          >
            {items.map((item, i) =>
              item.separator ? (
                <li key={item.id} className="context-menu__separator" role="separator" />
              ) : (
                <li key={item.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    ref={(el) => { itemRefs.current[i] = el; }}
                    tabIndex={enabledIdx[active] === i ? 0 : -1}
                    className={cx('context-menu__item', item.disabled && 'is-disabled', item.danger && 'context-menu__item--danger', enabledIdx[active] === i && 'is-active')}
                    disabled={item.disabled}
                    onMouseEnter={() => setActive(Math.max(0, enabledIdx.indexOf(i)))}
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
