import type { Meta, StoryObj } from '@storybook/react';
import { AuthScreen } from './AuthScreen';

/**
 * Copy-paste recipe (not shipped). Toggle the El Alba preset in the toolbar
 * to see it branded. Source: `src/blocks/AuthScreen.tsx`.
 */
export default {
  title: 'Blocks/Genéricos/Auth/Auth screen',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AuthScreen /> };
