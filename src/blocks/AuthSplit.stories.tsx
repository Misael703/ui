import type { Meta, StoryObj } from '@storybook/react';
import { AuthSplit } from './AuthSplit';

export default {
  title: 'Blocks/Auth split',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Split-screen auth: form left + brand panel right (logo watermark + tagline). Right panel hides under 768px. Switch the toolbar preset to see the brand overlay. Source: `src/blocks/AuthSplit.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AuthSplit /> };
