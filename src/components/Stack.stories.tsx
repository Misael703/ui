import type { Meta, StoryObj } from '@storybook/react';
import { Stack, HStack, VStack } from './Layout';
import { Button } from './Button';

const meta = {
  title: 'Components/Stack',
  component: Stack,
  subcomponents: { HStack, VStack },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'inline-radio', options: ['row', 'column'] },
  },
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <HStack gap={3}>
      <Button>Guardar</Button>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="outline">Vista previa</Button>
    </HStack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <VStack gap={2} style={{ maxWidth: 280 }}>
      <Button>Acción 1</Button>
      <Button variant="outline">Acción 2</Button>
      <Button variant="ghost">Acción 3</Button>
    </VStack>
  ),
};
