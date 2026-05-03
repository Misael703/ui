import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from './Notifications';

export default { title: 'Feedback/Notifications', tags: ['autodocs'] } as Meta;

export const ConNotificaciones: StoryObj = {
  render: () => {
    const [notifs, setNotifs] = React.useState([
      { id: '1', title: 'Pedido #1042 confirmado', description: 'Constructora Norte SpA', tone: 'success' as const, timestamp: 'hace 2 min', read: false },
      { id: '2', title: 'Stock bajo en SKU ELT-12-AC', description: 'Solo quedan 3 unidades', tone: 'warning' as const, timestamp: 'hace 1h', read: false },
      { id: '3', title: 'Pago rechazado', description: 'Pedido #1038 — Tarjeta declinada', tone: 'danger' as const, timestamp: 'hace 3h', read: false },
      { id: '4', title: 'Nuevo cliente registrado', tone: 'info' as const, timestamp: 'hace 1 día', read: true },
    ]);
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 24, background: 'var(--bg-subtle)', borderRadius: 8 }}>
        <NotificationCenter
          notifications={notifs}
          onMarkAllRead={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))}
          onClearAll={() => setNotifs([])}
        />
      </div>
    );
  },
};

export const Vacio: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 24 }}>
      <NotificationCenter notifications={[]} />
    </div>
  ),
};
