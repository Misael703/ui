'use client';
/**
 * Block: equipment availability calendar (Domain → Rentools). Month view of
 * ONE piece of equipment: which days it's rented, in maintenance, or free.
 * Answers the rubro's defining question — "¿está disponible cuándo?".
 *
 * UX rationale:
 * - Uses the kit's `Calendar` with tone-coded events: rented (danger),
 *   maintenance (warning). Free days carry no event — absence reads as
 *   availability, which is the lighter cognitive default.
 * - A legend + an upcoming-reservations list sit beside the calendar: the
 *   calendar answers "when", the list answers "who and how long".
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, CardHeader, Calendar, Badge, Avatar, Button, type CalendarEvent } from '../index';

const Y = 2026;
const M = 4; // mayo (0-indexed)

// Booked / maintenance days for the shown month. Free days carry no event.
const RESERVATIONS = [
  { from: 3, to: 6,  cliente: 'Constructora del Sur', label: 'Arrendado' },
  { from: 12, to: 15, cliente: 'Maestranza Norte',     label: 'Arrendado' },
  { from: 24, to: 27, cliente: 'Obras Civiles SpA',    label: 'Arrendado' },
];
const MAINTENANCE = [{ day: 9, label: 'Mantención' }];

function buildEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const r of RESERVATIONS) {
    for (let d = r.from; d <= r.to; d++) {
      events.push({ date: new Date(Y, M, d), label: r.label, tone: 'danger' });
    }
  }
  for (const m of MAINTENANCE) {
    events.push({ date: new Date(Y, M, m.day), label: m.label, tone: 'warning' });
  }
  return events;
}

export function AvailabilityCalendar(): React.ReactElement {
  const events = React.useMemo(buildEvents, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title="Disponibilidad — Generador eléctrico 5kVA"
        description="SKU GEN-5K · 1 unidad"
        actions={<Button>Reservar fechas libres</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start', marginTop: 24 }}>
        {/* Calendar */}
        <Card>
          <CardBody>
            <Calendar month={new Date(Y, M, 1)} events={events} />
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              <LegendDot color="var(--color-danger, #dc2626)" label="Arrendado" />
              <LegendDot color="var(--color-warning, #d97706)" label="Mantención" />
              <LegendDot color="var(--border-strong)" label="Disponible" />
            </div>
          </CardBody>
        </Card>

        {/* Upcoming reservations */}
        <aside style={{ position: 'sticky', top: 24 }}>
          <Card>
            <CardHeader>
              <h3 className="h4" style={{ margin: 0 }}>Próximas reservas</h3>
            </CardHeader>
            <CardBody style={{ padding: 0 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {RESERVATIONS.map((r, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 16px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-default)',
                    }}
                  >
                    <Avatar name={r.cliente} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.cliente}
                      </div>
                      <div className="cell-meta cell-mono">{r.from}–{r.to} may</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Badge variant="success">18 días libres este mes</Badge>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)' }}>
      <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}
