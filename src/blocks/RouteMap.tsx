'use client';
/**
 * Block: route map view (Domain → Despachos). The visual flagship of any
 * dispatch UI: sidebar with ordered stops on the left, map area on the
 * right with numbered markers connected by a polyline and a current-vehicle
 * indicator.
 *
 * UX rationale (from Onfleet, Routific, Bringg):
 * - Two synchronized panels: the LIST and the MAP read the same data; the
 *   list dominates for scanning ("¿cuántas paradas faltan?"), the map
 *   dominates for spatial relationships ("¿qué está más cerca de aquí?").
 *   The kit always renders both — picking only one penalises one of those
 *   modes of thinking.
 * - Each stop has THREE persistent affordances: the number (sequence),
 *   the status (pending/visited/current), and the ETA. Anything else is
 *   secondary.
 * - The current vehicle marker has a distinct shape (pulsing dot) so it
 *   never gets confused with a stop marker.
 *
 * IMPORTANT: this is a **VISUAL MOCK**. The map area is hand-drawn SVG
 * with positioned markers. In your app, replace `<MapMock>` with the
 * library of your choice (Mapbox GL JS, Leaflet, Google Maps). The list
 * panel stays as-is and feeds coordinates to your map component.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, Badge, Avatar, Button } from '../index';
import { Truck, Clock, Check } from '../components/Icons';

interface Stop {
  id: string;
  seq: number;
  cliente: string;
  address: string;
  eta: string;
  status: 'visited' | 'current' | 'pending';
  /** Mock position (% of the map area, 0-100). In production, derive from lat/lng. */
  x: number;
  y: number;
}

const ROUTE: Stop[] = [
  { id: 's1', seq: 1, cliente: 'Edificio Apoquindo 500', address: 'Apoquindo 500, Las Condes',    eta: '09:30', status: 'visited', x: 20, y: 30 },
  { id: 's2', seq: 2, cliente: 'Northwind Builders',      address: 'Av. Vitacura 4500, Vitacura', eta: '10:15', status: 'visited', x: 38, y: 22 },
  { id: 's3', seq: 3, cliente: 'Constructora Norte',      address: 'Av. Kennedy 7800, Las Condes',eta: '11:00', status: 'current', x: 55, y: 35 },
  { id: 's4', seq: 4, cliente: 'Casa & Construcción',     address: 'Av. Tobalaba 12, Providencia',eta: '11:45', status: 'pending', x: 68, y: 55 },
  { id: 's5', seq: 5, cliente: 'Maestranza Norte',        address: 'San Eugenio 320, Ñuñoa',      eta: '12:30', status: 'pending', x: 78, y: 72 },
  { id: 's6', seq: 6, cliente: 'Ferretería Centro',       address: 'Bandera 380, Santiago',       eta: '13:15', status: 'pending', x: 50, y: 80 },
];

const STATUS_COLOR: Record<Stop['status'], string> = {
  visited: 'var(--color-success, #16a34a)',
  current: 'var(--color-primary)',
  pending: 'var(--fg-muted)',
};

