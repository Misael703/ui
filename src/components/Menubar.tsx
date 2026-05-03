'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils/cx';

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
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openId]);

  const positionPanel = (trigger: HTMLElement) => {
    const t = trigger.getBoundingClientRect();
    setCoords({ top: t.bottom + window.scrollY, left: t.left + window.scrollX });
  };

  const handleSelect = (item: MenubarItem) => {
    if (item.disabled || item.separator) return;
    item.onSelect?.();
    setOpenId(null);
  };

  return (
    <div ref={rootRef} role="menubar" aria-label={ariaLabel} className={cx('menubar', className)}>
      {menus.map((menu) => {
        const isOpen = openId === menu.id;
        return (
          <div key={menu.id} className="menubar__menu">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              className={cx('menubar__trigger', isOpen && 'is-open')}
              onClick={(e) => {
                if (isOpen) { setOpenId(null); return; }
                positionPanel(e.currentTarget);
                setOpenId(menu.id);
              }}
              onMouseEnter={(e) => {
                if (!openId) return;
                positionPanel(e.currentTarget);
                setOpenId(menu.id);
              }}
            >
              {menu.label}
            </button>
            {isOpen && typeof document !== 'undefined' && createPortal(
              <ul
                ref={panelRef}
                role="menu"
                className="menubar__list"
                style={coords ? { position: 'absolute', top: coords.top, left: coords.left } : { position: 'absolute', visibility: 'hidden' }}
              >
                {menu.items.map((item) =>
                  item.separator ? (
                    <li key={item.id} className="menubar__separator" role="separator" />
                  ) : (
                    <li key={item.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        className={cx('menubar__item', item.disabled && 'is-disabled')}
                        onClick={() => handleSelect(item)}
                      >
                        <span className="menubar__label">{item.label}</span>
                        {item.shortcut && <kbd className="menubar__shortcut">{item.shortcut}</kbd>}
                      </button>
                    </li>
                  )
                )}
              </ul>,
              document.body
            )}
          </div>
        );
      })}
    </div>
  );
}
