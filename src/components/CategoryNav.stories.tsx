import type { Meta, StoryObj } from '@storybook/react';
import { CategoryNav } from './Marketing';

const meta = {
  title: 'Components/CategoryNav',
  component: CategoryNav,
  tags: ['autodocs'],
  args: {
    categories: [
      {
        id: 'construccion',
        label: 'Construcción',
        groups: [
          { title: 'Cementos y áridos', items: [{ label: 'Cemento gris' }, { label: 'Cemento blanco' }, { label: 'Arena' }] },
          { title: 'Fierros', items: [{ label: 'Corrugado 8mm' }, { label: 'Corrugado 12mm' }, { label: 'Mallas' }] },
        ],
      },
      {
        id: 'electrico',
        label: 'Eléctrico',
        groups: [
          { title: 'Cables', items: [{ label: 'THHN' }, { label: 'NYM' }] },
          { title: 'Enchufes', items: [{ label: 'Schuko' }, { label: 'USA' }] },
        ],
      },
      { id: 'pintura', label: 'Pintura', href: '#' },
      { id: 'herramientas', label: 'Herramientas', href: '#' },
    ],
  },
} satisfies Meta<typeof CategoryNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 8 }}>
      <CategoryNav {...a} />
    </div>
  ),
};
