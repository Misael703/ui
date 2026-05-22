'use client';
/**
 * Block: rental operations board (Domain → Rentools). Kanban where columns
 * are the rental lifecycle and cards are active rentals. The operational
 * center for a rental yard.
 *
 * UX rationale:
 * - Columns mirror the real lifecycle: Reservado → Entregado → En uso →
 *   Por devolver → Devuelto, plus an **Atrasado** column that pulls overdue
 *   rentals out of the flow — the one state that costs money (multa) and
 *   needs eyes on it first.
 * - Each card shows días restantes (or días de atraso, in red): the
 *   single number the yard manager scans for.
 *
 * No DnD wired (deliberate — pick dnd-kit / react-beautiful-dnd / native).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, Badge, Avatar, Button } from '../index';
import { Plus, MoreHorizontal, Clock } from '../components/Icons';

type Stage = 'reservado' | 'entregado' | 'en-uso' | 'por-devolver' | 'devuelto' | 'atrasado';

interface Rental {
  id: string;
  tool: string;
  sku: string;
  cliente: string;
  /** Days left in the rental; negative = overdue. */
  daysLeft: number;
  rate: string;
}

interface Column {
  id: Stage;
  label: string;
  tone?: 'danger';
  rentals: Rental[];
}

const COLUMNS: Column[] = [
  {
    id: 'atrasado', label: 'Atrasado', tone: 'danger',
    rentals: [
      { id: 'R-1018', tool: 'Martillo demoledor', sku: 'DEM-15', cliente: 'Obras del Maule', daysLeft: -2, rate: '$18.000/día' },
    ],
  },
  {
    id: 'reservado', label: 'Reservado',
    rentals: [
      { id: 'R-1025', tool: 'Andamio modular 4m', sku: 'AND-4M', cliente: 'Constructora del Sur', daysLeft: 5, rate: '$14.000/día' },
      { id: 'R-1026', tool: 'Placa compactadora', sku: 'CMP-01', cliente: 'Vialidad Norte', daysLeft: 7, rate: '$22.000/día' },
    ],
  },
  {
    id: 'entregado', label: 'Entregado',
    rentals: [
      { id: 'R-1022', tool: 'Generador 5kVA', sku: 'GEN-5K', cliente: 'Maestranza Norte', daysLeft: 3, rate: '$25.000/día' },
    ],
  },
  {
    id: 'en-uso', label: 'En uso',
    rentals: [
      { id: 'R-1019', tool: 'Torre de iluminación', sku: 'ILU-TR', cliente: 'Eventos Sur', daysLeft: 1, rate: '$30.000/día' },
      { id: 'R-1020', tool: 'Mezcladora concreto', sku: 'MEZ-150', cliente: 'Hormigones Lago', daysLeft: 4, rate: '$15.000/día' },
    ],
  },
  {
    id: 'por-devolver', label: 'Por devolver',
    rentals: [
      { id: 'R-1015', tool: 'Cortadora pavimento', sku: 'COR-PV', cliente: 'Pavimentos RM', daysLeft: 0, rate: '$28.000/día' },
    ],
  },
  {
    id: 'devuelto', label: 'Devuelto',
    rentals: [
      { id: 'R-1012', tool: 'Andamio modular 2m', sku: 'AND-2M', cliente: 'Constructora Centro', daysLeft: 0, rate: '$8.000/día' },
    ],
  },
];

function daysChip(daysLeft: number): React.ReactNode {
  if (daysLeft < 0) {
    return <Badge variant="danger">{Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'día' : 'días'} de atraso</Badge>;
  }
  if (daysLeft === 0) return <Badge variant="warning">Vence hoy</Badge>;
  return (
    <span className="cell-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Clock size={12} /> {daysLeft} {daysLeft === 1 ? 'día' : 'días'} restantes
    </span>
  );
}

export function RentalBoard(): React.ReactElement {
  const [columns] = React.useState<Column[]>(COLUMNS);
  const overdue = columns.find((c) => c.id === 'atrasado')?.rentals.length ?? 0;
  const active = columns.filter((c) => c.id !== 'devuelto').reduce((n, c) => n + c.rentals.length, 0);

  return (
    <div style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Tablero de arriendos"
        description={`${active} arriendos activos${overdue ? ` · ${overdue} atrasado${overdue > 1 ? 's' : ''}` : ''}`}
        actions={<Button><Plus size={16} style={{ marginRight: 6 }} /> Nuevo arriendo</Button>}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))`,
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
              background: col.tone === 'danger' ? 'color-mix(in oklab, var(--color-danger, #dc2626) 8%, var(--bg-muted))' : 'var(--bg-muted)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              minHeight: 0,
              border: col.tone === 'danger' ? '1px solid color-mix(in oklab, var(--color-danger, #dc2626) 30%, transparent)' : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ color: col.tone === 'danger' ? 'var(--color-danger, #dc2626)' : 'var(--fg-default)' }}>{col.label}</strong>
                <Badge variant={col.tone === 'danger' ? 'danger' : 'neutral'}>{col.rentals.length}</Badge>
              </div>
              <button
                type="button"
                aria-label={`Más opciones en ${col.label}`}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', minHeight: 0 }}>
              {col.rentals.map((r) => (
                <Card key={r.id} style={{ cursor: 'grab' }}>
                  <CardBody style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="cell-mono cell-meta">{r.id}</span>
                      <span className="cell-meta cell-mono">{r.sku}</span>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.tool}</div>
                    <div className="cell-meta cell-mono" style={{ marginBottom: 10 }}>{r.rate}</div>
                    <div style={{ marginBottom: 10 }}>{daysChip(r.daysLeft)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-default)' }}>
                      <Avatar name={r.cliente} size={24} />
                      <span className="cell-meta" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.cliente}</span>
                    </div>
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
