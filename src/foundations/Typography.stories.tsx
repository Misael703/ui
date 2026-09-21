import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typeset } from '@storybook/blocks';
import { formatCurrency } from '../utils/format';
import { SectionTitle, Caption } from './_helpers';

const meta = { title: 'Foundations/Typography', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

const SIZES = ['11px', '12px', '13px', '14px', '16px', '20px', '25px', '31px', '39px', '49px', '61px', '88px'];
const SAMPLE = 'Pedido #1042 · Northwind Builders';

export const Display: StoryObj = { render: () => <Typeset fontFamily="var(--font-display)" fontSizes={SIZES} fontWeight={600} sampleText={SAMPLE} /> };
export const Body: StoryObj = { render: () => <Typeset fontFamily="var(--font-body)" fontSizes={SIZES.slice(0, 8)} fontWeight={400} sampleText={SAMPLE} /> };
export const Mono: StoryObj = { render: () => <Typeset fontFamily="var(--font-mono)" fontSizes={['12px', '13px', '14px']} fontWeight={400} sampleText={`total: ${formatCurrency(1245000)}`} /> };

// =============================================================================
// Weight scale
// =============================================================================

const WEIGHT_STEPS = [
  { token: 'weight-thin',       value: 100, label: 'Thin' },
  { token: 'weight-extralight', value: 200, label: 'Extralight' },
  { token: 'weight-light',      value: 300, label: 'Light' },
  { token: 'weight-regular',    value: 400, label: 'Regular' },
  { token: 'weight-medium',     value: 500, label: 'Medium' },
  { token: 'weight-semibold',   value: 600, label: 'Semibold' },
  { token: 'weight-bold',       value: 700, label: 'Bold' },
  { token: 'weight-extrabold',  value: 800, label: 'Extrabold' },
  { token: 'weight-black',      value: 900, label: 'Black' },
];

export const WeightScale: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Display (Outfit, variable 100–900)</SectionTitle>
      <p className="body-sm" style={{ color: 'var(--fg-muted)', marginBottom: 24 }}>
        Outfit covers the whole range as a variable font: any weight is native (not faux).
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {WEIGHT_STEPS.map((w) => (
          <div key={w.token} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'baseline', paddingBottom: 8, borderBottom: '1px solid var(--border-default)' }}>
            <div>
              <Caption>--{w.token}</Caption>
              <div className="body-sm" style={{ color: 'var(--fg-muted)', marginTop: 4 }}>{w.label} ({w.value})</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: `var(--${w.token})` as React.CSSProperties['fontWeight'], fontSize: 32, lineHeight: 1.1 }}>
              Heavy machinery
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Body (DM Sans, variable 100–1000)</SectionTitle>
      <p className="body-sm" style={{ color: 'var(--fg-muted)', marginBottom: 24 }}>
        DM Sans is also variable: intermediate weights (300, 500, 600) are legitimate for body text, not synthesized.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {WEIGHT_STEPS.map((w) => (
          <div key={w.token} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'baseline' }}>
            <div>
              <Caption>--{w.token}</Caption>
              <div className="body-sm" style={{ color: 'var(--fg-muted)', marginTop: 4 }}>{w.label} ({w.value})</div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: `var(--${w.token})` as React.CSSProperties['fontWeight'], fontSize: 16 }}>
              Despacho del pedido #1042 — Northwind Builders.
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Usage</SectionTitle>
      <pre className="mono" style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>{`/* In your CSS */
.my-emphasis {
  font-weight: var(--weight-medium);  /* instead of "500" */
}

.my-card-title {
  font-weight: var(--weight-semibold);
  font-family: var(--font-display);
}`}</pre>
      <p className="body-sm" style={{ color: 'var(--fg-muted)', marginTop: 16 }}>
        The kit internals still use bare numbers (700, 400) in components — the tokens are for consumer / fork use.
      </p>
    </div>
  ),
};

// =============================================================================
// Body Review
// =============================================================================

/**
 * Permanent fixture for QA-ing how the body font renders in real-world
 * content density. Use this whenever you change `--font-body`, weight
 * tokens, or anything in `_typography.css` that affects body styles.
 *
 * Includes: long paragraph, form mockup, numeric table, mixed display+body.
 * If anything looks off here, the body font / scale / weight is off.
 */
