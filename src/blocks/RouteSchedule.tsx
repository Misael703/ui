'use client';
/**
 * Block: weekly route schedule (Domain → Despachos). 7 days × N hours grid
 * with route blocks positioned by start/end time. The shape fits delivery
 * routes ("Ruta Las Condes — 6 paradas"), but the structure is general
 * enough to repurpose for appointments, vehicle bookings, or any time-
 * windowed event.
 *
 * Visual only — no drag-to-resize or DnD; click handlers are stubbed for
 * the consumer to wire up. The grid uses CSS Grid columns for days and
 * `gridRow: start / end` for absolute positioning of event blocks per hour
 * slot.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Button } from '../index';
import { ChevronLeft, ChevronRight, Plus } from '../components/Icons';

interface CalendarEvent {
  id: string;
  day: number; // 0 = Monday … 6 = Sunday
  startHour: number; // 0-23
  endHour: number;
  title: string;
  subtitle?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 … 19:00

const TONE_BG: Record<NonNullable<CalendarEvent['tone']>, string> = {
  primary: 'color-mix(in oklab, var(--color-primary) 18%, transparent)',
  success: 'color-mix(in oklab, var(--color-success, #16a34a) 18%, transparent)',
  warning: 'color-mix(in oklab, var(--color-warning, #d97706) 18%, transparent)',
  danger:  'color-mix(in oklab, var(--color-danger,  #dc2626) 18%, transparent)',
};
const TONE_FG: Record<NonNullable<CalendarEvent['tone']>, string> = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success, #16a34a)',
  warning: 'var(--color-warning, #d97706)',
  danger:  'var(--color-danger,  #dc2626)',
};

const EVENTS: CalendarEvent[] = [
  { id: 'e1', day: 0, startHour: 9,  endHour: 11, title: 'Ruta Las Condes',   subtitle: '6 paradas',  tone: 'primary' },
  { id: 'e2', day: 0, startHour: 14, endHour: 16, title: 'Ruta Providencia',  subtitle: '4 paradas',  tone: 'primary' },
  { id: 'e3', day: 1, startHour: 10, endHour: 12, title: 'Recibir pedido 4501', tone: 'success' },
  { id: 'e4', day: 2, startHour: 8,  endHour: 10, title: 'Cierre mensual',    subtitle: 'Contabilidad', tone: 'warning' },
  { id: 'e5', day: 2, startHour: 15, endHour: 17, title: 'Ruta Maipú',        subtitle: '8 paradas',  tone: 'primary' },
  { id: 'e6', day: 3, startHour: 9,  endHour: 18, title: 'Capacitación',      subtitle: 'Bsale v2',   tone: 'success' },
  { id: 'e7', day: 4, startHour: 11, endHour: 13, title: 'Reunión proveedor', tone: 'warning' },
  { id: 'e8', day: 4, startHour: 16, endHour: 19, title: 'Ruta La Florida',   subtitle: '12 paradas', tone: 'primary' },
];

const HOUR_HEIGHT = 48; // px

export function RouteSchedule(): React.ReactElement {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Calendario semanal"
        description="Semana del 11 al 17 de mayo, 2026"
        actions={
          <>
            <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="sm">Hoy</Button>
            <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
            <Button size="sm"><Plus size={14} style={{ marginRight: 6 }} /> Nuevo evento</Button>
          </>
        }
      />

      <div
        style={{
          marginTop: 24,
          flex: 1,
          minHeight: 0,
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Days header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `64px repeat(7, 1fr)`,
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-subtle, var(--bg-muted))',
          }}
        >
          <div />
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: 13,
                borderLeft: '1px solid var(--border-default)',
              }}
            >
              {d}
              <div className="cell-meta cell-mono">{11 + i}</div>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `64px repeat(7, 1fr)`,
              gridTemplateRows: `repeat(${HOURS.length}, ${HOUR_HEIGHT}px)`,
              position: 'relative',
            }}
          >
            {/* Hours column */}
            {HOURS.map((h) => (
              <div
                key={`hr-${h}`}
                className="cell-mono cell-meta"
                style={{
                  gridColumn: 1,
                  borderTop: '1px solid var(--border-default)',
                  padding: '4px 8px',
                  textAlign: 'right',
                }}
              >
                {h}:00
              </div>
            ))}

            {/* Day columns — empty cells, borders draw the grid */}
            {HOURS.map((_, hi) =>
              DAYS.map((_, di) => (
                <div
                  key={`cell-${hi}-${di}`}
                  style={{
                    gridColumn: di + 2,
                    gridRow: hi + 1,
                    borderTop: '1px solid var(--border-default)',
                    borderLeft: '1px solid var(--border-default)',
                  }}
                />
              )),
            )}

            {/* Events */}
            {EVENTS.map((e) => {
              const tone = e.tone ?? 'primary';
              const rowStart = e.startHour - HOURS[0] + 1;
              const rowEnd = e.endHour - HOURS[0] + 1;
              if (rowStart < 1 || rowEnd > HOURS.length + 1) return null;
              return (
                <button
                  key={e.id}
                  type="button"
                  style={{
                    gridColumn: e.day + 2,
                    gridRow: `${rowStart} / ${rowEnd}`,
                    margin: 2,
                    background: TONE_BG[tone],
                    color: TONE_FG[tone],
                    border: `1px solid ${TONE_FG[tone]}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{e.title}</div>
                  {e.subtitle && <div style={{ opacity: 0.85, marginTop: 2 }}>{e.subtitle}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
