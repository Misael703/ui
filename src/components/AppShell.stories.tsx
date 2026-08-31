import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader, type AppShellTheme, type NavItem, type NavSection } from './AppShell';
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
   case instead of an isolated one. The active item is TOP-LEVEL (Inicio) so
   the orange `is-active` stripe — a top-level-only marker — shows in every
   story; the group still starts open (`defaultOpen`) exposing children +
   guide line. The dual cell (active INSIDE the group: `is-within` icon,
   child bg-tint without stripe) is the Playground's `activeItem: 'en grupo'`
   control. */
const sections: NavSection[] = [
  {
    label: 'Operación',
    items: [
      { id: 'home', label: 'Inicio', icon: <Home size={18} />, href: '#', active: true },
      { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={18} />, href: '#', badge: 12 },
      { id: 'productos', label: 'Productos', icon: <Package size={18} />, href: '#' },
      { id: 'despacho', label: 'Despacho', icon: <Truck size={18} />, href: '#' },
      { id: 'reportes', label: 'Reportes', icon: <FileText size={18} />, defaultOpen: true, children: [
        { id: 'r-ventas', label: 'Ventas', href: '#' },
        { id: 'r-stock', label: 'Stock', href: '#' },
        { id: 'r-margen', label: 'Margen', href: '#' },
      ] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { id: 'clientes', label: 'Clientes', icon: <Users size={18} />, href: '#' },
      { id: 'config', label: 'Configuración', icon: <Settings size={18} />, href: '#' },
    ],
  },
];

/* The OTHER matrix cell: active item INSIDE the group. Wired to the
   Playground's `activeItem: 'en grupo'` control — is-within icon/label
   (white on brand), stripe on the group header, child active as bg-tint
   WITHOUT the stripe (top-level-only by design), guide line. */
const sectionsGroupActive: NavSection[] = sections.map((s) => ({
  ...s,
  items: s.items.map((it): NavItem => it.id === 'home'
    ? { ...it, active: false }
    : it.id === 'reportes'
      ? { ...it, children: it.children!.map((c) => ({ ...c, active: c.id === 'r-stock' })) }
      : it),
}));

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
  <UserMenu name="Misael Ocas" role="Administrador" items={USER_ITEMS} compact={compact} />
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
  navSections = sections,
}: { theme?: AppShellTheme; headerTheme?: AppShellTheme; startCollapsed?: boolean; navSections?: typeof sections }) {
  const [collapsed, setCollapsed] = React.useState(startCollapsed);
  const brand = (headerTheme ?? theme) === 'brand';
  const sepColor = brand ? 'rgba(255,255,255,0.24)' : 'var(--border-default)';
  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        theme={theme}
        headerTheme={headerTheme}
        sections={navSections}
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
          <PageHeader title="Dashboard" description="Contenido largo para demostrar el scroll interno: el header y el sidebar quedan fijos" actions={<Button>Acción</Button>} />
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
 * active item lives (`activeItem`). The other stories exist only for what
 * controls can't represent: the render-prop API path, the no-sidebar layout,
 * and the mobile drawer + `linkAs` routing.
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
    // Remount the stateful shell when collapse-affecting args change, so the
    // initial-collapse control takes effect (useState init is read once).
    const k = String(a.defaultCollapsed);
    return (
      <ConfigurableShell
        key={k}
        theme={a.theme}
        headerTheme={a.headerTheme}
        startCollapsed={a.defaultCollapsed}
        navSections={a.activeItem === 'en grupo' ? sectionsGroupActive : sections}
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
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        sections={sections}
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
        <div style={{ padding: 24 }}>
          <PageHeader title="Dashboard" description="El estado lo administra el AppShell; el hamburger lo togglea vía render-prop" />
          <div style={{ marginTop: 16, border: '1px dashed var(--border-default)', borderRadius: 12, height: 320 }} />
        </div>
      </AppShell>
    </div>
  ),
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
          right: <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Cobros Khipu · Mesón</span>,
        }}
      >
        <div style={{ padding: 24 }}>
          <PageHeader title="Nuevo cobro" description="Flujo plano — el shell es solo el header sobre el contenido (sin sidebar)" />
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
    const [route, setRoute] = React.useState('Inicio');
    // Recursive: the fixture mixes flat links and a collapsible group, so the
    // group's children also route (and only ONE item ends up active).
    const mark = (it: NavItem): NavItem => ({
      ...it,
      active: it.label === route,
      children: it.children?.map(mark),
    });
    const routed = sections.map((s) => ({ ...s, items: s.items.map(mark) }));
    return (
      <div style={{ height: '100vh' }}>
        <AppShell
          sections={routed}
          showMenuToggle
          linkAs={(item, content, className) => (
            <a
              data-testid={`nav-${item.id}`}
              href={item.href}
              className={className}
              onClick={(e) => { e.preventDefault(); setRoute(String(item.label)); }}
            >
              {content}
            </a>
          )}
          header={{
            center: <Logo variant="horizontal" bg="auto" height={26} />,
            right: <DemoUserMenu />,
          }}
        >
          <div style={{ padding: 16 }}>
            <PageHeader title={`Ruta: ${route}`} description="Abre el drawer con el menú y toca un item: navega (linkAs) y el drawer se cierra solo. ESC o tap fuera también lo cierran." />
          </div>
        </AppShell>
      </div>
    );
  },
};

