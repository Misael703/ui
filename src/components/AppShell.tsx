'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { useLocale } from '../locale/LocaleProvider';
import { useFocusTrap, useEscape, useScrollLock } from '../hooks';
import { MenuIcon } from './Icons';

// ---------- AppShell (full-width header + sidebar + content) ------------
// Designed to drop into a Next.js app/layout.tsx as a Client Component shell.
//
// v1.31 BREAKING: the kit no longer exposes a `side` layout. Only the
// `top` shape exists: a full-width header above the body, three header
// slots (left/center/right), a sidebar below for navigation, and a content
// area that owns its own scroll. The `headerLayout` prop is removed.

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

/**
 * Collapse API handed to header-slot render-props so a consumer-placed control
 * (e.g. a hamburger in `header.left`) can drive the sidebar — crucially in
 * **uncontrolled** mode, where there is no built-in toggle affordance. This
 * is what lets `persistKey` (uncontrolled) coexist with a custom header
 * trigger: the kit owns the state + persistence, the consumer owns the
 * trigger's look and placement.
 *
 * `toggle()` is DWIM by viewport: on desktop it flips `collapsed` (the
 * rail/hide state); below 900px it flips an overlay drawer instead — same
 * single click handler regardless of breakpoint.
 */
export interface AppShellHeaderApi {
  /** Current collapsed state. */
  collapsed: boolean;
  /** Flip the collapsed state on desktop, or the drawer in mobile. */
  toggle: () => void;
  /** Set the collapsed state explicitly. */
  setCollapsed: (collapsed: boolean) => void;
}

/**
 * A header slot: a static node, or a render-prop receiving {@link AppShellHeaderApi}.
 * The function form is the only way to toggle an uncontrolled shell from the
 * header (no built-in toggle exists).
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
 * AppShell props.
 *
 * @example
 * <AppShell
 *   sections={sections}
 *   header={{
 *     left: ({ toggle }) => <button onClick={toggle}>Menu</button>,
 *     center: <Logo />,
 *     right: <Avatar />,
 *   }}
 * >
 *   {children}
 * </AppShell>
 */
