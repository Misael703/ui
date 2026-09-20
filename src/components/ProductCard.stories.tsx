import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './Display';
import { Button } from './Button';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: { name: 'Taladro percutor 650W', price: formatCurrency(45990) },
} satisfies Meta<typeof ProductCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 720 }}>
      <ProductCard
        sku="ELT-12-AC"
        name="Cemento gris 42.5 kg"
        price={formatCurrency(5490)}
        tag="Oferta"
        footer={<Button size="sm" fullWidth>Agregar</Button>}
      />
      <ProductCard
        sku="FRR-08"
        name="Fierro corrugado 12mm"
        price={formatCurrency(3290)}
        footer={<Button size="sm" variant="outline" fullWidth>Cotizar</Button>}
      />
      <ProductCard
        sku="PNT-01"
        name="Pintura látex blanca 1gal"
        price={formatCurrency(12990)}
        tag="Nuevo"
        footer={<Button size="sm" fullWidth>Agregar</Button>}
      />
    </div>
  ),
};
