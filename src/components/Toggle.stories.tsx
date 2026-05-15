import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Toggle, ToggleGroup, ToggleGroupItem } from './Toggle';
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
