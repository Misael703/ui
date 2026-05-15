import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { InputOTP } from './InputOTP';

export default { title: 'Forms/Input OTP', tags: ['autodocs'] } as Meta;

export const Basico: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <InputOTP value={value} onChange={setValue} length={6} autoFocus />
        <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
          Valor: <code>{value || '—'}</code>
        </p>
      </div>
    );
  },
};

export const Cuatro: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return <InputOTP value={value} onChange={setValue} length={4} />;
  },
};

export const Texto: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return <InputOTP value={value} onChange={setValue} length={5} inputMode="text" />;
  },
};

export const Invalido: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('123');
    return <InputOTP value={value} onChange={setValue} invalid />;
  },
};
