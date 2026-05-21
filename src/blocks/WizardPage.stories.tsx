import type { Meta, StoryObj } from '@storybook/react';
import { WizardPage } from './WizardPage';

/**
 * Copy-paste recipe (not shipped). Multi-step form (wizard) with Stepper
 * on the left and form area on the right. Example shown: creating a new
 * shipping order in 4 steps. In your app, persist the draft between steps
 * and use react-hook-form per step. Source: `src/blocks/WizardPage.tsx`.
 */
export default {
  title: 'Blocks/Genéricos/Utility/Wizard page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <WizardPage /> };
