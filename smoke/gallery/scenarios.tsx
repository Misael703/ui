'use client';
/* Scenario fixtures: realistic COMPOSITIONS of kit components, built to catch
   the integration bugs that isolated stories never reproduce — the ones that
   actually shipped and had to be fixed from a consumer (despachos):
     - 1.24.0  AppShell `top` scrolled the whole page (header drifted away).
     - 1.25.1  a flipped-up Combobox panel drifted off its anchor when the
               list shrank on filter.
   This single scenario reproduces both seams: a Combobox living low inside an
   AppShell `top` with internal scroll + a sticky sub-header. Asserted by
   `e2e/scenarios.spec.ts`. */
import * as React from 'react';
import * as K from '@misael703/ui';

// ~40 RM comunas → enough options to cap the combobox list at its 240px
// max-height, so filtering to a few visibly shrinks it (the resize the panel
// must react to).
const COMUNAS = [
  'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
  'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
  'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
  'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén',
  'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta',
  'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Santiago', 'Vitacura',
  'Puente Alto', 'San Bernardo', 'Colina', 'Lampa', 'Buin', 'Melipilla',
  'Talagante', 'Peñaflor',
];
const COMUNA_OPTIONS = COMUNAS.map((c) => ({ value: c, label: c }));

const sections = [
  {
    label: 'Operación',
    items: [
      { id: 'home', label: 'Inicio', href: '#', active: true },
      { id: 'orders', label: 'Pedidos', href: '#' },
      { id: 'dispatch', label: 'Despacho', href: '#' },
    ],
  },
];

const block: React.CSSProperties = {
  height: 200,
  border: '1px dashed var(--border-default)',
  borderRadius: 12,
};

/**
 * AppShell `headerLayout="top"` (internal-scroll model, v1.24.0) with a sticky
 * page sub-header and, low in the content, a searchable "Comuna" Combobox
 * (the v1.25.1 popover-resize case). Uncontrolled collapse driven by the
 * header render-prop (v1.23.0) — exercises that seam too.
 */
export function ScenarioAppShellCombobox() {
  const [comuna, setComuna] = React.useState<string | null>(null);
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-top-combobox">
      <K.AppShell
        headerLayout="top"
        collapsedRail
        sections={sections}
        header={{
          left: ({ collapsed, toggle }) => (
            <button
              type="button"
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              aria-expanded={!collapsed}
              onClick={toggle}
              style={{
                width: 40, height: 40, borderRadius: 999,
                border: '1px solid var(--border-default)', background: 'transparent',
                color: 'inherit', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <K.MenuIcon size={18} />
            </button>
          ),
          center: <strong>Despachos</strong>,
          right: <K.Avatar name="Misael Ocas" size={32} />,
        }}
      >
        <div
          data-testid="sticky-subheader"
          style={{
            position: 'sticky', top: 0, zIndex: 1,
            background: 'var(--bg-canvas)', padding: '12px 24px',
            borderBottom: '1px solid var(--border-default)', fontWeight: 600,
          }}
        >
          Pedidos · sub-header sticky
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={block} />
          ))}
          <div data-testid="comuna-field" style={{ maxWidth: 360 }}>
            <K.FormField label="Comuna" htmlFor="comuna" hint="Autocompleta la zona.">
              <K.Combobox
                id="comuna"
                searchable
                value={comuna}
                onChange={setComuna}
                options={COMUNA_OPTIONS}
                placeholder="Selecciona comuna…"
              />
            </K.FormField>
          </div>
          {/* trailing block so the field can sit mid/low viewport with scroll room on both sides */}
          <div style={block} />
        </div>
      </K.AppShell>
    </div>
  );
}

/**
 * Scenario 2 — **Modal + nested Combobox**. Seam: two stacked portals + focus
 * trap + body scroll-lock (the kit's global lock counter). The combobox's
 * floating listbox must stack ABOVE the modal, and the scroll-lock must engage
 * on open and release on close.
 */
export function ScenarioModalCombobox() {
  const [open, setOpen] = React.useState(false);
  const [comuna, setComuna] = React.useState<string | null>(null);
  return (
    <div style={{ padding: 24 }} data-scenario="modal-combobox">
      <K.Button data-testid="open-modal" onClick={() => setOpen(true)}>Abrir modal</K.Button>
      <K.Modal open={open} onClose={() => setOpen(false)} title="Nuevo pedido">
        <K.FormField label="Comuna" htmlFor="m-comuna" hint="Combobox dentro del modal.">
          <K.Combobox
            id="m-comuna"
            searchable
            value={comuna}
            onChange={setComuna}
            options={COMUNA_OPTIONS}
            placeholder="Selecciona comuna…"
          />
        </K.FormField>
      </K.Modal>
    </div>
  );
}

/**
 * Scenario 3 — **brand surface cascade**. Seam: `data-tone="inverse"`
 * re-scoping tokens at runtime. The band-aware Avatar (v1.21.0) inside a brand
 * top-header must compute to on-brand colors, distinct from the same Avatar on
 * a plain surface. The static Contrast unit test checks tokens; this checks the
 * cascade actually lands at runtime in a real composition.
 */
