import type { Meta, StoryObj } from '@storybook/react';
import { EmptyStatePage } from './EmptyStatePage';

/**
 * Copy-paste recipe (not shipped). Full-page empty state for a collection
 * that has no rows yet — wraps the `EmptyState` component in a centered
 * page card with a primary CTA. Source: `src/blocks/EmptyStatePage.tsx`.
 */
export default {
  title: 'Blocks/Empty state page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <EmptyStatePage /> };
