import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserCell, StatusIndicator, Timeline, TimelineItem, Tree, Calendar } from './Display3';
import { Badge } from './Display';
import { CheckCircle, Edit, Bell, Folder, Package, Truck, Clock } from './Icons';
import { action } from '@storybook/addon-actions';

export default { title: 'Data Display/People, Timeline, Tree & Calendar', tags: ['autodocs'] } as Meta;

export const UserCellDemo: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <UserCell name="Misael Ocas" meta="misael.ocas@elalba.cl" />
      <UserCell name="Patricia Rojas" meta="Admin · Acme Co" size={40} />
      <UserCell name="JN" meta="Bodeguero" avatarSrc="https://i.pravatar.cc/64?img=12" />
    </div>
  ),
};

export const StatusIndicators: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatusIndicator tone="success" pulse label="Sincronizado" />
      <StatusIndicator tone="warning" label="Pendiente" />
      <StatusIndicator tone="danger" label="Error de conexión" />
      <StatusIndicator tone="info" pulse label="Procesando" />
      <StatusIndicator tone="neutral" label="Inactivo" />
    </div>
  ),
};

export const TimelineDemo: StoryObj = {
  name: 'Timeline · default (1.x register)',
  render: () => (
    <Timeline style={{ maxWidth: 480 }}>
      <TimelineItem tone="success" icon={<CheckCircle size={14} />} title="Pedido creado" meta="2026-04-29 09:14 · Misael Ocas">
        14 ítems · Total $1.245.000
      </TimelineItem>
      <TimelineItem tone="info" icon={<Edit size={14} />} title="Cliente confirmó por WhatsApp" meta="2026-04-29 10:32" />
      <TimelineItem tone="warning" icon={<Bell size={14} />} title="Stock bajo en SKU ELT-12-AC" meta="2026-04-29 11:01" />
      <TimelineItem tone="success" icon={<CheckCircle size={14} />} title="Despachado" meta="2026-04-29 14:32 · Bodega norte" />
    </Timeline>
  ),
};

/**
 * **#1 — Progress states** (v1.28.0). Estados `done | current | pending` por
 * item, orthogonales al `tone`. El connector arriba de cada item se re-pinta
 * según el estado, así que mirando la columna izquierda escaneás avance:
 * sólido coloreado en lo hecho, halo pulsante en lo actual, dasheado muted
 * en lo pendiente. Caso despachos: una orden acumulando envíos/retiros hasta
 * marcar "completada".
 */
export const TimelineProgress: StoryObj = {
  name: '#1 Progress (despachos canonical)',
  render: () => (
    <Timeline style={{ maxWidth: 480 }}>
      <TimelineItem state="done"    tone="success" icon={<CheckCircle size={14} />} title="Orden 1415231 creada" meta="2026-05-25 09:14 · Misael Ocas" />
      <TimelineItem state="done"    tone="success" icon={<Truck size={14} />}        title="Despacho 1/3 enviado" meta="2026-05-25 14:30 · Bodega norte" />
      <TimelineItem state="done"    tone="success" icon={<Package size={14} />}      title="Retiro parcial — cliente en mesón" meta="2026-05-26 10:12" />
      <TimelineItem state="current" tone="info"    icon={<Truck size={14} />}        title="Preparando despacho 2/3" meta="En curso · Bodega norte" />
      <TimelineItem state="pending"                icon={<Truck size={14} />}        title="Despacho 3/3" meta="Pendiente" />
      <TimelineItem state="pending"                icon={<CheckCircle size={14} />}  title="Orden completada" meta="Pendiente" />
    </Timeline>
  ),
};

/**
 * **#2 — Numeric stepper.** Pura composición: el `icon` slot toma un número
 * en vez de un SVG, y los estados de progreso hacen el resto. Útil cuando el
 * orden importa más que el evento.
 */
