import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PermissionMatrix } from './Permissions';

export default { title: 'Patterns/Permissions', tags: ['autodocs'] } as Meta;

export const Demo: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState<Record<string, string[]>>({
      admin: ['read', 'write', 'delete', 'export'],
      editor: ['read', 'write'],
      viewer: ['read'],
    });
    return (
      <PermissionMatrix
        value={value}
        onChange={setValue}
        roles={[
          { id: 'admin', label: 'Admin' },
          { id: 'editor', label: 'Editor' },
          { id: 'viewer', label: 'Viewer' },
        ]}
        actions={[
          { id: 'read', label: 'Ver pedidos', description: 'Leer información de pedidos' },
          { id: 'write', label: 'Crear/editar pedidos' },
          { id: 'delete', label: 'Eliminar pedidos' },
          { id: 'export', label: 'Exportar a CSV' },
        ]}
      />
    );
  },
};
