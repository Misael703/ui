import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter, Badge, Alert, Skeleton, Spinner, Chip, ChipGroup, ProductCard } from './Display';
import { Button } from './Button';

export default { title: 'Data Display/Card & Badge', tags: ['autodocs'] } as Meta;

export const CardBasica: StoryObj = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader>Pedido #1042</CardHeader>
      <CardBody>Cliente: Northwind Builders. 14 ítems.</CardBody>
      <CardFooter>$1.245.000</CardFooter>
    </Card>
  ),
};

export const CardConAccent: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 720 }}>
      <Card accent="brand">
        <CardHeader>Pedido destacado</CardHeader>
        <CardBody>Cliente VIP — atención prioritaria.</CardBody>
      </Card>
      <Card accent="secondary">
        <CardHeader>Promo activa</CardHeader>
        <CardBody>Usa el color secundario de la marca (token `--accent-secondary`).</CardBody>
      </Card>
      <Card accent="success">
        <CardHeader>Despachado</CardHeader>
        <CardBody>Entregado el 28/04 a las 14:32.</CardBody>
      </Card>
      <Card accent="warning">
        <CardHeader>Stock bajo</CardHeader>
        <CardBody>Quedan 3 unidades de SKU ELT-12-AC.</CardBody>
      </Card>
      <Card accent="danger">
        <CardHeader>Pedido vencido</CardHeader>
        <CardBody>5 días de retraso. Contactar al cliente.</CardBody>
      </Card>
      <Card accent="info">
        <CardHeader>Nuevo cliente</CardHeader>
        <CardBody>Registrado hoy desde la web.</CardBody>
      </Card>
      <Card interactive accent="brand">
        <CardHeader>Card clickeable</CardHeader>
        <CardBody>Pasa el mouse para ver el efecto hover.</CardBody>
      </Card>
    </div>
  ),
};

export const Badges: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success" dot>Activo</Badge>
      <Badge variant="warning">Pendiente</Badge>
      <Badge variant="danger">Vencido</Badge>
      <Badge variant="info">Nuevo</Badge>
      <Badge variant="neutral">Neutral</Badge>
    </div>
  ),
};

/**
 * Registros de Badge (post-1.10.0). **Default = data-chip quieto**: sentence
 * case, texto tintado, sin borde duro — lee como metadato en una tabla densa
 * (status, tipo, "Clase A4", un precio). `tone="label"` = micro-label de
 * marca: la textura en mayúsculas para eyebrows / kickers / tags cortos.
 * Escena canónica: la columna de dato usa el default; los tags de marca
 * optan por `tone="label"`.
 */
export const BadgeRegisters: StoryObj = {
  render: () => (
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
                <td style={{ padding: '8px 12px' }}><Badge>{tipo}</Badge></td>
                <td style={{ padding: '8px 12px' }}><Badge variant={v as 'success'}>{estado}</Badge></td>
                <td style={{ padding: '8px 12px' }}><Badge variant="neutral">Clase A4</Badge></td>
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
          <Badge tone="label">Nuevo</Badge>
          <Badge variant="accent" tone="label">Oferta</Badge>
          <Badge variant="primary" tone="label">Beta</Badge>
        </div>
      </div>
    </div>
  ),
};

/**
 * Eje `appearance` (ortogonal a `variant`). `soft` (default) = chip tintado;
 * `solid` = relleno (tono profundo del variant + blanco); `outline` = hairline
 * (transparente, tono profundo en texto+borde). `variant="neutral"
 * appearance="solid"` = tag oscuro/ink. Escena del mock: status pills,
 * brand tags, count.
 */
