import type { Meta, StoryObj } from '@storybook/react';
import { AuditLogPage } from './AuditLogPage';

/**
 * Copy-paste recipe (not shipped). Chronological audit log with DataTable
 * + DiffViewer on row click. Wires two underused kit pieces (DiffViewer
 * and Modal) into a real auditing pattern. Source:
 * `src/blocks/AuditLogPage.tsx`.
 */
export default {
  title: 'Blocks/Audit log page',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <AuditLogPage /> };
