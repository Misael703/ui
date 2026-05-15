import type { Meta, StoryObj } from '@storybook/react';
import * as Icons from './Icons';

export default {
  title: 'Foundations/Icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Set de iconos SVG (24×24, `currentColor`, stroke 1.75). Heredan color del padre y aceptan `size`, `strokeWidth`, `className` y `title`.',
      },
    },
  },
} as Meta;

const ICON_NAMES = Object.keys(Icons).filter((name) => /^[A-Z]/.test(name) && name !== 'Icon') as Array<
  keyof typeof Icons
>;

export const Galeria: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 12,
      }}
    >
      {ICON_NAMES.map((name) => {
        const Icon = Icons[name] as React.ComponentType<{ size?: number }>;
        return (
          <div
            key={name as string}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: 12,
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              color: 'var(--fg-muted)',
            }}
          >
            <Icon size={24} />
            <span>{name as string}</span>
          </div>
        );
      })}
    </div>
  ),
};

export const Tamanos: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icons.Search size={16} />
      <Icons.Search size={20} />
      <Icons.Search size={24} />
      <Icons.Search size={32} />
      <Icons.Search size={48} />
    </div>
  ),
};

export const ColorHeredado: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <span style={{ color: 'var(--color-primary)' }}>
        <Icons.Bell />
      </span>
      <span style={{ color: 'var(--color-secondary)' }}>
        <Icons.Bell />
      </span>
      <span style={{ color: 'var(--color-success)' }}>
        <Icons.Bell />
      </span>
      <span style={{ color: 'var(--color-danger)' }}>
        <Icons.Bell />
      </span>
    </div>
  ),
};
