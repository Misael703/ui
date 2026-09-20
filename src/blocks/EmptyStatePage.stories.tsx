import type { Meta, StoryObj } from '@storybook/react';
import { EmptyStatePage } from './EmptyStatePage';

export default {
  title: 'Blocks/Empty state page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Full-page empty state for a collection that has no rows yet — wraps the `EmptyState` component in a centered page card with a primary CTA. Source: `src/blocks/EmptyStatePage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <EmptyStatePage /> };
