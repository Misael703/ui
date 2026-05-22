import type { Meta, StoryObj } from '@storybook/react';
import { RentalAgreement } from './RentalAgreement';

/**
 * Copy-paste recipe (not shipped). Print-friendly rental contract: lessor
 * + lessee blocks, equipment/period/rate, deposit, terms, signatures. The
 * `@media print` block strips app chrome for clean PDF/paper. Sibling of
 * Invoice document. Source: `src/blocks/RentalAgreement.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Rental agreement',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <RentalAgreement /> };
