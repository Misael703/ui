import type { Meta, StoryObj } from '@storybook/react';
import { ScheduleWeek } from './ScheduleWeek';

/**
 * Copy-paste recipe (not shipped). Weekly calendar grid 7 days × N hours
 * with event blocks positioned via CSS Grid `gridRow: start/end`.
 * Visual-only — wire up event click handlers and DnD per app. Source:
 * `src/blocks/ScheduleWeek.tsx`.
 */
export default {
  title: 'Blocks/Schedule week',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <ScheduleWeek /> };
