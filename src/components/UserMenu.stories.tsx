import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu, type UserMenuItem } from './UserMenu';
import { AppShell } from './AppShell';
import { Logo } from './Logo';
import { Avatar } from './Display2';
import {
  User, Settings, CreditCard, Bell, LogOut, Building, Mail, Users, Home, Package,
} from './Icons';

/**
 * **UserMenu** — the packaged topbar user menu (Linear / Vercel / Notion
 * pattern). The avatar is the ONLY control always visible; name + role +
 * chevron live in the trigger on desktop and **collapse to a bare avatar
 * under 900px** (the same breakpoint as `AppShell`'s mobile drawer), so a
 * narrow header never overflows. Clicking opens a `Popover` with a header
 * (name/role) + items; it closes on ESC, click-outside, or when an item is
 * selected.
 *
 * > **Tip:** these stories render the `UserMenu` on its own over a strip
 * > that imitates the right edge of a header. In production it goes in
 * > `header.right` of the `AppShell` (see the **In topbar** story). To see
 * > the collapse to mobile, use Storybook's viewport toolbar and go below
 * > 900px.
 */
const BASE_ITEMS: ('separator' | UserMenuItem)[] = [
  { label: 'Mi perfil' },
  { label: 'Configuración' },
  'separator',
  { label: 'Cerrar sesión', danger: true },
];

const meta = {
  title: 'Components/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  args: { name: 'Administrador Admin', role: 'Administrador', items: BASE_ITEMS, compact: false },
} satisfies Meta<typeof UserMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Strip that imitates the right edge of a topbar (only to frame the demo). */
const headerStrip: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
  padding: '12px 20px', minHeight: 64, background: 'var(--bg-subtle)',
  borderBottom: '1px solid var(--border-default)', borderRadius: 8,
};
const Strip = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, paddingBottom: 220 }}>
    <div style={headerStrip}>{children}</div>
  </div>
);

/** The minimum: name, role and three actions. A `'separator'` isolates the destructive action. */
export const Default: Story = {
  render: (a) => (
    <Strip>
      <UserMenu {...a} />
    </Strip>
  ),
};

