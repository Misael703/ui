import type { Meta, StoryObj } from '@storybook/react';
import { WizardPage } from './WizardPage';

export default {
  title: 'Blocks/Wizard page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Multi-step form (wizard) with a Stepper on the left and the form area on the right. Example shown: creating a new shipping order in 4 steps. Source: `src/blocks/WizardPage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <WizardPage /> };
