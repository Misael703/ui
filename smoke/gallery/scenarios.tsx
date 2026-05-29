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

/**
 * Scenario 7 — **AppShell `top` mobile drawer** (v1.31.0). Seam: under 900px
 * the sidebar must become a fixed overlay anchored under the header; the
 * same `header.left` render-prop trigger that toggles `collapsed` on desktop
 * must DWIM into open/close drawer on mobile. ESC + scrim-tap also close.
 * Asserted via Playwright resize across the breakpoint.
 *
 * 7b/7c/7d add the variant matrix:
 *   - brand: drawer over brand-themed shell (sidebar border switches to the
 *     white-α hairline; data-tone="inverse" cascades into descendants).
 *   - rail: `collapsedRail=true` does NOT interfere with the mobile overlay
 *     (mobile rules override the rail's `grid-template-columns: 72px 1fr`).
 *   - no-nav: `sections=[]` → no aside, no drawer logic; the header still
 *     compacts to `auto 1fr auto` so the brand/right zones don't choke.
 */
export function ScenarioAppShellTopMobile() {
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-top-mobile">
      <K.AppShell
        headerLayout="top"
        sections={sections}
        header={{
          left: ({ collapsed, toggle }) => (
            <button
              type="button"
              data-testid="trigger"
              aria-label={collapsed ? 'Abrir menú' : 'Cerrar menú'}
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
        <div style={{ padding: 16 }} data-testid="content">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 200, marginBottom: 12, border: '1px dashed var(--border-default)', borderRadius: 12 }} />
          ))}
        </div>
      </K.AppShell>
    </div>
  );
}

/* 7b — brand variant: mobile drawer over a fully-themed shell. Sidebar tint
   is `--color-primary`; the new white-α `border-right-color` rule must fire
   so the right edge separator stays visible against the dark surface. */
export function ScenarioAppShellTopMobileBrand() {
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-top-mobile-brand">
      <K.AppShell
        headerLayout="top"
        theme="brand"
        sections={sections}
        header={{
          left: ({ toggle }) => (
            <button
              type="button"
              data-testid="trigger"
              onClick={toggle}
              style={{
                width: 40, height: 40, borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.24)', background: 'transparent',
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
        <div style={{ padding: 16 }}>contenido</div>
      </K.AppShell>
    </div>
  );
}

/* 7c — collapsedRail variant: mobile rules must override the 72px rail
   (`grid-template-columns: 72px 1fr` on desktop) and put the aside as a
   fixed overlay anyway. */
export function ScenarioAppShellTopMobileRail() {
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-top-mobile-rail">
      <K.AppShell
        headerLayout="top"
        collapsedRail
        sections={sections}
        header={{
          left: ({ toggle }) => (
            <button
              type="button"
              data-testid="trigger"
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
        }}
      >
        <div style={{ padding: 16 }}>contenido</div>
      </K.AppShell>
    </div>
  );
}

/* 7e — Desktop hide-mode collapsed (no rail). The aside goes
   `position: absolute` and slides off-screen; before v1.31's grid-column fix,
   the <main> would auto-place into the freed col 1 (0 width) and only its
   own padding kept it visible — a 48px-wide strip with a phantom scrollbar
   at the body's right edge. The visible bug: a thin vertical line where the
   main's right edge should be at the viewport edge. */
export function ScenarioAppShellTopHideCollapsed() {
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-top-hide-collapsed">
      <K.AppShell
        headerLayout="top"
        defaultCollapsed
        sections={sections}
        header={{
          left: ({ toggle }) => (
            <button
              type="button"
              data-testid="trigger"
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
        <div style={{ padding: 24 }} data-testid="content">contenido a full width</div>
      </K.AppShell>
    </div>
  );
}

/* 7d — top-bar-only variant: no `sections` means no aside, no drawer logic.
   The mobile header rules (`grid-template-columns: auto 1fr auto`) must
   still fire so a long center brand doesn't choke against the right zone
   in 375px. */
export function ScenarioAppShellTopMobileNoNav() {
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-top-mobile-nonav">
      <K.AppShell
        headerLayout="top"
        header={{
          left: <strong style={{ fontSize: 14 }}>Cobros</strong>,
          right: <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>Mesón Khipu</span>,
        }}
      >
        <div style={{ padding: 16 }}>flujo plano sin nav</div>
      </K.AppShell>
    </div>
  );
}

/* 7f — `side` layout in mobile: legacy drawer (slides from left, fixed
   width 280px, scrim covers content). v1.31 closed three gaps: (1) the
   chevron at the drawer foot used to toggle `collapsed` → drawer stayed
   open at 280px but labels stripped (a UX dead-end). Now in mobile-open
   the chevron closes the drawer. (2) No ESC / focus trap / body scroll
   lock. Now via shared hooks. (3) iOS Safari clipped `bottom: 0`. Now
   `100vh` + `100dvh` height. */
export function ScenarioAppShellSideMobile() {
  return (
    <div style={{ height: '100vh' }} data-scenario="appshell-side-mobile">
      <K.AppShell
        theme="brand"
        defaultCollapsed
        brand={<strong style={{ color: 'white' }}>El Alba · v0.1</strong>}
        brandCollapsed={<strong style={{ color: 'white', fontSize: 14 }}>EA</strong>}
        sections={[
          { label: 'Operación', items: [
            { id: 'home', label: 'Inicio', icon: <K.MenuIcon size={18} />, href: '#', active: true },
            { id: 'orders', label: 'Pedidos', icon: <K.MenuIcon size={18} />, href: '#', badge: 12 },
            { id: 'products', label: 'Productos', icon: <K.MenuIcon size={18} />, href: '#' },
            { id: 'dispatch', label: 'Despacho', icon: <K.MenuIcon size={18} />, href: '#' },
          ] },
          { label: 'Administración', items: [
            { id: 'clients', label: 'Clientes', icon: <K.MenuIcon size={18} />, href: '#' },
            { id: 'config', label: 'Configuración', icon: <K.MenuIcon size={18} />, href: '#' },
          ] },
        ]}
        footer={<span className="appshell__foot-text" style={{ color: 'white' }}>Despachos · v0.1</span>}
        topbar={<span>Despacho</span>}
      >
        <div style={{ padding: 16 }} data-testid="content">
          contenido del side mobile
        </div>
      </K.AppShell>
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
