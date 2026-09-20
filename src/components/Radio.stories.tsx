import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Form';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  // `Radio` has no `label` prop — the label is `children`. A lone radio is
  // not representative usage, so `Default` renders the real unit: a group
  // sharing `name`.
  args: { name: 'tipo', children: 'Retiro en tienda' },
} satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Radio {...args} defaultChecked />
      <Radio name={args.name} disabled={args.disabled}>
        Despacho a domicilio
      </Radio>
    </div>
  ),
};
