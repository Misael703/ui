import type { Meta, StoryObj } from '@storybook/react';
import { CartDrawer } from './CartDrawer';

export default {
  title: 'Blocks/Cart drawer',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Cart in a side Drawer with qty stepper, remove, subtotal/shipping/total summary, and checkout CTA. Pairs with `ProductCatalog`. Source: `src/blocks/CartDrawer.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <CartDrawer /> };