export function RouteMap(): React.ReactElement {
  const visited = ROUTE.filter((s) => s.status === 'visited').length;
  const current = ROUTE.find((s) => s.status === 'current');
  const totalDistance = '42 km';
  const totalTime = '3 h 45 min';

  return (
    <div style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Ruta del día — Diego Salinas"
        description={`${visited} de ${ROUTE.length} paradas completadas · ${totalDistance} · ${totalTime}`}
        meta={<Badge variant="primary" appearance="solid">En ruta</Badge>}
        actions={
          <>
            <Button variant="outline">Reasignar chofer</Button>
            <Button variant="outline">Imprimir hoja</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, marginTop: 24, flex: 1, minHeight: 0 }}>
        {/* LIST panel — ordered stops */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '16px 16px 0' }}>
            <h3 className="h4" style={{ margin: 0 }}>Paradas</h3>
            <p className="cell-meta" style={{ marginTop: 4 }}>Orden optimizado por proximidad</p>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', overflowY: 'auto', flex: 1 }}>
            {ROUTE.map((stop) => (
              <li
                key={stop.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderTop: '1px solid var(--border-default)',
                  background: stop.status === 'current' ? 'var(--bg-muted)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {/* Sequence marker */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: stop.status === 'visited' ? STATUS_COLOR.visited : stop.status === 'current' ? STATUS_COLOR.current : 'var(--bg-surface)',
                    border: stop.status === 'pending' ? '2px solid var(--border-default)' : 'none',
                    color: stop.status === 'pending' ? 'var(--fg-muted)' : 'var(--color-white)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {stop.status === 'visited' ? <Check size={14} /> : stop.seq}
                </div>

                {/* Cliente + address */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: stop.status === 'current' ? 600 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: stop.status === 'visited' ? 'var(--fg-muted)' : 'var(--fg-default)',
                    }}
                  >
                    {stop.cliente}
                  </div>
                  <div className="cell-meta" style={{ marginTop: 2 }}>{stop.address}</div>
                </div>

                {/* ETA */}
                <span
                  className="cell-mono"
                  style={{
                    fontSize: 12,
                    color: stop.status === 'current' ? 'var(--color-primary)' : 'var(--fg-muted)',
                    fontWeight: stop.status === 'current' ? 600 : 400,
                  }}
                >
                  {stop.eta}
                </span>
              </li>
            ))}
          </ol>

          {/* Footer: current driver + ETA next stop */}
          {current && (
            <div style={{ padding: 16, borderTop: '1px solid var(--border-default)', background: 'var(--bg-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name="Diego Salinas" size={32} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Próxima: {current.cliente}</div>
                  <div className="cell-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Llegando {current.eta}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* MAP panel — mock SVG. Replace with Mapbox/Leaflet/Google in your app. */}
        <MapMock stops={ROUTE} />
      </div>
    </div>
  );
}

function MapMock({ stops }: { stops: Stop[] }) {
  // Build the polyline path from stops, in sequence.
  const path = stops.map((s, i) => `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`).join(' ');
  const current = stops.find((s) => s.status === 'current');

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <CardBody style={{ padding: 0, flex: 1, minHeight: 0, position: 'relative' }}>
        {/* Watermark "replace me" disclosure */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: 11,
            color: 'var(--fg-muted)',
            zIndex: 1,
          }}
          className="cell-meta"
        >
          Mock visual — conectá Mapbox/Leaflet
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(180deg, color-mix(in oklab, var(--bg-muted) 60%, transparent), var(--bg-muted))',
            display: 'block',
          }}
          role="img"
          aria-label="Mapa de la ruta con paradas numeradas"
        >
          {/* Decorative streets grid */}
          <g stroke="var(--border-default)" strokeWidth="0.15" opacity="0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
            ))}
          </g>

          {/* Polyline of the route */}
          <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="0.6" strokeDasharray="1.5 0.8" opacity="0.7" />

          {/* Numbered stop markers */}
          {stops.map((s) => (
            <g key={s.id}>
              <circle
                cx={s.x}
                cy={s.y}
                r="2.6"
                fill={
                  s.status === 'visited' ? 'var(--color-success, #16a34a)' :
                  s.status === 'current' ? 'var(--color-primary)' :
                  'var(--bg-surface)'
                }
                stroke={s.status === 'pending' ? 'var(--border-strong)' : 'transparent'}
                strokeWidth="0.4"
              />
              <text
                x={s.x}
                y={s.y + 0.9}
                textAnchor="middle"
                fontSize="2.5"
                fontWeight="700"
                fill={s.status === 'pending' ? 'var(--fg-muted)' : 'var(--color-white)'}
                style={{ pointerEvents: 'none' }}
              >
                {s.seq}
              </text>
            </g>
          ))}

          {/* Vehicle indicator — pulsing dot on the current stop */}
          {current && (
            <g>
              <circle cx={current.x} cy={current.y} r="5" fill="var(--color-primary)" opacity="0.2">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>

        {/* Vehicle chip — bottom-left overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            padding: '8px 12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
          }}
        >
          <Truck size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Camión 03</div>
            <div className="cell-meta cell-mono">PT-EX-94</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
