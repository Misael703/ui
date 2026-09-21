import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Layout';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

const ROWS = [
  { id: '1', name: 'Taladro percutor', qty: 2, total: 89990 },
  { id: '2', name: 'Sierra circular', qty: 1, total: 64990 },
  { id: '3', name: 'Brocha angular 2"', qty: 5, total: 12990 },
];

export const Default: Story = {
  render: () => (
    <Table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th scope="col">Producto</th>
          <th scope="col" style={{ textAlign: 'right' }}>Cantidad</th>
          <th scope="col" style={{ textAlign: 'right' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.id}>
            <td>{r.name}</td>
            <td style={{ textAlign: 'right' }}>{r.qty}</td>
            <td style={{ textAlign: 'right' }}>{formatCurrency(r.total)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  ),
};
