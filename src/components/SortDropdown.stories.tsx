import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { SortDropdown, type SortDropdownProps } from './Filters';

// `SortDropdown<T>` is generic: `ComponentProps<typeof SortDropdown>` /
// `satisfies Meta<typeof SortDropdown>` collapses `T` to `unknown` (same
// failure as `DataTable<T>` in Task 12) — `options`/`value`/`onChange` then
// reject the concrete string fixture. Loose `Meta` + `StoryObj` typed off
// `SortDropdownProps<string>` sidesteps the collapse.
const meta: Meta = {
  title: 'Components/SortDropdown',
  component: SortDropdown,
  tags: ['autodocs'],
  args: {
    value: 'recent',
    onChange: fn(),
    options: [
      { value: 'recent', label: 'Más recientes' },
      { value: 'oldest', label: 'Más antiguos' },
      { value: 'amount-desc', label: 'Mayor monto primero' },
      { value: 'amount-asc', label: 'Menor monto primero' },
      { value: 'urgent', label: 'Urgentes primero' },
    ],
  },
};
export default meta;
type Story = StoryObj<SortDropdownProps<string>>;

export const Default: Story = {
  render: (a) => {
    const [value, setValue] = React.useState(a.value);
    return <SortDropdown {...a} value={value} onChange={setValue} />;
  },
};
