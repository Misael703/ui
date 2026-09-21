import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';
import { Badge } from '../components/Display';
import { SectionTitle } from './_helpers';

const meta = { title: 'Foundations/Theming', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

export const PresetSwitch: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Preset switch</SectionTitle>
      <p className="body-sm" style={{ color: 'var(--fg-muted)', marginBottom: 16, maxWidth: 560 }}>
        Use the toolbar's Preset control to switch between the kit's default
        preset and the El Alba brand preset — watch how the components below
        restyle live, driven entirely by CSS variables.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary">Primary action</Button>
        <Badge>Activo</Badge>
      </div>
    </div>
  ),
};

/**
 * Consumer-extensible variants (`Extensible<T>`, since v1.6.0).
 * `variant="brand-x"` is not a type error; the kit emits `btn--brand-x` /
 * `badge--brand-x` and you style it in your own CSS (here, a `<style>` with
 * no layer, which wins over the kit's cascade layer (`@layer elalba`,
 * renamed `ui` in 5.0.0)). No fork required.
 */
export const ExtendingVariants: StoryObj = {
  render: () => (
    <div>
      <style>{`
        .btn--brand-x { background: #6d28d9; color: #fff; border-color: #6d28d9; }
        .btn--brand-x:hover { background: #5b21b6; }
        .badge--brand-x { background: #ede9fe; color: #5b21b6; }
      `}</style>
      <SectionTitle>Consumer-defined variant</SectionTitle>
      <p className="body-sm" style={{ color: 'var(--fg-muted)', marginBottom: 16, maxWidth: 560 }}>
        <code>variant="brand-x"</code> is not a TS error. The kit emits the BEM
        class; the style lives in your app, outside the kit's cascade layer
        (<code>@layer elalba</code>, renamed <code>ui</code> in 5.0.0).
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="brand-x">Acción brand-x</Button>
        <Button variant="brand-x" disabled>Disabled</Button>
        <Badge variant="brand-x">brand-x</Badge>
        <Button variant="primary">primary (sin tocar)</Button>
      </div>
    </div>
  ),
};
