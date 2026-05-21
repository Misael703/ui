import type { Meta, StoryObj } from '@storybook/react';
import { AuthSplit } from './AuthSplit';

/**
 * Copy-paste recipe (not shipped). Split-screen auth: form left + brand
 * panel right (logo watermark + tagline). Right panel hides under 768px.
 * Toggle the El Alba preset in the toolbar to see brand colors. Source:
 * `src/blocks/AuthSplit.tsx`.
 */
export default {
  title: 'Blocks/Auth split',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AuthSplit /> };
