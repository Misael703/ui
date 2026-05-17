import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader, type AppShellTheme } from './AppShell';
import { Button } from './Button';
import { Avatar } from './Display2';
import { Logo } from './Logo';
import { Home, Package, Truck, Users, Settings, ShoppingCart } from './Icons';

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

const Shell = ({ theme }: { theme?: AppShellTheme }) => (
  <div style={{ height: 'calc(100vh - 32px)' }}>
    <AppShell
      theme={theme}
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

/**
 * Sidebar claro con acento azul de marca en el item activo + barra naranja.
 * Recomendado para apps data-heavy de uso prolongado (ERP, admin, dashboards).
 */
export const ConSidebar: StoryObj = {
  render: () => <Shell />,
};

/**
 * Sidebar azul de marca con texto blanco. Mayor brand recall, recomendado para
 * apps con identidad visual fuerte (consumer, marketing-driven). Cuidado con la
 * fatiga visual en apps de uso prolongado.
 */
export const SidebarBrand: StoryObj = {
  render: () => <Shell theme="brand" />,
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
  render: () => <BrandWithText />,
};

export const BrandTextColapsadoInicial: StoryObj = {
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
  render: () => <FootWithText />,
};

export const FooterTextColapsadoInicial: StoryObj = {
  render: () => <FootWithText collapsed />,
};
