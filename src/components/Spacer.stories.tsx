import type { Meta, StoryObj } from '@storybook/react';
import { Spacer, HStack } from './Layout';
import { Button } from './Button';

const meta = {
  title: 'Components/Spacer',
  component: Spacer,
  tags: ['autodocs'],
} satisfies Meta<typeof Spacer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HStack style={{ border: '1px solid var(--border-default)', borderRadius: 8, padding: 12 }}>
      <Button variant="outline">Atrás</Button>
      <Spacer />
      <Button variant="ghost">Cancelar</Button>
      <Button>Guardar</Button>
    </HStack>
  ),
};
