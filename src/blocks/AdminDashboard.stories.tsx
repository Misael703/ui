import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboard } from './AdminDashboard';

/**
 * Copy-paste recipe (not shipped). Admin dashboard with the v1.15.0
 * `headerLayout="top"` AppShell — full-width header with three slots,
 * centered logo, sidebar that collapses without affecting the header.
 * Toggle the El Alba preset in the toolbar to see the brand variant.
 * Source: `src/blocks/AdminDashboard.tsx`.
 */
export default {
  title: 'Blocks/Genéricos/Shell/Admin dashboard',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AdminDashboard /> };
