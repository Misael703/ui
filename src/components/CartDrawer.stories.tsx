import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CartDrawer, type CartDrawerProps, type CartLineItem } from './Commerce';
import { Button } from './Button';

const INITIAL_ITEMS: CartLineItem[] = [
  { id: '1', name: 'Taladro percutor 650W', variant: 'Set con maletín', unitPrice: 45990, quantity: 1 },
  { id: '2', name: 'Sierra circular 7¼"', unitPrice: 89990, quantity: 1 },
];

function Launcher(args: CartDrawerProps) {
  const [open, setOpen] = React.useState(args.open);
  const [items, setItems] = React.useState(INITIAL_ITEMS);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir carro ({items.length})</Button>
      <CartDrawer
        {...args}
        open={open}
        items={items}
        onClose={() => setOpen(false)}
        onQuantityChange={(id, qty) => setItems((c) => c.map((i) => (i.id === id ? { ...i, quantity: qty } : i)))}
        onRemove={(id) => setItems((c) => c.filter((i) => i.id !== id))}
      />
    </>
  );
}

const meta = {
  title: 'Components/CartDrawer',
  component: CartDrawer,
  tags: ['autodocs'],
  args: {
    open: false,
    items: INITIAL_ITEMS,
    onClose: () => {},
    freeShippingThreshold: 50000,
    onCheckout: () => {},
  },
  render: (a) => <Launcher {...a} />,
} satisfies Meta<typeof CartDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
