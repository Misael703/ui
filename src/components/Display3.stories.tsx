import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserCell, StatusIndicator, Timeline, TimelineItem, Tree, Calendar } from './Display3';
import { CheckCircle, Edit, Bell, Folder, Package } from './Icons';

export default { title: 'ERP/Display3', tags: ['autodocs'] } as Meta;

export const UserCellDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <UserCell name="Misael Ocas" meta="misael.ocas@elalba.cl" />
      <UserCell name="Patricia Rojas" meta="Admin · El Alba" size={40} />
      <UserCell name="JN" meta="Bodeguero" avatarSrc="https://i.pravatar.cc/64?img=12" />
    </div>
  ),
};

export const StatusIndicators: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatusIndicator tone="success" pulse label="Sincronizado" />
      <StatusIndicator tone="warning" label="Pendiente" />
      <StatusIndicator tone="danger" label="Error de conexión" />
      <StatusIndicator tone="info" pulse label="Procesando" />
      <StatusIndicator tone="neutral" label="Inactivo" />
    </div>
  ),
};

export const TimelineDemo: StoryObj = {
  render: () => (
    <Timeline style={{ maxWidth: 480 }}>
      <TimelineItem tone="success" icon={<CheckCircle size={14} />} title="Pedido creado" meta="2026-04-29 09:14 · Misael Ocas">
        14 ítems · Total $1.245.000
      </TimelineItem>
      <TimelineItem tone="info" icon={<Edit size={14} />} title="Cliente confirmó por WhatsApp" meta="2026-04-29 10:32" />
      <TimelineItem tone="warning" icon={<Bell size={14} />} title="Stock bajo en SKU ELT-12-AC" meta="2026-04-29 11:01" />
      <TimelineItem tone="success" icon={<CheckCircle size={14} />} title="Despachado" meta="2026-04-29 14:32 · Bodega norte" />
    </Timeline>
  ),
};

export const TreeDemo: StoryObj = {
  render: () => {
    const [selected, setSelected] = React.useState('cemento');
    return (
      <Tree
        defaultExpanded={['construccion', 'electrico']}
        selectedId={selected}
        onSelect={setSelected}
        nodes={[
          {
            id: 'construccion', label: 'Construcción', icon: <Folder size={14} />,
            children: [
              { id: 'cemento', label: 'Cementos y áridos', icon: <Package size={14} />, meta: '142' },
              { id: 'fierro', label: 'Fierros', icon: <Package size={14} />, meta: '89' },
              { id: 'maderas', label: 'Maderas', icon: <Package size={14} />, meta: '56' },
            ],
          },
          {
            id: 'electrico', label: 'Eléctrico', icon: <Folder size={14} />,
            children: [
              { id: 'cables', label: 'Cables', icon: <Package size={14} /> },
              { id: 'enchufes', label: 'Enchufes', icon: <Package size={14} /> },
            ],
          },
          { id: 'pintura', label: 'Pintura', icon: <Folder size={14} />, meta: '67' },
        ]}
      />
    );
  },
};

export const CalendarDemo: StoryObj = {
  render: () => {
    const today = new Date();
    return (
      <div style={{ maxWidth: 720 }}>
        <Calendar
          events={[
            { date: today, label: 'Despacho 1042', tone: 'info' },
            { date: today, label: 'Cliente VIP visita', tone: 'warning' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), label: 'Vencimiento factura', tone: 'danger' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), label: 'Inventario', tone: 'success' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), label: 'Reunión equipo', tone: 'info' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), label: 'Capacitación', tone: 'neutral' },
          ]}
          onDayClick={(d) => console.log('click', d)}
        />
      </div>
    );
  },
};
