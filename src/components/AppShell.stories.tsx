import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, PageHeader } from './AppShell';
import { Button } from './Button';
import { Logo } from './Logo';
import { Home, Package, Truck, Users, Settings, ShoppingCart } from './Icons';

export default {
  title: 'Layout/AppShell',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} as Meta;

export const ConSidebar: StoryObj = {
  render: () => (
    <div style={{ height: 'calc(100vh - 32px)' }}>
      <AppShell
        brand={<Logo variant="horizontal" bg="light" height={28} />}
        brandCollapsed={<Logo variant="mark" bg="light" height={28} />}
        sections={[
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
        ]}
        topbar={
          <div style={{ width: '100%', maxWidth: 360 }}>
            <input
              className="input"
              placeholder="Buscar pedidos, productos, clientes…"
            />
          </div>
        }
        user={<Button variant="ghost" size="sm">MO</Button>}
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
  ),
};
