import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { VariantSelector, type VariantSelectorProps } from './Commerce';

// `VariantSelector<T>` is generic: `ComponentProps<typeof VariantSelector>` /
// `satisfies Meta<typeof VariantSelector>` collapses `T` to `unknown` (same
// failure as `SortDropdown<T>` in FilterBar/Task 16 and `DataTable<T>` in
// Task 12) — `options`/`value`/`onChange` then reject the concrete string
// fixture. Loose `Meta` + `StoryObj` typed off `VariantSelectorProps<string>`
// sidesteps the collapse.
const meta: Meta = {
  title: 'Components/VariantSelector',
  component: VariantSelector,
  tags: ['autodocs'],
  args: {
    label: 'Color',
    appearance: 'swatch',
    value: 'rojo',
    onChange: fn(),
    options: [
      { value: 'rojo', label: 'Rojo', swatch: '#dc2626' },
      { value: 'azul', label: 'Azul', swatch: '#002f87' },
      { value: 'negro', label: 'Negro', swatch: '#0c1220' },
    ],
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['chip', 'swatch'] },
  },
};
export default meta;
type Story = StoryObj<VariantSelectorProps<string>>;

export const Default: Story = {
  render: (a) => {
    const [value, setValue] = React.useState(a.value);
    return <VariantSelector {...a} value={value} onChange={setValue} />;
  },
};
