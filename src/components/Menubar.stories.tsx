import type { Meta, StoryObj } from '@storybook/react';
import { Menubar } from './Menubar';

export default { title: 'Navigation/Menubar', tags: ['autodocs'] } as Meta;

export const Basico: StoryObj = {
  render: () => (
    <Menubar
      menus={[
        {
          id: 'file',
          label: 'Archivo',
          items: [
            { id: 'new', label: 'Nuevo', shortcut: '⌘N', onSelect: () => alert('Nuevo') },
            { id: 'open', label: 'Abrir…', shortcut: '⌘O', onSelect: () => alert('Abrir') },
            { id: 'sep1', separator: true } as any,
            { id: 'save', label: 'Guardar', shortcut: '⌘S', onSelect: () => alert('Guardar') },
            { id: 'export', label: 'Exportar…', onSelect: () => alert('Exportar') },
          ],
        },
        {
          id: 'edit',
          label: 'Editar',
          items: [
            { id: 'undo', label: 'Deshacer', shortcut: '⌘Z', onSelect: () => alert('Deshacer') },
            { id: 'redo', label: 'Rehacer', shortcut: '⇧⌘Z', onSelect: () => alert('Rehacer') },
            { id: 'sep1', separator: true } as any,
            { id: 'cut', label: 'Cortar', shortcut: '⌘X', onSelect: () => alert('Cortar') },
            { id: 'copy', label: 'Copiar', shortcut: '⌘C', onSelect: () => alert('Copiar') },
            { id: 'paste', label: 'Pegar', shortcut: '⌘V', onSelect: () => alert('Pegar') },
          ],
        },
        {
          id: 'view',
          label: 'Ver',
          items: [
            { id: 'zoom-in', label: 'Acercar', shortcut: '⌘+', onSelect: () => alert('Zoom in') },
            { id: 'zoom-out', label: 'Alejar', shortcut: '⌘−', onSelect: () => alert('Zoom out') },
            { id: 'reset', label: 'Restablecer', shortcut: '⌘0', onSelect: () => alert('Reset') },
          ],
        },
      ]}
    />
  ),
};
