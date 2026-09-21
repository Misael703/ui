import type { Meta, StoryObj } from '@storybook/react';
import { NotFound } from './NotFound';

export default {
  title: 'Blocks/Not found',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). 404 page with brand-colored numeral and two recovery actions (back, home). Switch the toolbar preset to see the brand overlay. Source: `src/blocks/NotFound.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <NotFound /> };
