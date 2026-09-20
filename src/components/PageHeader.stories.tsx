import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './AppShell';
import { Button } from './Button';

// Hoisted: the actions node holds a React element, and the jsx source
// decorator recurses into `_owner` on elements created inside `render`
// (see DataTable.stories.tsx's gotcha).
const ACTIONS = <Button>Nuevo pedido</Button>;

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: { title: 'Pedidos', actions: ACTIONS },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: 'Todos los pedidos de la sucursal, desde retiro hasta entrega.' },
};

export const WithBreadcrumbs: Story = {
  args: {
    breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Pedidos' }],
    description: 'Todos los pedidos de la sucursal, desde retiro hasta entrega.',
  },
};
