'use client';
/**
 * Block: rental detail (Domain → Rentools). The single-rental view: header
 * with status + actions, a vertical lifecycle timeline (Reservado →
 * Entregado → En uso → Devuelto), and a sticky meta sidebar with the
 * equipment, customer, period, and cost/deposit breakdown.
 *
 * Combines the DetailPage layout with a DeliveryTimeline-style status track,
 * specialized for a rental's money + dates.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  KeyValue,
  KeyValueRow,
} from '../index';
import { Check, Package, Truck, MapPin, CheckCircle } from '../components/Icons';

type EventStatus = 'done' | 'current' | 'pending';

interface TimelineEvent {
  id: string;
  status: EventStatus;
  ts: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const RENTAL = {
  id: 'R-1022',
  tool: 'Generador eléctrico 5kVA',
  sku: 'GEN-5K',
  cliente: 'Maestranza Norte',
  rut: '76.345.678-9',
  from: '13-05-2026',
  to: '20-05-2026',
  days: 8,
  ratePerDay: 25000,
  deposit: 200000,
};

const EVENTS: TimelineEvent[] = [
  { id: '1', status: 'done',    ts: '12 may, 16:00', title: 'Reservado',  description: 'Reserva confirmada · garantía retenida', icon: <Package size={16} /> },
  { id: '2', status: 'done',    ts: '13 may, 09:30', title: 'Entregado',  description: 'Retiro en sucursal · contrato firmado', icon: <Truck size={16} /> },
  { id: '3', status: 'current', ts: '13–20 may',     title: 'En uso',      description: 'En obra del cliente · vence 20 may', icon: <MapPin size={16} /> },
  { id: '4', status: 'pending', ts: '—',             title: 'Devuelto',    description: 'Pendiente de inspección de devolución', icon: <CheckCircle size={16} /> },
];

const STATUS_COLOR: Record<EventStatus, string> = {
  done: 'var(--color-success, #16a34a)',
  current: 'var(--color-primary)',
  pending: 'var(--fg-muted)',
};

export function RentalDetail(): React.ReactElement {
  const rentalTotal = RENTAL.days * RENTAL.ratePerDay;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title={
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12 }}>
            <span>Arriendo</span>
            <span className="cell-mono" style={{ color: 'var(--fg-muted)' }}>{RENTAL.id}</span>
          </span>
        }
        description={`${RENTAL.tool} · ${RENTAL.cliente}`}
        breadcrumbs={[{ label: 'Arriendos', href: '#' }, { label: RENTAL.id }]}
        meta={<Badge variant="primary" appearance="solid">En uso</Badge>}
        actions={
          <>
            <Button variant="outline">Registrar devolución</Button>
            <Button variant="outline">Ver contrato</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start', marginTop: 24 }}>
        {/* Timeline */}
        <Card>
          <CardHeader><h3 className="h4" style={{ margin: 0 }}>Estado del arriendo</h3></CardHeader>
          <CardBody>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {EVENTS.map((e, i) => {
                const isLast = i === EVENTS.length - 1;
                const color = STATUS_COLOR[e.status];
                return (
                  <li key={e.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 16, paddingBottom: isLast ? 0 : 20 }}>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                      {!isLast && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute', top: 32, bottom: -20, width: 2,
                            background: e.status === 'done' ? STATUS_COLOR.done : 'var(--border-default)',
                          }}
                        />
                      )}
                      <div
                        aria-hidden="true"
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: e.status === 'pending' ? 'var(--bg-surface)' : color,
                          border: e.status === 'pending' ? '2px solid var(--border-default)' : 'none',
                          color: e.status === 'pending' ? 'var(--fg-muted)' : 'var(--color-white)',
                          display: 'grid', placeItems: 'center', position: 'relative', zIndex: 1,
                          boxShadow: e.status === 'current' ? `0 0 0 4px color-mix(in oklab, ${color} 20%, transparent)` : 'none',
                        }}
                      >
                        {e.status === 'done' ? <Check size={16} /> : e.icon}
                      </div>
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: e.status === 'current' ? 600 : 500, color: e.status === 'pending' ? 'var(--fg-muted)' : 'var(--fg-default)' }}>
                          {e.title}
                        </span>
                        <span className="cell-meta cell-mono">{e.ts}</span>
                      </div>
                      <div className="cell-meta" style={{ marginTop: 4 }}>{e.description}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardBody>
        </Card>

        {/* Meta sidebar */}
        <aside style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardHeader><h3 className="h4" style={{ margin: 0 }}>Detalles</h3></CardHeader>
            <CardBody>
              <KeyValue keyWidth={110}>
                <KeyValueRow label="Equipo">{RENTAL.tool}</KeyValueRow>
                <KeyValueRow label="SKU"><span className="cell-mono">{RENTAL.sku}</span></KeyValueRow>
                <KeyValueRow label="Cliente">{RENTAL.cliente}</KeyValueRow>
                <KeyValueRow label="RUT"><span className="cell-mono">{RENTAL.rut}</span></KeyValueRow>
                <KeyValueRow label="Periodo"><span className="cell-mono">{RENTAL.from} → {RENTAL.to}</span></KeyValueRow>
                <KeyValueRow label="Días"><span className="cell-mono">{RENTAL.days}</span></KeyValueRow>
              </KeyValue>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="h4" style={{ margin: 0 }}>Costos</h3></CardHeader>
            <CardBody>
              <KeyValue keyWidth={110}>
                <KeyValueRow label="Tarifa/día"><span className="cell-mono">${RENTAL.ratePerDay.toLocaleString('es-CL')}</span></KeyValueRow>
                <KeyValueRow label="Total"><span className="cell-mono"><strong>${rentalTotal.toLocaleString('es-CL')}</strong></span></KeyValueRow>
                <KeyValueRow label="Garantía"><span className="cell-mono">${RENTAL.deposit.toLocaleString('es-CL')}</span></KeyValueRow>
              </KeyValue>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
