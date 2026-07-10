import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader, type AppShellTheme } from './AppShell';
import { Button } from './Button';
import { Avatar } from './Display2';
import { Logo } from './Logo';
import { Home, Package, Truck, Users, Settings, ShoppingCart, MenuIcon, Bell } from './Icons';
import { UserMenu } from './UserMenu';
import { DataTable, type Column } from './DataTable';

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

const sections = [
  {
    label: 'Operación',
    items: [
      { id: 'home', label: 'Inicio', icon: <Home size={18} />, href: '#', active: true },
      { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={18} />, href: '#', badge: 12 },
      { id: 'productos', label: 'Productos', icon: <Package size={18} />, href: '#' },
      { id: 'despacho', label: 'Despacho', icon: <Truck size={18} />, href: '#' },
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

/* Single shell used by the Playground + the rail story. Mirrors the recommended
   pattern: the kit's `showMenuToggle` (standard filled trigger) at the start of
   `header.left`, brand Logo in `header.center`, avatar in `header.right`.
   Internal-scroll model — wrap in a 100vh container. */
function ConfigurableShell({
  theme = 'default',
  headerTheme,
  rail = false,
  startCollapsed = false,
}: { theme?: AppShellTheme; headerTheme?: AppShellTheme; rail?: boolean; startCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = React.useState(startCollapsed);
  const brand = (headerTheme ?? theme) === 'brand';
  const sepColor = brand ? 'rgba(255,255,255,0.24)' : 'var(--border-default)';
  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        theme={theme}
        headerTheme={headerTheme}
        collapsedRail={rail}
        sections={sections}
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
              <Avatar name="Misael Ocas" size={32} />
            </>
          ),
        }}
      >
        {/* A direct child of the scroll container (.appshell__content), so
            `top: 0` anchors to the top of the content viewport while the
            header and sidebar stay put. */}
        <div style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-canvas)', padding: '12px 24px', borderBottom: '1px solid var(--border-default)', fontWeight: 600 }}>
          Sub-header sticky · ancla al tope del contenido al scrollear
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
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
  collapsedRail: boolean;
  defaultCollapsed: boolean;
}

/**
 * **Playground** — configurable AppShell. Flip the controls to explore the
 * whole matrix: `theme` × `headerTheme` × `collapsedRail` × initial
 * collapse. The named stories below pin the variants worth fixing in CI.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  argTypes: {
    theme: { control: 'inline-radio', options: ['default', 'brand'] },
    headerTheme: { control: 'inline-radio', options: ['default', 'brand'] },
    collapsedRail: { control: 'boolean' },
    defaultCollapsed: { control: 'boolean' },
  },
  args: { theme: 'default', headerTheme: 'brand', collapsedRail: false, defaultCollapsed: false },
  render: (a) => {
    // Remount the stateful shell when collapse-affecting args change, so the
    // initial-collapse / rail controls take effect (useState init is read once).
    const k = `${a.defaultCollapsed}-${a.collapsedRail}`;
    return <ConfigurableShell key={k} theme={a.theme} headerTheme={a.headerTheme} rail={a.collapsedRail} startCollapsed={a.defaultCollapsed} />;
  },
};

/** **Topbar + icon rail** — `collapsedRail`: collapsing keeps a 72px rail
 *  (icons, active-item bar) instead of hiding the sidebar. The render-prop
 *  trigger drives the collapse. Shown starting collapsed so the rail is
 *  visible. */
export const TopbarRail: StoryObj = {
  name: 'Topbar · Rail (collapsedRail)',
  render: () => <ConfigurableShell theme="brand" rail startCollapsed />,
};

/**
 * **Topbar · uncontrolled, header render-prop** (v1.23.0). The shell owns the
 * collapse state; the hamburger is a `header.left` **render-prop** that gets
 * `{ collapsed, toggle }`. This is the only way to drive an uncontrolled
 * shell from the header — and what lets `persistKey` (uncontrolled) coexist
 * with a custom trigger. Add `persistKey="…"` to remember it across reloads.
 */
