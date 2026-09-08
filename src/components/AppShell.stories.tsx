import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader, type AppShellProps, type AppShellTheme, type NavSection } from './AppShell';
import { Button } from './Button';
import { Logo } from './Logo';
import { Home, Package, Truck, Users, Settings, ShoppingCart, MenuIcon, Bell, FileText } from './Icons';
import { UserMenu } from './UserMenu';

export default {
  title: 'Layout/AppShell',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // AppShell fills the viewport (top layout = internal scroll). Rendered
    // inline in the autodocs page it overflows the bounded Docs canvas (sidebar
    // clipped left, content/actions clipped right). Render each story in its own
    // sized iframe in Docs so 100vh maps to the iframe, not the doc column.
    docs: { story: { inline: false, iframeHeight: 720 } },
  },
} as Meta;

/* Shared nav fixture. Deliberately MIXED: flat links + a collapsible group
   (`NavItem` with `children`, v1.83.0), so every story exercises the mixed
   case instead of an isolated one. Items carry REAL paths and no hardcoded
   `active`: the stories drive the active item through `currentPath` (the
   consumer pattern — despachos feeds `usePathname()`), so clicking navigates.
   Starting on a TOP-LEVEL item shows the orange `is-active` stripe (a
   top-level-only marker); the group starts open (`defaultOpen`) exposing
   children + guide line. The dual cell (active INSIDE the group: `is-within`
   icon, child bg-tint without stripe) is one click away — or the Playground's
   `activeItem: 'en grupo'` control, which starts there. */
