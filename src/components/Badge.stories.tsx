import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Display';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { variant: 'neutral', children: 'Pendiente', tone: 'data', appearance: 'soft' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] },
    tone: { control: 'inline-radio', options: ['data', 'label'] },
    appearance: { control: 'inline-radio', options: ['soft', 'solid', 'outline'] },
    dot: { control: 'boolean' },
    pulse: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Variants: Story = {
  render: (a) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge {...a} variant="primary">Primary</Badge>
      <Badge {...a} variant="accent">Accent</Badge>
      <Badge {...a} variant="success" dot>Activo</Badge>
      <Badge {...a} variant="warning">Pendiente</Badge>
      <Badge {...a} variant="danger">Vencido</Badge>
      <Badge {...a} variant="info">Nuevo</Badge>
      <Badge {...a} variant="neutral">Neutral</Badge>
    </div>
  ),
};

/**
 * Badge registers (post-1.10.0). **Default = quiet data-chip**: sentence
 * case, tinted text, no hard border — it reads as metadata in a dense table
 * (a status, a type, "Categoría A", a price). `tone="label"` = brand
 * micro-label: the uppercase texture for eyebrows / kickers / short tags.
 * Canonical scene: the data column uses the default; brand tags opt into
 * `tone="label"`.
 */
export const Registers: Story = {
  render: (a) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ font: '600 12px/1 var(--font-body)', color: 'var(--fg-muted)', marginBottom: 8 }}>
          Columna de dato — default (quieto)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <tbody>
            {[
              ['0010402', 'Envío', 'success', 'Entregado'],
              ['0010403', 'Retiro', 'warning', 'Pendiente'],
              ['0010404', 'Envío', 'danger', 'Cancelado'],
            ].map(([n, tipo, v, estado]) => (
              <tr key={n} style={{ borderTop: '1px solid var(--border-default)' }}>
                <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>{n}</td>
                <td style={{ padding: '8px 12px' }}><Badge {...a}>{tipo}</Badge></td>
                <td style={{ padding: '8px 12px' }}><Badge {...a} variant={v as 'success'}>{estado}</Badge></td>
                <td style={{ padding: '8px 12px' }}><Badge {...a} variant="neutral">Categoría A</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div style={{ font: '600 12px/1 var(--font-body)', color: 'var(--fg-muted)', marginBottom: 8 }}>
          Micro-label de marca — opt-in <code>tone="label"</code>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge {...a} tone="label">Nuevo</Badge>
          <Badge {...a} variant="accent" tone="label">Oferta</Badge>
          <Badge {...a} variant="primary" tone="label">Beta</Badge>
        </div>
      </div>
    </div>
  ),
};

function StatusIndicatorDot({ tone }: { tone: 'success' | 'danger' }) {
  const color = tone === 'success' ? 'var(--color-success)' : 'var(--color-danger)';
  return <span aria-label={tone} style={{ width: 10, height: 10, borderRadius: 999, background: color, display: 'inline-block' }} />;
}

/**
 * `appearance` axis (orthogonal to `variant`). `soft` (default) = tinted
 * chip; `solid` = fill (the variant's deep tone + white); `outline` =
 * hairline (transparent, deep tone for text + border). `variant="neutral"
 * appearance="solid"` = the dark/ink tag. Mock scene: status pills, brand
 * tags, count.
 */
export const Appearances: Story = {
  render: (a) => {
    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 110, font: '600 11px/1 var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
      </div>
    );
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <Row label="Status pills">
          <Badge {...a} variant="success" dot tone="label">En stock</Badge>
          <Badge {...a} variant="warning" dot tone="label">Stock bajo</Badge>
          <Badge {...a} variant="danger" dot tone="label">Sin stock</Badge>
          <Badge {...a} variant="info" dot tone="label">Cotización</Badge>
        </Row>
        <Row label="Brand tags">
          <Badge {...a} variant="primary" appearance="solid" tone="label">Nuevo</Badge>
          <Badge {...a} variant="accent" appearance="solid" tone="label">−20%</Badge>
          <Badge {...a} variant="primary" appearance="outline" tone="label">Patio</Badge>
          <Badge {...a} variant="neutral" appearance="solid" tone="label">Premium</Badge>
        </Row>
        <Row label="Count · dot">
          <Badge {...a} variant="accent" appearance="solid">12</Badge>
          <Badge {...a} variant="primary" appearance="solid">99+</Badge>
          <StatusIndicatorDot tone="success" />
          <StatusIndicatorDot tone="danger" />
        </Row>
      </div>
    );
  },
};

/**
 * `pulse`: a single Badge covers a status column (previously required
 * mixing StatusIndicator + Badge). Respects prefers-reduced-motion.
 */
export const Pulse: Story = {
  render: (a) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge {...a} variant="success" pulse>En curso</Badge>
      <Badge {...a} variant="warning" pulse>Esperando</Badge>
      <Badge {...a} variant="danger" pulse>Caído</Badge>
      <Badge {...a} variant="neutral" dot>Inactivo</Badge>
    </div>
  ),
};
