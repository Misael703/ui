import type { Meta, StoryObj } from '@storybook/react';
import { InvoiceDocument } from './InvoiceDocument';

/**
 * Copy-paste recipe (not shipped). Print-friendly factura/recibo with
 * issuer + customer blocks, line items, totals (subtotal + IVA), and
 * footer. The `@media print` block strips the page chrome for clean
 * PDF/paper output. Source: `src/blocks/InvoiceDocument.tsx`.
 */
export default {
  title: 'Blocks/Invoice document',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <InvoiceDocument /> };
