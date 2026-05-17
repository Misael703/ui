'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

export interface MenubarItem {
  id: string;
  label?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
}

export interface MenubarMenu {
  id: string;
  label: React.ReactNode;
  items: MenubarItem[];
}

export interface MenubarProps {
  menus: MenubarMenu[];
  className?: string;
  ariaLabel?: string;
}

export function Menubar({ menus, className, ariaLabel = 'Barra de menús' }: MenubarProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [active, setActive] = React.useState(0);
  // Roving tab stop for the menubar row (one tab stop, arrows move between
  // triggers — WAI-ARIA menubar pattern).
  const [tabId, setTabId] = React.useState<string | null>(menus[0]?.id ?? null);
  // Keyboard opens move focus into the menu; pointer opens don't.
  const focusOnOpen = React.useRef(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLUListElement>(null);
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const open = openId !== null;
  const openMenu = menus.find((m) => m.id === openId) ?? null;
  const menuIndex = menus.findIndex((m) => m.id === openId);

  // Positions within the open menu that are selectable (no
  // separators/disabled). `active` indexes into this list.
  const enabledIdx = (openMenu?.items ?? [])
    .map((it, i) => (it.separator || it.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const pos = usePopoverPosition(anchorRef, panelRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 6,
  });

  useDismiss({
    open,
    onDismiss: () => setOpenId(null),
    refs: [rootRef, panelRef],
    closeOnEscape: false,
  });

  const focusTrigger = (id: string | null) => {
    if (id) triggerRefs.current[id]?.focus();
  };

  const openMenuById = (id: string, viaKeyboard: boolean) => {
    const el = triggerRefs.current[id];
    if (el) anchorRef.current = el;
    focusOnOpen.current = viaKeyboard;
    setActive(0);
    setTabId(id);
    setOpenId(id);
  };

  const closeAndFocusTrigger = () => {
    const id = openId;
    setOpenId(null);
    focusTrigger(id);
  };

  React.useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      const realIdx = enabledIdx[0];
      if (realIdx != null) itemRefs.current[realIdx]?.focus();
    }
  }, [open, enabledIdx]);

  React.useEffect(() => {
    if (!open || focusOnOpen.current) return;
    const realIdx = enabledIdx[active];
    if (realIdx != null) itemRefs.current[realIdx]?.focus();
  }, [open, active, enabledIdx]);

  const selectItem = (item: MenubarItem) => {
    if (item.disabled || item.separator) return;
    item.onSelect?.();
    closeAndFocusTrigger();
  };

  const stepMenu = (dir: 1 | -1) => {
    if (menus.length === 0) return;
    const from = menuIndex >= 0 ? menuIndex : 0;
    const next = (from + dir + menus.length) % menus.length;
    openMenuById(menus[next].id, true);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent, menu: MenubarMenu, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenuById(menu.id, true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = menus[(index + 1) % menus.length];
      setTabId(next.id);
      if (open) openMenuById(next.id, true);
      else focusTrigger(next.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = menus[(index - 1 + menus.length) % menus.length];
      setTabId(prev.id);
      if (open) openMenuById(prev.id, true);
      else focusTrigger(prev.id);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpenId(null);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setTabId(menus[0].id);
      focusTrigger(menus[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = menus[menus.length - 1];
      setTabId(last.id);
      focusTrigger(last.id);
    }
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAndFocusTrigger();
    } else if (e.key === 'Tab') {
      setOpenId(null);
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
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepMenu(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepMenu(-1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const realIdx = enabledIdx[active];
      const it = realIdx != null ? openMenu?.items[realIdx] : undefined;
      if (it) selectItem(it);
    }
  };

  return (
    <div ref={rootRef} role="menubar" aria-label={ariaLabel} className={cx('menubar', className)}>
      {menus.map((menu, index) => {
        const isOpen = openId === menu.id;
        return (
          <div key={menu.id} className="menubar__menu">
            <button
              type="button"
              role="menuitem"
              ref={(el) => { triggerRefs.current[menu.id] = el; }}
              tabIndex={(tabId ?? menus[0]?.id) === menu.id ? 0 : -1}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              className={cx('menubar__trigger', isOpen && 'is-open')}
              onClick={(e) => {
                if (isOpen) { setOpenId(null); return; }
                anchorRef.current = e.currentTarget;
                focusOnOpen.current = false;
                setActive(0);
                setTabId(menu.id);
                setOpenId(menu.id);
              }}
              onMouseEnter={(e) => {
                if (!openId) return;
                anchorRef.current = e.currentTarget;
                focusOnOpen.current = false;
                setActive(0);
                setTabId(menu.id);
                setOpenId(menu.id);
              }}
              onFocus={() => setTabId(menu.id)}
              onKeyDown={(e) => onTriggerKeyDown(e, menu, index)}
            >
              {menu.label}
            </button>
            {isOpen && (
              <Portal>
                <ul
                  ref={panelRef}
                  role="menu"
                  aria-label={typeof menu.label === 'string' ? menu.label : undefined}
                  className="menubar__list"
                  onKeyDown={onPanelKeyDown}
                  style={{
                    position: 'fixed',
                    top: pos.top,
                    left: pos.left,
                    visibility: pos.ready ? 'visible' : 'hidden',
                  }}
                >
                  {menu.items.map((item, i) =>
                    item.separator ? (
                      <li key={item.id} className="menubar__separator" role="separator" />
                    ) : (
                      <li key={item.id} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          ref={(el) => { itemRefs.current[i] = el; }}
                          tabIndex={enabledIdx[active] === i ? 0 : -1}
                          disabled={item.disabled}
                          className={cx('menubar__item', item.disabled && 'is-disabled', enabledIdx[active] === i && 'is-active')}
                          onMouseEnter={() => setActive(enabledIdx.indexOf(i))}
                          onClick={() => selectItem(item)}
                        >
                          <span className="menubar__label">{item.label}</span>
                          {item.shortcut && <kbd className="menubar__shortcut">{item.shortcut}</kbd>}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </Portal>
            )}
          </div>
        );
      })}
    </div>
  );
}
