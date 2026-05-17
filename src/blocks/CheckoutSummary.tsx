'use client';
/**
 * Block: checkout page (address form + order summary + promo + free-shipping
 * progress). Copy-paste recipe. Replace `../index` with `@misael703/ui`.
 * The kit ships no country data: define your own address field set per market.
 */
import * as React from 'react';
import {
  AddressForm,
  OrderSummary,
  PromoCodeInput,
  FreeShippingProgress,
  Button,
  type AddressField,
} from '../index';

const CL_REGIONS = ['Metropolitana', 'Valparaíso', 'Biobío', 'Maule', 'Araucanía'].map((r) => ({
  value: r,
  label: r,
}));

const fields: AddressField[] = [
  { key: 'fullName', label: 'Nombre completo' },
  { key: 'rut', label: 'RUT', placeholder: '12.345.678-9' },
  { key: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678' },
  { key: 'street', label: 'Calle', width: 'half' },
  { key: 'number', label: 'Número', width: 'third' },
  { key: 'apartment', label: 'Depto/Casa', width: 'third' },
  { key: 'region', label: 'Región', type: 'select', options: CL_REGIONS, width: 'half' },
  { key: 'comuna', label: 'Comuna', width: 'half' },
  { key: 'notes', label: 'Notas para el despacho (opcional)', type: 'textarea', rows: 2 },
];

export function CheckoutSummary(): React.ReactElement {
  const [addr, setAddr] = React.useState<Record<string, string>>({});

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: 32,
        alignItems: 'start',
        maxWidth: 1000,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <section>
        <h2 className="h3" style={{ marginTop: 0 }}>Datos de despacho</h2>
        <AddressForm fields={fields} value={addr} onChange={setAddr} />
      </section>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
        <FreeShippingProgress current={42000} threshold={50000} />
        <OrderSummary
          title="Resumen del pedido"
          rows={[
            { label: 'Subtotal (3 ítems)', value: '$45.250' },
            { label: 'Despacho', value: '$3.500' },
            { label: 'IVA 19%', value: '$8.408' },
            { label: 'Total', value: '$57.158', emphasis: true },
          ]}
        />
        <PromoCodeInput
          onApply={async (code) => {
            await new Promise((r) => setTimeout(r, 500));
            if (code.trim().toUpperCase() === 'BIENVENIDO') return '10% de descuento aplicado';
            throw new Error('Código no válido');
          }}
        />
        <Button fullWidth>Pagar</Button>
      </aside>
    </div>
  );
}
