import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { MultiCombobox, type MultiComboboxProps } from './AdvancedPickers';

const OPTIONS = [
  { value: 'cobre', label: 'Cobre' },
  { value: 'aluminio', label: 'Aluminio' },
  { value: 'pvc', label: 'PVC' },
  { value: 'acero', label: 'Acero galvanizado' },
  { value: 'madera', label: 'Madera pino' },
];

function Controlled(args: MultiComboboxProps<string>) {
  const [v, setV] = React.useState<string[]>(args.value);
  return (
    <div style={{ maxWidth: 400 }}>
      <MultiCombobox {...args} value={v} onChange={setV} />
    </div>
  );
}

/**
 * Hard requirement: `options` only carries the CURRENTLY selectable items,
 * but the control is prefilled with a stored selection that includes a value
 * whose option was removed later (here, a deactivated helper). Without
 * `resolveLabel` that chip would not render and would be lost on the next
 * `onChange`. With `resolveLabel` the chip still shows (falling back to the
 * raw value when there's no label), so the user sees it and can keep or
 * remove it on purpose.
 */
function WithInactiveValuesDemo() {
  // Names known by the consumer (they come from the order), not from options.
  const names: Record<string, string> = {
    ana: 'Ana Rojas', luis: 'Luis Vera', 'pedro-inactivo': 'Pedro Soto',
  };
  const [v, setV] = React.useState<string[]>(['ana', 'pedro-inactivo']);
  return (
    <div style={{ maxWidth: 420 }}>
      <MultiCombobox
        value={v}
        onChange={setV}
        options={[
          { value: 'ana', label: 'Ana Rojas' },
          { value: 'luis', label: 'Luis Vera' },
        ]}
        resolveLabel={(val) => names[val]}
        placeholder="Selecciona ayudantes…"
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Components/MultiCombobox',
  component: MultiCombobox,
  tags: ['autodocs'],
  args: { value: [], onChange: fn(), options: OPTIONS, placeholder: 'Selecciona materiales…' },
};
export default meta;
type Story = StoryObj<MultiComboboxProps<string>>;

export const Default: Story = { render: (a) => <Controlled {...a} /> };

export const WithInactiveValues: Story = {
  name: 'Value outside options',
  render: () => <WithInactiveValuesDemo />,
};
