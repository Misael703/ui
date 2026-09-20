import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, within, userEvent, expect } from '@storybook/test';
import { Combobox, type ComboboxProps } from './Pickers';

const OPTIONS = [
  { value: 'taladro', label: 'Taladro percutor' },
  { value: 'sierra', label: 'Sierra circular' },
  { value: 'lijadora', label: 'Lijadora orbital' },
];

function Controlled(args: ComboboxProps<string>) {
  const [v, setV] = React.useState<string | null>(args.value ?? null);
  return <Combobox {...args} value={v} onChange={setV} />;
}

/**
 * Async pattern: `onQueryChange` fires on every typed query (including the
 * reset to `''` after a select/clear), so the consumer fetches and re-passes
 * `options` — debouncing stays on the consumer side. In async mode the kit
 * skips client-side filtering (the source already filtered). `loading` shows
 * a loading row instead of the empty message while a fetch is in flight;
 * options already on screen stay visible (stale-while-revalidate). Here the
 * "server" answers after 600ms of simulated latency.
 */
function AsyncDemo() {
  const [v, setV] = React.useState<string | null>(null);
  const [results, setResults] = React.useState(OPTIONS);
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  const search = (q: string) => {
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setResults(OPTIONS.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())));
      setLoading(false);
    }, 600);
  };
  return (
    <Combobox
      value={v}
      onChange={setV}
      options={results}
      loading={loading}
      onQueryChange={search}
      placeholder="Buscar producto (async)…"
    />
  );
}

/**
 * `renderOption` customizes each listbox row's content (e.g. a monospace id
 * next to the name) — the typeable input still shows `label` as plain text,
 * only the listbox rows change.
 */
function RenderOptionDemo() {
  const [v, setV] = React.useState<string | null>(null);
  return (
    <Combobox
      value={v}
      onChange={setV}
      options={OPTIONS}
      placeholder="Buscar producto…"
      renderOption={(o) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--fg-meta)' }}>
            {String(o.value)}
          </span>
          {o.label}
        </span>
      )}
    />
  );
}

const meta: Meta = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { value: null, onChange: fn(), options: OPTIONS, placeholder: 'Buscar producto…', searchable: true },
  argTypes: { searchable: { control: 'boolean' }, loading: { control: 'boolean' } },
};
export default meta;
type Story = StoryObj<ComboboxProps<string>>;

export const Default: Story = { render: (a) => <Controlled {...a} /> };

/**
 * With a value already chosen, opening the dropdown marks the selected
 * option with a ✓ (an unambiguous marker) and the keyboard cursor starts ON
 * it (scrolled into view), not on the first item — so the confirmed
 * selection and the `active` (keyboard/hover) highlight never get confused
 * even when their backgrounds are close in a given palette. Open the list to
 * see it.
 */
export const WithSelection: Story = { args: { value: 'sierra' }, render: (a) => <Controlled {...a} /> };

export const Async: Story = { render: () => <AsyncDemo /> };

/**
 * `searchable={false}` swaps the typeable input for a button trigger that
 * shows the selected label (or the placeholder), with no filtering — the
 * listbox always lists every option. Same visual shell and the same
 * kit-styled listbox as the typeable Combobox; closes the gap with a native
 * `<select>` when a small picker without a browser dropdown is wanted.
 */
export const WithoutInput: Story = { args: { searchable: false }, render: (a) => <Controlled {...a} /> };

export const RenderOption: Story = { render: () => <RenderOptionDemo /> };

export const SelectByTyping: Story = {
  render: (a) => <Controlled {...a} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'sie');
    const option = await within(document.body).findByRole('option', { name: /Sierra circular/ });
    await userEvent.click(option);
    await expect(input).toHaveValue('Sierra circular');
    await expect(within(document.body).queryByRole('listbox')).toBeNull();
  },
};
