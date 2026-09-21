import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog, type ConfirmDialogProps } from './Editing';
import { Button } from './Button';

function Launcher(args: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(args.open);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Eliminar pedido</Button>
      <ConfirmDialog {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    open: false,
    onClose: () => {},
    onConfirm: () => new Promise((r) => setTimeout(r, 800)),
    title: '¿Eliminar pedido #1042?',
    description: 'Esta acción no se puede deshacer. Los datos del cliente quedarán intactos.',
    confirmLabel: 'Eliminar',
    tone: 'danger',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'danger'] },
  },
  render: (a) => <Launcher {...a} />,
} satisfies Meta<typeof ConfirmDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
