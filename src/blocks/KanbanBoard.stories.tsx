import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from './KanbanBoard';

/**
 * Copy-paste recipe (not shipped). Kanban board with columns by status,
 * cards with priority/assignee/due. Visual-only — drag-and-drop wiring is
 * left to the consumer (pick dnd-kit, react-beautiful-dnd, or HTML5).
 * Source: `src/blocks/KanbanBoard.tsx`.
 */
export default {
  title: 'Blocks/Kanban board',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj = { render: () => <KanbanBoard /> };
