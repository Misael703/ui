import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from './UserMenu';
import { AppShell } from './AppShell';
import { Logo } from './Logo';
import { Avatar } from './Display2';
import {
  User, Settings, CreditCard, Bell, LogOut, Building, Mail, Users, Home, Package,
} from './Icons';

/**
 * **UserMenu** — el menú de usuario de topbar (patrón Linear / Vercel / Notion),
 * empaquetado. El avatar es el ÚNICO control siempre visible; nombre + rol +
 * chevron viven en el trigger en desktop y **colapsan a puro avatar bajo 900px**
 * (mismo breakpoint que el mobile drawer del `AppShell`), así un header angosto
 * nunca desborda. Al click abre un `Popover` con header (nombre/rol) + items;
 * cierra con ESC, click-fuera, o al seleccionar un item.
 *
 * > **Tip:** estas stories renderizan el `UserMenu` suelto sobre una franja que
 * > imita la esquina derecha de un header. En producción va en `header.right`
 * > del `AppShell` (ver la story **En topbar**). Para ver el colapso a mobile,
 * > usa la barra de viewport de Storybook y baja de 900px.
 */
export default { title: 'Overlay/UserMenu', tags: ['autodocs'] } as Meta;

/** Franja que imita la esquina derecha de un topbar (solo para encuadrar el demo). */
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

/** Lo mínimo: nombre, rol y tres acciones. Un `'separator'` aísla la acción destructiva. */
export const Basico: StoryObj = {
  render: () => (
    <Strip>
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
    </Strip>
  ),
};

/** Con íconos por item — escanea más rápido. `danger` pinta la acción destructiva. */
export const ConIconos: StoryObj = {
  name: 'Con íconos',
  render: () => (
    <Strip>
      <UserMenu
        name="Misael Ocas"
        role="Dueño · El Alba"
        items={[
          { label: 'Mi perfil', icon: <User size={16} /> },
          { label: 'Facturación', icon: <CreditCard size={16} /> },
          { label: 'Notificaciones', icon: <Bell size={16} /> },
          { label: 'Configuración', icon: <Settings size={16} /> },
          'separator',
          { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
        ]}
      />
    </Strip>
  ),
};

/**
 * Items como links (`href`) ruteados por tu router. `linkAs` te deja envolverlos
 * en el `<Link>` de Next (acá un `<a>` de demo) sin perder el estilado del item.
 * Las acciones (logout) siguen siendo `onSelect`.
 */
export const ConLinks: StoryObj = {
  name: 'Con links (linkAs)',
  render: () => (
    <Strip>
      <UserMenu
        name="Camila Soto"
        role="Cajera"
        items={[
          { label: 'Mi perfil', icon: <User size={16} />, href: '/perfil' },
          { label: 'Mensajes', icon: <Mail size={16} />, href: '/mensajes' },
          { label: 'Mi sucursal', icon: <Building size={16} />, href: '/sucursal' },
          'separator',
          { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true, onSelect: () => alert('logout()') },
        ]}
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
 * `avatar` reemplaza el avatar de iniciales por el tuyo — una foto (`src`), un
 * `status` dot, o un avatar cuadrado. Útil cuando ya tienes la foto del usuario.
 */
export const AvatarPropio: StoryObj = {
  name: 'Avatar propio',
  render: () => (
    <Strip>
      <UserMenu
        name="Valentina Ruiz"
        role="Supervisora"
        avatar={<Avatar name="Valentina Ruiz" size={32} status="online" />}
        items={[
          { label: 'Mi perfil', icon: <User size={16} /> },
          { label: 'Equipo', icon: <Users size={16} /> },
          'separator',
          { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
        ]}
      />
    </Strip>
  ),
};

/**
 * `placement` + `align` controlan de qué lado y con qué anclaje sale el panel.
 * En un topbar normalmente quieres `placement="bottom"` + `align="end"` (default),
 * para que el panel se pegue al borde derecho y no se salga del viewport.
 */
export const PlacementYAlign: StoryObj = {
  name: 'Placement y align',
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24, paddingBottom: 260, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>align=&quot;end&quot; (default)</div>
        <UserMenu name="Admin" role="end" align="end"
          items={[{ label: 'Perfil' }, 'separator', { label: 'Salir', danger: true }]} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>align=&quot;start&quot;</div>
        <UserMenu name="Admin" role="start" align="start"
          items={[{ label: 'Perfil' }, 'separator', { label: 'Salir', danger: true }]} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>placement=&quot;top&quot;</div>
        <UserMenu name="Admin" role="top" placement="top"
          items={[{ label: 'Perfil' }, 'separator', { label: 'Salir', danger: true }]} />
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
 * El uso canónico: dentro de `header.right` de un `AppShell`. El header brand
 * (`theme="brand"`) tinta la barra; el `UserMenu` hereda el hover blanco-α.
 * Reduce el viewport bajo 900px (toolbar de Storybook) para ver el trigger
 * colapsar a puro avatar — sin overflow.
 */
export const EnTopbar: StoryObj = {
  name: 'En topbar (AppShell)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ height: '100vh' }}>
      <AppShell
        theme="brand"
        sections={navSections}
        showMenuToggle
        header={{
          center: <Logo variant="horizontal" bg="dark" height={28} />,
          right: (
            <UserMenu
              name="Administrador Admin"
              role="Administrador"
              items={[
                { label: 'Mi perfil', icon: <User size={16} /> },
                { label: 'Facturación', icon: <CreditCard size={16} /> },
                { label: 'Configuración', icon: <Settings size={16} /> },
                'separator',
                { label: 'Cerrar sesión', icon: <LogOut size={16} />, danger: true },
              ]}
            />
          ),
        }}
      >
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
