import type { Meta, StoryObj } from '@storybook/react';
import { RentalBooking } from './RentalBooking';

/**
 * Copy-paste recipe (not shipped). The core rental flow: pick tool + date
 * range (DateRangePicker) → live cost summary (días × tarifa) with the
 * deposit shown as a separate refundable line. Source:
 * `src/blocks/RentalBooking.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Rental booking',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <RentalBooking /> };
