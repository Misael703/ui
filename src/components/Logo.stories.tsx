import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './Logo';

export default {
  title: 'Foundations/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['horizontal', 'vertical', 'mark', 'wordmark'] },
    bg: { control: 'inline-radio', options: ['light', 'dark'] },
    format: { control: 'inline-radio', options: ['svg', 'png'] },
    responsive: { control: 'boolean' },
    height: { control: 'number' },
  },
} as Meta<typeof Logo>;

type S = StoryObj<typeof Logo>;

export const Default: S = {
  args: { variant: 'mark', bg: 'light' },
};

export const Horizontal: S = {
  args: { variant: 'horizontal', bg: 'light' },
};

export const Vertical: S = {
  args: { variant: 'vertical', bg: 'light' },
};

export const Wordmark: S = {
  args: { variant: 'wordmark', bg: 'light' },
};

export const SobreFondoOscuro: S = {
  args: { variant: 'horizontal', bg: 'dark' },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-brand-blue)', padding: 32, borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
};

export const TodasLasVariantes: S = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4 style={{ marginBottom: 12, fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Light bg
        </h4>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12 }}>
          <Logo variant="mark" bg="light" />
          <Logo variant="horizontal" bg="light" />
          <Logo variant="wordmark" bg="light" />
          <Logo variant="vertical" bg="light" />
        </div>
      </div>
      <div>
        <h4 style={{ marginBottom: 12, fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Dark bg
        </h4>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', padding: 24, background: 'var(--color-brand-blue)', borderRadius: 12 }}>
          <Logo variant="mark" bg="dark" />
          <Logo variant="horizontal" bg="dark" />
          <Logo variant="wordmark" bg="dark" />
          <Logo variant="vertical" bg="dark" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Inspección byte-por-byte de los 16 archivos en `public/assets/logos/`.
 * Cada celda muestra el archivo individual cargado por path explícito —
 * útil para detectar logos rotos o con tamaños inconsistentes entre los
 * formatos SVG y PNG.
 */
export const InspeccionDeArchivos: S = {
  render: () => {
    const variants = ['mark', 'horizontal', 'wordmark', 'vertical'] as const;
    const bgs = ['light', 'dark'] as const;
    const formats = ['svg', 'png'] as const;

    const Cell = ({ variant, bg, format }: {
      variant: (typeof variants)[number];
      bg: (typeof bgs)[number];
      format: (typeof formats)[number];
    }) => (
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: 16,
          background: bg === 'dark' ? 'var(--color-brand-blue)' : 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          minHeight: 120,
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: bg === 'dark' ? 'rgba(255,255,255,0.7)' : 'var(--fg-muted)' }}>
          {variant}-{bg}.{format}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo variant={variant} bg={bg} format={format} height={40} />
        </div>
      </div>
    );

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {bgs.flatMap((bg) =>
          formats.flatMap((format) =>
            variants.map((variant) => (
              <Cell key={`${variant}-${bg}-${format}`} variant={variant} bg={bg} format={format} />
            ))
          )
        )}
      </div>
    );
  },
};

export const Responsive: S = {
  render: () => (
    <div>
      <p style={{ marginBottom: 16, color: 'var(--fg-muted)' }}>
        Cambia el ancho del viewport (toolbar arriba) — vas a ver <strong>mark</strong> bajo 768px y <strong>horizontal</strong> arriba.
      </p>
      <div style={{ padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
        <Logo responsive variant="horizontal" bg="light" height={36} />
      </div>
    </div>
  ),
};

export const TamanosCustom: S = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <Logo variant="mark" height={24} />
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 8 }}>height=24</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Logo variant="mark" height={48} />
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 8 }}>height=48</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Logo variant="mark" height={96} />
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 8 }}>height=96</div>
      </div>
    </div>
  ),
};
