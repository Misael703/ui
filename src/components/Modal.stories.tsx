import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, waitFor } from '@storybook/test';
import { Modal, type OverlayProps } from './Overlay';
import { Button } from './Button';

// Hoisted: this grid holds no interactivity of its own, but keeping story
// content at module scope matches the kit's convention for non-trivial
// children (see the Menu.stories.tsx gotcha on hoisting elements).
const CONTACT_FIELDS = ['Nombre', 'Apellido', 'Cargo', 'Teléfono de contacto largo', 'Correo electrónico', 'Departamento'];
const CONTACT_FORM = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {CONTACT_FIELDS.map((l) => (
      <label key={l} style={{ display: 'grid', gap: 4, minWidth: 0 }}>
        <span className="label">{l}</span>
        <input className="input" placeholder={l} />
      </label>
    ))}
  </div>
);

function Launcher(args: OverlayProps) {
  // Seeded once from `args.open` (React only reads the initial value) so a
  // story can render pre-opened — e.g. TwoColumnGrid — without fighting the
  // trigger's own open/close state on every re-render.
  const [open, setOpen] = React.useState(args.open);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    open: false,
    onClose: () => {},
    title: 'Confirmar pedido',
    size: 'md',
    children: 'Se enviará el Pedido #1042 a Sucursal Centro.',
  },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (a) => <Launcher {...a} />,
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Pit of success (post-1.10.0): a 2-column grid that used to force an ugly
 * horizontal scrollbar now contains/reflows gracefully. The body clips on x
 * and only scrolls on y.
 */
export const TwoColumnGrid: Story = {
  args: { open: true, title: 'Editar contacto', children: CONTACT_FORM },
};

/**
 * Escape closes the dialog and focus returns to the trigger button
 * (`useFocusTrap` restores it on deactivation). The backdrop and dialog stay
 * mounted for `EXIT_MS` while the sink-out animation plays, so the dialog's
 * removal is asserted with `waitFor`.
 */
export const EscapeClosesAndRestoresFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Abrir modal' });
    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