/**
 * **Topbar · Built-in menu toggle** (v1.34.0) — `showMenuToggle` opts the
 * consumer into the kit's default hamburger trigger. No render-prop needed:
 * the toggle is prepended to `header.left` and drives the DWIM `toggle()`
 * (drawer in mobile, collapse in desktop). The render-prop API stays
 * available for custom triggers — both can coexist.
 */
export const TopbarBuiltinMenuToggle: StoryObj = {
  name: 'Topbar · Built-in menu toggle (showMenuToggle)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        collapsedRail
        showMenuToggle
        sections={sections}
        header={{
          center: <Logo variant="horizontal" bg="auto" height={28} />,
          right: <Avatar name="Misael Ocas" size={32} />,
        }}
      >
        <div style={{ padding: 24 }}>
          <PageHeader title="Dashboard" description="`showMenuToggle` renderiza el toggle estándar del kit — no hace falta render-prop" />
          <div style={{ marginTop: 16, border: '1px dashed var(--border-default)', borderRadius: 12, height: 320 }} />
        </div>
      </AppShell>
    </div>
  ),
};

export const TopbarUncontrolledRenderProp: StoryObj = {
  name: 'Topbar · Uncontrolled (header render-prop)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        collapsedRail
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
          right: <Avatar name="Misael Ocas" size={32} />,
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
 * DWIM by viewport. ESC and a tap on the scrim also close it.
 */
export const TopbarMobileDrawer: StoryObj = {
  name: 'Topbar · Mobile drawer (≤900px)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        sections={sections}
        showMenuToggle
        header={{
          center: <Logo variant="horizontal" bg="auto" height={26} />,
          right: <Avatar name="Misael Ocas" size={32} />,
        }}
      >
        <div style={{ padding: 16 }}>
          <PageHeader title="Pedidos" description="Toca el menú para abrir el drawer; ESC o tap fuera lo cierran." />
          <div style={{ marginTop: 16, border: '1px dashed var(--border-default)', borderRadius: 12, height: 320 }} />
        </div>
      </AppShell>
    </div>
  ),
};

/**
 * **Topbar · Mobile drawer + `linkAs` (cierra al navegar).** El caso real: con
 * `next/link` (vía `linkAs`) el kit no puede inyectar un `onClick` en el nodo del
 * consumidor, así que antes el drawer navegaba pero quedaba abierto sobre la
 * página nueva. Ahora se cierra solo al activar el link. Abre el menú y toca un
 * item: la ruta cambia y el drawer desaparece.
 */
export const TopbarMobileDrawerRouting: StoryObj = {
  name: 'Topbar · Mobile drawer + linkAs (cierra al navegar)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: function Routing() {
    const [route, setRoute] = React.useState('Inicio');
    const routed = sections.map((s) => ({
      ...s,
      items: s.items.map((it) => ({ ...it, active: it.label === route })),
    }));
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
            right: <Avatar name="Misael Ocas" size={32} />,
          }}
        >
          <div style={{ padding: 16 }}>
            <PageHeader title={`Ruta: ${route}`} description="Abre el drawer y toca un item: navega (linkAs) y el drawer se cierra solo." />
          </div>
        </AppShell>
      </div>
    );
  },
};

/**
 * **Topbar · User menu (`<UserMenu>`)** — Linear / Vercel / Notion pattern,
 * empaquetado como componente (v1.66.0). Caso real: en mobile el slot
 * `header.right` con avatar + nombre + rol + chevron desbordaba (~280px de
 * contenido contra un viewport de 320). El componente colapsa el trigger a
 * puro avatar bajo 900px (mismo breakpoint que el mobile drawer) — sin
 * breakpoint hacks del consumer. Abre un popover con nombre + rol + items;
 * cierra con ESC, tap fuera, o al seleccionar un item.
 */
