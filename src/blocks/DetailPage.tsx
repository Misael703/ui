'use client';
/**
 * Block: entity detail page (the opposite of `DataTablePage` — viewing ONE
 * record instead of a list of them). Composed of:
 *
 * - `PageHeader` with title, status `Badge`, breadcrumb back-link, actions
 * - `Tabs` to slice the entity (Información · Historial · Relacionados)
 * - Two-column layout: main content + sticky meta sidebar (`KeyValue`)
 *
 * Example: a Pedido. Swap the data shape and tabs to fit your domain.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Badge,
  Button,
  KeyValue,
  KeyValueRow,
  DataTable,
} from '../index';

const order = {
  id: '1042',
  cliente: 'Northwind Builders',
  rut: '76.123.456-7',
  total: 1245000,
  estado: 'Despachado',
  fechaPedido: '14 may 2026',
  fechaDespacho: '15 may 2026',
  vendedor: 'Carla Pizarro',
  metodoPago: 'Transferencia',
};

const items = [
  { id: 'a', producto: 'Taladro percutor 700W', sku: 'TLD-700', cantidad: 3, precio: 64990 },
  { id: 'b', producto: 'Sierra circular 7-1/4"', sku: 'SRR-7', cantidad: 1, precio: 134900 },
  { id: 'c', producto: 'Pintura látex blanca 1gal', sku: 'PNT-01', cantidad: 4, precio: 12990 },
];

const history = [
  { id: '1', ts: '15 may, 14:32', actor: 'Carla Pizarro', evento: 'Marcó como despachado' },
  { id: '2', ts: '15 may, 09:10', actor: 'Sistema', evento: 'Generó guía de despacho' },
  { id: '3', ts: '14 may, 17:45', actor: 'Carla Pizarro', evento: 'Confirmó pago' },
  { id: '4', ts: '14 may, 16:20', actor: 'Northwind Builders', evento: 'Creó el pedido' },
];

export function DetailPage(): React.ReactElement {
  const [tab, setTab] = React.useState('info');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title={
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12 }}>
            <span>Pedido</span>
            <span className="cell-mono" style={{ color: 'var(--fg-muted)' }}>#{order.id}</span>
          </span>
        }
        description={`Creado el ${order.fechaPedido} · ${order.cliente}`}
        breadcrumbs={[
          { label: 'Pedidos', href: '#' },
          { label: `#${order.id}` },
        ]}
        meta={<Badge variant="success">{order.estado}</Badge>}
        actions={
          <>
            <Button variant="outline">Imprimir</Button>
            <Button>Editar</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start', marginTop: 24 }}>
        {/* MAIN — tabs + content */}
        <div>
          <Tabs value={tab} onChange={setTab}>
            <TabList>
              <Tab value="info">Información</Tab>
              <Tab value="historial">Historial</Tab>
              <Tab value="relacionados">Relacionados</Tab>
            </TabList>

            <TabPanel value="info">
              <Card style={{ marginTop: 16 }}>
                <CardHeader>
                  <h3 className="h4" style={{ margin: 0 }}>Items del pedido</h3>
                </CardHeader>
                <CardBody style={{ padding: 0 }}>
                  <DataTable
                    rows={items}
                    rowKey={(r) => r.id}
                    ariaLabel="Items del pedido"
                    columns={[
                      {
                        key: 'producto',
                        header: 'Producto',
                        accessor: (r) => (
                          <>
                            <span>{r.producto}</span>
                            <span className="cell-meta cell-mono">{r.sku}</span>
                          </>
                        ),
                      },
                      { key: 'cantidad', header: 'Cant.', align: 'right', accessor: (r) => <span className="cell-mono">{r.cantidad}</span> },
                      { key: 'precio', header: 'Precio', align: 'right', accessor: (r) => <span className="cell-mono">${r.precio.toLocaleString('es-CL')}</span> },
                      {
                        key: 'subtotal',
                        header: 'Subtotal',
                        align: 'right',
                        accessor: (r) => <span className="cell-mono"><strong>${(r.cantidad * r.precio).toLocaleString('es-CL')}</strong></span>,
                      },
                    ]}
                  />
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel value="historial">
              <Card style={{ marginTop: 16 }}>
                <CardBody>
                  <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {history.map((h) => (
                      <li key={h.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
                        <span className="cell-mono" style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{h.ts}</span>
                        <div>
                          <div>{h.evento}</div>
                          <div className="cell-meta">{h.actor}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel value="relacionados">
              <Card style={{ marginTop: 16 }}>
                <CardBody>
                  <p style={{ margin: 0, color: 'var(--fg-muted)' }}>Sin pedidos relacionados.</p>
                </CardBody>
              </Card>
            </TabPanel>
          </Tabs>
        </div>

        {/* META — sticky sidebar */}
        <aside style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader>
              <h3 className="h4" style={{ margin: 0 }}>Detalles</h3>
            </CardHeader>
            <CardBody>
              <KeyValue keyWidth={120}>
                <KeyValueRow label="Cliente">{order.cliente}</KeyValueRow>
                <KeyValueRow label="RUT"><span className="cell-mono">{order.rut}</span></KeyValueRow>
                <KeyValueRow label="Vendedor">{order.vendedor}</KeyValueRow>
                <KeyValueRow label="Método pago">{order.metodoPago}</KeyValueRow>
                <KeyValueRow label="Despacho">{order.fechaDespacho}</KeyValueRow>
                <KeyValueRow label="Total"><span className="cell-mono"><strong>${order.total.toLocaleString('es-CL')}</strong></span></KeyValueRow>
              </KeyValue>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
