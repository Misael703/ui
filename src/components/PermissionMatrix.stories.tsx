import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PermissionMatrix, type PermissionMatrixProps } from './Permissions';

function Controlled(args: PermissionMatrixProps) {
  const [value, setValue] = React.useState(args.value);
  return <PermissionMatrix {...args} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Components/PermissionMatrix',
  component: PermissionMatrix,
  tags: ['autodocs'],
  args: {
    roles: [
      { id: 'admin', label: 'Admin' },
      { id: 'editor', label: 'Editor' },
      { id: 'viewer', label: 'Viewer' },
    ],
    actions: [
      { id: 'read', label: 'Ver pedidos', description: 'Leer información de pedidos' },
      { id: 'write', label: 'Crear/editar pedidos' },
      { id: 'delete', label: 'Eliminar pedidos' },
      { id: 'export', label: 'Exportar a CSV' },
    ],
    value: {
      admin: ['read', 'write', 'delete', 'export'],
      editor: ['read', 'write'],
      viewer: ['read'],
    },
    onChange: fn(),
  },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof PermissionMatrix>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
