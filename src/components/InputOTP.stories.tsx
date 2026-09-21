import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { InputOTP } from './InputOTP';

const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  args: { value: '', onChange: () => {}, length: 6, disabled: false, invalid: false, inputMode: 'numeric' },
  argTypes: {
    inputMode: { control: 'inline-radio', options: ['numeric', 'text'] },
  },
} satisfies Meta<typeof InputOTP>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => {
    const [value, setValue] = React.useState(a.value);
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <InputOTP {...a} value={value} onChange={setValue} />
        <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
          Valor: <code>{value || '—'}</code>
        </p>
      </div>
    );
  },
};

export const FourDigits: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return <InputOTP value={value} onChange={setValue} length={4} />;
  },
};

export const Alphanumeric: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return <InputOTP value={value} onChange={setValue} length={5} inputMode="text" />;
  },
};

export const Invalid: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('123');
    return <InputOTP value={value} onChange={setValue} invalid />;
  },
};
