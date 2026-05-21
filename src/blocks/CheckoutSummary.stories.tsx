import type { Meta, StoryObj } from '@storybook/react';
import { CheckoutSummary } from './CheckoutSummary';

/** Copy-paste recipe (not shipped). Source: `src/blocks/CheckoutSummary.tsx`. */
export default {
  title: 'Blocks/Commerce/Checkout',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <CheckoutSummary /> };
