import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import * as React from 'react';
import { MoneyInput, type MoneyInputProps } from './InputsExtra';

function Controlled(args: MoneyInputProps) {
  const [v, setV] = React.useState(args.value);
  return <MoneyInput {...args} value={v} onChange={setV} />;
}

const meta = {
  title: 'Components/MoneyInput',
  component: MoneyInput,
  tags: ['autodocs'],
  // `currency`/`locale` stay out of `Default` so it shows the brand default
  // (see `Currency` below for the explicit override).
  args: { value: 45990, liveFormat: true, onChange: fn() },
  argTypes: {
    currency: { control: 'inline-radio', options: ['USD', 'EUR', 'CLP', 'MXN'] },
    locale: { control: 'inline-radio', options: ['en-US', 'es-CL', 'es-MX', 'de-DE'] },
  },
} satisfies Meta<typeof MoneyInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Live formatting** — the amount stays grouped (locale thousands separator)
 * with the currency symbol *while typing*, identical focused and blurred (no
 * reformat jump on blur). The caret is preserved when separators shift:
 * typing in the middle, backspacing across a separator, or pasting a grouped
 * string. `liveFormat` defaults to `true`. No `currency`/`locale` here — the
 * brand default applies.
 */
export const Default: Story = { render: (args) => <Controlled {...args} /> };

/** Explicit `currency`/`locale` override the brand default — try the Controls panel. */
export const Currency: Story = {
  args: { currency: 'USD', locale: 'en-US' },
  render: (args) => <Controlled {...args} />,
};
