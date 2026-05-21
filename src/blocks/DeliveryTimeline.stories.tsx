import type { Meta, StoryObj } from '@storybook/react';
import { DeliveryTimeline } from './DeliveryTimeline';

/**
 * Copy-paste recipe (not shipped). Vertical lifecycle timeline of one
 * delivery: Created → Paid → Prepared → Loaded → En route → Delivered.
 * Each event has timestamp, actor, description, optional photo. Pairs
 * naturally as a tab in `DetailPage`. Source:
 * `src/blocks/DeliveryTimeline.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Despachos/Delivery timeline',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <DeliveryTimeline /> };
