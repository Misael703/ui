import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader, type AppShellTheme } from './AppShell';
import { Button } from './Button';
import { Avatar } from './Display2';
import { Logo } from './Logo';
import { Home, Package, Truck, Users, Settings, ShoppingCart, MenuIcon, Bell } from './Icons';

export default {
  title: 'Layout/AppShell',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
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

const Shell = ({ theme, defaultCollapsed }: { theme?: AppShellTheme; defaultCollapsed?: boolean }) => (
  <div style={{ height: 'calc(100vh - 32px)' }}>
    <AppShell
      theme={theme}
      defaultCollapsed={defaultCollapsed}
      brand={<Logo variant="horizontal" bg={theme === 'brand' ? 'dark' : 'light'} height={34} />}
      brandCollapsed={<Logo variant="mark" bg={theme === 'brand' ? 'dark' : 'light'} height={34} />}
      sections={sections}
      topbar={
        <div style={{ width: '100%', maxWidth: 360 }}>
          <input className="input" placeholder="Buscar pedidos, productos, clientes…" />
        </div>
      }
      user={<Avatar name="Misael Ocas" size={32} />}
    >
      <PageHeader
        title="Pedidos"
        description="Administra los pedidos abiertos del día"
        actions={<Button>Nuevo pedido</Button>}
      />
      <div style={{ padding: 24, border: '1px dashed var(--border-default)', borderRadius: 12, textAlign: 'center', color: 'var(--fg-muted)' }}>
        Aquí va el contenido de la página
      </div>
    </AppShell>
  </div>
);

interface PlaygroundArgs {
  headerLayout: 'side' | 'top';
  theme: AppShellTheme;
  headerTheme: AppShellTheme;
  collapsedRail: boolean;
  defaultCollapsed: boolean;
}

/**
 * **Playground** — configurable AppShell. Flip the controls to explore the
 * whole matrix; each control maps to a real prop:
 * `headerLayout` (side/top) × `theme` × `headerTheme` (top only) ×
 * `collapsedRail` (top only) × initial collapse. The named stories below
 * are kept as fixed references: the brand-text / footer collapse mechanism
 * (a usage pattern, not a single prop) and the collapsed rail look.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  argTypes: {
    headerLayout: { control: 'inline-radio', options: ['side', 'top'] },
    theme: { control: 'inline-radio', options: ['default', 'brand'] },
    headerTheme: { control: 'inline-radio', options: ['default', 'brand'], if: { arg: 'headerLayout', eq: 'top' } },
    collapsedRail: { control: 'boolean', if: { arg: 'headerLayout', eq: 'top' } },
    defaultCollapsed: { control: 'boolean' },
  },
  args: { headerLayout: 'top', theme: 'default', headerTheme: 'brand', collapsedRail: false, defaultCollapsed: false },
  render: (a) => {
    // Remount the stateful shell when collapse-affecting args change, so the
    // initial-collapse / rail controls take effect (useState init is read once).
    const k = `${a.headerLayout}-${a.defaultCollapsed}-${a.collapsedRail}`;
    return a.headerLayout === 'top'
      ? <TopbarCenteredShell key={k} theme={a.theme} headerTheme={a.headerTheme} rail={a.collapsedRail} startCollapsed={a.defaultCollapsed} />
      : <Shell key={k} theme={a.theme} defaultCollapsed={a.defaultCollapsed} />;
  },
};

/**
 * Brand con texto y **sin** `brandCollapsed`. El texto va envuelto en
 * `<span className="appshell__brand-text">`: al colapsar el riel (botón
 * chevron abajo) el texto desaparece animado y solo queda el mark — sin
 * recortes. Reproduce el caso "Despachos · v0.1" sin necesidad de mantener
 * un nodo `brandCollapsed` aparte.
 */
const BrandWithText = ({ collapsed }: { collapsed?: boolean }) => (
  <div style={{ height: 'calc(100vh - 32px)' }}>
    <AppShell
      theme="brand"
      defaultCollapsed={collapsed}
      brand={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo variant="mark" bg="dark" height={28} />
          <span className="appshell__brand-text">Despachos · v0.1</span>
        </span>
      }
      sections={sections}
      user={<Avatar name="Misael Ocas" size={32} />}
    >
      <PageHeader title="Despacho" description="Riel colapsable sin brandCollapsed" />
      <div style={{ padding: 24, border: '1px dashed var(--border-default)', borderRadius: 12, textAlign: 'center', color: 'var(--fg-muted)' }}>
        Colapsa el riel con el chevron inferior: el texto del brand se va, el mark queda.
      </div>
    </AppShell>
  </div>
);

export const BrandTextColapsable: StoryObj = {
  name: 'Sidebar · Brand, texto colapsable',
  render: () => <BrandWithText />,
};

export const BrandTextColapsadoInicial: StoryObj = {
  name: 'Sidebar · Brand, texto colapsado',
  render: () => <BrandWithText collapsed />,
};

/**
 * Footer con texto colapsable. Igual que `appshell__brand-text` pero para el
 * slot `footer`: envuelve el label de versión en
 * `<span className="appshell__brand-text">`-equivalente
 * `<span className="appshell__foot-text">` y al colapsar el riel el texto
 * desaparece animado en vez de partirse y solaparse con el toggle (caso
 * "Despachos · v0.1"). Colapsa el riel con el chevron inferior.
 */
const FootWithText = ({ collapsed }: { collapsed?: boolean }) => (
  <div style={{ height: 'calc(100vh - 32px)' }}>
    <AppShell
      theme="brand"
      defaultCollapsed={collapsed}
      brand={<Logo variant="horizontal" bg="dark" height={32} />}
      brandCollapsed={<Logo variant="mark" bg="dark" height={32} />}
      sections={sections}
      footer={<span className="appshell__foot-text">Despachos · v0.1</span>}
      user={<Avatar name="Misael Ocas" size={32} />}
    >
      <PageHeader title="Usuarios" description="Footer colapsable sin solape" />
      <div style={{ padding: 24, border: '1px dashed var(--border-default)', borderRadius: 12, textAlign: 'center', color: 'var(--fg-muted)' }}>
        Colapsa el riel: "Despachos · v0.1" se va, el toggle queda centrado.
      </div>
    </AppShell>
  </div>
);

export const FooterTextColapsable: StoryObj = {
  name: 'Sidebar · Footer colapsable',
  render: () => <FootWithText />,
};

export const FooterTextColapsadoInicial: StoryObj = {
  name: 'Sidebar · Footer colapsado',
  render: () => <FootWithText collapsed />,
};

/* =============================================================================
 * `headerLayout="top"` — full-width header above the body (v1.15.0). Brand
 * lives in `header.center` at the TRUE viewport centre (`1fr auto 1fr`
 * column grid). Hamburger toggles `collapsed`: only the sidebar animates;
 * the topbar is invariant. `theme="brand"` tints both header and sidebar.
 * ===========================================================================*/

function TopbarCenteredShell({ theme = 'default', headerTheme, rail = false, startCollapsed = false }: { theme?: AppShellTheme; headerTheme?: AppShellTheme; rail?: boolean; startCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = React.useState(startCollapsed);
  // The header content (separators, icon buttons) follows the HEADER band's
  // theme, which defaults to `theme`.
  const brand = (headerTheme ?? theme) === 'brand';
  const sepColor = brand ? 'rgba(255,255,255,0.24)' : 'var(--border-default)';
  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        theme={theme}
        headerTheme={headerTheme}
        headerLayout="top"
        collapsedRail={rail}
        sections={sections}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={{
          left: (
            <button
              type="button"
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
              style={{
                width: 40, height: 40, borderRadius: 999,
                border: `1px solid ${sepColor}`,
                background: 'transparent', color: 'inherit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            ><MenuIcon size={18} /></button>
          ),
          center: <Logo variant="horizontal" bg={brand ? 'dark' : 'light'} height={28} />,
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
        {/* Sticky page sub-header: a direct child of the scroll container
            (.appshell__content), so `top: 0` anchors to the top of the content
            viewport while the header + sidebar stay put. */}
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

/** **Topbar + icon rail** — `collapsedRail`: collapsing keeps a 72px rail
 *  (icons, active-item bar) instead of hiding the sidebar. Collapse is driven
 *  by the header hamburger (`header.left`) — no built-in rail toggle, so there
 *  is a single control. Shown starting collapsed so the rail is visible.
 *  (Toggle `theme`/`collapsedRail` live in the Playground for the rest.) */
export const TopbarRail: StoryObj = {
  name: 'Topbar · Rail (collapsedRail)',
  render: () => <TopbarCenteredShell theme="brand" rail startCollapsed />,
};

/**
 * **Topbar · uncontrolled, header render-prop** (v1.23.0). The shell owns the
 * collapse state; the hamburger is a `header.left` **render-prop** that gets
 * `{ collapsed, toggle }`. This is the only way to drive an uncontrolled `top`
 * shell from the header — and what lets `persistKey` (uncontrolled) coexist
 * with a custom trigger. Add `persistKey="…"` to remember it across reloads.
 */
export const TopbarUncontrolledRenderProp: StoryObj = {
  name: 'Topbar · Uncontrolled (header render-prop)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        headerLayout="top"
        collapsedRail
        sections={sections}
        header={{
          left: ({ collapsed, toggle }) => (
            <button
              type="button"
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              aria-expanded={!collapsed}
              onClick={toggle}
              style={{
                width: 40, height: 40, borderRadius: 999,
                border: '1px solid var(--border-default)', background: 'transparent',
                color: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><MenuIcon size={18} /></button>
          ),
          center: <Logo variant="horizontal" bg="light" height={28} />,
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
