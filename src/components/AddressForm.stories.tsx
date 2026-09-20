import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AddressForm, type AddressField } from './Commerce';

// The kit ships no country data — a consumer defines its own field set per
// market (see `AddressForm` docs). This is a market-agnostic example.
const FIELDS: AddressField[] = [
  { key: 'fullName', label: 'Nombre completo' },
  { key: 'street', label: 'Calle', width: 'half' },
  { key: 'number', label: 'Número', width: 'third' },
  { key: 'apartment', label: 'Depto/Oficina', width: 'third' },
  { key: 'city', label: 'Ciudad', width: 'half' },
  {
    key: 'region', label: 'Región', type: 'select', width: 'half',
    options: [
      { value: 'norte', label: 'Región Norte' },
      { value: 'centro', label: 'Región Centro' },
      { value: 'sur', label: 'Región Sur' },
    ],
  },
  { key: 'notes', label: 'Notas de entrega (opcional)', type: 'textarea', rows: 2 },
];

function Controlled(args: { fields: AddressField[] }) {
  const [value, setValue] = React.useState<Record<string, string>>({
    fullName: 'Satoru Gojo',
    street: 'Av. Ejemplo 123',
    city: 'Sucursal Centro',
  });
  return (
    <div style={{ maxWidth: 600 }}>
      <AddressForm fields={args.fields} value={value} onChange={setValue} />
    </div>
  );
}

const meta = {
  title: 'Components/AddressForm',
  component: AddressForm,
  tags: ['autodocs'],
  args: { fields: FIELDS, value: {}, onChange: () => {} },
  render: (a) => <Controlled fields={a.fields} />,
} satisfies Meta<typeof AddressForm>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
