'use client';
import * as React from 'react';
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
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenId(null);
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
              onClick={() => setOpenId(isOpen ? null : menu.id)}
              onMouseEnter={() => openId && setOpenId(menu.id)}
            >
              {menu.label}
            </button>
            {isOpen && (
              <ul role="menu" className="menubar__list">
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
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
