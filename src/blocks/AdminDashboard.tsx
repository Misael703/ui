'use client';
/**
 * Block: admin dashboard. Uses the AppShell TOP-header variant
 * (`headerLayout="top"`, v1.15.0) — full-width header above body with three
 * slots (`header.{left, center, right}`), centered brand, collapsible
 * sidebar that does NOT affect the header band.
 *
 * Composition: AppShell + PageHeader + KPI grid + recent-activity DataTable.
 *
 * Why top by default: the brand band stays full-width on collapse, which
 * reads better on the most common admin viewports (>= 1280px); on narrow
 * screens the sidebar collapses to zero (not to a 72px rail) so content has
 * its full horizontal room back.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 * Drop a Chart in the KPI row if you need one (see Charts story; Charts
 * take a `recharts` prop, kept out of this recipe on purpose).
 */
import * as React from 'react';
import {
  AppShell,
  PageHeader,
  SectionHeader,
  StatCard,
  Meter,
  Grid,
  Logo,
  Avatar,
  Button,
  IconButton,
  DataTable,
  Badge,
} from '../index';
import { Home, Package, Truck, Users, Settings, ShoppingCart, Wallet, MenuIcon, Bell } from '../components/Icons';

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

export function AdminDashboard(): React.ReactElement {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        sections={sections}
        header={{
          left: (
            <IconButton
              icon={<MenuIcon size={20} />}
              aria-label={collapsed ? 'Mostrar menú' : 'Ocultar menú'}
              onClick={() => setCollapsed((c) => !c)}
              size="sm"
            />
          ),
          center: <Logo variant="horizontal" bg="light" height={28} />,
          right: (
            <>
              <IconButton icon={<Bell size={18} />} aria-label="Notificaciones" size="sm" />
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
        <Grid minColWidth={200} gap={4} style={{ marginBottom: 24 }}>
          <StatCard accent="cat-2" icon={<Wallet size={16} />} label="Ventas hoy" value="$2,4M" delta={12} caption="vs. ayer" />
          <StatCard accent="cat-1" icon={<ShoppingCart size={16} />} label="Pedidos" value="184" delta={-3} caption="vs. ayer" />
          <StatCard label="Ticket prom." value="$13,8K" delta={0} caption="vs. ayer" />
          {/* A threshold/health metric, not a plain number: danger accent + a Meter
              (fewer critical SKUs is better → optimum="low"). */}
          <StatCard
            accent="danger"
            icon={<Package size={16} />}
            label="Stock crítico"
            value="7 SKU"
            caption="bajo umbral"
            chart={<Meter value={7} max={20} low={5} high={12} optimum="low" showValue={false} size="sm" />}
          />
        </Grid>
        <section aria-labelledby="dash-recent">
        <SectionHeader
          title="Pedidos recientes"
          titleId="dash-recent"
          actions={<a href="#" className="caption">Ver todos</a>}
        />
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
        </section>
      </AppShell>
    </div>
  );
}
