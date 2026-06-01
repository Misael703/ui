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

/* Single shell used by the Playground + all named stories. Mirrors the
   recommended pattern: brand in `header.center`, render-prop trigger in
   `header.left` (so the shell owns collapse state), avatar in
   `header.right`. Internal-scroll model — wrap in a 100vh container. */
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
export const TopbarUncontrolledRenderProp: StoryObj = {
  name: 'Topbar · Uncontrolled (header render-prop)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
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
          left: <Logo variant="horizontal" bg="light" height={26} />,
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
 * overlay anchored beneath the header. The same `header.left` render-prop
 * trigger that toggles `collapsed` on desktop now opens/closes the drawer
 * on mobile — one control, DWIM by viewport. ESC and a tap on the scrim
 * also close it.
 */
export const TopbarMobileDrawer: StoryObj = {
  name: 'Topbar · Mobile drawer (≤900px)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        sections={sections}
        header={{
          left: ({ collapsed, toggle }) => (
            <button
              type="button"
              aria-label={collapsed ? 'Abrir menú' : 'Cerrar menú'}
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
          center: <Logo variant="horizontal" bg="light" height={26} />,
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
