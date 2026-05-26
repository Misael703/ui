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

/**
 * Collapse API handed to header-slot render-props so a consumer-placed control
 * (e.g. a hamburger in `left`) can drive the sidebar — crucially in
 * **uncontrolled** mode, where the `top` layout otherwise has no toggle
 * affordance. This is what lets `persistKey` (uncontrolled) coexist with a
 * custom header trigger: the kit owns the state + persistence, the consumer
 * owns the trigger's look and placement.
 */
export interface AppShellHeaderApi {
  /** Current collapsed state. */
  collapsed: boolean;
  /** Flip the collapsed state (persisted if `persistKey` is set). */
  toggle: () => void;
  /** Set the collapsed state explicitly. */
  setCollapsed: (collapsed: boolean) => void;
}

/**
 * A header slot: a static node, or a render-prop receiving {@link AppShellHeaderApi}.
 * The function form is the only way to toggle an uncontrolled shell from the
 * header (no built-in toggle exists in `top`).
 */
export type AppShellHeaderSlot =
  | React.ReactNode
  | ((api: AppShellHeaderApi) => React.ReactNode);

export interface AppShellHeader {
  /** Left slot — typically a menu/hamburger trigger or back action. */
  left?: AppShellHeaderSlot;
  /** Center slot — typically the brand (Logo). Lands at the true viewport centre. */
  center?: AppShellHeaderSlot;
  /** Right slot — notifications, user avatar, utilities. */
  right?: AppShellHeaderSlot;
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
  /**
   * Persist the collapsed state in `localStorage[persistKey]` so it survives
   * reloads. Opt-in: omit it and the shell keeps the default behaviour (resets
   * to `defaultCollapsed` on each mount). SSR-safe — the initial render still
   * uses `defaultCollapsed` (no hydration mismatch); the stored value is read
   * after mount, so a differing value may flash for one frame. Ignored in
   * controlled mode (when `collapsed` is provided): the host owns persistence.
   */
  persistKey?: string;
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
  /**
   * Theme of the **header band only**, independent of the sidebar (`theme`).
   * Defaults to `theme`, so `theme="brand"` still tints both bands (no
   * change for existing consumers). Set `theme="default" headerTheme="brand"`
   * for a branded top bar over a neutral, legible sidebar — common in
   * data-heavy admin apps.
   */
  headerTheme?: AppShellTheme;
  /**
   * Collapse to an icon rail (72px) instead of hiding the sidebar entirely.
   * Default `false` → `collapsed` hides the sidebar (the original `top`
   * behavior). `true` → `collapsed` keeps a 72px rail showing the nav icons
   * (labels hidden, active-item bar kept) — like the `side` layout — and
   * renders a built-in expand/collapse toggle at the bottom of the rail.
   */
  collapsedRail?: boolean;
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
    collapsed: ctrlCollapsed, onCollapsedChange, persistKey,
    children, className, theme = 'default', linkAs,
  } = props;
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const t = useLocale();
  const collapsed = ctrlCollapsed ?? internalCollapsed;

  // SSR-safe persistence: the initial render uses `defaultCollapsed` (server
  // and first client render agree → no hydration mismatch), then we sync from
  // localStorage after mount. Only in uncontrolled mode; reads can throw
  // (Safari private mode), so they're guarded. Runs once per persistKey.
  React.useEffect(() => {
    if (persistKey == null || ctrlCollapsed !== undefined) return;
    try {
      const stored = window.localStorage.getItem(persistKey);
      if (stored === '0' || stored === '1') setInternalCollapsed(stored === '1');
    } catch {
      /* localStorage unavailable — keep defaultCollapsed */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once at mount; ctrlCollapsed read intentionally not tracked
  }, [persistKey]);

  const setCollapsed = (v: boolean) => {
    if (ctrlCollapsed === undefined) setInternalCollapsed(v);
    if (persistKey != null && ctrlCollapsed === undefined) {
      try {
        window.localStorage.setItem(persistKey, v ? '1' : '0');
      } catch {
        /* localStorage unavailable — persistence is best-effort */
      }
    }
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
    // Header band themes independently of the sidebar; defaults to `theme`
    // so `theme="brand"` keeps tinting both bands (back-compat).
    const headerTheme = props.headerTheme ?? theme;
    const collapsedRail = props.collapsedRail ?? false;
    // Hand the collapse API to header slots so a consumer trigger (hamburger)
    // can toggle the shell — the only path in uncontrolled `top` (no built-in
    // toggle here). A function slot is called with the API; a node renders as-is.
    const headerApi: AppShellHeaderApi = { collapsed, toggle: () => setCollapsed(!collapsed), setCollapsed };
    const slot = (s: AppShellHeaderSlot): React.ReactNode =>
      typeof s === 'function' ? (s as (api: AppShellHeaderApi) => React.ReactNode)(headerApi) : s;
    return (
      <div className={cx('appshell', `appshell--${theme}`, 'appshell--header-top', `appshell--header-${headerTheme}`, collapsedRail && 'appshell--rail', collapsed && 'is-collapsed', className)}>
        {/* On a brand header the band is dark, so re-scope foreground tokens
            via data-tone="inverse" — anything inside (Avatar, badges, links)
            becomes band-aware automatically without per-call-site colors. */}
        <header className="appshell__header" role="banner" data-tone={headerTheme === 'brand' ? 'inverse' : undefined}>
          <div className="appshell__header-left">{slot(header?.left)}</div>
          <div className="appshell__header-center">{slot(header?.center)}</div>
          <div className="appshell__header-right">{slot(header?.right)}</div>
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
            {footer != null && (
              <div className="appshell__sidebar-foot">{footer}</div>
            )}
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
