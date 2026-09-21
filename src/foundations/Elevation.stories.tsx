import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle, Caption } from './_helpers';

const meta = { title: 'Foundations/Elevation', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

export const Shadows: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Elevation</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, maxWidth: 800, padding: 24, background: 'var(--bg-subtle)' }}>
        {['xs', 'sm', 'md', 'lg', 'brand'].map((s) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <div style={{ height: 80, width: '100%', background: 'var(--bg-surface)', borderRadius: 8, boxShadow: `var(--shadow-${s})` }} />
            <Caption>--shadow-{s}</Caption>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const InvertedSurfaces: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <SectionTitle>Inverted surfaces</SectionTitle>
      <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: 0 }}>
        Apply <code>.surface-inverse</code> to a dark-bg zone and all nested text
        (p, h1-h6, .caption, anchors) automatically inherits light colors via
        CSS variable re-scoping. No inline overrides per element.
      </p>

      <footer className="surface-inverse surface-inverse--brand" style={{ padding: 24, borderRadius: 12 }}>
        <h3 className="h3" style={{ marginTop: 0 }}>Footer in brand navy</h3>
        <p>The kit's reset sets <code>color: var(--fg-default)</code> on p — with inversion active, <code>--fg-default</code> resolves to white.</p>
        <p className="caption">Captions fall back to <code>--fg-subtle</code> which under inversion is white at 50%.</p>
        <p><a href="/anchors-demo">Anchors use</a> the inverted accent (brand orange on hover).</p>
      </footer>

      <section className="surface-inverse surface-inverse--dark" style={{ padding: 24, borderRadius: 12 }}>
        <h3 className="h3" style={{ marginTop: 0 }}>Hero in darker blue</h3>
        <p>Same utility, alternate preset <code>--dark</code> = <code>var(--color-primary-900)</code>.</p>
      </section>

      <div data-tone="inverse" style={{ background: '#1a1a1a', padding: 24, borderRadius: 12 }}>
        <h3 className="h3" style={{ marginTop: 0 }}>Custom bg with <code>data-tone</code></h3>
        <p>For cases where the consumer paints its own bg (gray, gradient, image…) the <code>data-tone="inverse"</code> attribute applies the same rules without the preset classes.</p>
      </div>
    </div>
  ),
};