export function ScenarioBrandCascade() {
  return (
    <div style={{ height: '100vh' }} data-scenario="brand-cascade">
      <K.AppShell
        headerLayout="top"
        headerTheme="brand"
        sections={sections}
        header={{
          left: <span data-testid="brand-avatar"><K.Avatar name="Misael Ocas" size={32} /></span>,
          center: <strong>Despachos</strong>,
          right: <K.Badge variant="neutral">Beta</K.Badge>,
        }}
      >
        <div style={{ padding: 24 }}>
          <span data-testid="plain-avatar"><K.Avatar name="Misael Ocas" size={32} /></span>
        </div>
      </K.AppShell>
    </div>
  );
}

const TABLE_COLS = [
  { key: 'comuna', header: 'Comuna' },
  { key: 'orders', header: 'Pedidos' },
  { key: 'zone', header: 'Zona' },
];
const TABLE_ROWS = [
  { id: '1', comuna: 'Providencia', orders: 4, zone: 'Centro' },
  { id: '2', comuna: 'Maipú', orders: 9, zone: 'Poniente' },
  { id: '3', comuna: 'Puente Alto', orders: 2, zone: 'Sur' },
];

/**
 * Scenario 4 — **responsive DataTable**. Seam: `mobileLayout="cards"` collapses
 * the table to stacked cards below 600px (thead hidden, rows block). Asserted
 * by measuring computed `display` of the thead across viewports.
 */
export function ScenarioResponsiveTable() {
  return (
    <div style={{ padding: 24 }} data-scenario="responsive-table">
      <K.DataTable
        rows={TABLE_ROWS}
        rowKey={(r) => r.id}
        columns={TABLE_COLS}
        mobileLayout="cards"
        ariaLabel="Pedidos por comuna"
      />
    </div>
  );
}

/**
 * Scenario 5 — **semantic Badge row coherence** (v1.29.0). Seam: the four
 * semantic soft Badges (success / warning / danger / info) must read with even
 * weight in a row — same luminance neighbourhood for the bg, same depth for
 * the fg. Catches a future drift where one semantic scale (e.g. yellow) gets
 * tuned out of step with the others.
 */
export function ScenarioSemanticBadgeRow() {
  return (
    <div style={{ padding: 24 }} data-scenario="semantic-badge-row">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <K.Badge variant="success" data-testid="badge-success">success</K.Badge>
        <K.Badge variant="warning" data-testid="badge-warning">warning</K.Badge>
        <K.Badge variant="danger"  data-testid="badge-danger" >danger</K.Badge>
        <K.Badge variant="info"    data-testid="badge-info"   >info</K.Badge>
      </div>
    </div>
  );
}

/**
 * Scenario 6 — **Timeline milestone variant** (v1.30.0). Seam: the 5 tones of
 * the milestone variant must each render at 32×32 with a visible halo and the
 * fill color reading from the per-item `--timeline-tone`. Catches a future
 * drift in the milestone CSS (e.g. someone reverting size or losing the halo).
 */
/**
 * Scenario 6b — **Timeline milestone in compact density** (v1.30.6). Seam: in
 * compact, the milestone marker shrinks to 16px (compact CSS wins on
 * specificity), but the 1.30.1 `margin-left: -4` (designed for the 32px
 * milestone in default density) was not overridden — it shifted the compact
 * milestone 4px LEFT of the connector. v1.30.6 resets margin-left to 0 in
 * compact so all three marker centres line up with the connector.
 */
export function ScenarioTimelineMilestoneCompact() {
  const tones = ['neutral', 'success', 'info', 'warning', 'danger'] as const;
  return (
    <div style={{ padding: 24, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'start' }} data-scenario="timeline-milestone-compact">
      {tones.map((t) => (
        <K.Timeline key={t} density="compact" data-testid={`tlc-${t}`}>
          <K.TimelineItem tone={t} title={`before ${t}`} />
          <K.TimelineItem variant="milestone" tone={t} title={`anchor ${t}`} />
          <K.TimelineItem tone={t} title={`event ${t}`} />
        </K.Timeline>
      ))}
    </div>
  );
}

export function ScenarioTimelineMilestone() {
  const tones = ['neutral', 'success', 'info', 'warning', 'danger'] as const;
  return (
    <div style={{ padding: 24, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'start' }} data-scenario="timeline-milestone">
      {tones.map((t) => (
        // Each tone renders default → milestone → default. Two seams in one
        // strip: the 1.30.1 center-alignment fix (X-axis: milestone marker
        // centred with default markers) AND the 1.30.2 connector-reach fix
        // (Y-axis: the previous default's connector must REACH the
        // milestone marker top, not hang in the air above the halo). The
        // top default item exposes the 1.30.2 bug; the bottom one exposes
        // the milestone→default direction.
        <K.Timeline key={t} data-testid={`tl-${t}`}>
          <K.TimelineItem tone={t} title={`before ${t}`} />
          <K.TimelineItem variant="milestone" tone={t} title={`anchor ${t}`} />
          <K.TimelineItem tone={t} title={`event ${t}`} />
        </K.Timeline>
      ))}
    </div>
  );
}