export const TopbarUserMenu: StoryObj = {
  name: 'Topbar · User menu (UserMenu)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        theme="brand"
        sections={sections}
        showMenuToggle
        header={{
          center: <Logo variant="horizontal" bg="auto" height={28} />,
          right: (
            <UserMenu
              name="Administrador Admin"
              role="Administrador"
              items={[
                { label: 'Mi perfil' },
                { label: 'Configuración' },
                'separator',
                { label: 'Cerrar sesión', danger: true },
              ]}
            />
          ),
        }}
      >
        <div style={{ padding: 24 }}>
          <PageHeader
            title="Dashboard"
            description="Click sobre el avatar para abrir el menú. Misma forma en mobile y desktop — sin overflow ni breakpoint hacks."
          />
          <div style={{ marginTop: 16, border: '1px dashed var(--border-default)', borderRadius: 12, height: 320 }} />
        </div>
      </AppShell>
    </div>
  ),
};

/**
 * **Topbar · tall DataTable (scroll containment)** — regression guard for the
 * double-scrollbar leak. A `.table-wrap` (`overflow-x: auto`) taller than the
 * viewport used to leak its vertical layout-overflow past `.appshell__content`
 * to the document, producing a SECOND scrollbar at the page level. The shell
 * now contains its scroll boundary, so only `.appshell__content` scrolls. View
 * at a low viewport height: the page itself must not scroll.
 */
export const TopbarTallTable: StoryObj = {
  name: 'Topbar · tall DataTable (scroll containment)',
  render: () => {
    interface Row { id: string; sku: string; name: string; stock: number }
    const rows: Row[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i + 1),
      sku: `SKU-${1000 + i}`,
      name: `Producto ${i + 1}`,
      stock: (i * 7) % 50,
    }));
    const columns: Column<Row>[] = [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Producto' },
      { key: 'stock', header: 'Stock', numeric: true },
    ];
    return (
      <div style={{ height: '100vh' }}>
        <AppShell
          sections={sections}
          showMenuToggle
          header={{
            center: <Logo variant="horizontal" bg="auto" height={28} />,
            right: <Avatar name="Misael Ocas" size={32} />,
          }}
        >
          <div style={{ padding: 24, display: 'grid', gap: 16 }}>
            <PageHeader title="Inventario" description="Tabla más alta que el viewport: el scroll vive en el contenido, no en el documento" />
            <DataTable ariaLabel="Inventario" rows={rows} rowKey={(r) => r.id} columns={columns} />
          </div>
        </AppShell>
      </div>
    );
  },
};


/**
 * **Topbar · Collapsible nav groups** (v1.83.0) — a `NavItem` with `children`
 * renders a disclosure group (a button, not a link). The group holding the
 * active item auto-opens and reads `is-within`. Collapse the sidebar to see the
 * rail tooltips (labels recover on hover/focus). Tab first to reach the
 * skip-to-content link.
 */
export const TopbarNestedGroups: StoryObj = {
  name: 'Topbar · Collapsible nav groups',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        showMenuToggle
        collapsedRail
        sections={[
          { label: 'Operación', items: [
            { id: 'home', label: 'Inicio', icon: <Home size={18} />, href: '#' },
            { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={18} />, href: '#', badge: 12 },
            { id: 'reportes', label: 'Reportes', icon: <Package size={18} />, children: [
              { id: 'r-ventas', label: 'Ventas', href: '#' },
              { id: 'r-stock', label: 'Stock', href: '#', active: true },
              { id: 'r-margen', label: 'Margen', href: '#' },
            ] },
          ] },
          { label: 'Administración', items: [
            { id: 'clientes', label: 'Clientes', icon: <Users size={18} />, href: '#' },
            { id: 'config', label: 'Configuración', icon: <Settings size={18} />, href: '#' },
          ] },
        ]}
        header={{
          center: <Logo variant="horizontal" bg="auto" height={28} />,
          right: <Avatar name="Misael Ocas" size={32} />,
        }}
      >
        <div style={{ padding: 24 }}>
          <PageHeader title="Stock" description="El grupo Reportes se abre solo porque contiene la página activa. Colapsa el sidebar (toggle) para ver los tooltips del rail; Tab llega primero al skip-link." />
          <div style={{ marginTop: 16, border: '1px dashed var(--border-default)', borderRadius: 12, height: 320 }} />
        </div>
      </AppShell>
    </div>
  ),
};
