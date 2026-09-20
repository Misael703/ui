import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { NumberInput, type NumberInputProps } from './Inputs';

function Controlled(args: NumberInputProps) {
  const [v, setV] = React.useState<number | null>(args.value ?? 0);
  return <NumberInput {...args} value={v} onChange={setV} />;
}

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  args: { value: 3, min: 0, max: 99, size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Controlled {...args} /> };

export const FullWidth: Story = {
  args: { value: 1200, min: 0, suffix: 'kg', fullWidth: true },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Controlled {...args} />
    </div>
  ),
};

/**
 * **`size`** (v3.5.0): `sm` for a counter inside a table row or a dense
 * toolbar; `md` (default) is the form field register. The `md` field floor
 * dropped from 80 to 64px — a unit counter doesn't need more.
 */
export const Sizes: Story = {
  name: 'Sizes · sm vs md',
  render: () => {
    const [a, setA] = React.useState<number | null>(1);
    const [b, setB] = React.useState<number | null>(1);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>size="sm" · en una celda</span>
          <NumberInput size="sm" value={a} onChange={setA} min={0} max={99} suffix="u" />
        </div>
        <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>size="md" (default) · en un formulario</span>
          <NumberInput value={b} onChange={setB} min={0} max={99} suffix="u" />
        </div>
      </div>
    );
  },
};

/** Interactive playground: use the Controls panel to try `min`/`max`/`step`/`prefix`/`suffix`. */
export const Playground: Story = {
  args: { value: 1, min: 0, max: 99, step: 1, suffix: 'u', disabled: false, size: 'md' },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  render: (args) => <Controlled {...args} />,
};
