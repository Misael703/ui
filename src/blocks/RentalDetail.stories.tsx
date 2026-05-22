import type { Meta, StoryObj } from '@storybook/react';
import { RentalDetail } from './RentalDetail';

/**
 * Copy-paste recipe (not shipped). Single-rental view: header + status,
 * vertical lifecycle timeline (Reservado → Entregado → En uso → Devuelto),
 * sticky meta sidebar with equipment/customer/period and cost/deposit.
 * Source: `src/blocks/RentalDetail.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Rental detail',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <RentalDetail /> };
