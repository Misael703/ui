'use client';
/**
 * Block: full-page notifications inbox. List of notifications grouped by
 * read state, filter by tone, "mark all as read" action. Shares the
 * `NotificationItem` shape with the kit's `NotificationCenter` (the bell
 * dropdown), so a single source of truth in your store can feed both.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { PageHeader, Card, CardBody, Button, Badge, type NotificationItem, type NotificationTone } from '../index';
import { Bell, AlertTriangle, CheckCircle, Info, AlertCircle } from '../components/Icons';

const TONE_ICON: Record<NotificationTone, React.ReactNode> = {
  info:    <Info size={18} />,
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  danger:  <AlertCircle size={18} />,
};

const TONE_COLOR: Record<NotificationTone, string> = {
  info:    'var(--color-info, #2563eb)',
  success: 'var(--color-success, #16a34a)',
  warning: 'var(--color-warning, #d97706)',
  danger:  'var(--color-danger, #dc2626)',
};

const SEED: NotificationItem[] = [
  { id: '1', tone: 'success', title: 'Pedido #1042 despachado',  description: 'Cliente: Northwind Builders', timestamp: 'hace 5 min',  read: false },
  { id: '2', tone: 'warning', title: 'Stock bajo: CEM-425',      description: 'Solo quedan 8 unidades en bodega', timestamp: 'hace 22 min', read: false },
  { id: '3', tone: 'info',    title: 'Nuevo cliente registrado', description: 'Constructora del Sur · 77.456.789-K', timestamp: 'hace 1 h', read: false },
  { id: '4', tone: 'danger',  title: 'Pago rechazado',           description: 'Pedido #1039 — tarjeta declinada', timestamp: 'hace 3 h', read: true },
  { id: '5', tone: 'success', title: 'Backup completado',        description: 'Snapshot guardado en S3', timestamp: 'ayer', read: true },
  { id: '6', tone: 'info',    title: 'Resumen semanal listo',    description: '184 pedidos · $24.8M en ventas', timestamp: 'lun, 12 may', read: true },
];

type Filter = 'all' | 'unread' | NotificationTone;

export function NotificationsPage(): React.ReactElement {
  const [items, setItems] = React.useState<NotificationItem[]>(SEED);
  const [filter, setFilter] = React.useState<Filter>('all');

  const unread = items.filter((n) => !n.read).length;

  const visible = items.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.tone === filter;
  });

  const markAllRead = () => setItems((curr) => curr.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: string) =>
    setItems((curr) => curr.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <PageHeader
        title="Notificaciones"
        description={unread > 0 ? `Tienes ${unread} sin leer` : 'Estás al día'}
        actions={
          unread > 0 ? <Button variant="outline" onClick={markAllRead}>Marcar todas como leídas</Button> : undefined
        }
      />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Todas</FilterChip>
        <FilterChip active={filter === 'unread'} onClick={() => setFilter('unread')}>
          Sin leer {unread > 0 && <Badge variant="info" appearance="solid">{unread}</Badge>}
        </FilterChip>
        <FilterChip active={filter === 'info'}    onClick={() => setFilter('info')}>Información</FilterChip>
        <FilterChip active={filter === 'success'} onClick={() => setFilter('success')}>Éxito</FilterChip>
        <FilterChip active={filter === 'warning'} onClick={() => setFilter('warning')}>Aviso</FilterChip>
        <FilterChip active={filter === 'danger'}  onClick={() => setFilter('danger')}>Error</FilterChip>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Bell size={32} style={{ color: 'var(--fg-muted)', marginBottom: 8 }} />
              <p style={{ margin: 0, color: 'var(--fg-muted)' }}>Sin notificaciones para este filtro.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody style={{ padding: 0 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {visible.map((n, i) => {
                const tone = n.tone ?? 'info';
                return (
                  <li
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '14px 20px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-default)',
                      background: n.read ? 'transparent' : 'var(--bg-muted)',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleRead(n.id)}
                  >
                    <span aria-hidden="true" style={{ color: TONE_COLOR[tone], flex: '0 0 auto' }}>
                      {TONE_ICON[tone]}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                        <span className="cell-meta" style={{ flex: '0 0 auto' }}>{n.timestamp}</span>
                      </div>
                      {n.description && <div className="cell-meta" style={{ marginTop: 2 }}>{n.description}</div>}
                    </div>
                    {!n.read && (
                      <span
                        aria-label="No leída"
                        style={{
                          flex: '0 0 auto',
                          alignSelf: 'center',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-default)',
        background: active ? 'var(--color-primary)' : 'transparent',
        color: active ? 'var(--color-white)' : 'var(--fg-default)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
