import type { Meta, StoryObj } from '@storybook/react';
import { NotFound } from './NotFound';

/**
 * Copy-paste recipe (not shipped). 404 page with brand-colored numeral
 * and two recovery actions (back, home). Toggle the El Alba preset in the
 * toolbar to see brand colors. Source: `src/blocks/NotFound.tsx`.
 */
export default {
  title: 'Blocks/Not found',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <NotFound /> };
