import type { Meta, StoryObj } from '@storybook/react';
import { PasswordInput, FormField } from './Form';

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  args: { placeholder: 'Contraseña' },
} satisfies Meta<typeof PasswordInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <FormField label="Contraseña" htmlFor="pw-login">
        <PasswordInput {...args} id="pw-login" autoComplete="current-password" defaultValue="secreto123" />
      </FormField>
      <FormField label="Nueva contraseña (visible por defecto)" htmlFor="pw-new">
        <PasswordInput {...args} id="pw-new" autoComplete="new-password" defaultVisible />
      </FormField>
      <FormField label="Deshabilitado" htmlFor="pw-dis">
        <PasswordInput {...args} id="pw-dis" disabled defaultValue="secreto" />
      </FormField>
    </div>
  ),
};
