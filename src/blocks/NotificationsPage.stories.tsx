import type { Meta, StoryObj } from '@storybook/react';
import { NotificationsPage } from './NotificationsPage';

export default {
  title: 'Blocks/Notifications page',
  parameters: { layout: 'fullscreen', docs: { description: { component: "Copy-paste recipe (not shipped). Full-page notifications inbox with tone filters and mark-all-as-read. Shares the `NotificationItem` shape with the kit's `NotificationCenter` (bell dropdown) so both can read from a single source. Source: `src/blocks/NotificationsPage.tsx`." } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <NotificationsPage /> };
