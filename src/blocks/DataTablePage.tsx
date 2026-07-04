'use client';
/**
 * Block: admin data-table page (filter sidebar + DataTable with embedded
 * toolbar slot, bulk actions, pagination). Copy-paste recipe, not a
 * configurable component. In your app, replace the `../index` import with
 * `@misael703/ui`.
 *
 * v1.15.0 patterns:
 * - `<DataTable toolbar={...}>` wraps everything in `.table-surface` →
 *   one rounded border, one divider, no seam between toolbar and table.
 * - Cells use `.cell-mono` (JetBrains Mono, bundled) for tabular data
 *   like SKUs and prices, and `.cell-meta` (11px / `--fg-meta`, recedes)
 *   for the secondary/eco line under the primary value.
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
  categoryLabel: string;
  stock: number;
  price: number;
}

const ALL: Product[] = [
  { id: '1', name: 'Taladro percutor 700W', sku: 'TLD-700', category: 'electricas', categoryLabel: 'Herramientas eléctricas', stock: 24, price: 64990 },
  { id: '2', name: 'Sierra circular 7-1/4"', sku: 'SRR-7', category: 'electricas', categoryLabel: 'Herramientas eléctricas', stock: 5, price: 134900 },
  { id: '3', name: 'Cemento gris 42.5kg', sku: 'CEM-425', category: 'construccion', categoryLabel: 'Construcción', stock: 0, price: 5490 },
  { id: '4', name: 'Fierro corrugado 12mm', sku: 'FRR-12', category: 'construccion', categoryLabel: 'Construcción', stock: 142, price: 8990 },
  { id: '5', name: 'Pintura látex blanca 1gal', sku: 'PNT-01', category: 'pintura', categoryLabel: 'Pintura', stock: 18, price: 12990 },
  { id: '6', name: 'Brocha angular 2"', sku: 'BRC-02', category: 'pintura', categoryLabel: 'Pintura', stock: 60, price: 3290 },
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
          setPage(1);
        }}
      >
        <FilterSection title="Categoría">
          {CATEGORIES.map((c) => (
            <label key={c.value} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
              <Checkbox checked={cats.has(c.value)} onChange={() => { toggleCat(c.value); setPage(1); }} />
              {c.label}
            </label>
          ))}
        </FilterSection>
        <FilterSection title="Disponibilidad">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <Checkbox checked={inStockOnly} onChange={() => { setInStockOnly((v) => !v); setPage(1); }} />
            Solo con stock
          </label>
        </FilterSection>
      </FilterPanel>

      <div>
        <DataTable
          rows={visible}
          rowKey={(r) => r.id}
          ariaLabel="Productos"
          selectable
          selectedKeys={sel}
          onSelectionChange={setSel}
          toolbar={
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
              {sel.size > 0 && (
                <BulkActionBar selectedCount={sel.size} onClear={() => setSel(new Set())}>
                  <Button size="sm" variant="outline">Exportar</Button>
                  <Button size="sm" variant="danger">Eliminar</Button>
                </BulkActionBar>
              )}
            </TableToolbar>
          }
          columns={[
            {
              key: 'name',
              header: 'Producto',
              accessor: (r) => (
                <>
                  <span>{r.name}</span>
                  <span className="cell-meta">{r.categoryLabel}</span>
                </>
              ),
            },
            {
              key: 'sku',
              header: 'SKU',
              accessor: (r) => <span className="cell-mono cell-meta">{r.sku}</span>,
            },
            {
              key: 'stock',
              header: 'Stock',
              align: 'right',
              accessor: (r) =>
                r.stock === 0 ? <Badge variant="danger">Agotado</Badge> : r.stock < 10 ? <Badge variant="warning">{r.stock}</Badge> : <span className="cell-mono">{r.stock}</span>,
            },
            {
              key: 'price',
              header: 'Precio',
              align: 'right',
              accessor: (r) => <span className="cell-mono">${r.price.toLocaleString('es-CL')}</span>,
            },
          ]}
        />

        <div style={{ marginTop: 12 }}>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
