'use client';
/**
 * Block: tool rental catalog (Domain → Rentools). Grid of rentable tools
 * with **per-period rate** (not a fixed sale price) + availability badge +
 * "Reservar" CTA. Filter sidebar by category and availability.
 *
 * UX rationale (from rental marketplaces — Fat Llama, BigRentz, Kit):
 * - The card leads with the RATE PER PERIOD ("$12.000/día"), not a price —
 *   rental decisions are "cuánto por cuánto tiempo", not "cuánto cuesta".
 * - Availability is a first-class badge: "Disponible" / "Arrendado hasta
 *   DD/MM" / "En mantención". A tool the user can't rent right now still
 *   shows, but the CTA reflects the state.
 * - The deposit (garantía) is surfaced on the card — it's part of the
 *   commitment the renter is signing up for.
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

type Availability = 'available' | 'rented' | 'maintenance';

interface Tool {
  id: string;
  name: string;
  sku: string;
  category: string;
  ratePerDay: number;
  deposit: number;
  availability: Availability;
  availableFrom?: string;
}

const TOOLS: Tool[] = [
  { id: '1', name: 'Andamio modular 2m',        sku: 'AND-2M',  category: 'altura',       ratePerDay: 8000,  deposit: 80000,  availability: 'available' },
  { id: '2', name: 'Generador eléctrico 5kVA',  sku: 'GEN-5K',  category: 'energia',      ratePerDay: 25000, deposit: 200000, availability: 'available' },
  { id: '3', name: 'Martillo demoledor 1500W',  sku: 'DEM-15',  category: 'demolicion',   ratePerDay: 18000, deposit: 120000, availability: 'rented', availableFrom: '19 may' },
  { id: '4', name: 'Placa compactadora',        sku: 'CMP-01',  category: 'compactacion', ratePerDay: 22000, deposit: 150000, availability: 'available' },
  { id: '5', name: 'Mezcladora de concreto',    sku: 'MEZ-150', category: 'concreto',     ratePerDay: 15000, deposit: 100000, availability: 'maintenance' },
  { id: '6', name: 'Torre de iluminación',      sku: 'ILU-TR',  category: 'energia',      ratePerDay: 30000, deposit: 250000, availability: 'available' },
  { id: '7', name: 'Cortadora de pavimento',    sku: 'COR-PV',  category: 'demolicion',   ratePerDay: 28000, deposit: 180000, availability: 'rented', availableFrom: '22 may' },
  { id: '8', name: 'Andamio modular 4m',        sku: 'AND-4M',  category: 'altura',       ratePerDay: 14000, deposit: 140000, availability: 'available' },
];

const CATEGORIES = [
  { value: 'altura',       label: 'Trabajo en altura' },
  { value: 'energia',      label: 'Energía' },
  { value: 'demolicion',   label: 'Demolición' },
  { value: 'compactacion', label: 'Compactación' },
  { value: 'concreto',     label: 'Concreto' },
];

function availabilityBadge(a: Availability, from?: string): React.ReactNode {
  if (a === 'available') return <Badge variant="success">Disponible</Badge>;
  if (a === 'maintenance') return <Badge variant="neutral">En mantención</Badge>;
  return <Badge variant="warning">Libre {from}</Badge>;
}

export function ToolCatalog(): React.ReactElement {
  const [query, setQuery] = React.useState('');
  const [cats, setCats] = React.useState<Set<string>>(new Set());
  const [availableOnly, setAvailableOnly] = React.useState(false);
  const [order, setOrder] = React.useState<'rate-asc' | 'rate-desc' | 'name'>('name');

  const toggleCat = (c: string) =>
    setCats((curr) => {
      const next = new Set(curr);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const visible = TOOLS
    .filter((t) =>
      (!query || t.name.toLowerCase().includes(query.toLowerCase()) || t.sku.toLowerCase().includes(query.toLowerCase())) &&
      (cats.size === 0 || cats.has(t.category)) &&
      (!availableOnly || t.availability === 'available'),
    )
    .sort((a, b) => {
      if (order === 'name') return a.name.localeCompare(b.name);
      if (order === 'rate-asc') return a.ratePerDay - b.ratePerDay;
      return b.ratePerDay - a.ratePerDay;
    });

  const activeCount = cats.size + (availableOnly ? 1 : 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <PageHeader title="Catálogo de arriendo" description={`${visible.length} equipos`} />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start', marginTop: 24 }}>
        <FilterPanel
          activeCount={activeCount}
          onClearAll={() => { setCats(new Set()); setAvailableOnly(false); }}
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
              <Checkbox checked={availableOnly} onChange={() => setAvailableOnly((v) => !v)} />
              Solo disponibles ahora
            </label>
          </FilterSection>
        </FilterPanel>

        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input placeholder="Buscar equipo o SKU…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select value={order} onChange={(e) => setOrder(e.target.value as typeof order)}>
              <option value="name">Ordenar por nombre</option>
              <option value="rate-asc">Tarifa: menor a mayor</option>
              <option value="rate-desc">Tarifa: mayor a menor</option>
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {visible.map((t) => {
              const rentable = t.availability === 'available';
              return (
                <ProductCard
                  key={t.id}
                  sku={t.sku}
                  name={t.name}
                  price={
                    <span>
                      <span className="cell-mono">${t.ratePerDay.toLocaleString('es-CL')}</span>
                      <span className="cell-meta" style={{ marginLeft: 4 }}>/día</span>
                    </span>
                  }
                  tag={availabilityBadge(t.availability, t.availableFrom)}
                  footer={
                    <div style={{ width: '100%' }}>
                      <div className="cell-meta" style={{ marginBottom: 8 }}>
                        Garantía: <span className="cell-mono">${t.deposit.toLocaleString('es-CL')}</span>
                      </div>
                      <Button size="sm" fullWidth disabled={!rentable}>
                        {rentable ? 'Reservar' : 'No disponible'}
                      </Button>
                    </div>
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
