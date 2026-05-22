import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Toggle, ToggleGroup, ToggleGroupItem, SegmentedControl, SegmentedControlItem } from './Toggle';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from './Icons';

export default { title: 'Actions/Toggle', tags: ['autodocs'] } as Meta;

export const ToggleSimple: StoryObj = {
  render: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Notificaciones">
        Notificaciones {pressed ? 'on' : 'off'}
      </Toggle>
    );
  },
};

export const Variantes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Toggle defaultPressed>Default</Toggle>
      <Toggle variant="outline">Outline</Toggle>
      <Toggle size="sm">Pequeño</Toggle>
      <Toggle size="lg">Grande</Toggle>
      <Toggle disabled>Disabled</Toggle>
    </div>
  ),
};

export const ToggleGroupSingle: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState<string | null>('center');
    return (
      <ToggleGroup type="single" value={value} onChange={setValue} ariaLabel="Alineación">
        <ToggleGroupItem value="left" aria-label="Alinear izquierda">
          <AlignLeft size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Alinear centro">
          <AlignCenter size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Alinear derecha">
          <AlignRight size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

/**
 * **SegmentedControl** — single-select with equal-width segments, the
 * view-switcher case. No `type` to forget (it's always single), so no
 * cryptic union error. `SegmentedControlItem` aliases `ToggleGroupItem`.
 */
export const SegmentedControlDemo: StoryObj = {
  render: () => {
    const [view, setView] = React.useState<string | null>('list');
    return (
      <div style={{ maxWidth: 320 }}>
        <SegmentedControl value={view} onChange={setView} ariaLabel="Vista">
          <SegmentedControlItem value="list">Lista</SegmentedControlItem>
          <SegmentedControlItem value="grid">Tarjetas</SegmentedControlItem>
          <SegmentedControlItem value="board">Tablero</SegmentedControlItem>
        </SegmentedControl>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-muted)' }}>Vista actual: {view}</p>
      </div>
    );
  },
};

export const ToggleGroupMultiple: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['bold']);
    return (
      <ToggleGroup type="multiple" value={value} onChange={setValue} ariaLabel="Formato">
        <ToggleGroupItem value="bold" aria-label="Negrita"><Bold size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Cursiva"><Italic size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Subrayado"><Underline size={16} /></ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

/** Playground interactivo: usa Controls para `size`, `variant` y `disabled`. */
export const TogglePlayground: StoryObj<typeof Toggle> = {
  args: { children: 'Notificaciones', size: 'md', variant: 'default', disabled: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['default', 'outline'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  render: (args) => {
    const [pressed, setPressed] = React.useState(false);
    return <Toggle {...args} pressed={pressed} onPressedChange={setPressed} aria-label="Demo" />;
  },
};
