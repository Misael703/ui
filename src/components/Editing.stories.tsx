import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog, DescriptionList, DescriptionListItem, DiffViewer, TransferList, EditableCell, type TransferItem } from './Editing';
import { Button } from './Button';
import { Badge } from './Display';

export default { title: 'Patterns/Editing', tags: ['autodocs'] } as Meta;

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

/**
 * **EditableCell** (v1.50.0): primitive click-to-edit con semántica
 * Airtable/Notion — click o Enter edita, Enter/blur comitea, Esc cancela.
 * `onCommit` async-aware: pendiente deshabilita el input; si rechaza, la
 * celda SIGUE editando con el draft intacto (un PATCH fallido nunca pierde
 * el tipeo). El display usa `formatDisplay` (acá `formatCurrency`); la
 * edición siempre trabaja sobre el valor crudo. Compone dentro de DataTable
 * vía `accessor` — el kit shipea la CELDA, no un subsistema de tabla
 * editable: la orquestación del commit (optimistic, refetch, toast) queda
 * en el consumer. El segundo demo simula un server que rechaza.
 */
export const EditableCellDemo: StoryObj = {
  render: () => {
    const [price, setPrice] = React.useState('45000');
    const [stock, setStock] = React.useState('24');
    return (
      <div style={{ display: 'grid', gap: 12, maxWidth: 280 }}>
        <EditableCell
          value={price}
          onCommit={(v) => setPrice(v)}
          type="number"
          formatDisplay={(v) => `$${Number(v).toLocaleString('es-CL')}`}
          ariaLabel="Editar precio"
        />
        <EditableCell
          value={stock}
          onCommit={(v) => new Promise<void>((resolve, reject) => {
            setTimeout(() => { Number(v) > 100 ? reject(new Error('stock máximo 100')) : (setStock(v), resolve()); }, 600);
          })}
          type="number"
          validate={(v) => (Number(v) < 0 ? 'No puede ser negativo' : null)}
          ariaLabel="Editar stock (server simulado; >100 falla)"
        />
      </div>
    );
  },
};