export const TimelineNumeric: StoryObj = {
  name: '#2 Numeric (icon = número)',
  render: () => {
    const Num = ({ n }: { n: number }) => <span style={{ fontWeight: 700, fontSize: 11 }}>{n}</span>;
    return (
      <Timeline style={{ maxWidth: 480 }}>
        <TimelineItem state="done"    tone="success" icon={<Num n={1} />} title="Crear orden" />
        <TimelineItem state="done"    tone="success" icon={<Num n={2} />} title="Confirmar cliente" />
        <TimelineItem state="current" tone="info"    icon={<Num n={3} />} title="Despachar" meta="En curso" />
        <TimelineItem state="pending"                icon={<Num n={4} />} title="Completar" />
      </Timeline>
    );
  },
};

/**
 * **#3 — Compact density** (v1.28.0). `density="compact"` reduce marker, gap y
 * font sizes manteniendo la semántica. Para resúmenes en sidebar / cards de
 * lista de órdenes.
 */
export const TimelineCompact: StoryObj = {
  name: '#3 Compact (cards / sidebars)',
  render: () => (
    <div style={{ maxWidth: 280, padding: 16, border: '1px solid var(--border-default)', borderRadius: 12 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Orden 1415231</h4>
      <Timeline density="compact">
        <TimelineItem state="done"    tone="success" icon={<CheckCircle size={10} />} title="Creada"           meta="09:14" />
        <TimelineItem state="done"    tone="success" icon={<Truck size={10} />}       title="Despacho 1/3"     meta="14:30" />
        <TimelineItem state="current" tone="info"    icon={<Truck size={10} />}       title="Despacho 2/3"     meta="ahora" />
        <TimelineItem state="pending"                icon={<Truck size={10} />}       title="Despacho 3/3"     meta="pend." />
      </Timeline>
    </div>
  ),
};

/**
 * **#5 — Event-typed** (v1.28.0). El prop `right` agrega un slot al final del
 * title row — encaja perfecto una `Badge` que clasifique el tipo de evento
 * (envío / retiro / nota), así escaneás el "qué" sin leer el "qué pasó".
 */
export const TimelineEventTyped: StoryObj = {
  name: '#5 Event-typed (Badge en `right`)',
  render: () => (
    <Timeline style={{ maxWidth: 560 }}>
      <TimelineItem state="done"    tone="success" icon={<CheckCircle size={14} />} title="Orden 1415231 creada"        meta="09:14"   right={<Badge variant="info">orden</Badge>} />
      <TimelineItem state="done"    tone="success" icon={<Truck size={14} />}       title="Despacho 1/3 enviado"        meta="14:30"   right={<Badge variant="primary">envío</Badge>} />
      <TimelineItem state="done"    tone="success" icon={<Package size={14} />}     title="Retiro parcial — mesón"      meta="10:12"   right={<Badge variant="accent">retiro</Badge>} />
      <TimelineItem state="current" tone="info"    icon={<Truck size={14} />}       title="Preparando despacho 2/3"     meta="ahora"   right={<Badge variant="primary">envío</Badge>} />
      <TimelineItem state="pending"                icon={<Bell size={14} />}        title="Nota: cliente cambió dirección" meta="pend." right={<Badge>nota</Badge>} />
    </Timeline>
  ),
};

/**
 * **#6 — Inline payload.** El slot `children` ya existía — esta story
 * demuestra el patrón: un mini-card debajo del evento con el detalle (guía,
 * tracking, factura), solo para los items que tengan payload.
 */
export const TimelinePayload: StoryObj = {
  name: '#6 Inline payload (slot children)',
  render: () => (
    <Timeline style={{ maxWidth: 540 }}>
      <TimelineItem state="done" tone="success" icon={<CheckCircle size={14} />} title="Orden creada" meta="09:14" />
      <TimelineItem state="done" tone="success" icon={<Truck size={14} />} title="Despacho 1/3 enviado" meta="14:30">
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 8, padding: 10, fontSize: 12 }}>
          <div><strong>Guía:</strong> #DG-78422 · Starken</div>
          <div style={{ color: 'var(--fg-muted)' }}>4 bultos · 38,2 kg</div>
        </div>
      </TimelineItem>
      <TimelineItem state="current" tone="info" icon={<Truck size={14} />} title="Despacho 2/3 en preparación" meta="ahora">
        <div style={{ border: '1px dashed var(--border-default)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} /> Guía aún sin emitir
        </div>
      </TimelineItem>
      <TimelineItem state="pending" icon={<Truck size={14} />} title="Despacho 3/3" meta="Pendiente" />
    </Timeline>
  ),
};

/**
 * Operable por teclado (WAI-ARIA TreeView, desde v1.3.0). Da foco al árbol con
 * Tab y prueba: ↑/↓ mueven entre nodos visibles, →/← expanden/colapsan o saltan
 * a hijo/padre, Inicio/Fin van al primero/último, Enter/Espacio seleccionan. El
 * chevron es decorativo (fuera del orden de tabulación); el estado se expone en
 * el `treeitem` vía `aria-expanded`.
 */
export const TreeDemo: StoryObj = {
  render: () => {
    const [selected, setSelected] = React.useState('cemento');
    return (
      <Tree
        defaultExpanded={['construccion', 'electrico']}
        selectedId={selected}
        onSelect={setSelected}
        nodes={[
          {
            id: 'construccion', label: 'Construcción', icon: <Folder size={14} />,
            children: [
              { id: 'cemento', label: 'Cementos y áridos', icon: <Package size={14} />, meta: '142' },
              { id: 'fierro', label: 'Fierros', icon: <Package size={14} />, meta: '89' },
              { id: 'maderas', label: 'Maderas', icon: <Package size={14} />, meta: '56' },
            ],
          },
          {
            id: 'electrico', label: 'Eléctrico', icon: <Folder size={14} />,
            children: [
              { id: 'cables', label: 'Cables', icon: <Package size={14} /> },
              { id: 'enchufes', label: 'Enchufes', icon: <Package size={14} /> },
            ],
          },
          { id: 'pintura', label: 'Pintura', icon: <Folder size={14} />, meta: '67' },
        ]}
      />
    );
  },
};

export const CalendarDemo: StoryObj = {
  render: () => {
    const today = new Date();
    return (
      <div style={{ maxWidth: 720 }}>
        <Calendar
          events={[
            { date: today, label: 'Despacho 1042', tone: 'info' },
            { date: today, label: 'Cliente VIP visita', tone: 'warning' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), label: 'Vencimiento factura', tone: 'danger' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), label: 'Inventario', tone: 'success' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), label: 'Reunión equipo', tone: 'info' },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), label: 'Capacitación', tone: 'neutral' },
          ]}
          onDayClick={action('day-click')}
        />
      </div>
    );
  },
};

