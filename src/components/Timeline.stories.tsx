import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, TimelineItem } from './Display3';
import { Badge } from './Display';
import { formatCurrency } from '../utils/format';
import { CheckCircle, Edit, Bell, Package, Truck, Clock } from './Icons';

// Hoisted: array holds React elements.
const TIMELINE_ITEMS = [
  <TimelineItem key="created" tone="success" icon={<CheckCircle size={14} />} title="Pedido #1042 creado" meta="2026-04-29 09:14 · Satoru Gojo">
    14 ítems · Total {formatCurrency(1245000)}
  </TimelineItem>,
  <TimelineItem key="paid" tone="info" icon={<Edit size={14} />} title="Pedido #1042 pagado" meta="2026-04-29 10:32" />,
  <TimelineItem key="low-stock" tone="warning" icon={<Bell size={14} />} title="Stock bajo en SKU ELT-12-AC" meta="2026-04-29 11:01" />,
  <TimelineItem key="delivered" tone="success" icon={<CheckCircle size={14} />} title="Pedido #1042 entregado" meta="2026-04-29 14:32 · Bodega norte" />,
];

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  subcomponents: { TimelineItem },
  tags: ['autodocs'],
  args: { children: TIMELINE_ITEMS },
  argTypes: {
    density: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * **Numeric stepper.** Pure composition: the `icon` slot takes a number
 * instead of an SVG, and the progress states do the rest. Useful when order
 * matters more than the event itself.
 */
export const Numeric: Story = {
  render: () => {
    const NumericMarker = ({ n }: { n: number }) => <span style={{ fontWeight: 700, fontSize: 11 }}>{n}</span>;
    return (
      <Timeline style={{ maxWidth: 480 }}>
        <TimelineItem state="done"    tone="success" icon={<NumericMarker n={1} />} title="Crear orden" />
        <TimelineItem state="done"    tone="success" icon={<NumericMarker n={2} />} title="Confirmar cliente" />
        <TimelineItem state="current" tone="info"    icon={<NumericMarker n={3} />} title="Enviar" meta="En curso" />
        <TimelineItem state="pending"                icon={<NumericMarker n={4} />} title="Completar" />
      </Timeline>
    );
  },
};

/**
 * **Compact density** (v1.28.0). `density="compact"` shrinks marker, gap
 * and font sizes while keeping the same semantics. For sidebar summaries /
 * order list cards.
 */
export const Compact: Story = {
  render: () => (
    <div style={{ maxWidth: 280, padding: 16, border: '1px solid var(--border-default)', borderRadius: 12 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Pedido #1042</h4>
      <Timeline density="compact">
        <TimelineItem state="done"    tone="success" icon={<CheckCircle size={10} />} title="Creado"    meta="09:14" />
        <TimelineItem state="done"    tone="success" icon={<Truck size={10} />}       title="Envío 1/3" meta="14:30" />
        <TimelineItem state="current" tone="info"    icon={<Truck size={10} />}       title="Envío 2/3" meta="ahora" />
        <TimelineItem state="pending"                icon={<Truck size={10} />}       title="Envío 3/3" meta="pend." />
      </Timeline>
    </div>
  ),
};

/**
 * **Event-typed** (v1.28.0). The `right` prop adds a slot at the end of the
 * title row — a great fit for a `Badge` that classifies the event type
 * (shipment / pickup / note), so you can scan the "what" without reading
 * the "what happened".
 */
export const EventTyped: Story = {
  render: () => (
    <Timeline style={{ maxWidth: 560 }}>
      <TimelineItem state="done"    tone="success" icon={<CheckCircle size={14} />} title="Pedido #1042 creado"        meta="09:14"   right={<Badge variant="info">orden</Badge>} />
      <TimelineItem state="done"    tone="success" icon={<Truck size={14} />}       title="Envío 1/3 enviado"          meta="14:30"   right={<Badge variant="primary">envío</Badge>} />
      <TimelineItem state="done"    tone="success" icon={<Package size={14} />}     title="Retiro parcial en tienda"   meta="10:12"   right={<Badge variant="accent">retiro</Badge>} />
      <TimelineItem state="current" tone="info"    icon={<Truck size={14} />}       title="Preparando envío 2/3"       meta="ahora"   right={<Badge variant="primary">envío</Badge>} />
      <TimelineItem state="pending"                icon={<Bell size={14} />}        title="Nota: cliente cambió dirección" meta="pend." right={<Badge>nota</Badge>} />
    </Timeline>
  ),
};

/**
 * **Inline payload.** The `children` slot already existed — this story
 * demonstrates the pattern: a mini-card below the event with the detail
 * (tracking, invoice), only for items that carry a payload.
 */
export const Payload: Story = {
  render: () => (
    <Timeline style={{ maxWidth: 540 }}>
      <TimelineItem state="done" tone="success" icon={<CheckCircle size={14} />} title="Pedido #1042 creado" meta="09:14" />
      <TimelineItem state="done" tone="success" icon={<Truck size={14} />} title="Envío 1/3 enviado" meta="14:30">
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 8, padding: 10, fontSize: 12 }}>
          <div><strong>Seguimiento:</strong> #TRK-78422 · Courier Andes</div>
          <div style={{ color: 'var(--fg-muted)' }}>4 bultos · 38,2 kg</div>
        </div>
      </TimelineItem>
      <TimelineItem state="current" tone="info" icon={<Truck size={14} />} title="Envío 2/3 en preparación" meta="ahora">
        <div style={{ border: '1px dashed var(--border-default)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} /> Seguimiento aún sin emitir
        </div>
      </TimelineItem>
      <TimelineItem state="pending" icon={<Truck size={14} />} title="Envío 3/3" meta="Pendiente" />
    </Timeline>
  ),
};

/**
 * **Milestone variant** (v1.30.0) — anchor events get visual weight that the
 * operational events below them don't. 32×32 filled in the tone color + soft
 * halo. Combinable with each of the 5 tones; combinable with `state` (a
 * pending milestone stays hollow muted, preserving "not yet" while keeping
 * the anchor slot).
 */
export const MilestoneTones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
      {(['neutral', 'success', 'info', 'warning', 'danger'] as const).map((t) => (
        <Timeline key={t}>
          <TimelineItem variant="milestone" tone={t} icon={<CheckCircle size={18} />} title={`Anchor · ${t}`} meta="2026-05-25 09:14" />
          <TimelineItem tone={t === 'neutral' ? 'success' : t} icon={<CheckCircle size={14} />} title="Evento operativo" meta="14:30" />
        </Timeline>
      ))}
    </div>
  ),
};

interface OrderLifecycleArgs { events: number; payload: boolean; types: boolean; density: 'default' | 'compact'; completed: boolean }

/**
 * **Playground · order lifecycle.** The four layers the kit offers to tell
 * the full lifecycle of a resource, combined:
 *
 *  - **Fixed anchors** (`variant="milestone"`) at the top and bottom —
 *    "created" is always `state="done"`; "delivered" morphs between
 *    `pending` and `done`.
 *  - **Operational events** (24×24 markers) in the middle — `state` reflects
 *    progress (`done` / `current` / `pending`), `tone` reinforces it with
 *    color.
 *  - **Event type** via `right={<Badge>…</Badge>}` — scan the "what"
 *    without reading the "what happened".
 *  - **Structured payload** in `children` for the items that carry detail —
 *    the ones without it show none.
 *
 * The formula scales from 0 to N events with no code changes: `events: 0`
 * leaves just the two anchors ("created, everything else pending");
 * `completed` closes the story (everything `done`, bottom anchor `done`).
 * `density="compact"` is the same pattern for a list card.
 */
export const OrderLifecyclePlayground: StoryObj<OrderLifecycleArgs> = {
  name: 'Playground · order lifecycle',
  args: { events: 4, payload: true, types: true, density: 'default', completed: false },
  argTypes: {
    events: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    payload: { control: 'boolean' },
    types: { control: 'boolean' },
    density: { control: 'inline-radio', options: ['default', 'compact'] },
    completed: { control: 'boolean' },
  },
  render: (a) => {
    const size = a.density === 'compact' ? 10 : 14;
    const anchor = a.density === 'compact' ? 10 : 18;
    type S = 'done' | 'current' | 'pending';
    const pool: { title: string; meta: string; doneMeta: string; icon: React.ReactNode; type: React.ReactNode; state: S; tone?: 'success' | 'info'; payload?: React.ReactNode }[] = [
      { title: 'Envío 1/3 enviado', meta: '25-05-2026 14:30 · Bodega norte', doneMeta: '25-05-2026 14:30 · Bodega norte', icon: <Truck size={size} />, type: <Badge variant="primary">envío</Badge>, state: 'done', tone: 'success',
        payload: (
          <div style={{ marginTop: 6, padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12, color: 'var(--fg-muted)', display: 'grid', gap: 2 }}>
            <div><span style={{ color: 'var(--fg-subtle)' }}>Seguimiento:</span> TRK-78422 · Courier Andes</div>
            <div><span style={{ color: 'var(--fg-subtle)' }}>Bultos:</span> 4 · 38,2 kg</div>
          </div>
        ) },
      { title: 'Retiro parcial en tienda', meta: '26-05-2026 10:12', doneMeta: '26-05-2026 10:12', icon: <Package size={size} />, type: <Badge variant="accent">retiro</Badge>, state: 'done', tone: 'success' },
      { title: 'Preparando envío 2/3', meta: 'En curso · Bodega norte', doneMeta: '26-05-2026 16:40 · Bodega norte', icon: <Truck size={size} />, type: <Badge variant="primary">envío</Badge>, state: 'current', tone: 'info',
        payload: (
          <div style={{ marginTop: 6, padding: '8px 12px', border: '1px dashed var(--border-default)', borderRadius: 8, fontSize: 12, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Seguimiento aún sin emitir
          </div>
        ) },
      { title: 'Envío 3/3', meta: 'Pendiente', doneMeta: '27-05-2026 11:05', icon: <Truck size={size} />, type: <Badge variant="primary">envío</Badge>, state: 'pending' },
      { title: 'Cliente cambió la dirección', meta: 'Pendiente de confirmación', doneMeta: '27-05-2026 09:30 · Satoru Gojo', icon: <Bell size={size} />, type: <Badge>nota</Badge>, state: 'pending' },
    ];
    const items = pool.slice(0, a.events);
    return (
      <Timeline density={a.density === 'compact' ? 'compact' : undefined} style={{ maxWidth: 580 }}>
        <TimelineItem variant="milestone" state="done" tone="success" icon={<CheckCircle size={anchor} />} title="Pedido #1042 creado" meta="25-05-2026 09:14 · Satoru Gojo" />
        {items.map((e) => (
          <TimelineItem
            key={e.title}
            state={a.completed ? 'done' : e.state}
            tone={a.completed ? 'success' : e.tone}
            icon={e.icon}
            title={e.title}
            meta={a.completed ? e.doneMeta : e.meta}
            right={a.types ? e.type : undefined}
          >
            {a.payload && !a.completed && e.payload}
          </TimelineItem>
        ))}
        <TimelineItem variant="milestone" state={a.completed ? 'done' : 'pending'} tone="success" icon={<CheckCircle size={anchor} />} title="Pedido #1042 entregado" meta={a.completed ? '27-05-2026 16:45' : 'Pendiente'} />
      </Timeline>
    );
  },
};
