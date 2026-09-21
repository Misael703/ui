import type { Meta, StoryObj } from '@storybook/react';
import { Spacer, HStack } from './Layout';
import { Button } from './Button';

const meta = {
  title: 'Components/Spacer',
  component: Spacer,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: [undefined, 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] },
  },
} satisfies Meta<typeof Spacer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <HStack style={{ border: '1px solid var(--border-default)', borderRadius: 8, padding: 12 }}>
      <Button variant="outline">Atrás</Button>
      <Spacer {...a} />
      <Button variant="ghost">Cancelar</Button>
      <Button>Guardar</Button>
    </HStack>
  ),
};