/**
 * **Milestone variant** (v1.30.0) — anchor events get visual weight that the
 * operational events below them don't. 32×32 filled in the tone color + soft
 * halo. Combinable with each of the 5 tones; combinable with `state` (a
 * pending milestone stays hollow muted, preserving "not yet" while keeping
 * the anchor slot).
 */
export const TimelineMilestoneTones: StoryObj = {
  name: '#7 Milestone · 5 tonos lado a lado',
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

/**
 * **Despachos canonical** — la orden 1415231 ahora con el "Orden creada" como
 * anchor milestone arriba del resto de despachos operativos. La inversión de
 * jerarquía pre-1.30.0 desaparece: el anchor pesa más que los eventos que
 * cuelgan de él, no menos.
 */
export const TimelineMilestoneDespachos: StoryObj = {
  name: '#8 Milestone · despachos anchor + eventos',
  render: () => (
    <Timeline style={{ maxWidth: 480 }}>
      <TimelineItem variant="milestone" state="done" tone="success" icon={<CheckCircle size={18} />} title="Orden 1415231 creada" meta="2026-05-25 09:14 · Misael Ocas" />
      <TimelineItem state="done"    tone="success" icon={<Truck size={14} />}   title="Despacho 1/3 enviado"       meta="2026-05-25 14:30" />
      <TimelineItem state="done"    tone="success" icon={<Package size={14} />} title="Retiro parcial — mesón"     meta="2026-05-26 10:12" />
      <TimelineItem state="current" tone="info"    icon={<Truck size={14} />}   title="Preparando despacho 2/3"    meta="En curso" />
      <TimelineItem state="pending"                icon={<Truck size={14} />}   title="Despacho 3/3"               meta="Pendiente" />
      <TimelineItem variant="milestone" state="pending" tone="success" icon={<CheckCircle size={18} />} title="Orden completada" meta="Pendiente" />
    </Timeline>
  ),
};

/**
 * **#9 — Despachos · patrón canónico (detalle de orden).** El recomendado
 * para `/dispatch-orders/[id]`. Combina las 4 capas que el kit ofrece para
 * representar el ciclo completo de una orden:
 *
 *  - **Anchors fijos** (`variant="milestone"`) arriba y abajo — "Orden
 *    creada" siempre `state="done"`, "Orden completada" morphea entre
 *    `pending` y `done` según el estado de la orden.
 *  - **Eventos operativos** (default markers 24×24) en el medio — `state`
 *    refleja avance (`done` / `current` / `pending`), `tone` lo refuerza
 *    con color.
 *  - **Tipo de evento** via `right={<Badge>…</Badge>}` (envío / retiro /
 *    nota) — escaneás el "qué" sin leer el "qué pasó".
 *  - **Payload estructurado** en `children` para los items que cargan
 *    detalle (guía, tracking, totales) — los que no tienen, no lo muestran.
 *
 * La fórmula **escala de 1 a N despachos sin cambios de código**. Con 1
 * despacho lee igual de claro que con 10: los anchors mantienen la
 * jerarquía siempre.
 */
export const TimelineDespachosCanonical: StoryObj = {
  name: '#9 Despachos · patrón canónico (detalle de orden)',
  render: () => (
    <Timeline style={{ maxWidth: 580 }}>
      {/* ANCHOR superior: siempre done apenas la orden se crea. */}
      <TimelineItem
        variant="milestone"
        state="done"
        tone="success"
        icon={<CheckCircle size={18} />}
        title="Orden 1415231 creada"
        meta="2026-05-25 09:14 · Misael Ocas"
      />

      {/* Despacho 1 ya enviado — con payload (guía + bultos). */}
      <TimelineItem
        state="done"
        tone="success"
        icon={<Truck size={14} />}
        title="Despacho 1/3 enviado"
        meta="2026-05-25 14:30 · Bodega norte"
        right={<Badge variant="primary">envío</Badge>}
      >
        <div style={{
          marginTop: 6,
          padding: '8px 12px',
          borderLeft: '2px solid var(--border-default)',
          fontSize: 12,
          color: 'var(--fg-muted)',
          display: 'grid', gap: 2,
        }}>
          <div><span style={{ color: 'var(--fg-subtle)' }}>Guía:</span> DG-78422 · Starken</div>
          <div><span style={{ color: 'var(--fg-subtle)' }}>Bultos:</span> 4 · 38,2 kg</div>
        </div>
      </TimelineItem>

      {/* Retiro parcial en el mesón — sin payload. */}
      <TimelineItem
        state="done"
        tone="success"
        icon={<Package size={14} />}
        title="Retiro parcial — cliente en mesón"
        meta="2026-05-26 10:12"
        right={<Badge variant="accent">retiro</Badge>}
      />

      {/* En curso (pulse animado por state="current"). */}
      <TimelineItem
        state="current"
        tone="info"
        icon={<Truck size={14} />}
        title="Preparando despacho 2/3"
        meta="En curso · Bodega norte"
        right={<Badge variant="primary">envío</Badge>}
      />

      {/* Pendiente — connector dasheado arriba. */}
      <TimelineItem
        state="pending"
        icon={<Truck size={14} />}
        title="Despacho 3/3"
        meta="Pendiente"
        right={<Badge variant="primary">envío</Badge>}
      />

      {/* Nota interna entre eventos — neutral. */}
      <TimelineItem
        state="pending"
        icon={<Bell size={14} />}
        title="Cliente cambió dirección"
        meta="Pendiente de confirmación"
        right={<Badge>nota</Badge>}
      />

      {/* ANCHOR inferior: pending mientras la orden no se entregue;
          morphea a state="done" tone="success" cuando se entregue. */}
      <TimelineItem
        variant="milestone"
        state="pending"
        tone="success"
        icon={<CheckCircle size={18} />}
        title="Orden completada"
        meta="Pendiente"
      />
    </Timeline>
  ),
};

/**
 * **#10 — Despachos · card de lista (compact).** El mismo patrón en
 * `density="compact"` para los cards de la **lista** de órdenes (`/dispatch-orders`).
 * Cabe 3-4 órdenes en el viewport y sigue leyéndose el avance con un vistazo.
 *
 * Las 3 cards muestran las situaciones límite que demuestran que la fórmula
 * escala desde N=0 hasta N=múltiple:
 *
 *  1. **Recién creada** (N=0) — solo los 2 anchors, nada en medio. Lee
 *     claro: "se creó, falta todo".
 *  2. **En curso** (N=3, multi-estado) — el caso típico mid-flight.
 *  3. **Entregada** (N=1, ideal) — el "happy path" con un solo despacho.
 *     Los 3 markers verdes en línea + ambos anchors en `done` cierra la
 *     historia.
 */
export const TimelineDespachosCardCompact: StoryObj = {
  name: '#10 Despachos · card de lista (compact)',
  render: () => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {/* Card 1: recién creada (N=0) */}
      <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Orden 1415230</h4>
        <Timeline density="compact">
          <TimelineItem variant="milestone" state="done"    tone="success" icon={<CheckCircle size={10} />} title="Creada"     meta="09:14" />
          <TimelineItem variant="milestone" state="pending" tone="success" icon={<CheckCircle size={10} />} title="Completada" meta="pend." />
        </Timeline>
      </div>

      {/* Card 2: en curso (N=3, multi-estado) */}
      <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Orden 1415231</h4>
        <Timeline density="compact">
          <TimelineItem variant="milestone" state="done"    tone="success" icon={<CheckCircle size={10} />} title="Creada"        meta="09:14" />
          <TimelineItem                     state="done"    tone="success" icon={<Truck size={10} />}      title="Despacho 1/3"  meta="14:30" />
          <TimelineItem                     state="current" tone="info"    icon={<Truck size={10} />}      title="2/3 en curso"  meta="ahora" />
          <TimelineItem                     state="pending"                icon={<Truck size={10} />}      title="3/3"           meta="pend." />
          <TimelineItem variant="milestone" state="pending" tone="success" icon={<CheckCircle size={10} />} title="Completada"   meta="pend." />
        </Timeline>
      </div>

      {/* Card 3: entregada (N=1, happy path) */}
      <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Orden 1415229</h4>
        <Timeline density="compact">
          <TimelineItem variant="milestone" state="done" tone="success" icon={<CheckCircle size={10} />} title="Creada"          meta="09:14" />
          <TimelineItem                     state="done" tone="success" icon={<Truck size={10} />}      title="Despacho único" meta="14:30" />
          <TimelineItem variant="milestone" state="done" tone="success" icon={<CheckCircle size={10} />} title="Entregada"       meta="16:45" />
        </Timeline>
      </div>
    </div>
  ),
};
