import type { Meta, StoryObj } from '@storybook/react';
import { ReturnInspection } from './ReturnInspection';

/**
 * Copy-paste recipe (not shipped). Return check-in: pass/fail condition
 * checklist + damage notes + photos + LIVE deposit settlement (every
 * retention subtracts from the refund in real time). The most
 * rental-specific block. Source: `src/blocks/ReturnInspection.tsx`.
 */
export default {
  title: 'Blocks/Dominio/Rentools/Return inspection',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <ReturnInspection /> };
