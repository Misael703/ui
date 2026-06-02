import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader, type AppShellTheme } from './AppShell';
import { Button } from './Button';
import { Avatar } from './Display2';
import { Logo } from './Logo';
import { Home, Package, Truck, Users, Settings, ShoppingCart, MenuIcon, Bell, ChevronDown } from './Icons';
import { Popover } from './Popover';

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
          center: <Logo variant="horizontal" bg="light" height={28} />,
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

/**
 * **Topbar · User menu (popover)** — Linear / Vercel / Notion pattern.
 * Caso real: en mobile el slot `header.right` con avatar + nombre + rol +
 * chevron desbordaba (~280px de contenido contra un viewport de 320).
 * Patrón: el avatar es el ÚNICO control visible; un Popover monta el
 * nombre + rol + acciones al hacer click. Mismo layout mobile y desktop,
 * sin breakpoint hacks. Cierra con ESC o tap fuera (`useDismiss` interno).
 *
 * Estructura del slot derecho:
 * - Trigger: `<Avatar />` solo (32×32)
 * - Contenido del popover: header (nombre + rol) + separador + items de
 *   menú (Mi perfil, Configuración, Cerrar sesión)
 */
export const TopbarUserMenu: StoryObj = {
  name: 'Topbar · User menu (popover)',
  render: () => (
    <div style={{ height: '100vh' }}>
      {/* Local rule: under 900px, collapse the user pill to its avatar
          (hide name/role + chevron). Same breakpoint the kit's mobile
          drawer uses (`(max-width: 900px)`). Lives inline because it's a
          consumer-side decision — the kit doesn't ship a generic
          "hide-on-mobile" utility class. */}
      <style>{`
        @media (max-width: 900px) {
          .user-pill .user-pill__text { display: none !important; }
          .user-pill { padding: 0 !important; gap: 0 !important; }
        }
        .user-menu-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          border: 0;
          background: transparent;
          cursor: pointer;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--fg-default);
          transition: background var(--duration-fast, 120ms) ease, color var(--duration-fast, 120ms) ease;
        }
        .user-menu-item:hover,
        .user-menu-item:focus-visible {
          background: var(--bg-subtle);
          outline: none;
        }
        .user-menu-item--danger { color: var(--color-danger, #c0392b); }
        .user-menu-item--danger:hover,
        .user-menu-item--danger:focus-visible {
          background: var(--color-danger-50, rgba(192, 57, 43, 0.08));
          color: var(--color-danger, #c0392b);
        }
      `}</style>
      <AppShell
        theme="brand"
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
                border: '1px solid rgba(255,255,255,0.24)', background: 'transparent',
                color: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            ><MenuIcon size={18} /></button>
          ),
          center: <Logo variant="horizontal" bg="dark" height={28} />,
          right: (
            <Popover
              placement="bottom"
              align="end"
              ariaLabel="Menú de usuario"
              trigger={
                <button
                  type="button"
                  aria-label="Abrir menú de usuario"
                  className="user-pill"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: 'transparent', border: 0, padding: '4px 8px 4px 4px',
                    borderRadius: 999, cursor: 'pointer',
                    color: 'inherit', fontFamily: 'var(--font-body)',
                  }}
                >
                  <Avatar name="Administrador Admin" size={32} />
                  {/* Texto + chevron solo en desktop — `.user-pill__text` se
                      esconde bajo 900px via `<style>` local. Mobile: el botón
                      colapsa a un avatar de 40×40 (el padding + gap). */}
                  <span
                    className="user-pill__text"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}
                  >
                    <strong style={{ fontSize: 14 }}>Administrador Admin</strong>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>Administrador</span>
                  </span>
                  <span className="user-pill__text" aria-hidden="true" style={{ display: 'inline-flex' }}>
                    <ChevronDown size={16} />
                  </span>
                </button>
              }
              contentClassName="elalba-user-menu"
            >
              <div style={{ minWidth: 220, padding: 4 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px' }}>
                  <Avatar name="Administrador Admin" size={40} />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                    <strong style={{ fontSize: 13 }}>Administrador Admin</strong>
                    <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Administrador</span>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border-default)', margin: '4px 0' }} />
                <button type="button" className="user-menu-item">Mi perfil</button>
                <button type="button" className="user-menu-item">Configuración</button>
                <div style={{ height: 1, background: 'var(--border-default)', margin: '4px 0' }} />
                <button type="button" className="user-menu-item user-menu-item--danger">Cerrar sesión</button>
              </div>
            </Popover>
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

