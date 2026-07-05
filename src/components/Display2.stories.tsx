import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup, Stat, Menu } from './Display2';

export default { title: 'Data Display/Avatar & Stat', tags: ['autodocs'] } as Meta;

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
      {/* Preferred: numeric `delta` → shared DeltaBadge (signed, localized, tone by sign). */}
      <Stat label="Ventas hoy" value="$1.245.000" hint="vs ayer" delta={12.4} />
      <Stat label="Pedidos" value="38" delta={-4} deltaFormat={(v) => `${v > 0 ? '+' : ''}${v}`} />
      <Stat label="Margen promedio" value="22%" hint="objetivo: 25%" />
    </div>
  ),
};

// `deltaInvert` for higher-is-worse metrics (cost, merma): the arrow still points
// up on an increase, but the tone reads negative. And the legacy string `trend`
// stays supported (deprecated) for back-compat.
export const StatDeltaInvertYLegacy: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Stat label="Merma" value="3,1%" delta={3.1} deltaInvert hint="vs mes ant." />
      <Stat label="Costo envío" value="$4.200" delta={-8.5} deltaInvert hint="bajó, mejor" />
      <Stat label="NPS (legacy trend)" value="72" trend={{ value: '+5', dir: 'up' }} />
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
