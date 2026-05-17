'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronDown } from './Icons';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

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
  // When the panel was opened by keyboard we move focus into it; pointer
  // (click/hover) opens leave focus with the user's cursor.
  const focusOnOpen = React.useRef(false);
  const rootRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  // The currently-open trigger; usePopoverPosition anchors to this and
  // focus returns here on close. One panel is open at a time, so a single
  // anchor ref is correct (see todo.md risk note).
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const open = openId !== null;

  const pos = usePopoverPosition(anchorRef, panelRef, {
    open,
    side: 'bottom',
    align: 'start',
    offset: 8,
  });

  // Outside-click closes; Escape is handled on the panel so it can also
  // return focus to the trigger (WAI-ARIA disclosure/menu pattern).
  useDismiss({
    open,
    onDismiss: () => setOpenId(null),
    refs: [rootRef, panelRef],
    closeOnEscape: false,
  });

  const closeAndFocusTrigger = () => {
    const id = openId;
    setOpenId(null);
    if (id) triggerRefs.current[id]?.focus();
  };

  // `.nav-menu__link` is applied to every link node (default <a> and the
  // `linkAs` render-prop alike), so querying by class manages focus
  // uniformly regardless of how the consumer renders links.
  const panelLinks = (): HTMLElement[] =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>('.nav-menu__link') ?? []);

  const focusLinkAt = (index: number) => {
    const links = panelLinks();
    if (links.length === 0) return;
    const wrapped = ((index % links.length) + links.length) % links.length;
    links[wrapped]?.focus();
  };

  React.useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      focusLinkAt(0);
    }
  }, [open]);

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const links = panelLinks();
    const current = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAndFocusTrigger();
    } else if (e.key === 'Tab') {
      setOpenId(null);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusLinkAt(current + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusLinkAt(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusLinkAt(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusLinkAt(links.length - 1);
    }
  };

  return (
    <nav ref={rootRef} aria-label={ariaLabel} className={cx('nav-menu', className)}>
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
                  ref={(el) => { triggerRefs.current[item.id] = el; }}
                  className={triggerCls}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  onClick={(e) => {
                    if (isOpen) { setOpenId(null); return; }
                    anchorRef.current = e.currentTarget;
                    focusOnOpen.current = false;
                    setOpenId(item.id);
                  }}
                  onMouseEnter={(e) => {
                    if (!openId) return;
                    anchorRef.current = e.currentTarget;
                    focusOnOpen.current = false;
                    setOpenId(item.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isOpen) { focusLinkAt(0); return; }
                      anchorRef.current = e.currentTarget;
                      focusOnOpen.current = true;
                      setOpenId(item.id);
                    } else if (e.key === 'Escape' && isOpen) {
                      e.preventDefault();
                      setOpenId(null);
                    }
                  }}
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
                <Portal>
                  <div
                    ref={panelRef}
                    className="nav-menu__panel"
                    role="menu"
                    aria-label={typeof item.label === 'string' ? item.label : undefined}
                    onKeyDown={onPanelKeyDown}
                    style={{
                      position: 'absolute',
                      top: pos.top,
                      left: pos.left,
                      visibility: pos.ready ? 'visible' : 'hidden',
                    }}
                  >
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
                                tabIndex={-1}
                                className={linkCls}
                                href={link.href}
                                onClick={(e) => {
                                  if (link.onClick) {
                                    e.preventDefault();
                                    link.onClick();
                                  }
                                  closeAndFocusTrigger();
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
                </Portal>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
