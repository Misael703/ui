import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from './ContextMenu';
import { Edit, Trash, Copy, Download } from './Icons';

const ITEMS = [
  { id: 'edit', label: 'Editar', icon: <Edit size={14} />, onSelect: () => alert('Editar') },
  { id: 'copy', label: 'Duplicar', icon: <Copy size={14} />, onSelect: () => alert('Duplicar') },
  { id: 'download', label: 'Descargar', icon: <Download size={14} />, onSelect: () => alert('Descargar') },
  { id: 'sep', separator: true } as any,
  { id: 'del', label: 'Eliminar', icon: <Trash size={14} />, onSelect: () => alert('Eliminar') },
];

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  args: { items: ITEMS, children: null, ariaLabel: 'Menú contextual' },
} satisfies Meta<typeof ContextMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <ContextMenu {...a}>
      <div
        style={{
          padding: 32,
          background: 'var(--bg-subtle)',
          border: '1px dashed var(--border-default)',
          borderRadius: 8,
          textAlign: 'center',
          color: 'var(--fg-muted)',
        }}
      >
        Click derecho aquí
      </div>
    </ContextMenu>
  ),
};
