import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboard } from './AdminDashboard';

export default {
  title: 'Blocks/Admin dashboard',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Admin dashboard with the v1.15.0 `headerLayout="top"` AppShell — full-width header with three slots, centered logo, sidebar that collapses without affecting the header. Switch the toolbar preset to see the brand overlay. Source: `src/blocks/AdminDashboard.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AdminDashboard /> };
