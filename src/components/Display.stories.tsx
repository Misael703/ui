import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter, Badge, Alert, Skeleton, Spinner, Chip, ChipGroup, ProductCard } from './Display';
import { Button } from './Button';
import { DataTable } from './DataTable';

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

/**
 * **`variant="inset"`** (v3.4.0) — el panel hundido: agrupa sin flotar. Al lado,
 * la card por default (flota: borde + sombra) para comparar. Regla: card =
 * objeto autocontenido (métrica, producto, resumen de orden); inset = sección
 * o grupo de campos. Una tabla nunca va dentro de ninguna de las dos.
 *
 * v3.6.0: el inset lleva un hairline `--border-on-canvas` (tinte de marca sobre
 * el canvas). Sin él quedaba a 1.09:1 del canvas F y solo las esquinas lo
 * delataban (medido por despachos). Cambia el tema: en dark el canto es más
 * claro que ambos lados porque los tiers son aditivos.
 */
export const CardInset: StoryObj = {
  name: 'Card · inset vs card (cuándo cada una)',
  render: () => (
    // `alignItems: 'start'`: a grid stretches both cards to the tallest one and
    // the floating card would show empty surface under its footer.
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, maxWidth: 760, alignItems: 'start' }}>
      <Card variant="inset">
        <CardHeader>Cliente</CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 4, fontSize: 'var(--text-sm)' }}>
            <div>Northwind Builders</div>
            <div style={{ color: 'var(--fg-muted)' }}>76.543.210-K · Av. Las Torres 1200, Colina</div>
          </div>
        </CardBody>
        <CardFooter>Sección de un formulario: agrupa, no flota.</CardFooter>
      </Card>
      <Card>
        <CardHeader>Pedido #1042</CardHeader>
        <CardBody>14 ítems · entrega mañana AM</CardBody>
        <CardFooter>$1.245.000</CardFooter>
      </Card>
    </div>
  ),
};

interface SurfacesArgs {
  sectionAs: 'inset' | 'card' | 'plain';
  objectCard: boolean;
  table: boolean;
}

/**
 * **Playground · superficies en una página.** Cómo se comportan las tres formas
 * de colocar contenido sobre el canvas al juntarse: una **sección** (grupo de
 * campos) como `inset`, como card flotante o plana sin envoltorio; una **card
 * de objeto** (algo que se lee como unidad); y una **tabla** directa sobre la
 * página, que dibuja su propia superficie. Regla "When to card" (DESIGN.md):
 * card = objeto autocontenido; inset = sección; la tabla nunca va dentro de
 * ninguna. Cambia `sectionAs` para ver por qué una sección en card compite con
 * la card del objeto y aplana la jerarquía.
 */
