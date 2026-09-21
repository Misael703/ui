import type { Meta, StoryObj } from '@storybook/react';
import { SettingsPage } from './SettingsPage';

export default {
  title: 'Blocks/Settings page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Settings page with a vertical section nav and one form area per section. Source: `src/blocks/SettingsPage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <SettingsPage /> };
