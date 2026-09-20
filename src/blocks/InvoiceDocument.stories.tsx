import type { Meta, StoryObj } from '@storybook/react';
import { InvoiceDocument } from './InvoiceDocument';

export default {
  title: 'Blocks/Invoice document',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Print-friendly invoice/receipt with issuer + customer blocks, line items, totals (subtotal + tax), and footer. The `@media print` block strips the page chrome for clean PDF/paper output. Source: `src/blocks/InvoiceDocument.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <InvoiceDocument /> };
