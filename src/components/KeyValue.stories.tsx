import type { Meta, StoryObj } from '@storybook/react';
import { KeyValue, KeyValueRow } from './Layout';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/KeyValue',
  component: KeyValue,
  subcomponents: { KeyValueRow },
  tags: ['autodocs'],
} satisfies Meta<typeof KeyValue>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <KeyValue>
        <KeyValueRow label="Pedido">#1042</KeyValueRow>
        <KeyValueRow label="Cliente">Satoru Gojo</KeyValueRow>
        <KeyValueRow label="Total">{formatCurrency(45990)}</KeyValueRow>
      </KeyValue>
    </div>
  ),
};