const sections: NavSection[] = [
  {
    label: 'Operación',
    items: [
      { id: 'home', label: 'Inicio', icon: <Home size={18} />, href: '/inicio' },
      { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={18} />, href: '/pedidos', badge: 12 },
      { id: 'productos', label: 'Productos', icon: <Package size={18} />, href: '/productos' },
      { id: 'envios', label: 'Envíos', icon: <Truck size={18} />, href: '/envios' },
      { id: 'reportes', label: 'Reportes', icon: <FileText size={18} />, defaultOpen: true, children: [
        { id: 'r-ventas', label: 'Ventas', href: '/reportes/ventas' },
        { id: 'r-stock', label: 'Stock', href: '/reportes/stock' },
        { id: 'r-margen', label: 'Margen', href: '/reportes/margen' },
      ] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { id: 'clientes', label: 'Clientes', icon: <Users size={18} />, href: '/clientes' },
      { id: 'config', label: 'Configuración', icon: <Settings size={18} />, href: '/configuracion' },
    ],
  },
];

const ROUTE_TOP_LEVEL = '/inicio';
const ROUTE_IN_GROUP = '/reportes/stock';

/* Page title per route, so the content area visibly changes with the nav. */
const ROUTE_TITLES: Record<string, string> = {
  '/inicio': 'Inicio', '/pedidos': 'Pedidos', '/productos': 'Productos', '/envios': 'Envíos',
  '/reportes/ventas': 'Reporte de ventas', '/reportes/stock': 'Reporte de stock', '/reportes/margen': 'Reporte de margen',
  '/clientes': 'Clientes', '/configuracion': 'Configuración',
};

/* In-memory router for the stories — the smallest stand-in for next/link +
   usePathname. `linkAs` renders a real <a> (href kept for semantics: middle-
   click, copy link, a11y) but intercepts the click and updates `path`; the
   shell then re-derives the active item from `currentPath`. Stable via
   useCallback: NavItemNode is memoized and an inline arrow would defeat it. */
function useDemoRouter(initial: string) {
  const [path, setPath] = React.useState(initial);
  const linkAs = React.useCallback<NonNullable<AppShellProps['linkAs']>>((item, content, className) => (
    <a
      href={item.href}
      className={className}
      aria-current={item.active ? 'page' : undefined}
      data-testid={`nav-${item.id}`}
      onClick={(e) => { e.preventDefault(); setPath(item.href!); }}
    >
      {content}
    </a>
  ), []);
  return { path, linkAs };
}

/* Wall clock with millis: consecutive clicks land in the same second, and the
   whole point is that the page timestamp moves while the shell's doesn't. */
const clock = () => {
  const d = new Date();
  return `${d.toLocaleTimeString('es-CL', { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;
};

/* Content for the current route. Keyed by `path` where it's used so it
   REMOUNTS per navigation (as a Next `page` does), while the shell around it
   only re-renders — the two timestamps make that difference visible. */
function DemoPage({ path, shellMountedAt, actions }: { path: string; shellMountedAt: string; actions?: React.ReactNode }) {
  const mountedAt = React.useRef(clock());
  return (
    <>
      <PageHeader
        title={ROUTE_TITLES[path] ?? path}
        description={`Ruta actual: ${path} · Haz clic en el menú para navegar (linkAs + currentPath)`}
        actions={actions}
      />
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-meta)' }}>
        Shell montado a las {shellMountedAt} (no se remonta al navegar) · Página montada a las {mountedAt.current}
      </p>
    </>
  );
}

/* Standard header.right across ALL stories: the kit `UserMenu`, not a bare
   `<Avatar>` (that was the pre-v1.66.0 pattern; the avatar alone opens
   nothing and demos a dead end). `compact` = avatar-only trigger, used where
   sibling actions (Bell) share the slot. */
const USER_ITEMS = [
  { label: 'Mi perfil' },
  { label: 'Configuración' },
  'separator' as const,
  { label: 'Cerrar sesión', danger: true },
];
const DemoUserMenu = ({ compact = false }: { compact?: boolean }) => (
  <UserMenu name="Satoru Gojo" role="Administrador" items={USER_ITEMS} compact={compact} />
);

/* Single shell used by the Playground. Mirrors the recommended
   pattern: the kit's `showMenuToggle` (standard filled trigger) at the start of
   `header.left`, brand Logo in `header.center`, notifications + compact
   `UserMenu` in `header.right`. Internal-scroll model — wrap in a 100vh
   container. */
function ConfigurableShell({
  theme = 'default',
  headerTheme,
  startCollapsed = false,
  startPath = ROUTE_TOP_LEVEL,
}: { theme?: AppShellTheme; headerTheme?: AppShellTheme; startCollapsed?: boolean; startPath?: string }) {
  const [collapsed, setCollapsed] = React.useState(startCollapsed);
  const { path, linkAs } = useDemoRouter(startPath);
  const shellMountedAt = React.useRef(clock());
  const brand = (headerTheme ?? theme) === 'brand';
  const sepColor = brand ? 'rgba(255,255,255,0.24)' : 'var(--border-default)';
  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        theme={theme}
        headerTheme={headerTheme}
        sections={sections}
        currentPath={path}
        linkAs={linkAs}
        showMenuToggle
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={{
          center: <Logo variant="horizontal" bg="auto" height={28} />,
          right: (
            <>
              <button type="button" aria-label="Notificaciones" style={{
                width: 36, height: 36, borderRadius: 999, border: 0, background: 'transparent',
                cursor: 'pointer', color: 'inherit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}><Bell size={18} /></button>
              <span aria-hidden="true" style={{ width: 1, height: 20, background: sepColor }} />
              <DemoUserMenu compact />
            </>
          ),
        }}
      >
        {/* A direct child of the scroll container (.appshell__content), which is
            padded. A `top: 0` sticky would anchor to the padded content box —
            pushed down by the padding, leaving a gap where the content peeks
            above and clips. Counter the padding with the public
            `--appshell-content-pad` var so it sits FLUSH + full-bleed; the var
            stays in sync across breakpoints (24px → 16px under 768px). */}
        <div style={{
          position: 'sticky',
          top: 'calc(-1 * var(--appshell-content-pad, 24px))',
          margin: 'calc(-1 * var(--appshell-content-pad, 24px)) calc(-1 * var(--appshell-content-pad, 24px)) 0',
          zIndex: 1, background: 'var(--bg-canvas)', padding: '12px 24px',
          borderBottom: '1px solid var(--border-default)', fontWeight: 600,
        }}>
          Sub-header sticky · ancla al tope del contenido al scrollear
        </div>
        {/* No inner padding: the scroll container already provides the gutter. */}
        <div style={{ display: 'grid', gap: 16 }}>
          <DemoPage key={path} path={path} shellMountedAt={shellMountedAt.current} actions={<Button>Acción</Button>} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ border: '1px dashed var(--border-default)', borderRadius: 12, height: 200 }} />
          ))}
        </div>
      </AppShell>
    </div>
  );
}

interface PlaygroundArgs {
  theme: AppShellTheme;
  headerTheme: AppShellTheme;
  defaultCollapsed: boolean;
  activeItem: 'top-level' | 'en grupo';
}

/**
 * **Playground** — the MAIN story: the whole feature matrix behind controls —
 * `theme` × `headerTheme` × initial collapse × where the
 * active item STARTS (`activeItem`). The nav is live: items carry real paths
 * and the active one is derived from `currentPath` (the consumer pattern), so
 * clicking navigates — the content swaps and remounts, the shell only
 * re-renders. The other stories exist only for what controls can't represent:
 * the render-prop API path, the no-sidebar layout, and the mobile drawer.
 *
 * Cells worth revisiting when touching nav/brand CSS:
 * - `theme: brand` + `activeItem: 'en grupo'` — the brand × group contrast
 *   cell (v1.87.0 fixes): group icon white WITHOUT hover, children guide
 *   subtle, chevron legible, stripe on the group header, child = bg tint.
 * - `defaultCollapsed` — the 72px icon rail (2.0.0: the rail IS the
 *   collapse); the group collapses to its icon with the recovery tooltip
 *   on hover/focus.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  argTypes: {
    theme: { control: 'inline-radio', options: ['default', 'brand'] },
    headerTheme: { control: 'inline-radio', options: ['default', 'brand'] },
    defaultCollapsed: { control: 'boolean' },
    activeItem: { control: 'inline-radio', options: ['top-level', 'en grupo'] },
  },
  args: { theme: 'default', headerTheme: 'brand', defaultCollapsed: false, activeItem: 'top-level' },
  render: (a) => {
    // Remount the stateful shell when an initial-state arg changes (collapse,
    // start route), so the control takes effect (useState init is read once).
    const k = `${a.defaultCollapsed}-${a.activeItem}`;
    return (
      <ConfigurableShell
        key={k}
        theme={a.theme}
        headerTheme={a.headerTheme}
        startCollapsed={a.defaultCollapsed}
        startPath={a.activeItem === 'en grupo' ? ROUTE_IN_GROUP : ROUTE_TOP_LEVEL}
      />
    );
  },
};

/**
 * **Topbar · uncontrolled, header render-prop** (v1.23.0). The shell owns the
 * collapse state; the hamburger is a `header.left` **render-prop** that gets
 * `{ collapsed, toggle }`. This is the only way to drive an uncontrolled
 * shell from the header — and what lets `persistKey` (uncontrolled) coexist
 * with a custom trigger. Add `persistKey="…"` to remember it across reloads.
 * (For the standard trigger, just use `showMenuToggle` — see Playground.)
 */
export const TopbarUncontrolledRenderProp: StoryObj = {
  name: 'Topbar · Uncontrolled (header render-prop)',
  render: function Uncontrolled() {
    const { path, linkAs } = useDemoRouter(ROUTE_TOP_LEVEL);
    const shellMountedAt = React.useRef(clock());
    return (
    <div style={{ height: '100vh' }}>
      <AppShell
        sections={sections}
        currentPath={path}
        linkAs={linkAs}
        header={{
          // A custom render-prop trigger that reuses the kit's `appshell__menu-toggle`
          // class, so it looks identical to the standard toggle (bare icon + hover
          // fill) while you still own the markup. (Use `showMenuToggle` to skip it.)
          left: ({ collapsed, toggle }) => (
            <button
              type="button"
              className="appshell__menu-toggle"
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              aria-expanded={!collapsed}
              onClick={toggle}
            ><MenuIcon size={20} /></button>
          ),
          center: <Logo variant="horizontal" bg="auto" height={28} />,
          right: <DemoUserMenu />,
        }}
      >
        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
          <DemoPage key={path} path={path} shellMountedAt={shellMountedAt.current} />
          <div style={{ border: '1px dashed var(--border-default)', borderRadius: 12, height: 320 }} />
        </div>
      </AppShell>
    </div>
    );
  },
};

/**
 * **Top-bar only** (v1.27.0) — for flat-route apps (kiosk, single-flow tools)
 * that don't need panel navigation. Omit `sections` and the shell renders just
 * the header band over a single-column content area (no sidebar at all).
 */
export const TopbarOnlyNoNav: StoryObj = {
  name: 'Topbar · Top-bar only (no sidebar)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        header={{
          left: <Logo variant="horizontal" bg="auto" height={26} />,
          right: <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Punto de venta · Caja 2</span>,
        }}
      >
        <div style={{ padding: 24 }}>
          <PageHeader title="Nueva venta" description="Flujo plano — el shell es solo el header sobre el contenido (sin sidebar)" />
          <div style={{ marginTop: 16, border: '1px dashed var(--border-default)', borderRadius: 12, height: 360 }} />
        </div>
      </AppShell>
    </div>
  ),
};

/**
 * **Topbar · Mobile drawer** (v1.31.0). Under 900px the sidebar becomes an
 * overlay anchored beneath the header. The kit's `showMenuToggle` toggles
 * `collapsed` on desktop and opens/closes the drawer on mobile — one control,
 * DWIM by viewport. ESC and a tap on the scrim close it; and with `linkAs`
 * (next/link, where the kit can't inject an `onClick` into the consumer's
 * node) the drawer also closes itself on link activation — open the menu and
 * tap an item: the route changes and the drawer disappears. Group children
 * route too (recursive `active` mapping, only ONE item active at a time).
 */
export const TopbarMobileDrawer: StoryObj = {
  name: 'Topbar · Mobile drawer (≤900px)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: function Routing() {
    // Same in-memory router as the Playground: `currentPath` resolves the
    // active item recursively (group children route too, only ONE active).
    const { path, linkAs } = useDemoRouter(ROUTE_TOP_LEVEL);
    return (
      <div style={{ height: '100vh' }}>
        <AppShell
          sections={sections}
          currentPath={path}
          linkAs={linkAs}
          showMenuToggle
          header={{
            center: <Logo variant="horizontal" bg="auto" height={26} />,
            right: <DemoUserMenu />,
          }}
        >
          <div style={{ padding: 16 }}>
            <PageHeader title={ROUTE_TITLES[path] ?? path} description={`Ruta: ${path} · Abre el drawer con el menú y toca un item: navega (linkAs) y el drawer se cierra solo. ESC o tap fuera también lo cierran.`} />
          </div>
        </AppShell>
      </div>
    );
  },
};

