import type { Meta, StoryObj } from '@storybook/react';
import { ToolCatalog } from './ToolCatalog';

/**
 * Copy-paste recipe (not shipped). Tool rental catalog — cards lead with
 * rate-per-period + availability badge + deposit, not a sale price.
 * Filter sidebar by category and availability. Source:
 * `src/blocks/ToolCatalog.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Tool catalog',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <ToolCatalog /> };