export const BadgeAppearances: StoryObj = {
  render: () => {
    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 110, font: '600 11px/1 var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
      </div>
    );
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <Row label="Status pills">
          <Badge variant="success" dot tone="label">En stock</Badge>
          <Badge variant="warning" dot tone="label">Stock bajo</Badge>
          <Badge variant="danger" dot tone="label">Sin stock</Badge>
          <Badge variant="info" dot tone="label">Cotización</Badge>
        </Row>
        <Row label="Brand tags">
          <Badge variant="primary" appearance="solid" tone="label">Nuevo</Badge>
          <Badge variant="accent" appearance="solid" tone="label">−20%</Badge>
          <Badge variant="primary" appearance="outline" tone="label">Patio</Badge>
          <Badge variant="neutral" appearance="solid" tone="label">Premium</Badge>
        </Row>
        <Row label="Count · dot">
          <Badge variant="accent" appearance="solid">12</Badge>
          <Badge variant="primary" appearance="solid">99+</Badge>
          <StatusIndicatorDot tone="success" />
          <StatusIndicatorDot tone="danger" />
        </Row>
      </div>
    );
  },
};

function StatusIndicatorDot({ tone }: { tone: 'success' | 'danger' }) {
  const color = tone === 'success' ? 'var(--color-success)' : 'var(--color-danger)';
  return <span aria-label={tone} style={{ width: 10, height: 10, borderRadius: 999, background: color, display: 'inline-block' }} />;
}

/** P5f — `pulse`: un solo Badge cubre una columna de estado (antes había
 * que mezclar StatusIndicator + Badge). Respeta prefers-reduced-motion. */
export const BadgePulse: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge variant="success" pulse>En curso</Badge>
      <Badge variant="warning" pulse>Esperando</Badge>
      <Badge variant="danger" pulse>Caído</Badge>
      <Badge variant="neutral" dot>Inactivo</Badge>
    </div>
  ),
};

export const Alerts: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert variant="info" title="Aviso">Mantenimiento el sábado.</Alert>
      <Alert variant="success" title="Listo">Pedido confirmado.</Alert>
      <Alert variant="warning" title="Atención">Stock bajo.</Alert>
      <Alert variant="danger" title="Error">No pudimos procesar el pago.</Alert>
    </div>
  ),
};

export const Skeletons: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={120} />
    </div>
  ),
};

export const Spinners: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  ),
};

export const Chips: StoryObj = {
  render: () => {
    const [filtros, setFiltros] = React.useState(['Eléctrico', 'Pintura', 'Stock>0']);
    return (
      <ChipGroup>
        {filtros.map((f) => (
          <Chip key={f} active onRemove={() => setFiltros((curr) => curr.filter((x) => x !== f))}>
            {f}
          </Chip>
        ))}
        <Chip>Plomería</Chip>
        <Chip>Construcción</Chip>
      </ChipGroup>
    );
  },
};

export const ProductCardDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 720 }}>
      <ProductCard
        sku="ELT-12-AC"
        name="Cemento gris 42.5 kg"
        price="$5.490"
        tag="Oferta"
        footer={<Button size="sm" fullWidth>Agregar</Button>}
      />
      <ProductCard
        sku="FRR-08"
        name="Fierro corrugado 12mm"
        price="$3.290"
        footer={<Button size="sm" variant="outline" fullWidth>Cotizar</Button>}
      />
      <ProductCard
        sku="PNT-01"
        name="Pintura látex blanca 1gal"
        price="$12.990"
        tag="Nuevo"
        footer={<Button size="sm" fullWidth>Agregar</Button>}
      />
    </div>
  ),
};

/** Playground interactivo: usa el panel Controls para probar `variant` y `dot`. */
export const BadgePlayground: StoryObj<typeof Badge> = {
  args: { children: 'Activo', variant: 'success' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
  render: (args) => <Badge {...args} />,
};

/**
 * `asChild`: una Card clickeable que renderiza como `<a>` (en tu app,
 * `next/link`). Conserva clases, ref y handlers; sin wrapper extra.
 */
export const CardAsChildLink: StoryObj = {
  render: () => (
    <Card asChild interactive accent="brand" style={{ maxWidth: 360, display: 'block', textDecoration: 'none' }}>
      <a href="https://example.com">
        <CardHeader>Pedido #1042</CardHeader>
        <CardBody>Toda la card es un enlace. Northwind Builders, 14 ítems.</CardBody>
      </a>
    </Card>
  ),
};