export const BodyReview: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 32, maxWidth: 1100 }}>
      {/* Long-form paragraph */}
      <section>
        <SectionTitle>Long paragraph</SectionTitle>
        <p className="body" style={{ maxWidth: 520 }}>
          Northwind Builders opera desde 1987 abasteciendo a constructoras y profesionales independientes en la zona industrial de la ciudad. El catálogo actual supera las doce mil referencias entre herramientas manuales, eléctricas, fijaciones, pintura, sanitarios y materiales de construcción livianos. La operación se apoya en dos bodegas, cuatro vehículos de reparto y un equipo de quince personas que cubre venta presencial, despacho y postventa.
        </p>
        <p className="body" style={{ maxWidth: 520 }}>
          El sistema de gestión interno coordina inventario en tiempo real con las dos sucursales, integra el módulo de facturación electrónica con la autoridad tributaria y permite consultar márgenes por SKU desde cualquier punto de venta.
        </p>
        <p className="body-sm" style={{ maxWidth: 520, color: 'var(--fg-muted)' }}>
          Nota: si los renglones se sienten cansadores o las palabras se ven "designy" en lugar de neutrales, el body font no es el adecuado.
        </p>
      </section>

      {/* Form mockup */}
      <section>
        <SectionTitle>Dense form</SectionTitle>
        <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          {[
            { label: 'Razón social', value: 'Northwind Builders' },
            { label: 'N° de pedido', value: 'Pedido #1042' },
            { label: 'Dirección de despacho', value: 'Av. Industrial 4860, Sector Norte' },
            { label: 'Contacto', value: 'Patricio Saavedra · ext. 4751' },
            { label: 'Forma de pago', value: 'Transferencia electrónica · 30 días' },
            { label: 'Última compra', value: `2026-05-08 · OC #1042 · ${formatCurrency(1245000)}` },
          ].map((r) => (
            <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'baseline' }}>
              <span className="label" style={{ color: 'var(--fg-muted)' }}>{r.label}</span>
              <span className="body">{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Numeric table */}
      <section style={{ gridColumn: '1 / -1' }}>
        <SectionTitle>Numeric density</SectionTitle>
        <table className="table" style={{ width: '100%', maxWidth: 820 }}>
          <thead>
            <tr>
              <th scope="col">SKU</th>
              <th scope="col">Producto</th>
              <th scope="col" style={{ textAlign: 'right' }}>Stock</th>
              <th scope="col" style={{ textAlign: 'right' }}>Costo</th>
              <th scope="col" style={{ textAlign: 'right' }}>Venta</th>
              <th scope="col" style={{ textAlign: 'right' }}>Margen</th>
            </tr>
          </thead>
          <tbody>
            {[
              { sku: 'TLD-700', name: 'Taladro percutor 700W',           stock: 14, cost: 42990,  price: 64990 },
              { sku: 'SRR-7',   name: 'Sierra circular 7-1/4"',          stock:  5, cost: 89900,  price: 134900 },
              { sku: 'LIJ-300', name: 'Lijadora orbital 300W',           stock: 22, cost: 31490,  price: 47490 },
              { sku: 'ATR-450', name: 'Atornillador inalámbrico 18V',    stock:  9, cost: 54990,  price: 84990 },
              { sku: 'PUL-180', name: 'Pulidora angular 180mm 2400W',    stock:  3, cost: 67990,  price: 109900 },
              { sku: 'CMP-50L', name: 'Compresor 50L 2HP',               stock:  2, cost: 189900, price: 274900 },
              { sku: 'GEN-3KW', name: 'Generador eléctrico 3KW gasolina', stock: 1, cost: 449900, price: 629900 },
            ].map((r) => {
              const margin = ((r.price - r.cost) / r.price * 100).toFixed(1);
              return (
                <tr key={r.sku}>
                  <td className="mono">{r.sku}</td>
                  <td>{r.name}</td>
                  <td className="table__num">{r.stock}</td>
                  <td className="table__num">{formatCurrency(r.cost)}</td>
                  <td className="table__num">{formatCurrency(r.price)}</td>
                  <td className="table__num">{margin}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Mix display + body */}
      <section style={{ gridColumn: '1 / -1' }}>
        <SectionTitle>Mix display + body</SectionTitle>
        <article style={{ maxWidth: 640 }}>
          <h2 className="h2">Despacho del pedido #1042</h2>
          <p className="caption">Northwind Builders · 14 ítems · 2026-05-08</p>
          <h3 className="h3" style={{ marginTop: 24 }}>Resumen</h3>
          <p className="body">
            El pedido fue confirmado a las 10:48 y entró en preparación a las 11:12. La bodega norte completó el picking en 38 minutos, dentro del SLA de 60. El despacho salió a las 12:45 con destino a la sucursal norte y se entregó a las 14:32 con firma del receptor.
          </p>
          <h4 className="h4" style={{ marginTop: 16 }}>Observaciones</h4>
          <p className="body-sm">
            Falta una unidad del SKU SRR-7 (sierra circular) por quiebre de stock en bodega norte. Se sustituyó por una unidad equivalente de bodega sur. Acordado por teléfono con el cliente.
          </p>
        </article>
      </section>
    </div>
  ),
};

// =============================================================================
// Text transform roles (moved from the old CapsOptOut story — --tt-label / --tt-title)
// =============================================================================

const CapsSample = () => (
  <div style={{ display: 'grid', gap: 14 }}>
    <div><Caption>.h2 (--tt-title)</Caption><div className="h2">Heading display</div></div>
    <div><Caption>.eyebrow (--tt-label)</Caption><div className="eyebrow">Eyebrow / overline</div></div>
    <div><Caption>.label (--tt-label)</Caption><div className="label">Field label</div></div>
    <div>
      <Caption>.table th (--tt-label)</Caption>
      <table className="table" style={{ width: '100%' }}>
        <thead><tr><th>Producto</th><th>SKU</th></tr></thead>
        <tbody><tr><td>—</td><td>—</td></tr></tbody>
      </table>
    </div>
  </div>
);

/**
 * `--tt-label` (micro: eyebrows, badges, table headers, KPI/section labels)
 * and `--tt-title` (display headings: h1-h3, modal/drawer/empty titles,
 * appshell brand) control `text-transform`. Default `uppercase` → the
 * kit's look does not change. A consumer or preset sets either of the two
 * to `none` (e.g. `:root { --tt-title: none; }`) to drop the uppercase
 * without forking component CSS. The El Alba preset does not touch them:
 * its uppercase styling is a brand signature.
 */
export const TextTransformRoles: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Uppercase opt-out</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h3 className="h3" style={{ marginTop: 0 }}>Default (uppercase)</h3>
          <CapsSample />
        </div>
        <div style={{ ['--tt-title']: 'none', ['--tt-label']: 'none' } as React.CSSProperties}>
          <h3 className="h3" style={{ marginTop: 0 }}>--tt-title / --tt-label: none</h3>
          <CapsSample />
        </div>
      </div>
    </div>
  ),
};
