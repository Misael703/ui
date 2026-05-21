'use client';
/**
 * Block: product catalog page. Filter sidebar on the left + responsive
 * grid of `ProductCard`s on the right with a toolbar (search + sort) above.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import {
  PageHeader,
  ProductCard,
  FilterPanel,
  FilterSection,
  Input,
  Select,
  Checkbox,
  Button,
  Badge,
} from '../index';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  inStock: boolean;
  isNew?: boolean;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Taladro percutor 700W',     sku: 'TLD-700', category: 'electricas', price: 64990,  inStock: true,  isNew: true },
  { id: '2', name: 'Sierra circular 7-1/4"',    sku: 'SRR-7',   category: 'electricas', price: 134900, inStock: true },
  { id: '3', name: 'Cemento gris 42.5kg',       sku: 'CEM-425', category: 'construccion', price: 5490, inStock: false },
  { id: '4', name: 'Fierro corrugado 12mm',     sku: 'FRR-12',  category: 'construccion', price: 8990, inStock: true },
  { id: '5', name: 'Pintura látex blanca 1gal', sku: 'PNT-01',  category: 'pintura',    price: 12990,  inStock: true },
  { id: '6', name: 'Brocha angular 2"',         sku: 'BRC-02',  category: 'pintura',    price: 3290,   inStock: true },
  { id: '7', name: 'Lijadora orbital 300W',     sku: 'LIJ-300', category: 'electricas', price: 49990,  inStock: true,  isNew: true },
  { id: '8', name: 'Cinta métrica 5m',          sku: 'CMT-05',  category: 'medicion',   price: 4990,   inStock: true },
];

const CATEGORIES = [
  { value: 'electricas',   label: 'Herramientas eléctricas' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'pintura',      label: 'Pintura' },
  { value: 'medicion',     label: 'Medición' },
];

export function ProductCatalog(): React.ReactElement {
  const [query, setQuery] = React.useState('');
  const [cats, setCats] = React.useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [order, setOrder] = React.useState<'price-asc' | 'price-desc' | 'name'>('name');

  const toggleCat = (c: string) =>
    setCats((curr) => {
      const next = new Set(curr);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const visible = PRODUCTS
    .filter((p) =>
      (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())) &&
      (cats.size === 0 || cats.has(p.category)) &&
      (!inStockOnly || p.inStock),
    )
    .sort((a, b) => {
      if (order === 'name') return a.name.localeCompare(b.name);
      if (order === 'price-asc') return a.price - b.price;
      return b.price - a.price;
    });

  const activeCount = cats.size + (inStockOnly ? 1 : 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <PageHeader title="Catálogo de productos" description={`${visible.length} productos`} />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start', marginTop: 24 }}>
        <FilterPanel
          activeCount={activeCount}
          onClearAll={() => { setCats(new Set()); setInStockOnly(false); }}
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

        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input placeholder="Buscar producto o SKU…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select value={order} onChange={(e) => setOrder(e.target.value as typeof order)}>
              <option value="name">Ordenar por nombre</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </Select>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                sku={p.sku}
                name={p.name}
                price={`$${p.price.toLocaleString('es-CL')}`}
                tag={p.isNew ? <Badge variant="primary" appearance="solid">Nuevo</Badge> : !p.inStock ? <Badge variant="danger">Agotado</Badge> : undefined}
                footer={<Button size="sm" fullWidth disabled={!p.inStock}>{p.inStock ? 'Agregar al carrito' : 'Sin stock'}</Button>}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
