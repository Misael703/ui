import type { Meta, StoryObj } from '@storybook/react';
import { AppShellTop } from './AppShellTop';

/**
 * Copy-paste recipe (not shipped). Showcases the v1.15.0 `headerLayout="top"`
 * AppShell: full-width header with three slots, centered logo, sidebar
 * collapses without affecting the header. Toggle the El Alba preset in the
 * toolbar to see the brand variant. Source: `src/blocks/AppShellTop.tsx`.
 */
export default {
  title: 'Blocks/AppShell top',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AppShellTop /> };
