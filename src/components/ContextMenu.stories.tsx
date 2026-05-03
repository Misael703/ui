import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from './ContextMenu';
import { Edit, Trash, Copy, Download } from './Icons';

export default { title: 'Overlay/ContextMenu', tags: ['autodocs'] } as Meta;

export const Basico: StoryObj = {
  render: () => (
    <ContextMenu
      items={[
        { id: 'edit', label: 'Editar', icon: <Edit size={14} />, onSelect: () => alert('Editar') },
        { id: 'copy', label: 'Duplicar', icon: <Copy size={14} />, onSelect: () => alert('Duplicar') },
        { id: 'download', label: 'Descargar', icon: <Download size={14} />, onSelect: () => alert('Descargar') },
        { id: 'sep', separator: true } as any,
        { id: 'del', label: 'Eliminar', icon: <Trash size={14} />, onSelect: () => alert('Eliminar') },
      ]}
    >
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
