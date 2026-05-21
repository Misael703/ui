import type { Meta, StoryObj } from '@storybook/react';
import { NotificationsPage } from './NotificationsPage';

/**
 * Copy-paste recipe (not shipped). Full-page notifications inbox with
 * tone filters and mark-all-as-read. Shares the `NotificationItem` shape
 * with the kit's `NotificationCenter` (bell dropdown) so one source of
 * truth can feed both. Source: `src/blocks/NotificationsPage.tsx`.
 */
export default {
  title: 'Blocks/Notifications page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <NotificationsPage /> };