export const SuperficiesPlayground: StoryObj<SurfacesArgs> = {
  name: 'Playground · superficies en una página',
  parameters: { layout: 'fullscreen' },
  args: { sectionAs: 'inset', objectCard: true, table: true },
  argTypes: {
    sectionAs: { control: 'inline-radio', options: ['inset', 'card', 'plain'] },
    objectCard: { control: 'boolean' },
    table: { control: 'boolean' },
  },
  render: (a) => {
    const fields = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 'var(--text-sm)' }}>
        <div><div style={{ color: 'var(--fg-muted)' }}>Cliente</div><div>Northwind Builders</div></div>
        <div><div style={{ color: 'var(--fg-muted)' }}>Sucursal</div><div>Casa matriz</div></div>
        <div><div style={{ color: 'var(--fg-muted)' }}>Entrega</div><div>Retiro en tienda</div></div>
        <div><div style={{ color: 'var(--fg-muted)' }}>Vendedor</div><div>Mesón 2</div></div>
      </div>
    );
    const section = a.sectionAs === 'plain'
      ? <div style={{ display: 'grid', gap: 8 }}><strong style={{ fontSize: 'var(--text-sm)' }}>Cliente y entrega</strong>{fields}</div>
      : <Card variant={a.sectionAs === 'inset' ? 'inset' : 'card'}><CardHeader>Cliente y entrega</CardHeader><CardBody>{fields}</CardBody></Card>;
    return (
      <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Pedido #1042</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>Creado hoy · 14 ítems</div>
          </div>
          <Button>Confirmar</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: a.objectCard ? '2fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {section}
            {a.table && (
              <DataTable
                ariaLabel="Ítems"
                rows={[
                  { id: '1', name: 'Cemento 25 kg', qty: 40, ready: 40 },
                  { id: '2', name: 'Fierro 12 mm × 6 m', qty: 30, ready: 12 },
                  { id: '3', name: 'Malla acma', qty: 6, ready: 0 },
                ]}
                rowKey={(r) => r.id}
                columns={[
                  { key: 'name', header: 'Producto' },
                  { key: 'qty', header: 'Pedido', numeric: true },
                  { key: 'ready', header: 'Preparado', numeric: true },
                ]}
              />
            )}
          </div>
          {a.objectCard && (
            <Card>
              <CardHeader>Resumen</CardHeader>
              <CardBody>
                <div style={{ display: 'grid', gap: 6, fontSize: 'var(--text-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ítems</span><strong>3</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Preparado</span><strong>52 / 76</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Estado</span><Badge variant="warning">Pendiente</Badge></div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    );
  },
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

const ZONES = [
  { cat: 'cat-1', label: 'Metropolitana' },
  { cat: 'cat-2', label: 'Valparaíso' },
  { cat: 'cat-3', label: 'Biobío' },
  { cat: 'cat-4', label: 'Maule' },
  { cat: 'cat-5', label: 'Araucanía' },
  { cat: 'cat-6', label: 'Los Lagos' },
] as const;

/**
 * **Categorical accents** (v1.16+). For CATEGORY, not status: six
 * well-separated hues so operational zones / regions / teams read as
 * distinct (unlike `info` vs `primary`, both blue). `accent="cat-N"` on
 * Card tints the surface + colours the border in the hue (v1.68.1, replaced the
 * side rail); `variant="cat-N"` on Badge is the soft chip. All `--cat-N-fg` on
 * `--cat-N-bg` are AA (pinned in Contrast.test). Plus `accent="neutral"` (grey).
 */
export const CategoricalAccents: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ZONES.map((z) => <Badge key={z.cat} variant={z.cat}>{z.label}</Badge>)}
        <Badge variant="neutral">Sin zona</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {ZONES.map((z) => (
          <Card key={z.cat} accent={z.cat}>
            <CardBody>
              <strong>{z.label}</strong>
              <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4 }}>Zona operativa</div>
            </CardBody>
          </Card>
        ))}
        <Card accent="neutral">
          <CardBody><strong>Sin asignar</strong><div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 4 }}>accent="neutral"</div></CardBody>
        </Card>
      </div>
    </div>
  ),
};

/**
 * **Card clickeable compacta = link/row.** No hace falta un componente
 * `ListRow` aparte: `Card interactive asChild` deja que la Card *sea* el
 * `<a>` (o el `<Link>` de Next), heredando hover/focus accesibles. Para
 * una fila densa (lista de pedidos, resultados), bajá el padding del
 * `CardBody` con `style`/className. El `asChild` evita el `<a>`-dentro-de-
 * `<div>` (un solo nodo interactivo, foco correcto).
 *
 * En tu app, Next.js:
 * ```tsx
 * <Card interactive asChild>
 *   <Link href={`/pedidos/${id}`}> … </Link>
 * </Card>
 * ```
 */
export const CardComoLink: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
      {[
        { id: '1042', cliente: 'Northwind Builders', total: '$1.245.000', estado: 'Despachado' },
        { id: '1041', cliente: 'Constructora Norte', total: '$842.300', estado: 'En ruta' },
        { id: '1040', cliente: 'Ferretería Centro', total: '$318.900', estado: 'Pendiente' },
      ].map((o) => (
        <Card key={o.id} interactive asChild>
          {/* In your app this is a Next <Link href=…>. Plain <a> here. */}
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <CardBody style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.cliente}</div>
                <div className="cell-meta cell-mono">#{o.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cell-mono">{o.total}</div>
                <Badge variant="neutral">{o.estado}</Badge>
              </div>
            </CardBody>
          </a>
        </Card>
      ))}
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
