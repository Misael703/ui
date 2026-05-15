import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DataTable, Accordion, AccordionItem, Breadcrumbs, TableToolbar, TablePagination } from './DataTable';
import { Badge } from './Display';
import { Input } from './Form';
import { Button } from './Button';

export default { title: 'Data Display/DataTable', tags: ['autodocs'] } as Meta;

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

/** Estado vacío: pasa `rows={[]}`. Muestra el mensaje por defecto o el `empty` slot. */
export const SinDatos: StoryObj = {
  render: () => (
    <DataTable
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
      ]}
    />
  ),
};

/** Estado de carga: skeleton de 5 filas mientras `loading=true`. */
export const Cargando: StoryObj = {
  render: () => (
    <DataTable
      loading
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
      ]}
    />
  ),
};

/** Empty slot custom: pasa un nodo arbitrario via `empty`. */
export const SinDatosCustom: StoryObj = {
  render: () => (
    <DataTable
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      empty={
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Sin productos en este filtro</strong>
          <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
            Ajusta los filtros o limpia la búsqueda para ver más resultados.
          </span>
        </div>
      }
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
      ]}
    />
  ),
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

/** Estado de error: pasa `error` para mostrar un mensaje rojo con `role="alert"`. */
export const ConError: StoryObj = {
  render: () => (
    <DataTable
      rows={[]}
      rowKey={(r: { id: string }) => r.id}
      ariaLabel="Productos"
      error="No pudimos cargar los productos. Reintenta en unos segundos."
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
      ]}
    />
  ),
};

/** Sticky header: el thead se mantiene visible mientras se scrolea el body.
 * Requiere envolver la tabla en un contenedor con altura limitada y `overflow-y: auto`. */
export const StickyHeader: StoryObj = {
  render: () => {
    const manyRows = Array.from({ length: 30 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${String(i + 1).padStart(3, '0')}`,
      stock: Math.floor(Math.random() * 100),
      price: Math.floor(Math.random() * 200000) + 10000,
    }));
    return (
      <div style={{ height: 320, overflowY: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
        <DataTable
          stickyHeader
          rows={manyRows}
          rowKey={(r) => r.id}
          ariaLabel="Inventario"
          columns={[
            { key: 'name', header: 'Producto' },
            { key: 'sku', header: 'SKU' },
            { key: 'stock', header: 'Stock', align: 'right' },
            { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
          ]}
        />
      </div>
    );
  },
};

/** Card layout en mobile: a partir de <600px cada fila se renderiza como
 * una tarjeta con label + value. Usa el viewport mobile en Storybook para verlo. */
export const CardLayoutMobile: StoryObj = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <DataTable
      mobileLayout="cards"
      rows={rows}
      rowKey={(r) => r.id}
      ariaLabel="Productos"
      columns={[
        { key: 'name', header: 'Producto' },
        { key: 'sku', header: 'SKU' },
        { key: 'stock', header: 'Stock', align: 'right' },
        { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
      ]}
    />
  ),
};

/** TablePagination con page-size selector y rango de filas. */
export const PaginacionCompleta: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    return (
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={87}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    );
  },
};

/** TablePagination sin page-size selector — para tablas con tamaño fijo. */
export const PaginacionSimple: StoryObj = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return (
      <TablePagination
        page={page}
        pageSize={20}
        total={155}
        onPageChange={setPage}
      />
    );
  },
};

/** DataTable + TablePagination juntos, patrón típico de uso. */
export const DataTableConPaginacion: StoryObj = {
  render: () => {
    const allRows = Array.from({ length: 87 }, (_, i) => ({
      id: String(i + 1),
      name: `Producto ${i + 1}`,
      sku: `SKU-${String(i + 1).padStart(3, '0')}`,
      stock: Math.floor(Math.random() * 100),
    }));
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const start = (page - 1) * pageSize;
    const visible = allRows.slice(start, start + pageSize);
    return (
      <div>
        <DataTable
          rows={visible}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          columns={[
            { key: 'name', header: 'Producto' },
            { key: 'sku', header: 'SKU' },
            { key: 'stock', header: 'Stock', align: 'right' },
          ]}
        />
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={allRows.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>
    );
  },
};

export const AccordionBasico: StoryObj = {
  render: () => (
    <Accordion defaultOpen={['envio']}>
      <AccordionItem id="envio" title="Envío y plazos">Despachamos en 24-48h hábiles.</AccordionItem>
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
