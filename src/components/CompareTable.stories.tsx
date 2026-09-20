import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CompareTable, type CompareItem } from './Commerce';
import { formatCurrency } from '../utils/format';

const INITIAL_ITEMS: CompareItem[] = [
  { id: '1', name: 'Taladro percutor 650W', price: formatCurrency(45990) },
  { id: '2', name: 'Sierra circular 7¼"', price: formatCurrency(89990) },
];

const ATTRIBUTES = [
  { key: 'potencia', label: 'Potencia', values: { '1': '650W', '2': '1400W' } },
  { key: 'peso', label: 'Peso', values: { '1': '1.8 kg', '2': '3.9 kg' } },
  { key: 'garantia', label: 'Garantía', values: { '1': '12 meses', '2': '24 meses' } },
];

function Controlled() {
  const [items, setItems] = React.useState(INITIAL_ITEMS);
  return (
    <CompareTable
      items={items}
      attributes={ATTRIBUTES}
      onRemove={(id) => setItems((c) => c.filter((i) => i.id !== id))}
    />
  );
}

const meta = {
  title: 'Components/CompareTable',
  component: CompareTable,
  tags: ['autodocs'],
  args: { items: INITIAL_ITEMS, attributes: ATTRIBUTES },
  render: () => <Controlled />,
} satisfies Meta<typeof CompareTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
