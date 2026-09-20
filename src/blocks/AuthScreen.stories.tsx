import type { Meta, StoryObj } from '@storybook/react';
import { AuthScreen } from './AuthScreen';

export default {
  title: 'Blocks/Auth screen',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Switch the toolbar preset to see the brand overlay. Source: `src/blocks/AuthScreen.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AuthScreen /> };
