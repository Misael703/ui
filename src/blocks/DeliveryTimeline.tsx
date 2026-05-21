'use client';
/**
 * Block: delivery timeline (Domain → Despachos). Vertical timeline of the
 * lifecycle of ONE delivery: when it was created, when it was prepared,
 * when the vehicle picked it up, when the driver arrived, when it was
 * delivered. Each event has timestamp + actor + optional photo / note.
 *
 * UX rationale (from Onfleet, FedEx tracking pages, Bringg):
 * - Vertical timeline (not horizontal Stepper): the events are temporal,
 *   not configuration steps, and users scan top-to-bottom looking for
 *   "what happened last."
 * - The CURRENT state has a distinct affordance (filled circle, brand
 *   color). Past = filled with success color. Future = hollow outline.
 *   The visual reads "where we are" without parsing labels.
 * - Each event surfaces ONE photo if relevant (proof of delivery, paquete
 *   recibido, firma) — collapsed inline, not in a separate tab.
 *
 * Pairs naturally with `DetailPage`: drop this as one of the tabs of an
 * order detail view.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, Badge, Button, Avatar } from '../index';
import { Check, MapPin, Package, Truck, CheckCircle, Eye } from '../components/Icons';

type EventStatus = 'done' | 'current' | 'pending';

interface DeliveryEvent {
  id: string;
  status: EventStatus;
  ts: string;
  actor: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  photo?: string;
}

const EVENTS: DeliveryEvent[] = [
  {
    id: '1', status: 'done', ts: '14 may 2026, 16:20', actor: 'Northwind Builders',
    title: 'Pedido creado',
    description: 'Cliente confirmó el pedido desde el portal web.',
    icon: <Package size={16} />,
  },
  {
    id: '2', status: 'done', ts: '14 may 2026, 17:45', actor: 'Carla Pizarro',
    title: 'Pago confirmado',
    description: 'Transferencia recibida · $1.245.000 · Banco Estado',
    icon: <Check size={16} />,
  },
  {
    id: '3', status: 'done', ts: '15 may 2026, 08:30', actor: 'Bodega central',
    title: 'Preparado en bodega',
    description: '3 SKUs · 8 unidades totales · embalaje estándar',
    icon: <Package size={16} />,
    photo: 'package',
  },
  {
    id: '4', status: 'done', ts: '15 may 2026, 09:10', actor: 'Diego Salinas',
    title: 'Cargado en vehículo',
    description: 'Camión 03 · PT-EX-94',
    icon: <Truck size={16} />,
  },
  {
    id: '5', status: 'current', ts: '15 may 2026, 11:00', actor: 'Diego Salinas',
    title: 'En ruta a la dirección',
    description: 'Av. Apoquindo 4500, Las Condes · ETA 11:45',
    icon: <MapPin size={16} />,
  },
  {
    id: '6', status: 'pending', ts: '—', actor: '—',
    title: 'Entregado',
    description: 'Esperando confirmación del receptor',
    icon: <CheckCircle size={16} />,
  },
];

const STATUS_COLOR: Record<EventStatus, string> = {
  done:    'var(--color-success, #16a34a)',
  current: 'var(--color-primary)',
  pending: 'var(--fg-muted)',
};

export function DeliveryTimeline(): React.ReactElement {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title={
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12 }}>
            <span>Pedido</span>
            <span className="cell-mono" style={{ color: 'var(--fg-muted)' }}>#1042</span>
          </span>
        }
        description="Northwind Builders · Av. Apoquindo 4500, Las Condes"
        meta={<Badge variant="primary" appearance="solid">En ruta</Badge>}
        actions={
          <>
            <Button variant="outline">Llamar al chofer</Button>
            <Button variant="outline">Reportar incidencia</Button>
          </>
        }
      />

      <Card style={{ marginTop: 24 }}>
        <CardBody>
          <h3 className="h4" style={{ marginTop: 0, marginBottom: 16 }}>Estado de la entrega</h3>

          {/* Vertical timeline. Each event is a row; the dot+line on the
              left is a single column, the content fills the rest. */}
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {EVENTS.map((e, i) => {
              const isLast = i === EVENTS.length - 1;
              const color = STATUS_COLOR[e.status];
              return (
                <li
                  key={e.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr',
                    gap: 16,
                    paddingBottom: isLast ? 0 : 20,
                  }}
                >
                  {/* Dot + connector line */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    {/* Connector below the dot, drawn unless last */}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          top: 32,
                          bottom: -20,
                          width: 2,
                          background:
                            e.status === 'done'
                              ? STATUS_COLOR.done
                              : 'var(--border-default)',
                        }}
                      />
                    )}
                    {/* Dot */}
                    <div
                      aria-hidden="true"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: e.status === 'pending' ? 'var(--bg-surface)' : color,
                        border: e.status === 'pending' ? '2px solid var(--border-default)' : 'none',
                        color: e.status === 'pending' ? 'var(--fg-muted)' : 'var(--color-white)',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: e.status === 'current' ? `0 0 0 4px color-mix(in oklab, ${color} 20%, transparent)` : 'none',
                      }}
                    >
                      {e.icon}
                    </div>
                  </div>

                  {/* Event content */}
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: e.status === 'current' ? 600 : 500,
                          color: e.status === 'pending' ? 'var(--fg-muted)' : 'var(--fg-default)',
                        }}
                      >
                        {e.title}
                      </span>
                      <span className="cell-meta cell-mono">{e.ts}</span>
                    </div>
                    <div className="cell-meta" style={{ marginTop: 4 }}>
                      {e.description}
                    </div>
                    {e.actor !== '—' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <Avatar name={e.actor} size={24} />
                        <span className="cell-meta">{e.actor}</span>
                      </div>
                    )}
                    {/* Photo block — only on events that have one */}
                    {e.photo && (
                      <button
                        type="button"
                        aria-label="Ver foto del evento"
                        style={{
                          marginTop: 12,
                          width: 120,
                          height: 90,
                          border: '1px solid var(--border-default)',
                          background: 'var(--bg-muted)',
                          borderRadius: 'var(--radius-md)',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'var(--fg-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={20} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
