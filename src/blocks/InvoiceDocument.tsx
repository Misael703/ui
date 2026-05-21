'use client';
/**
 * Block: print-friendly invoice / recibo. Composes a header (issuer + invoice
 * meta), a customer block, a line-items table, totals, and a footer.
 * Designed to render cleanly to PDF (via your favourite browser-print
 * route or a renderer like react-pdf).
 *
 * The `@media print` block strips the page chrome and forces black ink so
 * the document looks the same whether you screenshot it, "Print → Save as
 * PDF", or pipe it through a headless renderer.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { Logo, Button } from '../index';
import { Download } from '../components/Icons';

interface InvoiceLine {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

const ISSUER = {
  name: 'Ferretería El Alba SpA',
  rut: '76.512.340-9',
  giro: 'Comercio al por menor de ferretería',
  address: 'Av. Principal 123, Santiago',
  email: 'contacto@elalba.cl',
  phone: '+56 2 2345 6789',
};

const CUSTOMER = {
  name: 'Northwind Builders S.A.',
  rut: '76.123.456-7',
  giro: 'Construcción de obras civiles',
  address: 'Av. Apoquindo 4500, Las Condes',
  email: 'compras@northwind.cl',
};

const LINES: InvoiceLine[] = [
  { sku: 'TLD-700', name: 'Taladro percutor 700W',     qty: 3,  unitPrice: 64990 },
  { sku: 'SRR-7',   name: 'Sierra circular 7-1/4"',    qty: 1,  unitPrice: 134900 },
  { sku: 'PNT-01',  name: 'Pintura látex blanca 1gal', qty: 12, unitPrice: 12990 },
];

const IVA_RATE = 0.19;

export function InvoiceDocument(): React.ReactElement {
  const subtotal = LINES.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const iva = Math.round(subtotal * IVA_RATE);
  const total = subtotal + iva;

  return (
    <div className="invoice-block" style={{ maxWidth: 820, margin: '0 auto', padding: 24 }}>
      {/* Actions bar — hidden when printing */}
      <div className="invoice-block__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button variant="outline" onClick={() => window.print()}>
          <Download size={16} style={{ marginRight: 6 }} /> Imprimir / PDF
        </Button>
      </div>

      {/* The document itself */}
      <article
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
        }}
      >
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ marginBottom: 12 }}>
              <Logo variant="horizontal" bg="light" height={32} />
            </div>
            <div className="cell-meta">{ISSUER.name}</div>
            <div className="cell-meta cell-mono">RUT {ISSUER.rut}</div>
            <div className="cell-meta">{ISSUER.giro}</div>
            <div className="cell-meta">{ISSUER.address}</div>
          </div>
          <div style={{ textAlign: 'right', minWidth: 220 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Factura electrónica
            </div>
            <div className="cell-mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
              N° 0010402
            </div>
            <div className="cell-meta" style={{ marginTop: 8 }}>SII · Reg. Electrónico Tributario</div>
          </div>
        </header>

        {/* Customer + meta */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Cliente
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{CUSTOMER.name}</div>
            <div className="cell-meta cell-mono">RUT {CUSTOMER.rut}</div>
            <div className="cell-meta">{CUSTOMER.giro}</div>
            <div className="cell-meta">{CUSTOMER.address}</div>
            <div className="cell-meta">{CUSTOMER.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Detalles
            </div>
            <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 4, margin: 0 }}>
              <dt className="cell-meta">Fecha emisión</dt>
              <dd className="cell-mono" style={{ margin: 0 }}>15-05-2026</dd>
              <dt className="cell-meta">Vencimiento</dt>
              <dd className="cell-mono" style={{ margin: 0 }}>14-06-2026</dd>
              <dt className="cell-meta">Condición</dt>
              <dd style={{ margin: 0 }}>30 días</dd>
              <dt className="cell-meta">Vendedor</dt>
              <dd style={{ margin: 0 }}>Carla Pizarro</dd>
            </dl>
          </div>
        </section>

        {/* Line items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
              <th style={{ textAlign: 'left',  padding: '8px 4px', fontWeight: 500, fontSize: 12, color: 'var(--fg-muted)' }}>SKU</th>
              <th style={{ textAlign: 'left',  padding: '8px 4px', fontWeight: 500, fontSize: 12, color: 'var(--fg-muted)' }}>Descripción</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 500, fontSize: 12, color: 'var(--fg-muted)' }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 500, fontSize: 12, color: 'var(--fg-muted)' }}>P. Unit.</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 500, fontSize: 12, color: 'var(--fg-muted)' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {LINES.map((l) => (
              <tr key={l.sku} style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td className="cell-mono" style={{ padding: '12px 4px', fontSize: 13 }}>{l.sku}</td>
                <td style={{ padding: '12px 4px' }}>{l.name}</td>
                <td className="cell-mono" style={{ padding: '12px 4px', textAlign: 'right' }}>{l.qty}</td>
                <td className="cell-mono" style={{ padding: '12px 4px', textAlign: 'right' }}>${l.unitPrice.toLocaleString('es-CL')}</td>
                <td className="cell-mono" style={{ padding: '12px 4px', textAlign: 'right' }}>${(l.qty * l.unitPrice).toLocaleString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 24px', margin: 0, minWidth: 280 }}>
            <dt className="cell-meta">Subtotal</dt>
            <dd className="cell-mono" style={{ margin: 0, textAlign: 'right' }}>${subtotal.toLocaleString('es-CL')}</dd>
            <dt className="cell-meta">IVA (19%)</dt>
            <dd className="cell-mono" style={{ margin: 0, textAlign: 'right' }}>${iva.toLocaleString('es-CL')}</dd>
            <dt style={{ fontWeight: 600, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-default)' }}>Total</dt>
            <dd className="cell-mono" style={{ margin: 0, fontWeight: 700, fontSize: 18, textAlign: 'right', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-default)' }}>
              ${total.toLocaleString('es-CL')}
            </dd>
          </dl>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, textAlign: 'center' }}>
          <div className="cell-meta">
            Documento tributario electrónico · Resolución SII Ex. N° 80, 22-08-2014
          </div>
          <div className="cell-meta" style={{ marginTop: 4 }}>
            {ISSUER.email} · {ISSUER.phone}
          </div>
        </footer>
      </article>

      {/* Print stylesheet — hide app chrome, force black ink on paper. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-block, .invoice-block * { visibility: visible; }
          .invoice-block { position: absolute; left: 0; top: 0; width: 100%; max-width: none; padding: 0; }
          .invoice-block__actions { display: none !important; }
          .invoice-block article {
            border: none !important;
            border-radius: 0 !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
