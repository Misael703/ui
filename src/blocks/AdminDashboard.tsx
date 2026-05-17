'use client';
/**
 * Block: admin dashboard shell (AppShell + PageHeader + KPI grid + recent
 * activity). Copy-paste recipe. Replace `../index` with `@misael703/ui` in
 * your app. Drop a Chart in the KPI row if you need one (see the Charts story;
 * Charts take a `recharts` prop, kept out of this recipe on purpose).
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
import { Home, Package, Truck, Users, Settings, ShoppingCart } from '../components/Icons';

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
  { id: '1042', cliente: 'Northwind Builders', total: '$1.245.000', estado: 'ok' as const },
  { id: '1041', cliente: 'Constructora Norte', total: '$842.300', estado: 'warn' as const },
  { id: '1040', cliente: 'Ferretería Centro', total: '$318.900', estado: 'ok' as const },
];

export function AdminDashboard(): React.ReactElement {
  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        brand={<Logo variant="horizontal" bg="light" height={32} />}
        brandCollapsed={<Logo variant="mark" bg="light" height={32} />}
        sections={sections}
        topbar={
          <div style={{ width: '100%', maxWidth: 360 }}>
            <input className="input" placeholder="Buscar pedidos, productos, clientes…" />
          </div>
        }
        user={<Avatar name="Misael Ocas" size={32} />}
      >
        <PageHeader
          title="Resumen del día"
          description="Operación de la tienda al 17 de mayo"
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
            { key: 'id', header: 'Pedido', accessor: (r) => `#${r.id}` },
            { key: 'cliente', header: 'Cliente' },
            { key: 'total', header: 'Total', align: 'right' },
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
