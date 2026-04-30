'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronDown } from './Icons';

export interface NavLink {
  id: string;
  label: React.ReactNode;
  href?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface NavMenuItem {
  id: string;
  label: React.ReactNode;
  href?: string;
  links?: NavLink[];
  featured?: NavLink;
}

export interface NavigationMenuProps {
  items: NavMenuItem[];
  className?: string;
  ariaLabel?: string;
  linkAs?: (link: NavLink, content: React.ReactNode, className: string) => React.ReactNode;
  rootLinkAs?: (item: NavMenuItem, content: React.ReactNode, className: string) => React.ReactNode;
}

export function NavigationMenu({ items, className, ariaLabel = 'Navegación principal', linkAs, rootLinkAs }: NavigationMenuProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLElement>(null);

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

  return (
    <nav ref={rootRef as any} aria-label={ariaLabel} className={cx('nav-menu', className)}>
      <ul className="nav-menu__list">
        {items.map((item) => {
          const hasChildren = !!item.links?.length;
          const isOpen = openId === item.id;
          const triggerCls = cx('nav-menu__trigger', isOpen && 'is-open');
          const content = (
            <>
              <span>{item.label}</span>
              {hasChildren && <ChevronDown size={14} className="nav-menu__chevron" />}
            </>
          );

          return (
            <li key={item.id} className="nav-menu__item">
              {hasChildren ? (
                <button
                  type="button"
                  className={triggerCls}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  onMouseEnter={() => openId && setOpenId(item.id)}
                >
                  {content}
                </button>
              ) : rootLinkAs && item.href ? (
                rootLinkAs(item, content, triggerCls)
              ) : (
                <a className={triggerCls} href={item.href}>
                  {content}
                </a>
              )}
              {hasChildren && isOpen && (
                <div className="nav-menu__panel" role="menu">
                  {item.featured && (
                    <div className="nav-menu__featured">
                      <strong>{item.featured.label}</strong>
                      {item.featured.description && <p>{item.featured.description}</p>}
                    </div>
                  )}
                  <ul className="nav-menu__sublist">
                    {item.links!.map((link) => {
                      const linkCls = 'nav-menu__link';
                      const linkContent = (
                        <>
                          {link.icon && <span className="nav-menu__link-icon">{link.icon}</span>}
                          <span className="nav-menu__link-body">
                            <span className="nav-menu__link-label">{link.label}</span>
                            {link.description && <span className="nav-menu__link-desc">{link.description}</span>}
                          </span>
                        </>
                      );
                      return (
                        <li key={link.id} role="none">
                          {linkAs ? (
                            linkAs(link, linkContent, linkCls)
                          ) : (
                            <a
                              role="menuitem"
                              className={linkCls}
                              href={link.href}
                              onClick={(e) => {
                                if (link.onClick) {
                                  e.preventDefault();
                                  link.onClick();
                                  setOpenId(null);
                                }
                              }}
                            >
                              {linkContent}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
