import type { Meta, StoryObj } from '@storybook/react';
import { ListGroup, ListGroupItem, HStack } from './Layout';
import { Badge } from './Display';

const meta = {
  title: 'Components/ListGroup',
  component: ListGroup,
  subcomponents: { ListGroupItem },
  tags: ['autodocs'],
} satisfies Meta<typeof ListGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ListGroup style={{ maxWidth: 420 }}>
      {['Cemento gris 42.5kg', 'Fierro corrugado 12mm', 'Pintura látex 1gal', 'Brocha angular 2"'].map((item, i) => (
        <ListGroupItem key={i} interactive>
          <HStack gap={3} justify="space-between" style={{ width: '100%' }}>
            <span>{item}</span>
            <Badge variant="neutral">x{i + 1}</Badge>
          </HStack>
        </ListGroupItem>
      ))}
    </ListGroup>
  ),
};
