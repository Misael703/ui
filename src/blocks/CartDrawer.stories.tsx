import type { Meta, StoryObj } from '@storybook/react';
import { CartDrawer } from './CartDrawer';

/**
 * Copy-paste recipe (not shipped). Cart in a side Drawer with qty stepper,
 * remove, subtotal/shipping/total summary, and checkout CTA. Pairs with
 * `ProductCatalog`. Source: `src/blocks/CartDrawer.tsx`.
 */
export default {
  title: 'Blocks/Commerce/Cart drawer',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <CartDrawer /> };
