import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody, CardFooter, Badge } from './Display';
import { Button } from './Button';
import { DataTable } from './DataTable';
import { formatCurrency } from '../utils/format';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: { children: 'Pedido #1042' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'inset'] },
    interactive: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader>Pedido #1042</CardHeader>
      <CardBody>Cliente: Northwind Builders. 14 ítems.</CardBody>
      <CardFooter><span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>Total</span><strong>{formatCurrency(1245000)}</strong></CardFooter>
    </Card>
  ),
};

/**
 * **Card rhythm (v4.1.0).** Header, body and footer separate by typography
 * and vertical rhythm, not by tone or lines. The header IS the title
 * register (16/600) at 10px from its content; an `h2`/`h3` inside inherits
 * it; `.card__subtitle` sits 2px below; a badge or button at the end of the
 * header aligns itself (flex + gap). The footer sits flat at the bottom and
 * spreads its children (a label on the left, a total or actions on the
 * right). `divider` on header and footer draws the hairline when a "totals"
 * edge is needed; `tone="label"` on the header is the uppercase rubric for a
 * SECTION ("Resumen"), same vocabulary as `Badge tone="label"`; the default
 * is an OBJECT's name ("Pedido #1042").
 */
export const Registers: Story = {
  name: 'Card · header, subtitle, action, label and dividers',
  render: () => {
    const row = (l: string, v: React.ReactNode) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 'var(--text-sm)' }}><span style={{ color: 'var(--fg-muted)' }}>{l}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span></div>
    );
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
        <Card>
          <CardHeader>
            <div><h3>Estado del arriendo</h3><p className="card__subtitle">Taladro percutor · 3 días</p></div>
            <Badge variant="success">Activo</Badge>
          </CardHeader>
          <CardBody><div style={{ display: 'grid', gap: 6 }}>{row('Inicio', '8 sep 2026')}{row('Devolución', '11 sep 2026')}{row('Garantía', formatCurrency(50000))}</div></CardBody>
          <CardFooter><Button variant="outline" size="sm">Extender</Button><Button size="sm">Devolver</Button></CardFooter>
        </Card>
        <Card variant="inset">
          <CardHeader tone="label">Cliente y entrega</CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 'var(--text-sm)' }}>
              <div><div style={{ color: 'var(--fg-muted)' }}>Cliente</div><div>Northwind Builders</div></div>
              <div><div style={{ color: 'var(--fg-muted)' }}>Sucursal</div><div>Casa matriz</div></div>
              <div><div style={{ color: 'var(--fg-muted)' }}>Entrega</div><div>Retiro en tienda</div></div>
              <div><div style={{ color: 'var(--fg-muted)' }}>Vendedor</div><div>Mesón 2</div></div>
            </div>
          </CardBody>
          <CardFooter><Button variant="ghost" size="sm">Editar</Button></CardFooter>
        </Card>
        <Card>
          <CardHeader divider>Resumen</CardHeader>
          <CardBody><div style={{ display: 'grid', gap: 6 }}>{row('Ítems', 14)}{row('Preparado', '52 / 76')}{row('Estado', <Badge variant="warning">Pendiente</Badge>)}</div></CardBody>
          <CardFooter divider><span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>Total</span><strong style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(1245000)}</strong></CardFooter>
        </Card>
      </div>
    );
  },
};

/**
 * **`variant="inset"`** (v3.4.0) — the sunken panel: groups without floating.
 * Next to it, the default card (floats: border + shadow) for comparison.
 * Rule: card = self-contained object (a metric, a product, an order
 * summary); inset = a section or group of fields. A table never goes inside
 * either.
 *
 * v3.6.0: the inset carries a `--border-on-canvas` hairline (a brand tint
 * over the canvas). Without it, it sat at 1.09:1 against canvas F and only
 * the corners gave it away. It flips with the theme: in dark the edge is
 * lighter than both sides because the tiers are additive.
 */
export const Inset: Story = {
  name: 'Card · inset vs card (when to use each)',
  render: () => (
    // `alignItems: 'start'`: a grid stretches both cards to the tallest one and
    // the floating card would show empty surface under its footer.
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, maxWidth: 760, alignItems: 'start' }}>
      <Card variant="inset">
        <CardHeader>Cliente</CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 4, fontSize: 'var(--text-sm)' }}>
            <div>Northwind Builders</div>
            <div style={{ color: 'var(--fg-muted)' }}>Cliente frecuente · retiro en sucursal</div>
          </div>
        </CardBody>
        <CardFooter>Sección de un formulario: agrupa, no flota.</CardFooter>
      </Card>
      <Card>
        <CardHeader>Pedido #1042</CardHeader>
        <CardBody>14 ítems · entrega mañana AM</CardBody>
        <CardFooter>{formatCurrency(1245000)}</CardFooter>
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
 * **Playground · surfaces on a page.** How the three ways of placing content
 * on the canvas behave together: a **section** (a group of fields) as
 * `inset`, as a floating card, or plain with no wrapper; an **object card**
 * (something that reads as a unit); and a **table** directly on the page,
 * which draws its own surface. "When to card" rule (DESIGN.md): card =
 * self-contained object; inset = section; the table never goes inside
 * either. Change `sectionAs` to see why a section-as-card competes with the
 * object's card and flattens the hierarchy.
 */
export const SurfacesPlayground: StoryObj<SurfacesArgs> = {
  name: 'Playground · surfaces on a page',
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
        <div style={{ display: 'grid', gridTemplateColumns: a.objectCard ? 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' : 'minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
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

export const WithAccent: Story = {
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
export const CategoricalAccents: Story = {
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
 * **A compact clickable card = link/row.** No need for a separate `ListRow`
 * component: `Card interactive asChild` lets the Card itself *be* the `<a>`
 * (or Next's `<Link>`), inheriting accessible hover/focus. For a dense row
 * (an order list, search results), reduce the `CardBody` padding with
 * `style`/className. `asChild` avoids `<a>`-inside-`<div>` (a single
 * interactive node, correct focus).
 *
 * In your app, Next.js:
 * ```tsx
 * <Card interactive asChild>
 *   <Link href={`/pedidos/${id}`}> … </Link>
 * </Card>
 * ```
 */
export const AsLink: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
      {[
        { id: '1042', cliente: 'Northwind Builders', total: formatCurrency(1245000), estado: 'Despachado' },
        { id: '1041', cliente: 'Constructora Norte', total: formatCurrency(842300), estado: 'En ruta' },
        { id: '1040', cliente: 'Construcciones del Sur', total: formatCurrency(318900), estado: 'Pendiente' },
      ].map((o) => (
        <Card key={o.id} interactive asChild>
          {/* In your app this is a Next <Link href=…>. Plain <a> here. */}
          <a href={`/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
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

/**
 * `asChild`: a clickable card that renders as an `<a>` (in your app,
 * `next/link`). Keeps classes, ref and handlers; no extra wrapper.
 */
export const AsChildLink: Story = {
  render: () => (
    <Card asChild interactive accent="brand" style={{ maxWidth: 360, display: 'block', textDecoration: 'none' }}>
      <a href="https://example.com">
        <CardHeader>Pedido #1042</CardHeader>
        <CardBody>Toda la card es un enlace. Northwind Builders, 14 ítems.</CardBody>
      </a>
    </Card>
  ),
};
