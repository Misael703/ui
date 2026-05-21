import type { Meta, StoryObj } from '@storybook/react';
import { RouteSchedule } from './RouteSchedule';

/**
 * Copy-paste recipe (not shipped). Weekly route schedule for delivery
 * operations: 7-day x N-hour CSS Grid with event blocks positioned via
 * `gridRow: start/end`. Visual-only — wire up click handlers and DnD per
 * app. Source: `src/blocks/RouteSchedule.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Despachos/Route schedule',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <RouteSchedule /> };
