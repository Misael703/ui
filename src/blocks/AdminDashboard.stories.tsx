import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboard } from './AdminDashboard';

/** Copy-paste recipe (not shipped). Source: `src/blocks/AdminDashboard.tsx`. */
export default {
  title: 'Blocks/Admin dashboard',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AdminDashboard /> };
