import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { TransferList, type TransferListProps, type TransferItem } from './Editing';

const ALL_ITEMS: TransferItem[] = [
  { id: 'p1', label: 'Crear pedidos', description: 'Permite crear nuevos pedidos' },
  { id: 'p2', label: 'Editar pedidos' },
  { id: 'p3', label: 'Eliminar pedidos' },
  { id: 'p4', label: 'Ver reportes' },
  { id: 'p5', label: 'Administrar usuarios', disabled: true },
  { id: 'p6', label: 'Configurar envío' },
];

function Controlled(args: TransferListProps) {
  const [selected, setSelected] = React.useState(args.selected);
  return <TransferList {...args} selected={selected} onChange={setSelected} />;
}

const meta = {
  title: 'Components/TransferList',
  component: TransferList,
  tags: ['autodocs'],
  args: {
    source: ALL_ITEMS,
    selected: [ALL_ITEMS[0], ALL_ITEMS[3]],
    sourceTitle: 'Permisos disponibles',
    selectedTitle: 'Asignados al rol Bodeguero',
    onChange: fn(),
  },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof TransferList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
