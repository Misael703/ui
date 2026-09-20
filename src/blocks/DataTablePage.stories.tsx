import type { Meta, StoryObj } from '@storybook/react';
import { DataTablePage } from './DataTablePage';

export default {
  title: 'Blocks/Data table page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Filter sidebar + toolbar + selectable table + bulk actions + pagination. Source: `src/blocks/DataTablePage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <DataTablePage /> };
