import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingChecklist } from './OnboardingChecklist';

export default {
  title: 'Blocks/Onboarding checklist',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Activation checklist with a progress bar and a CTA per task. Source: `src/blocks/OnboardingChecklist.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <OnboardingChecklist /> };
