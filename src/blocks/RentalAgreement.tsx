'use client';
/**
 * Block: rental agreement / contract (Domain → Rentools). Print-friendly
 * document: lessor + lessee blocks, equipment + period + rate, deposit,
 * terms, and a signature area. Sibling of `InvoiceDocument` adapted to a
 * contract (the legal artifact the renter signs at pickup).
 *
 * The `@media print` block strips the app chrome and forces clean output
 * for "Print → Save as PDF" or a headless renderer.
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { Logo, Button } from '../index';
import { Download } from '../components/Icons';

const LESSOR = {
  name: 'Rentools SpA',
  rut: '77.888.999-0',
  address: 'Av. Industrial 1200, Santiago',
  phone: '+56 2 2987 6543',
};

const LESSEE = {
  name: 'Constructora del Sur Ltda.',
  rut: '76.234.567-8',
  address: 'Camino El Roble 450, Buin',
  contact: 'Pedro Salgado',
  phone: '+56 9 8765 4321',
};

const RENTAL = {
  id: 'R-1025',
  tool: 'Andamio modular 4m',
  sku: 'AND-4M',
  from: '15-05-2026',
  to: '22-05-2026',
  days: 8,
  ratePerDay: 14000,
  deposit: 140000,
};

const TERMS = [
  'El arrendatario es responsable del equipo desde el retiro hasta la devolución.',
  'Daños, pérdidas o faltantes se descuentan de la garantía; si exceden, se facturan aparte.',
  'La devolución tardía genera multa equivalente a un día de arriendo por día de atraso.',
  'El equipo debe devolverse limpio y en las mismas condiciones de entrega.',
];

export function RentalAgreement(): React.ReactElement {
  const rentalTotal = RENTAL.days * RENTAL.ratePerDay;

  return (
    <div className="agreement-block" style={{ maxWidth: 820, margin: '0 auto', padding: 24 }}>
      <div className="agreement-block__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button variant="outline" onClick={() => window.print()}>
          <Download size={16} style={{ marginRight: 6 }} /> Imprimir / PDF
        </Button>
      </div>

      <article
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
        }}
      >
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
          <div>
            <div style={{ marginBottom: 12 }}><Logo variant="horizontal" bg="light" height={32} /></div>
            <div className="cell-meta">{LESSOR.name}</div>
            <div className="cell-meta cell-mono">RUT {LESSOR.rut}</div>
            <div className="cell-meta">{LESSOR.address}</div>
          </div>
          <div style={{ textAlign: 'right', minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Contrato de arriendo
            </div>
            <div className="cell-mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
              {RENTAL.id}
            </div>
          </div>
        </header>

        {/* Lessee */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Arrendatario
          </div>
          <div style={{ fontWeight: 600 }}>{LESSEE.name}</div>
          <div className="cell-meta cell-mono">RUT {LESSEE.rut}</div>
          <div className="cell-meta">{LESSEE.address}</div>
          <div className="cell-meta">{LESSEE.contact} · {LESSEE.phone}</div>
        </section>

        {/* Equipment + period */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <tbody>
            <AgreementRow label="Equipo" value={`${RENTAL.tool} (${RENTAL.sku})`} />
            <AgreementRow label="Periodo" value={`${RENTAL.from} → ${RENTAL.to} (${RENTAL.days} días)`} mono />
            <AgreementRow label="Tarifa diaria" value={`$${RENTAL.ratePerDay.toLocaleString('es-CL')}`} mono />
            <AgreementRow label="Total arriendo" value={`$${rentalTotal.toLocaleString('es-CL')}`} mono strong />
            <AgreementRow label="Garantía (reembolsable)" value={`$${RENTAL.deposit.toLocaleString('es-CL')}`} mono />
          </tbody>
        </table>

        {/* Terms */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Términos
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--fg-default)', fontSize: 13, lineHeight: 1.7 }}>
            {TERMS.map((term, i) => <li key={i}>{term}</li>)}
          </ol>
        </section>

        {/* Signatures */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 48 }}>
          {[LESSOR.name, LESSEE.name].map((name, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid var(--fg-default)', paddingTop: 8 }}>
                <div style={{ fontWeight: 500 }}>{name}</div>
                <div className="cell-meta">{i === 0 ? 'Arrendador' : 'Arrendatario'}</div>
              </div>
            </div>
          ))}
        </section>
      </article>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .agreement-block, .agreement-block * { visibility: visible; }
          .agreement-block { position: absolute; left: 0; top: 0; width: 100%; max-width: none; padding: 0; }
          .agreement-block__actions { display: none !important; }
          .agreement-block article { border: none !important; border-radius: 0 !important; padding: 24px !important; }
        }
      `}</style>
    </div>
  );
}

function AgreementRow({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
      <td style={{ padding: '10px 4px', color: 'var(--fg-muted)', fontSize: 13, width: 200 }}>{label}</td>
      <td className={mono ? 'cell-mono' : undefined} style={{ padding: '10px 4px', textAlign: 'right', fontWeight: strong ? 700 : 400 }}>
        {value}
      </td>
    </tr>
  );
}
