import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, type DrawerProps } from './Overlay';
import { Button } from './Button';

function Launcher(args: DrawerProps) {
  // Seeded once from `args.open` (React only reads the initial value) so a
  // story can render pre-opened without fighting the trigger's own
  // open/close state on every re-render.
  const [open, setOpen] = React.useState(args.open);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir drawer</Button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    open: false,
    onClose: () => {},
    title: 'Filtros',
    side: 'right',
    children: 'Filtra el listado por sucursal, estado y rango de fechas.',
  },
  argTypes: { side: { control: 'inline-radio', options: ['left', 'right'] } },
  render: (a) => <Launcher {...a} />,
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
