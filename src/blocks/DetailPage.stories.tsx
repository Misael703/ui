import type { Meta, StoryObj } from '@storybook/react';
import { DetailPage } from './DetailPage';

export default {
  title: 'Blocks/Detail page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Entity detail page: PageHeader + Tabs + two-column layout with sticky meta sidebar. Example shown: an order. Switch the toolbar preset to see the brand overlay. Source: `src/blocks/DetailPage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <DetailPage /> };
