import type { Meta, StoryObj } from '@storybook/react';
import { DiffViewer } from './Editing';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/DiffViewer',
  component: DiffViewer,
  tags: ['autodocs'],
  args: {
    entries: [
      { field: 'Cliente', before: 'Southwind Builders', after: 'Northwind Builders' },
      { field: 'Total', before: formatCurrency(1000000), after: formatCurrency(1245000) },
      { field: 'Estado', before: 'Borrador', after: 'Confirmado' },
      { field: 'Fecha de entrega', before: '2026-05-01', after: '2026-04-30' },
    ],
  },
} satisfies Meta<typeof DiffViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
