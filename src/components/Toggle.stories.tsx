import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Toggle, ToggleGroup, ToggleGroupItem } from './Toggle';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from './Icons';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  subcomponents: { ToggleGroup, ToggleGroupItem },
  tags: ['autodocs'],
  args: { children: 'Notificaciones', size: 'md', variant: 'default', disabled: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['default', 'outline'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => {
    const [pressed, setPressed] = React.useState(false);
    return <Toggle {...a} pressed={pressed} onPressedChange={setPressed} aria-label="Notificaciones" />;
  },
};

export const Variants: StoryObj = {
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

export const GroupSingle: StoryObj = {
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

export const GroupMultiple: StoryObj = {
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
