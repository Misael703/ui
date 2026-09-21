import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BulkActionBar } from './Filters';
import { Button } from './Button';

const meta = {
  title: 'Components/BulkActionBar',
  component: BulkActionBar,
  tags: ['autodocs'],
  args: { selectedCount: 3 },
} satisfies Meta<typeof BulkActionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <BulkActionBar {...a}>
      <Button variant="outline" size="sm">Marcar como enviados</Button>
      <Button variant="ghost" size="sm">Imprimir</Button>
      <Button variant="danger" size="sm">Eliminar</Button>
    </BulkActionBar>
  ),
};

/** Clearing the selection hides the bar (`selectedCount` drops to 0). */
export const Examples: Story = {
  render: () => {
    const [count, setCount] = React.useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, padding: 16 }}>
        <Button variant="secondary" size="sm" onClick={() => setCount(count > 0 ? 0 : 3)}>
          {count > 0 ? 'Deseleccionar' : 'Seleccionar 3'}
        </Button>
        <div style={{ width: '100%' }}>
          <BulkActionBar selectedCount={count} onClear={() => setCount(0)}>
            <Button variant="outline" size="sm">Marcar como enviados</Button>
            <Button variant="ghost" size="sm">Imprimir</Button>
            <Button variant="danger" size="sm">Eliminar</Button>
          </BulkActionBar>
        </div>
      </div>
    );
  },
};
