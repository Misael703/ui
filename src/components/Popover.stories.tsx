import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Popover } from './Popover';
import { Button } from './Button';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: { trigger: null, children: null, placement: 'bottom', align: 'start', closeOnOutsideClick: true, closeOnEscape: true },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <Popover {...a} trigger={<Button variant="outline">Abrir popover</Button>}>
      <div style={{ padding: 16, minWidth: 240 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Configuración</h4>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-muted)' }}>
          Contenido arbitrario en el popover. Click fuera para cerrar.
        </p>
      </div>
    </Popover>
  ),
};

export const Placements: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 24, padding: 80 }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((p) => (
        <Popover
          key={p}
          placement={p}
          trigger={<Button variant="outline" size="sm">{p}</Button>}
        >
          <div style={{ padding: 12, fontSize: 13 }}>Placement: <strong>{p}</strong></div>
        </Popover>
      ))}
    </div>
  ),
};

export const Controlled: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button onClick={() => setOpen((v) => !v)}>{open ? 'Cerrar' : 'Abrir'} desde fuera</Button>
        <Popover open={open} onOpenChange={setOpen} trigger={<Button variant="outline">Trigger</Button>}>
          <div style={{ padding: 16 }}>Estado externo: {open ? 'abierto' : 'cerrado'}</div>
        </Popover>
      </div>
    );
  },
};
