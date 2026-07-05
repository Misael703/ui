'use client';
/**
 * Block: cart drawer. Side `Drawer` with line items (qty stepper + remove),
 * subtotal/shipping/total summary, and a "Pagar" CTA. Pairs naturally with
 * `ProductCatalog` (open from the "Agregar al carrito" button).
 *
 * Copy-paste recipe. Replace `../index` with `@misael703/ui` in your app.
 */
import * as React from 'react';
import { Drawer, Button, IconButton, NumberInput, OrderSummary } from '../index';
import { ShoppingCart, Trash } from '../components/Icons';

interface CartLine {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
}

const SHIPPING = 3500;

export function CartDrawer(): React.ReactElement {
  const [open, setOpen] = React.useState(true);
  const [lines, setLines] = React.useState<CartLine[]>([
    { id: '1', name: 'Taladro percutor 700W',      sku: 'TLD-700', price: 64990, qty: 1 },
    { id: '2', name: 'Pintura látex blanca 1gal',  sku: 'PNT-01',  price: 12990, qty: 2 },
    { id: '3', name: 'Brocha angular 2"',          sku: 'BRC-02',  price: 3290,  qty: 4 },
  ]);

  const setQty = (id: string, qty: number) =>
    setLines((curr) => curr.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)));
  const remove = (id: string) => setLines((curr) => curr.filter((l) => l.id !== id));

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const total = subtotal + (lines.length > 0 ? SHIPPING : 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <>
      {/* Trigger — in your app this lives in the topbar / header.right */}
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>
          <ShoppingCart size={16} style={{ marginRight: 8 }} />
          Abrir carrito ({itemCount})
        </Button>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        title={`Tu carrito (${itemCount})`}
        footer={
          lines.length > 0 ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <OrderSummary
                rows={[
                  { label: `Subtotal (${itemCount} ítems)`, value: `$${subtotal.toLocaleString('es-CL')}` },
                  { label: 'Despacho',                      value: `$${SHIPPING.toLocaleString('es-CL')}` },
                  { label: 'Total',                         value: `$${total.toLocaleString('es-CL')}`, emphasis: true },
                ]}
              />
              <Button fullWidth>Pagar</Button>
            </div>
          ) : undefined
        }
      >
        {lines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <ShoppingCart size={40} style={{ color: 'var(--fg-muted)', marginBottom: 12 }} />
            <p style={{ margin: 0, color: 'var(--fg-muted)' }}>Tu carrito está vacío</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {lines.map((l) => (
              <li
                key={l.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border-default)',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--fg-muted)',
                    fontSize: 11,
                  }}
                  className="cell-mono"
                  aria-hidden="true"
                >
                  {l.sku}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{l.name}</div>
                  <div className="cell-meta cell-mono">${l.price.toLocaleString('es-CL')} c/u</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <NumberInput value={l.qty} onChange={(v) => setQty(l.id, v ?? 1)} min={1} step={1} />
                    <IconButton icon={<Trash size={16} />} aria-label={`Quitar ${l.name}`} onClick={() => remove(l.id)} size="sm" />
                  </div>
                </div>
                <div className="cell-mono" style={{ fontWeight: 600, alignSelf: 'start' }}>
                  ${(l.price * l.qty).toLocaleString('es-CL')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  );
}
