import type { Meta, StoryObj } from '@storybook/react';
import { ErrorPage } from './ErrorPage';

export default {
  title: 'Blocks/Error page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Full-page error state with retry CTA and support contact. Source: `src/blocks/ErrorPage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <ErrorPage onRetry={() => { /* re-fetch */ }} /> };
