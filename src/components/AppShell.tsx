'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight, MenuIcon } from './Icons';

// ---------- AppShell (Sidebar + Topbar + Content) -----------------------
// Designed to drop into a Next.js app/layout.tsx as a Client Component shell.

export interface NavItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  active?: boolean;
  badge?: React.ReactNode;
  onSelect?: () => void;
  children?: NavItem[];
}

export interface NavSection {
  id?: string;
  label?: React.ReactNode;
  items: NavItem[];
}

export interface AppShellProps {
  brand?: React.ReactNode;
  brandCollapsed?: React.ReactNode;
  sections: NavSection[];
  topbar?: React.ReactNode;
  footer?: React.ReactNode;
  user?: React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (c: boolean) => void;
  children: React.ReactNode;
  className?: string;
  /** Render-prop for navigation links so the host app can use Next.js Link, etc. */
  linkAs?: (item: NavItem, content: React.ReactNode, className: string) => React.ReactNode;
}

export function AppShell({
  brand, brandCollapsed, sections, topbar, footer, user,
  defaultCollapsed = false, collapsed: ctrlCollapsed, onCollapsedChange,
  children, className, linkAs,
}: AppShellProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const collapsed = ctrlCollapsed ?? internalCollapsed;
  const setCollapsed = (v: boolean) => {
    if (ctrlCollapsed === undefined) setInternalCollapsed(v);
    onCollapsedChange?.(v);
  };

  const renderItem = (item: NavItem, depth = 0) => {
    const klass = cx('appshell__navitem', item.active && 'is-active', `appshell__navitem--depth-${depth}`);
    const inner = (
      <>
        {item.icon && <span className="appshell__navicon" aria-hidden="true">{item.icon}</span>}
        <span className="appshell__navlabel">{item.label}</span>
        {item.badge && <span className="appshell__navbadge">{item.badge}</span>}
      </>
    );
    const node = item.href && linkAs
      ? linkAs(item, inner, klass)
      : (
        <a
          href={item.href ?? '#'}
          className={klass}
          aria-current={item.active ? 'page' : undefined}
          onClick={(e) => {
            if (!item.href) e.preventDefault();
            item.onSelect?.();
            setMobileOpen(false);
          }}
        >
          {inner}
        </a>
      );
    return (
      <li key={item.id}>
        {node}
        {item.children && item.children.length > 0 && (
          <ul className="appshell__navchildren">
            {item.children.map((c) => renderItem(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className={cx('appshell', collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open', className)}>
      <aside className="appshell__sidebar" aria-label="Navegación principal">
        <div className="appshell__brand">
          {collapsed ? (brandCollapsed ?? brand) : brand}
        </div>
        <nav className="appshell__nav">
          {sections.map((s, i) => (
            <div key={s.id ?? i} className="appshell__navsection">
              {s.label && <div className="appshell__navlabel-section">{s.label}</div>}
              <ul>{s.items.map((it) => renderItem(it))}</ul>
            </div>
          ))}
        </nav>
        <div className="appshell__sidebar-foot">
          {footer}
          <button
            type="button"
            className="appshell__collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      <div className="appshell__main">
        <header className="appshell__topbar">
          <button
            type="button"
            className="appshell__hamburger"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          ><MenuIcon size={20} /></button>
          <div className="appshell__topbar-content">{topbar}</div>
          {user && <div className="appshell__topbar-user">{user}</div>}
        </header>
        <main className="appshell__content" role="main">{children}</main>
      </div>

      {mobileOpen && (
        <div className="appshell__scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
}

// ---------- PageHeader --------------------------------------------------
export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Array<{ label: React.ReactNode; href?: string }>;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, meta, className }: PageHeaderProps) {
  return (
    <div className={cx('page-header', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="page-header__crumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((c, i) => (
              <li key={i}>
                {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
                {i < breadcrumbs.length - 1 && <span className="page-header__crumb-sep" aria-hidden="true">/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="page-header__row">
        <div className="page-header__title-wrap">
          <h1 className="page-header__title">{title}</h1>
          {description && <p className="page-header__desc">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      {meta && <div className="page-header__meta">{meta}</div>}
    </div>
  );
}
