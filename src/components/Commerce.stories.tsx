import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Rating, PriceDisplay, QuantitySelector, VariantSelector,
  WishlistButton, PromoCodeInput, FreeShippingProgress,
  CartDrawer, OrderSummary, AddressForm, CompareTable,
  type Address,
} from './Commerce';
import { Button } from './Button';

export default { title: 'Commerce', tags: ['autodocs'] } as Meta;

export const RatingDemo: StoryObj = {
  render: () => {
    const [v, setV] = React.useState(0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Rating value={4.5} />
        <Rating value={3} size={20} />
        <Rating value={v} onChange={setV} size={28} />
        <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Tu rating: {v}</span>
      </div>
    );
  },
};

export const PriceDisplayDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PriceDisplay amount={5490} size="sm" />
      <PriceDisplay amount={12990} compareAt={15990} size="md" />
      <PriceDisplay amount={89990} compareAt={129990} size="lg" />
      <PriceDisplay amount={249990} size="xl" />
    </div>
  ),
};

export const QuantitySelectorDemo: StoryObj = {
  render: () => {
    const [v, setV] = React.useState(1);
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <QuantitySelector value={v} onChange={setV} min={1} max={20} />
        <QuantitySelector value={v} onChange={setV} size="sm" />
      </div>
    );
  },
};

export const VariantSelectorDemo: StoryObj = {
  render: () => {
    const [color, setColor] = React.useState<string | null>('rojo');
    const [tamano, setTamano] = React.useState<string | null>('25kg');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <VariantSelector
          label="Color"
          appearance="swatch"
          value={color}
          onChange={setColor}
          options={[
            { value: 'rojo', label: 'Rojo', swatch: '#dc2626' },
            { value: 'azul', label: 'Azul', swatch: '#002f87' },
            { value: 'verde', label: 'Verde', swatch: '#2f9e44' },
            { value: 'negro', label: 'Negro', swatch: '#0c1220' },
          ]}
        />
        <VariantSelector
          label="Tamaño"
          value={tamano}
          onChange={setTamano}
          options={[
            { value: '25kg', label: '25kg' },
            { value: '42.5kg', label: '42.5kg' },
            { value: '50kg', label: '50kg' },
            { value: '90kg', label: '90kg', disabled: true },
          ]}
        />
      </div>
    );
  },
};

export const WishlistDemo: StoryObj = {
  render: () => {
    const [active, setActive] = React.useState(false);
    return <WishlistButton active={active} onToggle={setActive} />;
  },
};

export const PromoCodeDemo: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <PromoCodeInput
        onApply={async (code) => {
          await new Promise((r) => setTimeout(r, 600));
          if (code === 'BIENVENIDO') return '10% de descuento aplicado';
          throw new Error('Código no válido');
        }}
      />
    </div>
  ),
};

export const FreeShippingDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <FreeShippingProgress current={28000} threshold={50000} />
      <FreeShippingProgress current={55000} threshold={50000} />
    </div>
  ),
};

export const CartDrawerDemo: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState([
      { id: '1', name: 'Cemento gris 42.5kg', variant: 'Pack x4', unitPrice: 5490, quantity: 2 },
      { id: '2', name: 'Fierro corrugado 12mm', unitPrice: 3290, quantity: 5 },
    ]);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir carro ({items.length})</Button>
        <CartDrawer
          open={open}
          onClose={() => setOpen(false)}
          items={items}
          freeShippingThreshold={50000}
          onQuantityChange={(id, qty) => setItems((c) => c.map((i) => i.id === id ? { ...i, quantity: qty } : i))}
          onRemove={(id) => setItems((c) => c.filter((i) => i.id !== id))}
          onCheckout={() => alert('Ir a checkout')}
        />
      </>
    );
  },
};

export const OrderSummaryDemo: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <OrderSummary
        title="Resumen del pedido"
        rows={[
          { label: 'Subtotal (3 ítems)', value: '$45.250' },
          { label: 'Despacho', value: '$3.500' },
          { label: 'Descuento (BIENVENIDO)', value: '-$4.525' },
          { label: 'IVA 19%', value: '$8.408' },
          { label: 'Total', value: '$52.633', emphasis: true },
        ]}
      />
    </div>
  ),
};

export const AddressFormDemo: StoryObj = {
  render: () => {
    const [addr, setAddr] = React.useState<Partial<Address>>({});
    return (
      <div style={{ maxWidth: 600 }}>
        <AddressForm value={addr} onChange={setAddr} />
      </div>
    );
  },
};

export const CompareTableDemo: StoryObj = {
  render: () => {
    const [items, setItems] = React.useState([
      { id: '1', name: 'Cemento gris 25kg', price: '$3.490' },
      { id: '2', name: 'Cemento gris 42.5kg', price: '$5.490' },
      { id: '3', name: 'Cemento blanco 25kg', price: '$6.990' },
    ]);
    return (
      <CompareTable
        items={items}
        onRemove={(id) => setItems((c) => c.filter((i) => i.id !== id))}
        attributes={[
          { key: 'marca', label: 'Marca', values: { '1': 'Polpaico', '2': 'Polpaico', '3': 'Melón' } },
          { key: 'peso', label: 'Peso', values: { '1': '25 kg', '2': '42.5 kg', '3': '25 kg' } },
          { key: 'rendimiento', label: 'Rendimiento (m²)', values: { '1': '~5', '2': '~9', '3': '~5' } },
          { key: 'tiempo-fraguado', label: 'Tiempo de fraguado', values: { '1': '8h', '2': '8h', '3': '6h' } },
        ]}
      />
    );
  },
};
