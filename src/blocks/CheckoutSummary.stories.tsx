import type { Meta, StoryObj } from '@storybook/react';
import { CheckoutSummary } from './CheckoutSummary';

export default {
  title: 'Blocks/Checkout',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Source: `src/blocks/CheckoutSummary.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <CheckoutSummary /> };
