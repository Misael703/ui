import type { Meta, StoryObj } from '@storybook/react';
import { Cluster } from './Layout';
import { Badge } from './Display';

const REGIONS = ['Metropolitana', 'Valparaíso', 'Biobío', 'Maule', 'Araucanía', 'Los Lagos', 'Coquimbo', 'Antofagasta'];

// Hoisted: array holds React elements.
const CLUSTER_CHILDREN = REGIONS.map((r) => <Badge key={r} variant="neutral">{r}</Badge>);

const meta = {
  title: 'Components/Cluster',
  component: Cluster,
  tags: ['autodocs'],
  args: { gap: 2, children: CLUSTER_CHILDREN },
} satisfies Meta<typeof Cluster>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
