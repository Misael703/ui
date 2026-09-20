import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList, DescriptionListItem } from './Editing';
import { Badge } from './Display';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  subcomponents: { DescriptionListItem },
  tags: ['autodocs'],
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DescriptionList style={{ maxWidth: 480 }}>
      <DescriptionListItem label="Cliente" value="Northwind Builders" />
      <DescriptionListItem label="Vendedor" value="Satoru Gojo" editable onEdit={() => alert('Editar vendedor')} />
      <DescriptionListItem label="Estado" value={<Badge variant="success">Entregado</Badge>} />
      <DescriptionListItem label="Total" value={formatCurrency(1245000)} editable onEdit={() => alert('Editar total')} />
    </DescriptionList>
  ),
};
