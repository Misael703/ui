import * as React from 'react';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '32px 0 16px' }}>
    {children}
  </h2>
);

export const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-muted)', margin: '20px 0 8px' }}>
    {children}
  </h3>
);

export const Caption = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
    {children}
  </code>
);
