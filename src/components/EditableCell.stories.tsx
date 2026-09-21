import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EditableCell } from './Editing';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/EditableCell',
  component: EditableCell,
  tags: ['autodocs'],
  args: { value: '45990', onCommit: () => {} },
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'number'] },
  },
} satisfies Meta<typeof EditableCell>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Click-to-edit primitive with Airtable/Notion semantics: click or Enter to
 * edit, Enter/blur commits, Esc cancels. `onCommit` is async-aware — while
 * it's pending the input is disabled; on rejection the cell STAYS in edit
 * mode with the invalid style, so the user's typing is never lost to a
 * failed PATCH. The price cell formats the resting display via
 * `formatDisplay` (`formatCurrency`); the stock cell simulates a server that
 * rejects values over 100.
 */
export const Default: Story = {};

/** Two live cells: a currency-formatted price and a stock cell with a simulated server that rejects values over 100. */
export const Examples: Story = {
  render: () => {
    const [price, setPrice] = React.useState('45990');
    const [stock, setStock] = React.useState('24');
    return (
      <div style={{ display: 'grid', gap: 12, maxWidth: 280 }}>
        <EditableCell
          value={price}
          onCommit={(v) => setPrice(v)}
          type="number"
          formatDisplay={(v) => formatCurrency(Number(v))}
          ariaLabel="Editar precio"
        />
        <EditableCell
          value={stock}
          onCommit={(v) => new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              if (Number(v) > 100) { reject(new Error('stock máximo 100')); return; }
              setStock(v);
              resolve();
            }, 600);
          })}
          type="number"
          validate={(v) => (Number(v) < 0 ? 'No puede ser negativo' : null)}
          ariaLabel="Editar stock (server simulado; >100 falla)"
        />
      </div>
    );
  },
};
