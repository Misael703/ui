'use client';
/**
 * Block: admin data-table page (filter sidebar + toolbar + selectable table +
 * bulk actions + pagination). Copy-paste recipe, not a configurable component.
 * In your app, replace the `../index` import with `@misael703/ui`.
 */
import * as React from 'react';
import {
  DataTable,
  TableToolbar,
  TablePagination,
  FilterPanel,
  FilterSection,
  BulkActionBar,
  SortDropdown,
  Input,
  Button,
  Checkbox,
  Badge,
} from '../index';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
}

const ALL: Product[] = [
  { id: '1', name: 'Taladro percutor 700W', sku: 'TLD-700', category: 'electricas', stock: 24, price: 64990 },
  { id: '2', name: 'Sierra circular 7-1/4"', sku: 'SRR-7', category: 'electricas', stock: 5, price: 134900 },
  { id: '3', name: 'Cemento gris 42.5kg', sku: 'CEM-425', category: 'construccion', stock: 0, price: 5490 },
  { id: '4', name: 'Fierro corrugado 12mm', sku: 'FRR-12', category: 'construccion', stock: 142, price: 8990 },
  { id: '5', name: 'Pintura látex blanca 1gal', sku: 'PNT-01', category: 'pintura', stock: 18, price: 12990 },
  { id: '6', name: 'Brocha angular 2"', sku: 'BRC-02', category: 'pintura', stock: 60, price: 3290 },
];

const CATEGORIES = [
  { value: 'electricas', label: 'Herramientas eléctricas' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'pintura', label: 'Pintura' },
];

export function DataTablePage(): React.ReactElement {
  const [query, setQuery] = React.useState('');
  const [cats, setCats] = React.useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [order, setOrder] = React.useState<'name' | 'price' | 'stock'>('name');
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const toggleCat = (c: string) =>
    setCats((curr) => {
      const next = new Set(curr);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const filtered = ALL.filter(
    (p) =>
      (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())) &&
      (cats.size === 0 || cats.has(p.category)) &&
      (!inStockOnly || p.stock > 0),
  ).sort((a, b) => (order === 'name' ? a.name.localeCompare(b.name) : b[order] - a[order]));

  const activeCount = cats.size + (inStockOnly ? 1 : 0);
  const start = (page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start', padding: 24 }}>
      <FilterPanel
        activeCount={activeCount}
        onClearAll={() => {
          setCats(new Set());
          setInStockOnly(false);
        }}
      >
        <FilterSection title="Categoría">
          {CATEGORIES.map((c) => (
            <label key={c.value} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
              <Checkbox checked={cats.has(c.value)} onChange={() => toggleCat(c.value)} />
              {c.label}
            </label>
          ))}
        </FilterSection>
        <FilterSection title="Disponibilidad">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <Checkbox checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)} />
            Solo con stock
          </label>
        </FilterSection>
      </FilterPanel>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-surface)' }}>
        <TableToolbar>
          <div className="grow" style={{ flex: 1 }}>
            <Input placeholder="Buscar producto o SKU…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          <SortDropdown
            value={order}
            onChange={(v) => setOrder(v)}
            options={[
              { value: 'name', label: 'Nombre' },
              { value: 'price', label: 'Precio' },
              { value: 'stock', label: 'Stock' },
            ]}
          />
        </TableToolbar>

        {sel.size > 0 && (
          <BulkActionBar selectedCount={sel.size} onClear={() => setSel(new Set())}>
            <Button size="sm" variant="outline">Exportar</Button>
            <Button size="sm" variant="danger">Eliminar</Button>
          </BulkActionBar>
        )}

        <DataTable
          rows={visible}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          selectable
          selectedKeys={sel}
          onSelectionChange={setSel}
          sort={sort}
          onSortChange={setSort}
          columns={[
            { key: 'name', header: 'Producto', sortable: true },
            { key: 'sku', header: 'SKU' },
            {
              key: 'stock',
              header: 'Stock',
              align: 'right',
              accessor: (r) =>
                r.stock === 0 ? <Badge variant="danger">Agotado</Badge> : r.stock < 10 ? <Badge variant="warning">{r.stock}</Badge> : r.stock,
            },
            { key: 'price', header: 'Precio', align: 'right', accessor: (r) => `$${r.price.toLocaleString('es-CL')}` },
          ]}
        />

        <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
