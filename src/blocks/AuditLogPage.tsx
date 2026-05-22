'use client';
/**
 * Block: audit log page. Chronological DataTable of system events; clicking
 * an "edit" row opens a `DiffViewer` (the kit's before/after viewer) that
 * shows exactly which fields changed.
 *
 * The composition uses two underused but valuable kit pieces — `DiffViewer`
 * and Modal — wired together with a real event shape.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  DataTable,
  TableToolbar,
  Input,
  Select,
  Badge,
  Button,
  Modal,
  DiffViewer,
  type DiffEntry,
} from '../index';

type EventKind = 'create' | 'update' | 'delete' | 'auth';

interface AuditEvent {
  id: string;
  ts: string;
  actor: string;
  kind: EventKind;
  entity: string;
  description: string;
  diff?: DiffEntry[];
}

const KIND_BADGE: Record<EventKind, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  create: { variant: 'success', label: 'Creó' },
  update: { variant: 'info',    label: 'Editó' },
  delete: { variant: 'danger',  label: 'Eliminó' },
  auth:   { variant: 'warning', label: 'Sesión' },
};

const EVENTS: AuditEvent[] = [
  {
    id: 'e1', ts: '15 may 2026, 14:32', actor: 'Carla Pizarro', kind: 'update', entity: 'Pedido #1042',
    description: 'Cambió estado a Despachado',
    diff: [
      { field: 'estado', before: 'Pendiente',  after: 'Despachado' },
      { field: 'fecha despacho', before: '—',  after: '15 may 2026' },
    ],
  },
  { id: 'e2', ts: '15 may 2026, 09:10', actor: 'Sistema',         kind: 'create', entity: 'Guía #G-2055', description: 'Generó guía de despacho' },
  { id: 'e3', ts: '14 may 2026, 17:45', actor: 'Carla Pizarro',   kind: 'auth',   entity: 'Sesión',      description: 'Inicio de sesión desde 190.x.x.x' },
  {
    id: 'e4', ts: '14 may 2026, 11:02', actor: 'Misael Ocas', kind: 'update', entity: 'Producto TLD-700',
    description: 'Actualizó precio',
    diff: [
      { field: 'precio', before: '$59.990', after: '$64.990' },
    ],
  },
  { id: 'e5', ts: '13 may 2026, 16:20', actor: 'Misael Ocas',     kind: 'delete', entity: 'Cliente #87',  description: 'Eliminó cliente inactivo' },
];

export function AuditLogPage(): React.ReactElement {
  const [query, setQuery] = React.useState('');
  const [kind, setKind] = React.useState<EventKind | 'all'>('all');
  const [openEvent, setOpenEvent] = React.useState<AuditEvent | null>(null);

  const filtered = EVENTS.filter((e) => {
    if (kind !== 'all' && e.kind !== kind) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return e.actor.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title="Registro de actividad"
        description="Todos los cambios y eventos del sistema, ordenados por fecha"
        actions={<Button variant="outline">Exportar CSV</Button>}
      />

      <div style={{ marginTop: 24 }}>
        <DataTable
          rows={filtered}
          rowKey={(r) => r.id}
          ariaLabel="Registro de actividad"
          onRowClick={(r) => r.diff && setOpenEvent(r)}
          toolbar={
            <TableToolbar>
              <div className="grow" style={{ flex: 1 }}>
                <Input placeholder="Buscar por actor, entidad o acción…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={kind} onChange={(e) => setKind(e.target.value as EventKind | 'all')}>
                <option value="all">Todas las acciones</option>
                <option value="create">Creaciones</option>
                <option value="update">Ediciones</option>
                <option value="delete">Eliminaciones</option>
                <option value="auth">Sesiones</option>
              </Select>
            </TableToolbar>
          }
          columns={[
            {
              key: 'ts',
              header: 'Fecha',
              accessor: (r) => <span className="cell-mono cell-meta">{r.ts}</span>,
            },
            {
              key: 'actor',
              header: 'Actor',
              accessor: (r) => r.actor,
            },
            {
              key: 'kind',
              header: 'Acción',
              accessor: (r) => <Badge variant={KIND_BADGE[r.kind].variant}>{KIND_BADGE[r.kind].label}</Badge>,
            },
            {
              key: 'entity',
              header: 'Entidad',
              accessor: (r) => (
                <>
                  <span>{r.entity}</span>
                  <span className="cell-meta">{r.description}</span>
                </>
              ),
            },
            {
              key: 'detail',
              header: '',
              align: 'right',
              accessor: (r) => (r.diff ? <span className="cell-meta">Ver cambios →</span> : null),
            },
          ]}
        />
      </div>

      <Modal
        open={openEvent !== null}
        onClose={() => setOpenEvent(null)}
        title={openEvent ? `Cambios en ${openEvent.entity}` : ''}
        footer={<Button onClick={() => setOpenEvent(null)}>Cerrar</Button>}
        size="lg"
      >
        {openEvent && (
          <>
            <p className="cell-meta" style={{ margin: '0 0 16px' }}>{openEvent.actor} · {openEvent.ts}</p>
            {openEvent.diff && <DiffViewer entries={openEvent.diff} />}
          </>
        )}
      </Modal>
    </div>
  );
}
