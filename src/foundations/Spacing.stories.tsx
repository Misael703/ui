import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle, Caption } from './_helpers';

const meta = { title: 'Foundations/Spacing', tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

export const Spacing: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Scale (4pt grid)</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((n) => (
          <React.Fragment key={n}>
            <Caption>--space-{n}</Caption>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'var(--color-secondary)', height: 16, width: `var(--space-${n})`, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{n * 4}px</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};

export const Radii: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Border radius</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, maxWidth: 720 }}>
        {['none', 'sm', 'md', 'lg', 'xl', 'pill'].map((r) => (
          <div key={r} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 64, background: 'var(--color-primary)', borderRadius: `var(--radius-${r})` }} />
            <Caption>--radius-{r}</Caption>
          </div>
        ))}
      </div>
    </div>
  ),
};
