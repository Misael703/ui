'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { ChevronLeft, ChevronRight, MenuIcon } from './Icons';
import { useLocale } from '../locale/LocaleProvider';

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

export type AppShellTheme = 'default' | 'brand';

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
  /**
   * Sidebar color theme:
   * - `default` (light): claro, mejor para apps data-heavy de uso prolongado.
   * - `brand`: sidebar azul de marca con texto blanco. Mayor brand recall.
   */
  theme?: AppShellTheme;
  /** Render-prop for navigation links so the host app can use Next.js Link, etc. */
  linkAs?: (item: NavItem, content: React.ReactNode, className: string) => React.ReactNode;
}

// Recursive nav item, memoized so a single item's parent re-render doesn't
// churn through every other item in the tree. Stability of `linkAs` and
// `onCloseMobile` is the parent's responsibility (we stabilize
// `onCloseMobile` via useCallback below; consumers should memoize `linkAs`
// if they care about avoiding renders, but for typical Next.js Link usage
// the inline arrow is rarely a hot path).
interface NavItemNodeProps {
  item: NavItem;
  depth: number;
  linkAs?: AppShellProps['linkAs'];
  onCloseMobile: () => void;
}

const NavItemNode = React.memo(function NavItemNode({
  item, depth, linkAs, onCloseMobile,
}: NavItemNodeProps) {
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
          onCloseMobile();
        }}
      >
        {inner}
      </a>
    );
  return (
    <li>
      {node}
      {item.children && item.children.length > 0 && (
        <ul className="appshell__navchildren">
          {item.children.map((c) => (
            <NavItemNode key={c.id} item={c} depth={depth + 1} linkAs={linkAs} onCloseMobile={onCloseMobile} />
          ))}
        </ul>
      )}
    </li>
  );
});

export function AppShell({
  brand, brandCollapsed, sections, topbar, footer, user,
  defaultCollapsed = false, collapsed: ctrlCollapsed, onCollapsedChange,
  children, className, theme = 'default', linkAs,
}: AppShellProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const t = useLocale();
  const collapsed = ctrlCollapsed ?? internalCollapsed;
  const setCollapsed = (v: boolean) => {
    if (ctrlCollapsed === undefined) setInternalCollapsed(v);
    onCollapsedChange?.(v);
  };
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  return (
    <div className={cx('appshell', `appshell--${theme}`, collapsed && 'is-collapsed', mobileOpen && 'is-mobile-open', className)}>
      <aside className="appshell__sidebar" aria-label={t['appshell.mainNav']}>
        <div className="appshell__brand">
          {collapsed ? (brandCollapsed ?? brand) : brand}
        </div>
        <nav className="appshell__nav">
          {sections.map((s, i) => (
            <div key={s.id ?? i} className="appshell__navsection">
              {s.label && <div className="appshell__navlabel-section">{s.label}</div>}
              <ul>{s.items.map((it) => (
                <NavItemNode key={it.id} item={it} depth={0} linkAs={linkAs} onCloseMobile={closeMobile} />
              ))}</ul>
            </div>
          ))}
        </nav>
        <div className="appshell__sidebar-foot">
          {footer}
          <button
            type="button"
            className="appshell__collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? t['appshell.expandMenu'] : t['appshell.collapseMenu']}
            title={collapsed ? t['appshell.expand'] : t['appshell.collapse']}
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
            aria-label={t['appshell.openMenu']}
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
  const t = useLocale();
  return (
    <div className={cx('page-header', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="page-header__crumbs" aria-label={t['appshell.breadcrumb']}>
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