// Hoisted: items hold React elements.
const ICON_ITEMS: ('separator' | UserMenuItem)[] = [
  { label: 'Mi perfil', icon: <User size={16} /> },
  { label: 'Facturación', icon: <CreditCard size={16} /> },
  { label: 'Notificaciones', icon: <Bell size={16} /> },
  { label: 'Configuración', icon: <Settings size={16} /> },
  'separator',
  { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
];

/** Icons per item — scans faster. `danger` colors the destructive action. */
export const WithIcons: StoryObj = {
  name: 'With icons',
  render: () => (
    <Strip>
      <UserMenu name="Satoru Gojo" role="Administrador · Northwind" items={ICON_ITEMS} />
    </Strip>
  ),
};

/**
 * Items as links (`href`) routed by your router. `linkAs` lets you wrap
 * them in Next's `<Link>` (here a demo `<a>`) without losing the item's
 * styling. Actions (logout) remain `onSelect`.
 */
// Hoisted: items hold React elements.
const LINK_ITEMS: ('separator' | UserMenuItem)[] = [
  { label: 'Mi perfil', icon: <User size={16} />, href: '/perfil' },
  { label: 'Mensajes', icon: <Mail size={16} />, href: '/mensajes' },
  { label: 'Mi sucursal', icon: <Building size={16} />, href: '/sucursal' },
  'separator',
  { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true, onSelect: () => alert('logout()') },
];

export const WithLinks: StoryObj = {
  name: 'With links (linkAs)',
  render: () => (
    <Strip>
      <UserMenu
        name="Camila Soto"
        role="Cajera"
        items={LINK_ITEMS}
        linkAs={({ href, className, children }) => (
          <a href={href} className={className} onClick={(e) => { e.preventDefault(); alert(`navegar a ${href}`); }}>
            {children}
          </a>
        )}
      />
    </Strip>
  ),
};

/**
 * `avatar` replaces the initials avatar with your own — a photo (`src`), a
 * `status` dot, or a square avatar. Useful when you already have the
 * user's photo.
 */
// Hoisted: items and avatar hold React elements.
const AVATAR_ITEMS: ('separator' | UserMenuItem)[] = [
  { label: 'Mi perfil', icon: <User size={16} /> },
  { label: 'Equipo', icon: <Users size={16} /> },
  'separator',
  { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
];
const CUSTOM_AVATAR = <Avatar name="Valentina Ruiz" size={32} status="online" />;

export const CustomAvatar: StoryObj = {
  name: 'Custom avatar',
  render: () => (
    <Strip>
      <UserMenu name="Valentina Ruiz" role="Supervisora" avatar={CUSTOM_AVATAR} items={AVATAR_ITEMS} />
    </Strip>
  ),
};

/**
 * `compact` collapses the trigger to a bare avatar on EVERY viewport — an
 * opt-in size variant for headers with sibling actions (notifications,
 * search) where name + role would crowd the slot. The hover is SQUARE (the
 * same 40×40 box as the menu toggle): the trigger reads as one more header
 * control, not as a loose circle. The popover still shows the full
 * identity: nothing is lost, only the trigger's footprint changes.
 */
// Hoisted: items hold React elements.
const COMPACT_ITEMS: ('separator' | UserMenuItem)[] = [
  { label: 'Mi perfil', icon: <User size={16} /> },
  { label: 'Configuración', icon: <Settings size={16} /> },
  'separator',
  { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
];

export const Compact: StoryObj = {
  name: 'Compact',
  render: () => (
    <Strip>
      <button type="button" aria-label="Notificaciones" style={{
        width: 36, height: 36, borderRadius: 999, border: 0, background: 'transparent',
        cursor: 'pointer', color: 'inherit', marginRight: 8,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}><Bell size={18} /></button>
      <UserMenu compact name="Satoru Gojo" role="Administrador" items={COMPACT_ITEMS} />
    </Strip>
  ),
};

/**
 * `placement` + `align` control which side the panel comes out from and
 * its anchor. In a topbar you usually want `placement="bottom"` +
 * `align="end"` (default), so the panel hugs the right edge and doesn't
 * overflow the viewport.
 */
// Hoisted: shared across the three menus below.
const PLACEMENT_ITEMS: ('separator' | UserMenuItem)[] = [{ label: 'Perfil' }, 'separator', { label: 'Salir', danger: true }];

export const PlacementAndAlign: StoryObj = {
  name: 'Placement and align',
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24, paddingBottom: 260, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>align=&quot;end&quot; (default)</div>
        <UserMenu name="Admin" role="end" align="end" items={PLACEMENT_ITEMS} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>align=&quot;start&quot;</div>
        <UserMenu name="Admin" role="start" align="start" items={PLACEMENT_ITEMS} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>placement=&quot;top&quot;</div>
        <UserMenu name="Admin" role="top" placement="top" items={PLACEMENT_ITEMS} />
      </div>
    </div>
  ),
};

const navSections = [
  { items: [
    { id: 'home', label: 'Inicio', icon: <Home size={18} />, active: true },
    { id: 'orders', label: 'Órdenes', icon: <Package size={18} /> },
    { id: 'team', label: 'Equipo', icon: <Users size={18} /> },
  ] },
];

/**
 * The canonical usage: inside `header.right` of an `AppShell`. The brand
 * header (`theme="brand"`) tints the bar; `UserMenu` inherits the
 * white-alpha hover. Shrink the viewport below 900px (Storybook's toolbar)
 * to see the trigger collapse to a bare avatar — with no overflow.
 */
// Hoisted: items and the header object hold React elements.
const TOPBAR_ITEMS: ('separator' | UserMenuItem)[] = [
  { label: 'Mi perfil', icon: <User size={16} /> },
  { label: 'Facturación', icon: <CreditCard size={16} /> },
  { label: 'Configuración', icon: <Settings size={16} /> },
  'separator',
  { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
];
const TOPBAR_HEADER = {
  center: <Logo variant="horizontal" bg="dark" height={28} />,
  right: <UserMenu name="Administrador Admin" role="Administrador" items={TOPBAR_ITEMS} />,
};

export const InTopbar: StoryObj = {
  name: 'In topbar (AppShell)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell theme="brand" sections={navSections} showMenuToggle header={TOPBAR_HEADER}>
        <div style={{ padding: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--fg-muted)' }}>
            Click en el avatar (arriba a la derecha) para abrir el menú. Bajo 900px
            el trigger colapsa a puro avatar.
          </p>
        </div>
      </AppShell>
    </div>
  ),
};
