'use client';
/**
 * Block: AppShell with the TOP header variant (`headerLayout="top"`, v1.15.0).
 *
 * Layout: full-width header above body with three slots
 * (`header.{left, center, right}`). The center slot lands at the **true
 * viewport centre** via the 1fr·auto·1fr column grid — brand position is
 * invariant to left/right widths. The collapse only hides the sidebar; the
 * top header stays full-width. With `theme="brand"`, both bands tint with
 * `--color-primary` and a hairline (`rgba(255,255,255,0.12)`) separates them.
 *
 * Compare with `AdminDashboard` (sidebar shell, default layout).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  AppShell,
  PageHeader,
  Kpi,
  Logo,
  Avatar,
  Button,
  DataTable,
  Badge,
} from '../index';
import { Home, Package, Truck, Users, Settings, ShoppingCart, MenuIcon, Bell } from '../components/Icons';

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

const recent = [
  { id: '1042', cliente: 'Northwind Builders', rut: '76.123.456-7', total: 1245000, estado: 'ok' as const },
  { id: '1041', cliente: 'Constructora Norte', rut: '76.987.654-3', total: 842300, estado: 'warn' as const },
  { id: '1040', cliente: 'Ferretería Centro',  rut: '77.456.789-K', total: 318900, estado: 'ok' as const },
];

export function AppShellTop(): React.ReactElement {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        headerLayout="top"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        sections={sections}
        header={{
          left: (
            <button
              type="button"
              aria-label={collapsed ? 'Mostrar menú' : 'Ocultar menú'}
              onClick={() => setCollapsed((c) => !c)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                border: 0,
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <MenuIcon size={20} />
            </button>
          ),
          center: <Logo variant="horizontal" bg="light" height={28} />,
          right: (
            <>
              <button
                type="button"
                aria-label="Notificaciones"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Bell size={18} />
              </button>
              <Avatar name="Misael Ocas" size={32} />
            </>
          ),
        }}
      >
        <PageHeader
          title="Resumen del día"
          description="Operación de la tienda hoy"
          actions={<Button>Nuevo pedido</Button>}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Kpi label="Ventas hoy" value="$2.4M" delta={{ value: '12%', trend: 'up' }} hint="vs ayer" />
          <Kpi label="Pedidos" value="184" delta={{ value: '3%', trend: 'down' }} />
          <Kpi label="Ticket prom." value="$13.8K" delta={{ value: '0%', trend: 'flat' }} />
          <Kpi label="Stock crítico" value="7 SKU" hint="bajo umbral" />
        </div>
        <h3 className="h3" style={{ margin: '0 0 12px' }}>Pedidos recientes</h3>
        <DataTable
          rows={recent}
          rowKey={(r) => r.id}
          ariaLabel="Pedidos recientes"
          columns={[
            { key: 'id', header: 'Pedido', accessor: (r) => <span className="cell-mono">#{r.id}</span> },
            {
              key: 'cliente',
              header: 'Cliente',
              accessor: (r) => (
                <>
                  <span>{r.cliente}</span>
                  <span className="cell-meta cell-mono">{r.rut}</span>
                </>
              ),
            },
            {
              key: 'total',
              header: 'Total',
              align: 'right',
              accessor: (r) => <span className="cell-mono">${r.total.toLocaleString('es-CL')}</span>,
            },
            {
              key: 'estado',
              header: 'Estado',
              accessor: (r) =>
                r.estado === 'ok' ? <Badge variant="success">Despachado</Badge> : <Badge variant="warning">Pendiente</Badge>,
            },
          ]}
        />
      </AppShell>
    </div>
  );
}
