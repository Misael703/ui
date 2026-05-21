import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingChecklist } from './OnboardingChecklist';

/**
 * Copy-paste recipe (not shipped). Activation checklist with progress bar
 * and a CTA per task. In your app, wire the completion state to your real
 * source of truth (user profile, feature flag, API count). Source:
 * `src/blocks/OnboardingChecklist.tsx`.
 */
export default {
  title: 'Blocks/Onboarding checklist',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <OnboardingChecklist /> };
