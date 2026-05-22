import type { Meta, StoryObj } from '@storybook/react';
import { DataTablePage } from './DataTablePage';

/**
 * Copy-paste recipe (not shipped). Filter sidebar + toolbar + selectable
 * table + bulk actions + pagination. Source: `src/blocks/DataTablePage.tsx`.
 */
export default {
  title: 'Blocks/Genéricos/Data/Data table page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <DataTablePage /> };
