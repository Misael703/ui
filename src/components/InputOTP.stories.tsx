import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { InputOTP } from './InputOTP';

const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
} satisfies Meta<typeof InputOTP>;
export default meta;

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <InputOTP value={value} onChange={setValue} length={6} />
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
