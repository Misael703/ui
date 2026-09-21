import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip, ChipGroup } from './Display';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  subcomponents: { ChipGroup },
  tags: ['autodocs'],
  args: { children: 'Taladro', active: false },
  argTypes: {
    active: { control: 'boolean' },
  },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A removable filter group next to two plain chips. */
export const Examples: Story = {
  render: () => {
    const [filtros, setFiltros] = React.useState(['Eléctrico', 'Pintura', 'Stock>0']);
    return (
      <ChipGroup>
        {filtros.map((f) => (
          <Chip key={f} active onRemove={() => setFiltros((curr) => curr.filter((x) => x !== f))}>
            {f}
          </Chip>
        ))}
        <Chip>Plomería</Chip>
        <Chip>Construcción</Chip>
      </ChipGroup>
    );
  },
};
