/* global React */
// Reusable kit primitives + foundation showcase pages

const { useState, useEffect, useRef } = React;

// ---------- Section primitive ---------------------------------------------
function Section({ title, desc, children, action }) {
  return (
    <section className="section">
      <div className="section__head">
        <div>
          <h2 className="section__title">{title}</h2>
          {desc && <p className="section__desc">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Subsection({ title, children }) {
  return (
    <div className="subsection">
      {title && <h3 className="subsection__title">{title}</h3>}
      {children}
    </div>
  );
}
function Stage({ children, label, modifier = '', style }) {
  return (
    <div className={`stage ${modifier}`} style={style}>
      {label && <div className="stage__label">{label}</div>}
      {children}
    </div>
  );
}

function PageHeader({ eyebrow, title, lede }) {
  return (
    <header>
      {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
      <h1 className="page-title">{title}</h1>
      {lede && <p className="page-lede">{lede}</p>}
    </header>
  );
}

// ============================================================================
// FOUNDATIONS PAGES
// ============================================================================

function PageColors() {
  const brand = [
    { name: 'Brand Blue', token: '--color-brand-blue', hex: '#002f87', note: 'Pantone 287 C' },
    { name: 'Brand Orange', token: '--color-brand-orange', hex: '#ff671d', note: 'Pantone 165 C' },
  ];
  const blueScale = [900,800,700,600,500,400,300,200,100,50];
  const orangeScale = [900,800,700,600,500,400,300,200,100,50];
  const neutrals = [
    { v: 'ink', hex: '#0c1220' },
    { v: 'gray-900', hex: '#161c2c' },
    { v: 'gray-800', hex: '#23293a' },
    { v: 'gray-700', hex: '#3a4052' },
    { v: 'gray-600', hex: '#5b6173' },
    { v: 'gray-500', hex: '#7e8495' },
    { v: 'gray-400', hex: '#a6acbb' },
    { v: 'gray-300', hex: '#c9cdd7' },
    { v: 'gray-200', hex: '#e3e6ec' },
    { v: 'gray-150', hex: '#eceef3' },
    { v: 'gray-100', hex: '#f4f5f8' },
    { v: 'gray-50', hex: '#fafbfc' },
    { v: 'white', hex: '#ffffff' },
  ];
  const semantic = [
    { name: 'Success', token: '--color-success', hex: '#2f9e44' },
    { name: 'Warning', token: '--color-warning', hex: '#f59f00' },
    { name: 'Danger', token: '--color-danger', hex: '#d1462f' },
    { name: 'Info', token: '--color-info', hex: '#1a73c2' },
  ];

  const Swatch = ({ hex, name, sub, big }) => (
    <div className="col" style={{ gap: 6, minWidth: big ? 200 : 120 }}>
      <div style={{
        background: hex, height: big ? 120 : 64,
        borderRadius: 8, border: '1px solid var(--border-default)'
      }}/>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{hex}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{sub}</div>}
    </div>
  );

  return (
    <div data-screen-label="Colors">
      <PageHeader eyebrow="Foundations" title="Colors"
        lede="Dos colores de marca al 100%, neutrales fríos y un set semántico. Distribución 70% blanco · 20% azul · 10% naranja. El naranja es siempre acento, nunca campo." />

      <Section title="Brand">
        <Stage>
          <div className="row row--lg" style={{ alignItems: 'flex-start' }}>
            {brand.map(c => <Swatch key={c.token} hex={c.hex} name={c.name} sub={`${c.token} · ${c.note}`} big/>)}
          </div>
        </Stage>
      </Section>

      <Section title="Blue scale">
        <Stage>
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            {blueScale.map(s => (
              <Swatch key={s}
                hex={getComputedStyle(document.documentElement).getPropertyValue(`--color-blue-${s}`).trim() || '#002f87'}
                name={`blue-${s}`} sub={s === 700 ? 'brand' : ''}/>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Orange scale">
        <Stage>
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            {orangeScale.map(s => (
              <Swatch key={s}
                hex={getComputedStyle(document.documentElement).getPropertyValue(`--color-orange-${s}`).trim() || '#ff671d'}
                name={`orange-${s}`} sub={s === 600 ? 'brand' : ''}/>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Neutrals">
        <Stage>
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            {neutrals.map(c => <Swatch key={c.v} hex={c.hex} name={c.v} sub={c.hex}/>)}
          </div>
        </Stage>
      </Section>

      <Section title="Semantic">
        <Stage>
          <div className="row row--lg">
            {semantic.map(c => <Swatch key={c.token} hex={c.hex} name={c.name} sub={c.token}/>)}
          </div>
        </Stage>
      </Section>

      <Section title="Semantic tokens" desc="Úsalos en componentes; la marca puede recolorearse cambiando solo los tokens.">
        <Stage>
          <div className="kv">
            <div className="kv__k">--bg-canvas</div><div className="kv__v">white — fondo principal</div>
            <div className="kv__k">--bg-subtle</div><div className="kv__v">gray-100 — bandas, inputs</div>
            <div className="kv__k">--bg-inverse</div><div className="kv__v">brand-blue — secciones inversas</div>
            <div className="kv__k">--fg-default</div><div className="kv__v">ink — texto principal</div>
            <div className="kv__k">--fg-muted</div><div className="kv__v">gray-600 — texto secundario</div>
            <div className="kv__k">--accent-primary</div><div className="kv__v">brand-blue</div>
            <div className="kv__k">--accent-secondary</div><div className="kv__v">brand-orange — CTAs, focus</div>
            <div className="kv__k">--border-default</div><div className="kv__v">gray-200</div>
            <div className="kv__k">--border-focus</div><div className="kv__v">brand-orange — outlines de foco</div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

function PageType() {
  return (
    <div data-screen-label="Typography">
      <PageHeader eyebrow="Foundations" title="Typography"
        lede="Integral CF (display, mayúsculas) + Metropolis (body). Nunca un tercer display. Integral CF nunca por debajo de 18px." />

      <Section title="Display — Integral CF Bold">
        <Stage>
          <div className="col gap-6">
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>H1 / Display · 68 px / 700 / uppercase</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 68, textTransform: 'uppercase', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                Patio constructor
              </div>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>H2 · 40 px</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, textTransform: 'uppercase', lineHeight: 1.1 }}>
                Cemento, fierro, herramientas
              </div>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>H3 · 24 px</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, textTransform: 'uppercase' }}>
                Categorías destacadas
              </div>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Eyebrow · 14 px tracked +80</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-secondary)' }}>
                Promociones del mes
              </div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Body — Metropolis">
        <Stage>
          <div className="col gap-6">
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>H4 · 20 px / 700</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20 }}>
                Cotiza tu obra. Respuesta en 24 horas.
              </div>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Body lg · 18 px</div>
              <p style={{ fontSize: 18, maxWidth: 640, margin: 0, lineHeight: 1.6 }}>
                Vendemos materiales de construcción y herramientas para maestros, contratistas y obras particulares. Retira en patio o despacha a tu obra.
              </p>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Body · 16 px</div>
              <p style={{ fontSize: 16, maxWidth: 640, margin: 0, lineHeight: 1.6 }}>
                Texto base para descripciones, párrafos largos y contenido editorial. Color por defecto <code className="mono">ink</code>; secundario <code className="mono">gray-600</code>.
              </p>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Caption · 12 px</div>
              <p style={{ fontSize: 12, color: 'var(--fg-subtle)', letterSpacing: '0.04em', margin: 0 }}>
                IVA INCLUIDO · DESPACHO NO INCLUIDO EN EL PRECIO
              </p>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Type scale">
        <Stage>
          <div className="kv">
            <div className="kv__k">--text-xs</div><div className="kv__v">12 px · captions</div>
            <div className="kv__k">--text-sm</div><div className="kv__v">14 px · labels, ui</div>
            <div className="kv__k">--text-md</div><div className="kv__v">16 px · body base</div>
            <div className="kv__k">--text-lg</div><div className="kv__v">18 px · lede</div>
            <div className="kv__k">--text-xl</div><div className="kv__v">20 px · h4</div>
            <div className="kv__k">--text-2xl</div><div className="kv__v">24 px · h3</div>
            <div className="kv__k">--text-3xl</div><div className="kv__v">30 px</div>
            <div className="kv__k">--text-4xl</div><div className="kv__v">40 px · h2</div>
            <div className="kv__k">--text-5xl</div><div className="kv__v">52 px · page title</div>
            <div className="kv__k">--text-6xl</div><div className="kv__v">68 px · h1 / display</div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

function PageSpacing() {
  const spaces = [0,1,2,3,4,5,6,8,10,12,16,20,24];
  const px = { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64, 20:80, 24:96 };
  const radii = [
    { name: 'none', val: 0 }, { name: 'sm', val: 4 }, { name: 'md', val: 8 },
    { name: 'lg', val: 12 }, { name: 'xl', val: 18 }, { name: 'pill', val: 999 },
  ];
  const shadows = ['xs','sm','md','lg','brand'];
  return (
    <div data-screen-label="Spacing">
      <PageHeader eyebrow="Foundations" title="Spacing, radii & shadows"
        lede="Sistema 4-pt. Inputs/buttons 8px, cards 12px, pills 999px. Sombras suaves neutras; --shadow-brand solo para CTAs hero." />

      <Section title="Spacing scale">
        <Stage>
          <div className="col gap-4">
            {spaces.map(s => (
              <div key={s} className="row gap-4" style={{ alignItems: 'center' }}>
                <div style={{ width: 90, fontFamily: 'var(--font-mono)', fontSize: 12 }}>--space-{s}</div>
                <div style={{ width: 50, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-subtle)' }}>{px[s]}px</div>
                <div style={{ height: 16, width: px[s] || 1, background: 'var(--color-brand-blue)' }}/>
              </div>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Radii">
        <Stage>
          <div className="row row--lg">
            {radii.map(r => (
              <div key={r.name} className="col" style={{ alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 90, height: 90,
                  background: 'var(--color-blue-100)',
                  border: '1px solid var(--color-blue-200)',
                  borderRadius: r.val
                }}/>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                <div className="code-chip">{r.val}px</div>
              </div>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Shadows">
        <Stage>
          <div className="row" style={{ gap: 28, flexWrap: 'wrap' }}>
            {shadows.map(s => (
              <div key={s} className="col" style={{ alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 120, height: 120,
                  background: 'var(--bg-surface)',
                  borderRadius: 12,
                  boxShadow: `var(--shadow-${s})`,
                  border: '1px solid var(--border-default)',
                }}/>
                <div className="code-chip">--shadow-{s}</div>
              </div>
            ))}
          </div>
        </Stage>
      </Section>
    </div>
  );
}

function PageIconography() {
  const all = Object.keys(I);
  return (
    <div data-screen-label="Iconography">
      <PageHeader eyebrow="Foundations" title="Iconography"
        lede="Lucide-style line icons, peso 2px a 24px. Tamaños 16/20/24/32/48. Color hereda de currentColor. Cero emoji en producto." />

      <Section title={`Icon set (${all.length})`}>
        <Stage>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
            gap: 8
          }}>
            {all.map(k => {
              const C = I[k];
              return (
                <div key={k} className="col" style={{
                  alignItems: 'center', gap: 8,
                  padding: 16,
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  background: 'var(--bg-surface)',
                }}>
                  <C size={24}/>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{k}</div>
                </div>
              );
            })}
          </div>
        </Stage>
      </Section>

      <Section title="Sizes">
        <Stage>
          <div className="row row--lg" style={{ alignItems: 'center' }}>
            {[16, 20, 24, 32, 48].map(s => (
              <div key={s} className="col" style={{ alignItems: 'center', gap: 6 }}>
                <I.Hammer size={s}/>
                <div className="code-chip">{s}px</div>
              </div>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Coloring (currentColor)">
        <Stage>
          <div className="row" style={{ gap: 24 }}>
            <div style={{ color: 'var(--fg-default)' }}><I.Truck size={28}/></div>
            <div style={{ color: 'var(--color-brand-blue)' }}><I.Truck size={28}/></div>
            <div style={{ color: 'var(--color-brand-orange)' }}><I.Truck size={28}/></div>
            <div style={{ color: 'var(--color-success)' }}><I.Truck size={28}/></div>
            <div style={{ color: 'var(--color-danger)' }}><I.Truck size={28}/></div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

function PageLogo() {
  return (
    <div data-screen-label="Logo">
      <PageHeader eyebrow="Foundations" title="Logo"
        lede="Lockup principal en claro. Versión inversa cuando se coloca sobre azul de marca. Espacio de protección = altura de la 'A' en todas direcciones." />

      <Section title="Variantes">
        <div className="row row--lg" style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
          <Stage style={{ flex: '1 1 280px', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="assets/logo-primary-light.png" alt="logo light" style={{ maxHeight: 140, maxWidth: '80%' }}/>
            <div className="stage__label">Primary · light</div>
          </Stage>
          <Stage modifier="stage--inverse" style={{ flex: '1 1 280px', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="assets/logo-primary-dark.png" alt="logo dark" style={{ maxHeight: 140, maxWidth: '80%' }}/>
            <div className="stage__label" style={{ color: 'rgba(255,255,255,0.7)' }}>Primary · dark</div>
          </Stage>
          <Stage style={{ flex: '0 1 200px', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="assets/mark-lightbg.svg?v=2" alt="mark" style={{ maxHeight: 100 }}/>
            <div className="stage__label">Mark</div>
          </Stage>
        </div>
      </Section>

      <Section title="Reglas" desc="No deformar, no recolorear, no sombrear, no rotar.">
        <Stage>
          <div className="row" style={{ gap: 32, flexWrap: 'wrap' }}>
            <div className="col gap-2">
              <div className="badge badge--success"><I.Check size={12}/> Sí</div>
              <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>Solid plate detrás del logo cuando va sobre foto.</div>
            </div>
            <div className="col gap-2">
              <div className="badge badge--success"><I.Check size={12}/> Sí</div>
              <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>Mínimo 120px de ancho para lockup completo.</div>
            </div>
            <div className="col gap-2">
              <div className="badge badge--danger"><I.X size={12}/> No</div>
              <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>Skews, gradientes, sombras o reordenar las palabras.</div>
            </div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

window.KitFoundations = { PageColors, PageType, PageSpacing, PageIconography, PageLogo };
window.KitPrimitives = { Section, Subsection, Stage, PageHeader };
