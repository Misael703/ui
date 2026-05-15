import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog, DescriptionList, DescriptionListItem, DiffViewer, TransferList, type TransferItem } from './Editing';
import { Button } from './Button';
import { Badge } from './Display';

export default { title: 'ERP/Editing', tags: ['autodocs'] } as Meta;

export const ConfirmDialogDemo: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Eliminar pedido</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => new Promise((r) => setTimeout(r, 800))}
          title="¿Eliminar pedido #1042?"
          description="Esta acción no se puede deshacer. Los datos del cliente quedarán intactos."
          confirmLabel="Eliminar"
          tone="danger"
        />
      </>
    );
  },
};

export const DescriptionListDemo: StoryObj = {
  render: () => (
    <DescriptionList style={{ maxWidth: 480 }}>
      <DescriptionListItem label="Cliente" value="Northwind Builders" />
      <DescriptionListItem label="RUT" value="76.123.456-7" editable onEdit={() => alert('Editar RUT')} />
      <DescriptionListItem label="Estado" value={<Badge variant="success">Despachado</Badge>} />
      <DescriptionListItem label="Total" value="$1.245.000" editable onEdit={() => alert('Editar total')} />
    </DescriptionList>
  ),
};

export const DiffViewerDemo: StoryObj = {
  render: () => (
    <DiffViewer
      entries={[
        { field: 'Cliente', before: 'Southwind Builders', after: 'Northwind Builders' },
        { field: 'Total', before: '$1.000.000', after: '$1.245.000' },
        { field: 'Estado', before: 'Borrador', after: 'Confirmado' },
        { field: 'Despacho', before: '2026-05-01', after: '2026-04-30' },
      ]}
    />
  ),
};

export const TransferListDemo: StoryObj = {
  render: () => {
    const allItems: TransferItem[] = [
      { id: 'p1', label: 'Crear pedidos', description: 'Permite crear nuevos pedidos' },
      { id: 'p2', label: 'Editar pedidos' },
      { id: 'p3', label: 'Eliminar pedidos' },
      { id: 'p4', label: 'Ver reportes' },
      { id: 'p5', label: 'Administrar usuarios', disabled: true },
      { id: 'p6', label: 'Configurar despacho' },
    ];
    const [selected, setSelected] = React.useState<TransferItem[]>([allItems[0], allItems[3]]);
    return (
      <TransferList
        source={allItems}
        selected={selected}
        onChange={setSelected}
        sourceTitle="Permisos disponibles"
        selectedTitle="Asignados al rol Bodeguero"
      />
    );
  },
};
