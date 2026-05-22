import type { Meta, StoryObj } from '@storybook/react';
import { ProductCatalog } from './ProductCatalog';

/**
 * Copy-paste recipe (not shipped). E-commerce catalog page: FilterPanel
 * sidebar + responsive grid of ProductCards + toolbar (search + sort).
 * Source: `src/blocks/ProductCatalog.tsx`.
 */
export default {
  title: 'Blocks/Commerce/Product catalog',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <ProductCatalog /> };
