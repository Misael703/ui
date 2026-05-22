import type { Meta, StoryObj } from '@storybook/react';
import { AvailabilityCalendar } from './AvailabilityCalendar';

/**
 * Copy-paste recipe (not shipped). Month view of one equipment's
 * availability — kit Calendar with tone-coded events (rented = danger,
 * maintenance = warning; free days carry none) + legend + upcoming
 * reservations list. Source: `src/blocks/AvailabilityCalendar.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Availability calendar',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AvailabilityCalendar /> };
