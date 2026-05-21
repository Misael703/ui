import type { Meta, StoryObj } from '@storybook/react';
import { SettingsPage } from './SettingsPage';

/**
 * Copy-paste recipe (not shipped). Settings page with vertical section nav
 * (Cuenta / Notificaciones / Seguridad / Facturación) and a form area per
 * section. In your app, route each section to its own URL and read the
 * active section from the router. Source: `src/blocks/SettingsPage.tsx`.
 */
export default {
  title: 'Blocks/Settings page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <SettingsPage /> };
