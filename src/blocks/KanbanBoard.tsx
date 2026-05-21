'use client';
/**
 * Block: Kanban board. Columns by status, cards per work item.
 *
 * No drag-and-drop in the recipe (deliberate): pick whichever DnD library
 * fits your app — dnd-kit (modern, accessible), react-beautiful-dnd
 * (Atlassian, more declarative), or HTML5 native. Adding DnD here would
 * couple the block to a library and force a peer dep on every consumer.
 * The current "Cambiar columna" prompt is a placeholder for that wiring.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, Badge, Avatar, Button } from '../index';
import { Plus, MoreHorizontal } from '../components/Icons';

type Priority = 'low' | 'med' | 'high';

interface KanbanCard {
  id: string;
  title: string;
  tag?: string;
  priority: Priority;
  assignee: string;
  due?: string;
}

interface Column {
  id: string;
  label: string;
  cards: KanbanCard[];
}

const PRIORITY_BADGE: Record<Priority, { variant: 'neutral' | 'warning' | 'danger'; label: string }> = {
  low:  { variant: 'neutral', label: 'Baja' },
  med:  { variant: 'warning', label: 'Media' },
  high: { variant: 'danger',  label: 'Alta' },
};

const INITIAL: Column[] = [
  {
    id: 'pendiente',
    label: 'Pendiente',
    cards: [
      { id: 'k1', title: 'Reordenar bodega', tag: 'OP', priority: 'med',  assignee: 'Carla Pizarro', due: '17 may' },
      { id: 'k2', title: 'Llamar a 3 morosos', tag: 'CO', priority: 'high', assignee: 'Misael Ocas',  due: '16 may' },
    ],
  },
  {
    id: 'en-progreso',
    label: 'En progreso',
    cards: [
      { id: 'k3', title: 'Recibir pedido 4501', tag: 'OP', priority: 'med',  assignee: 'Carla Pizarro' },
      { id: 'k4', title: 'Actualizar precios pintura', tag: 'AD', priority: 'low', assignee: 'Misael Ocas', due: '20 may' },
      { id: 'k5', title: 'Capacitación nuevo vendedor', tag: 'RH', priority: 'low', assignee: 'Misael Ocas' },
    ],
  },
  {
    id: 'en-revision',
    label: 'En revisión',
    cards: [
      { id: 'k6', title: 'Cierre mensual abril', tag: 'CO', priority: 'high', assignee: 'Misael Ocas', due: '15 may' },
    ],
  },
  {
    id: 'completado',
    label: 'Completado',
    cards: [
      { id: 'k7', title: 'Inventario físico Q1', tag: 'OP', priority: 'med', assignee: 'Carla Pizarro' },
      { id: 'k8', title: 'Migrar a Bsale v2',    tag: 'TI', priority: 'low', assignee: 'Misael Ocas' },
    ],
  },
];

export function KanbanBoard(): React.ReactElement {
  const [columns] = React.useState<Column[]>(INITIAL);

  return (
    <div style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Tareas del equipo"
        description={`${columns.reduce((n, c) => n + c.cards.length, 0)} tareas · 4 estados`}
        actions={<Button><Plus size={16} style={{ marginRight: 6 }} /> Nueva tarea</Button>}
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
              background: 'var(--bg-muted)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              minHeight: 0,
            }}
          >
            {/* Column header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{col.label}</strong>
                <Badge variant="neutral">{col.cards.length}</Badge>
              </div>
              <button
                type="button"
                aria-label={`Más opciones en ${col.label}`}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', minHeight: 0 }}>
              {col.cards.map((card) => (
                <Card key={card.id} style={{ cursor: 'grab' }}>
                  <CardBody style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      {card.tag && <span className="cell-mono cell-meta">{card.tag}</span>}
                      <Badge variant={PRIORITY_BADGE[card.priority].variant}>{PRIORITY_BADGE[card.priority].label}</Badge>
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: 12 }}>{card.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Avatar name={card.assignee} size={24} />
                      {card.due && <span className="cell-meta cell-mono">📅 {card.due}</span>}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Add card */}
            <button
              type="button"
              style={{
                marginTop: 8,
                padding: '8px 12px',
                border: 0,
                background: 'transparent',
                color: 'var(--fg-muted)',
                fontSize: 13,
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} /> Agregar tarea
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
