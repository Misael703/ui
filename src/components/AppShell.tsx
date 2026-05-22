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

export type AppShellHeaderLayout = 'side' | 'top';

export interface AppShellHeader {
  /** Left slot — typically a menu/hamburger trigger or back action. */
  left?: React.ReactNode;
  /** Center slot — typically the brand (Logo). Lands at the true viewport centre. */
  center?: React.ReactNode;
  /** Right slot — notifications, user avatar, utilities. */
  right?: React.ReactNode;
}

/**
 * Props shared by both layouts. The layout-specific props live in
 * `AppShellSideProps` / `AppShellTopProps`; `AppShellProps` is the
 * discriminated union of the two, keyed on `headerLayout`.
 */
export interface AppShellBaseProps {
  sections: NavSection[];
  footer?: React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (c: boolean) => void;
  children: React.ReactNode;
  className?: string;
  /**
   * Color theme (applies to both layouts):
   * - `default` (light): claro, mejor para apps data-heavy de uso prolongado.
   * - `brand`: superficie azul de marca con texto blanco. Mayor brand recall.
   *   En `side` tiñe el sidebar; en `top` tiñe header + sidebar (un solo knob).
   */
  theme?: AppShellTheme;
  /** Render-prop for navigation links so the host app can use Next.js Link, etc. */
  linkAs?: (item: NavItem, content: React.ReactNode, className: string) => React.ReactNode;
}

/**
 * Sidebar layout (default, `headerLayout="side"` or omitted). The brand
 * block + collapse rail live in the sidebar; the topbar sits over the
 * content with a mobile hamburger. `header` is **not** valid here — that
 * slot belongs to the `top` layout.
 */
export interface AppShellSideProps extends AppShellBaseProps {
  headerLayout?: 'side';
  /** Brand node in the sidebar header (expanded state). */
  brand?: React.ReactNode;
  /** Brand node shown when the rail is collapsed. Falls back to `brand`. */
  brandCollapsed?: React.ReactNode;
  /** Content of the topbar over the page (search, etc.). */
  topbar?: React.ReactNode;
  /** User slot at the right of the topbar (avatar/menu). */
  user?: React.ReactNode;
  /** Not valid in the `side` layout — the header slots belong to `top`. */
  header?: never;
}

/**
 * Top-header layout (`headerLayout="top"`, v1.15.0). Full-width header
 * above the body with three slots (`header.{left,center,right}`); the
 * centre slot lands at the **true viewport centre** (1fr·auto·1fr grid).
 * The sidebar has no brand block and `collapsed` hides it entirely (no
 * 72px rail); the header is **invariant** to the collapse. `theme="brand"`
 * tints both bands. The `side`-only props are **not** valid here — put your
 * chrome in `header`.
 */
export interface AppShellTopProps extends AppShellBaseProps {
  headerLayout: 'top';
  /** Slots for the full-width header. Brand usually goes in `center`. */
  header?: AppShellHeader;
  /** Not valid in `top` — use `header.center` for the brand. */
  brand?: never;
  /** Not valid in `top` — the sidebar collapses entirely. */
  brandCollapsed?: never;
  /** Not valid in `top` — use the `header` slots. */
  topbar?: never;
  /** Not valid in `top` — use `header.right`. */
  user?: never;
}

/**
 * Discriminated union keyed on `headerLayout`. TypeScript enforces that
 * `header` is only accepted with `headerLayout="top"` and that
 * `brand`/`brandCollapsed`/`topbar`/`user` are only accepted with the
 * (default) `side` layout — passing the wrong prop for the layout is a
 * compile error instead of being silently ignored at runtime.
 */
export type AppShellProps = AppShellSideProps | AppShellTopProps;

// Recursive nav item, memoized so a single item's parent re-render doesn't
// churn through every other item in the tree. Stability of `linkAs` and
// `onCloseMobile` is the parent's responsibility (we stabilize
// `onCloseMobile` via useCallback below; consumers should memoize `linkAs`
// if they care about avoiding renders, but for typical Next.js Link usage
// the inline arrow is rarely a hot path).
interface NavItemNodeProps {
  item: NavItem;
  depth: number;
  linkAs?: AppShellBaseProps['linkAs'];
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

export function AppShell(props: AppShellProps) {
  const {
    sections, footer, defaultCollapsed = false,
    collapsed: ctrlCollapsed, onCollapsedChange,
    children, className, theme = 'default', linkAs,
  } = props;
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const t = useLocale();
  const collapsed = ctrlCollapsed ?? internalCollapsed;
  const setCollapsed = (v: boolean) => {
    if (ctrlCollapsed === undefined) setInternalCollapsed(v);
    onCollapsedChange?.(v);
  };
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  // Top-header variant: full-width header above the body. Topbar is
  // invariant to `collapsed` (only the inner body's columns animate); brand
  // lives in `header.center` at the true viewport centre. Default
  // `headerLayout="side"` falls through to the legacy JSX below
  // (byte-identical for existing consumers). The `props.headerLayout`
  // check narrows the discriminated union, so `header` (top) and
  // `brand`/`topbar`/`user` (side) are each only in scope in their branch.
  if (props.headerLayout === 'top') {
    const { header } = props;
    return (
      <div className={cx('appshell', `appshell--${theme}`, 'appshell--header-top', collapsed && 'is-collapsed', className)}>
        <header className="appshell__header" role="banner">
          <div className="appshell__header-left">{header?.left}</div>
          <div className="appshell__header-center">{header?.center}</div>
          <div className="appshell__header-right">{header?.right}</div>
        </header>
        <div className="appshell__body">
          <aside className="appshell__sidebar" aria-label={t['appshell.mainNav']}>
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
            {footer != null && <div className="appshell__sidebar-foot">{footer}</div>}
          </aside>
          <main className="appshell__content" role="main">{children}</main>
        </div>
      </div>
    );
  }

  const { brand, brandCollapsed, topbar, user } = props;
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
            aria-expanded={!collapsed}
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
