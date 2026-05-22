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
              <FieldList>
                <Field label="Equipo">{RENTAL.tool}</Field>
                <Field label="SKU" mono>{RENTAL.sku}</Field>
                <Field label="Cliente">{RENTAL.cliente}</Field>
                <Field label="RUT" mono>{RENTAL.rut}</Field>
                <Field label="Periodo" mono>{RENTAL.from} → {RENTAL.to}</Field>
                <Field label="Días" mono>{RENTAL.days}</Field>
              </FieldList>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="h4" style={{ margin: 0 }}>Costos</h3></CardHeader>
            <CardBody>
              <FieldList>
                <Field label="Tarifa/día" mono>${RENTAL.ratePerDay.toLocaleString('es-CL')}</Field>
                <Field label="Total" mono><strong>${rentalTotal.toLocaleString('es-CL')}</strong></Field>
                <Field label="Garantía" mono>${RENTAL.deposit.toLocaleString('es-CL')}</Field>
              </FieldList>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/**
 * Stacked field: label above, value below at full width. Better than a
 * 2-column KeyValue inside a narrow sidebar — the value gets the full card
 * width so mono values (RUT, dates) don't wrap mid-token.
 */
function FieldList({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>;
}

function Field({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="cell-meta" style={{ marginBottom: 2 }}>{label}</div>
      <div className={mono ? 'cell-mono' : undefined}>{children}</div>
    </div>
  );
}
