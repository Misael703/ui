import type { Meta, StoryObj } from '@storybook/react';
import { DetailPage } from './DetailPage';

/**
 * Copy-paste recipe (not shipped). Entity detail page: PageHeader + Tabs +
 * two-column layout with sticky meta sidebar. Example shown: a Pedido.
 * Toggle the El Alba preset in the toolbar to see brand colors. Source:
 * `src/blocks/DetailPage.tsx`.
 */
export default {
  title: 'Blocks/Genéricos/Data/Detail page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <DetailPage /> };