export interface AppShellProps {
  /**
   * Navigation sections that populate the sidebar. Omit (or pass an empty
   * array) to render a **top-bar-only** shell — no sidebar at all, body
   * collapses to a single column. Use when the app is flat-route (no panel
   * nav), e.g. a kiosk/checkout flow.
   */
  sections?: NavSection[];
  /** Slot at the bottom of the sidebar (version label, env tag, etc.). */
  footer?: React.ReactNode;
  /** Initial collapsed state (uncontrolled). */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state — pair with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Called when `collapsed` flips (controlled mode handshake). */
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
   * Sidebar color theme:
   * - `default` (light): claro, mejor para apps data-heavy de uso prolongado.
   * - `brand`: superficie azul de marca con texto blanco. Mayor brand recall.
   *
   * The header band's theme is `headerTheme`, defaulting to this value so
   * `theme="brand"` tints both bands by default.
   */
  theme?: AppShellTheme;
  /**
   * Header band theme, independent of the sidebar (`theme`). Defaults to
   * `theme`. Set `theme="default" headerTheme="brand"` for a branded top
   * bar over a neutral, legible sidebar — common in data-heavy admin apps.
   */
  headerTheme?: AppShellTheme;
  /**
   * Collapse to an icon rail (72px) instead of hiding the sidebar entirely.
   * Default `false` → `collapsed` hides the sidebar (slides off-screen).
   * `true` → `collapsed` keeps a 72px rail showing the nav icons (labels
   * hidden, active-item bar kept).
   */
  collapsedRail?: boolean;
  /**
   * Render the kit's standard menu toggle (hamburger) at the start of
   * `header.left`. Default trigger for the drawer (mobile) / collapsed
   * state (desktop), so consumers don't need the `header.left`
   * render-prop just to get a working toggle. The render-prop remains
   * available — when both are provided, the kit toggle renders first
   * and the consumer's slot content renders after it. Ignored when
   * `sections` is empty (top-bar-only shell).
   */
  showMenuToggle?: boolean;
  /** Slots for the full-width header. */
  header?: AppShellHeader;
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

/**
 * Mobile drawer breakpoint. Below this, `toggle()` flips an overlay drawer
 * (`is-mobile-open`) instead of the desktop collapse — see CSS
 * `@media (max-width: 900px)` for the visual shape. Kept in sync with that
 * media query; if you change one, change both.
 */
const MOBILE_BREAKPOINT = '(max-width: 900px)';

// Stable id for `aria-controls` on the built-in menu toggle. Static (not
// per-instance via useId) because a page only renders one AppShell; if a
// host ever ships two, the duplicate id is the lesser problem vs. losing
// SSR/CSR id stability for the toggle's aria-controls handshake.
const SIDEBAR_ID = 'appshell-sidebar';

export function AppShell({
  sections = [],
  footer,
  defaultCollapsed = false,
  collapsed: ctrlCollapsed,
  onCollapsedChange,
  persistKey,
  children,
  className,
  theme = 'default',
  headerTheme: ctrlHeaderTheme,
  collapsedRail = false,
  showMenuToggle = false,
  header,
  linkAs,
}: AppShellProps) {
  const t = useLocale();
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = ctrlCollapsed ?? internalCollapsed;
  // Header band themes independently of the sidebar; defaults to `theme`
  // so `theme="brand"` keeps tinting both bands.
  const headerTheme = ctrlHeaderTheme ?? theme;
  const hasSidebar = sections.length > 0;

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

  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Track whether matchMedia says we are below the mobile breakpoint. State
  // (not ref) so React re-renders when it flips — `aria-hidden` on the
  // closed mobile drawer is derived from this, and a ref-only value would
  // never land on the DOM (the ref update doesn't trigger a re-render).
  // Initial render uses `false` (SSR-safe; matchMedia is browser-only) and
  // the effect corrects it post-mount. The listener also clears
  // `mobileOpen` when the user resizes back into desktop, so a stale-open
  // drawer doesn't ghost.
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // First-paint transition guard. The collapse animations (sidebar slide,
  // body grid, nav-label fade) are always-on, so any time the shell paints
  // EXPANDED and then settles to COLLAPSED post-paint, the collapse animates
  // when it shouldn't. That happens whenever the collapsed state arrives after
  // the first paint: SSR hydration (server sends expanded HTML, then the
  // client collapses), `persistKey` (localStorage read in an effect), or a
  // controlled consumer whose initial state resolves async. We suppress the
  // shell's transitions until one frame after mount so that settle is instant;
  // user-initiated toggles (which can't happen within the first frame) still
  // animate. `false` on the server + first client render → no hydration
  // mismatch; the class ships in the SSR HTML and is removed post-mount.
  const [animReady, setAnimReady] = React.useState(false);
  React.useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimReady(true));
    });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, []);

  // Mirror `collapsed` to `mobileOpen` in mobile: any flip of `collapsed`
  // (e.g. a controlled consumer's static hamburger that calls setCollapsed
  // directly instead of going through `headerApi.toggle()`) opens/closes
  // the drawer. Without this sync, a controlled consumer's button reads as
  // dead in mobile — flipping `collapsed` is invisible because the aside
  // is a fixed overlay that ignores collapsed in mobile.
  //
  // Semantics: `collapsed=true` means "menu hidden" in BOTH viewports
  // (rail/hide on desktop, drawer-closed on mobile). The DWIM `toggle()`
  // for the render-prop API still does its mobileOpen flip directly, but
  // any out-of-band `collapsed` change also propagates here.
  //
  // Initial render must NOT auto-open the drawer just because
  // `collapsed=false` happens to be the default — track previous value
  // and only mirror when it actually changes.
  const prevCollapsed = React.useRef(collapsed);
  React.useEffect(() => {
    if (!isMobile) return;
    if (prevCollapsed.current === collapsed) return;
    prevCollapsed.current = collapsed;
    setMobileOpen(!collapsed);
  }, [isMobile, collapsed]);

  // ESC closes the drawer (only active while open — no leaked listener).
  const closeMobileDrawer = React.useCallback(() => setMobileOpen(false), []);
  useEscape(mobileOpen, closeMobileDrawer);
  // Focus trap inside the open drawer: focuses the first nav link on open,
  // cycles Tab/Shift+Tab within, restores focus to the trigger on close.
  // Same hook used by Modal/Drawer — single source of truth for the trap.
  const drawerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, mobileOpen);
  // Lock body scroll while the drawer is open so the content behind the
  // scrim doesn't drift on touch. Shares a global counter with Modal/Drawer
  // (kit-wide nesting safe).
  useScrollLock(mobileOpen);

  // The DWIM toggle: mobile flips the drawer, desktop flips `collapsed`.
  // Same API surface (`headerApi.toggle`) — the consumer's hamburger keeps
  // its single click handler regardless of viewport.
  const headerApi: AppShellHeaderApi = {
    collapsed,
    toggle: () => {
      if (isMobile) setMobileOpen((o) => !o);
      else setCollapsed(!collapsed);
    },
    setCollapsed,
  };
  const slot = (s: AppShellHeaderSlot): React.ReactNode =>
    typeof s === 'function' ? (s as (api: AppShellHeaderApi) => React.ReactNode)(headerApi) : s;

  return (
    <div className={cx(
      'appshell', `appshell--${theme}`, 'appshell--header-top', `appshell--header-${headerTheme}`,
      collapsedRail && 'appshell--rail',
      !hasSidebar && 'appshell--no-nav',
      collapsed && 'is-collapsed',
      mobileOpen && 'is-mobile-open',
      !animReady && 'appshell--no-anim',
      className,
    )}>
      {/* On a brand header the band is dark, so re-scope foreground tokens
          via data-tone="inverse" — anything inside (Avatar, badges, links)
          becomes band-aware automatically without per-call-site colors. */}
      <header className="appshell__header" role="banner" data-tone={headerTheme === 'brand' ? 'inverse' : undefined}>
        <div className="appshell__header-left">
          {showMenuToggle && hasSidebar && (
            <button
              type="button"
              className="appshell__menu-toggle"
              aria-label={t['appshell.toggleMenu']}
              aria-expanded={isMobile ? mobileOpen : !collapsed}
              aria-controls={SIDEBAR_ID}
              onClick={headerApi.toggle}
            >
              <MenuIcon size={20} />
            </button>
          )}
          {slot(header?.left)}
        </div>
        <div className="appshell__header-center">{slot(header?.center)}</div>
        <div className="appshell__header-right">{slot(header?.right)}</div>
      </header>
      <div className="appshell__body">
        {hasSidebar && (
          <aside
            ref={drawerRef}
            id={SIDEBAR_ID}
            className="appshell__sidebar"
            aria-label={t['appshell.mainNav']}
            /* Closed mobile drawer: hide from assistive tech so a screen
               reader doesn't tab through 30 offscreen links. */
            aria-hidden={isMobile && !mobileOpen ? true : undefined}
          >
            <nav className="appshell__nav">
              {sections.map((s, i) => (
                <div key={s.id ?? i} className="appshell__navsection">
                  {s.label && <div className="appshell__navlabel-section">{s.label}</div>}
                  <ul>{s.items.map((it) => (
                    <NavItemNode key={it.id} item={it} depth={0} linkAs={linkAs} onCloseMobile={closeMobileDrawer} />
                  ))}</ul>
                </div>
              ))}
            </nav>
            {footer != null && (
              <div className="appshell__sidebar-foot">{footer}</div>
            )}
          </aside>
        )}
        <main className="appshell__content" role="main">{children}</main>
        {/* Scrim is a child of the body so it MATCHES the body's exact
            bounds via `position: absolute; inset: 0` — not a sibling of
            the body using viewport-relative math, which couldn't keep up
            when the actual header height drifted from the
            `--appshell-header-height` var (e.g., 73 rendered vs the 64 floor).
            Click-anywhere-out closes. */}
        {mobileOpen && (
          <div
            className="appshell__scrim"
            onClick={closeMobileDrawer}
            aria-hidden="true"
          />
        )}
      </div>
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
