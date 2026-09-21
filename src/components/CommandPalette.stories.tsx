import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { CommandPalette, type CommandItem } from './AdvancedPickers';

// Hoisted to module scope: a stable reference for the meta-level `args`
// (same convention followed even though these items hold no React elements).
const COMMANDS: CommandItem[] = [
  { id: '1', label: 'Nuevo pedido', group: 'Acciones', shortcut: '⌘N', onRun: () => alert('Nuevo pedido') },
  { id: '2', label: 'Buscar producto', group: 'Acciones', shortcut: '⌘P', onRun: () => alert('Buscar producto') },
  { id: '3', label: 'Ir a reportes', group: 'Navegación', onRun: () => alert('Ir a reportes') },
];

const meta = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  // The palette is a fixed-position, full-viewport overlay; fullscreen keeps
  // the docs canvas free of the default padded box around it.
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: fn(), items: COMMANDS },
} satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
