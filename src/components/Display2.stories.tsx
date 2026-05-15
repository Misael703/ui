import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup, Stat, Menu } from './Display2';

export default { title: 'Display/Avatar y Stat', tags: ['autodocs'] } as Meta;

export const Avatares: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar name="Misael Ocas" />
      <Avatar name="Acme Supply Co" size={40} />
      <Avatar name="Acme Co" size={48} />
      <Avatar name="JN" status="online" />
      <Avatar src="https://i.pravatar.cc/64?img=12" alt="Cliente" size={48} />
    </div>
  ),
};

export const GrupoDeAvatares: StoryObj = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="MO" />
      <Avatar name="JN" />
      <Avatar name="CP" />
      <Avatar name="DV" />
      <Avatar name="LR" />
    </AvatarGroup>
  ),
};

export const StatBasico: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Stat label="Ventas hoy" value="$1.245.000" hint="vs ayer" trend={{ value: '+12.4%', dir: 'up' }} />
      <Stat label="Pedidos" value="38" trend={{ value: '-4', dir: 'down' }} />
      <Stat label="Margen promedio" value="22%" hint="objetivo: 25%" />
    </div>
  ),
};

export const MenuContextual: StoryObj = {
  render: () => (
    <Menu
      trigger={<button className="btn btn--ghost btn--sm">Acciones ▾</button>}
      items={[
        { label: 'Editar pedido', onSelect: () => alert('Editar') },
        { label: 'Duplicar', onSelect: () => alert('Duplicar') },
        { type: 'separator' },
        { label: 'Eliminar', onSelect: () => alert('Eliminar'), destructive: true },
      ]}
    />
  ),
};
