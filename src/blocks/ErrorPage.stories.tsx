import type { Meta, StoryObj } from '@storybook/react';
import { ErrorPage } from './ErrorPage';

/**
 * Copy-paste recipe (not shipped). Full-page error state with retry CTA
 * and support contact. Source: `src/blocks/ErrorPage.tsx`.
 */
export default {
  title: 'Blocks/Genéricos/Estados/Error page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <ErrorPage onRetry={() => { /* re-fetch */ }} /> };
