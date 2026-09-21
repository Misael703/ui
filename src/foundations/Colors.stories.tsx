import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPalette, ColorItem } from '@storybook/blocks';

const meta = { title: 'Foundations/Colors', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

const read = (token: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();

function useTokens(tokens: string[]): Record<string, string> {
  const [map, setMap] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    // Preset/theme decorators mutate <head>/<html> in parent effects: measure next frame and re-measure on mutation.
    const measure = () => requestAnimationFrame(() => setMap(Object.fromEntries(tokens.map((t) => [t, read(t)]))));
    measure();
    const mo = new MutationObserver(measure);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    mo.observe(document.head, { childList: true });
    return () => mo.disconnect();
  }, [tokens]);
  return map;
}

const SCALE = (name: string) => [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => `color-${name}-${s}`);
const BRAND = [...SCALE('primary'), ...SCALE('secondary')];
const SEMANTIC = ['bg-canvas', 'bg-surface', 'bg-subtle', 'bg-muted', 'fg-default', 'fg-muted', 'fg-subtle', 'fg-meta', 'border-default', 'border-strong', 'border-control', 'border-focus'];

function Palette({ tokens, title, subtitle }: { tokens: string[]; title: string; subtitle: string }) {
  const map = useTokens(tokens);
  return (
    <ColorPalette>
      <ColorItem title={title} subtitle={subtitle} colors={Object.fromEntries(tokens.map((t) => [`--${t}`, map[t] ?? '#00000000']))} />
    </ColorPalette>
  );
}

export const Brand: StoryObj = { render: () => <Palette title="Brand scales" subtitle="--color-primary-* / --color-secondary-*" tokens={BRAND} /> };
export const Semantic: StoryObj = { render: () => <Palette title="Semantic tokens" subtitle="backgrounds, foregrounds, borders" tokens={SEMANTIC} /> };
export const Status: StoryObj = { render: () => <Palette title="Status" subtitle="green / yellow / red / info at the 600 step" tokens={['color-success', 'color-warning', 'color-danger', 'color-info']} /> };
export const Categorical: StoryObj = { render: () => <Palette title="Categorical" subtitle="--cat-1…6 (distinguishable, not meaningful)" tokens={[1, 2, 3, 4, 5, 6].flatMap((n) => [`cat-${n}`, `cat-${n}-bg`, `cat-${n}-fg`])} /> };
