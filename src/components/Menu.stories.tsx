import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Menu, type MenuProps } from './Display2';
import { Button } from './Button';
import { Edit, Trash } from './Icons';

// Hoisted: items hold React elements.
const MENU_ITEMS: MenuProps['items'] = [
  { label: 'Editar', icon: <Edit size={16} />, shortcut: '⌘E' },
  { label: 'Duplicar' },
  { type: 'separator' },
  { label: 'Eliminar', icon: <Trash size={16} />, destructive: true },
];

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  args: { trigger: <Button variant="outline">Acciones</Button>, items: MENU_ITEMS, align: 'start' },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Acciones' });
    await userEvent.click(trigger);
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(menu).getAllByRole('menuitem')[1]).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};
