'use client';
/**
 * Block: dispatch board (Domain → Despachos). Kanban-style operational view
 * where each column is a stage in the dispatch lifecycle and each card is
 * a delivery order. This is the **center of operation** for any
 * logistics-leaning app — what the dispatcher stares at all day.
 *
 * UX rationale (from Onfleet, Bringg, Routific):
 * - Columns mirror the real pipeline stages, not arbitrary buckets, so
 *   stage transitions read as physical movement.
 * - Each card surfaces the four things a dispatcher decides on at a
 *   glance: who (cliente), where (zona), when (ETA), and load (paradas).
 * - Driver assignment lives ON the card (avatar + chip) — no extra click
 *   to see who's responsible.
 *
 * No DnD wired (deliberate — pick dnd-kit, react-beautiful-dnd, or HTML5
 * native and lift drag state to your store).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, Badge, Avatar, Button } from '../index';
import { MapPin, Clock, Package, Plus, MoreHorizontal } from '../components/Icons';

type Stage = 'por-confirmar' | 'preparando' | 'listo' | 'en-ruta' | 'entregado';

interface Order {
  id: string;
  cliente: string;
  zona: string;
  paradas: number;
  eta?: string;
  driver?: string;
  priority: 'low' | 'med' | 'high';
}

interface Column {
  id: Stage;
  label: string;
  hint: string;
  orders: Order[];
}

const PRIORITY_DOT: Record<Order['priority'], string> = {
  low:  'var(--fg-muted)',
  med:  'var(--color-warning, #d97706)',
  high: 'var(--color-danger, #dc2626)',
};

const INITIAL: Column[] = [
  {
    id: 'por-confirmar',
    label: 'Por confirmar',
    hint: 'Esperan confirmación del cliente',
    orders: [
      { id: '1045', cliente: 'Constructora del Sur',  zona: 'La Florida',   paradas: 1, eta: 'Mañana', priority: 'med' },
      { id: '1046', cliente: 'Ferretería Centro',     zona: 'Santiago',     paradas: 2, priority: 'low' },
    ],
  },
  {
    id: 'preparando',
    label: 'Preparando',
    hint: 'Picking en bodega',
    orders: [
      { id: '1043', cliente: 'Northwind Builders',    zona: 'Las Condes',   paradas: 3, eta: 'Hoy 14:00', driver: 'Carla Pizarro', priority: 'high' },
      { id: '1044', cliente: 'Casa & Construcción',   zona: 'Providencia',  paradas: 1, eta: 'Hoy 15:30', driver: 'Carla Pizarro', priority: 'med' },
    ],
  },
  {
    id: 'listo',
    label: 'Listo para despachar',
    hint: 'En andén, esperando chofer',
    orders: [
      { id: '1042', cliente: 'Edificio Apoquindo 500', zona: 'Las Condes',  paradas: 1, eta: 'Hoy 12:30', priority: 'high' },
    ],
  },
  {
    id: 'en-ruta',
    label: 'En ruta',
    hint: '2 vehículos activos',
    orders: [
      { id: '1041', cliente: 'Maestranza Norte',      zona: 'Quilicura',     paradas: 4, eta: '11:45', driver: 'Diego Salinas', priority: 'med' },
      { id: '1040', cliente: 'Constructora Norte',    zona: 'Recoleta',      paradas: 2, eta: '11:20', driver: 'Diego Salinas', priority: 'high' },
    ],
  },
  {
    id: 'entregado',
    label: 'Entregado',
    hint: 'Hoy',
    orders: [
      { id: '1039', cliente: 'Ferretería Sur',        zona: 'San Miguel',   paradas: 3, driver: 'Diego Salinas', priority: 'low' },
      { id: '1038', cliente: 'Inmobiliaria Oeste',    zona: 'Maipú',        paradas: 1, driver: 'Carla Pizarro', priority: 'low' },
    ],
  },
];

export function DispatchBoard(): React.ReactElement {
  const [columns] = React.useState<Column[]>(INITIAL);
  const totalActive = columns
    .filter((c) => c.id !== 'entregado')
    .reduce((n, c) => n + c.orders.length, 0);

  return (
    <div style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Tablero de despachos"
        description={`${totalActive} órdenes activas · ${columns[3].orders.length} en ruta`}
        actions={<Button><Plus size={16} style={{ marginRight: 6 }} /> Nueva orden</Button>}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))`,
          gap: 16,
          marginTop: 24,
          overflowX: 'auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        {columns.map((col) => (
          <div
            key={col.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-muted)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              minHeight: 0,
            }}
          >
            {/* Column header — label + hint + count */}
            <div style={{ marginBottom: 12, paddingLeft: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>{col.label}</strong>
                  <Badge variant="neutral">{col.orders.length}</Badge>
                </div>
                <button
                  type="button"
                  aria-label={`Más opciones en ${col.label}`}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="cell-meta" style={{ marginTop: 2 }}>{col.hint}</div>
            </div>

            {/* Orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', minHeight: 0 }}>
              {col.orders.map((o) => (
                <Card key={o.id} style={{ cursor: 'grab' }}>
                  <CardBody style={{ padding: 12 }}>
                    {/* Header: priority + order id */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          aria-hidden="true"
                          style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_DOT[o.priority] }}
                        />
                        <span className="cell-mono cell-meta">#{o.id}</span>
                      </div>
                      {o.eta && (
                        <span className="cell-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {o.eta}
                        </span>
                      )}
                    </div>

                    {/* Cliente */}
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{o.cliente}</div>

                    {/* Zona + paradas */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, color: 'var(--fg-muted)', fontSize: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {o.zona}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Package size={12} /> {o.paradas} {o.paradas === 1 ? 'parada' : 'paradas'}
                      </span>
                    </div>

                    {/* Driver assignment */}
                    {o.driver ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-default)' }}>
                        <Avatar name={o.driver} size={24} />
                        <span className="cell-meta">{o.driver}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        style={{
                          padding: '6px 8px',
                          border: '1px dashed var(--border-default)',
                          background: 'transparent',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--fg-muted)',
                          fontSize: 12,
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                        }}
                      >
                        + Asignar chofer
                      </button>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
