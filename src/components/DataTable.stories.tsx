import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DataTable, Accordion, AccordionItem, Breadcrumbs, TableToolbar } from './DataTable';
import { Badge } from './Display';
import { Input } from './Form';
import { Button } from './Button';

export default { title: 'Data/DataTable', tags: ['autodocs'] } as Meta;

const rows = [
  { id: '1', name: 'Taladro percutor', sku: 'TLD-700', stock: 24, price: 89990 },
  { id: '2', name: 'Sierra circular', sku: 'SRR-7', stock: 8, price: 159990 },
  { id: '3', name: 'Lijadora orbital', sku: 'LIJ-300', stock: 0, price: 49990 },
];

export const DataTableBasica: StoryObj = {
  render: () => {
    const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
    const [sel, setSel] = React.useState<Set<string>>(new Set());
    return (
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
        selectable
        selectedKeys={sel}
        onSelectionChange={setSel}
        columns={[
          { key: 'name', header: 'Producto', sortable: true },
          { key: 'sku', header: 'SKU' },
          {
            key: 'stock', header: 'Stock', sortable: true, align: 'right',
            accessor: (r) => r.stock === 0 ? <Badge variant="danger">Agotado</Badge> : r.stock < 10 ? <Badge variant="warning">{r.stock}</Badge> : r.stock,
          },
          { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
        ]}
      />
    );
  },
};

export const ConToolbar: StoryObj = {
  render: () => {
    const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
    return (
      <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-surface)' }}>
        <TableToolbar>
          <div className="grow">
            <Input placeholder="Buscar producto…" />
          </div>
          <Button variant="outline" size="sm">Filtros</Button>
          <Button size="sm">Exportar</Button>
        </TableToolbar>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={setSort}
          columns={[
            { key: 'name', header: 'Producto', sortable: true },
            { key: 'sku', header: 'SKU' },
            { key: 'stock', header: 'Stock', sortable: true, align: 'right' },
            { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
          ]}
        />
      </div>
    );
  },
};

export const AccordionBasico: StoryObj = {
  render: () => (
    <Accordion defaultOpen={['envio']}>
      <AccordionItem id="envio" title="Envío y plazos">Despachamos en 24-48h hábiles dentro de Santiago.</AccordionItem>
      <AccordionItem id="dev" title="Devoluciones">Tienes 10 días para devolver productos sin uso.</AccordionItem>
      <AccordionItem id="pago" title="Métodos de pago">Tarjetas, transferencia y crédito empresa.</AccordionItem>
    </Accordion>
  ),
};

export const BreadcrumbsBasico: StoryObj = {
  render: () => (
    <Breadcrumbs items={[
      { label: 'Inicio', href: '/' },
      { label: 'Catálogo', href: '/catalogo' },
      { label: 'Herramientas eléctricas', href: '/catalogo/electricas' },
      { label: 'Taladro percutor' },
    ]}/>
  ),
};
