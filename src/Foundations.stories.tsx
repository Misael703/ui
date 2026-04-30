import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations',
  parameters: { layout: 'padded' },
};
export default meta;

// =============================================================================
// Helpers
// =============================================================================

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '32px 0 16px' }}>
    {children}
  </h2>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-muted)', margin: '20px 0 8px' }}>
    {children}
  </h3>
);

const Caption = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
    {children}
  </code>
);

// =============================================================================
// Color swatches
// =============================================================================

interface SwatchProps {
  token: string;
  hex?: string;
  invert?: boolean;
}

function Swatch({ token, hex, invert }: SwatchProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = React.useState(hex ?? '');
  React.useEffect(() => {
    if (!hex && ref.current) {
      const v = getComputedStyle(ref.current).backgroundColor;
      setResolved(rgbToHex(v));
    }
  }, [hex]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <div
        ref={ref}
        style={{
          background: `var(--${token})`,
          borderRadius: 8,
          height: 56,
          border: '1px solid var(--border-default)',
          color: invert ? 'var(--color-white)' : 'var(--fg-default)',
          padding: 8,
          display: 'flex',
          alignItems: 'flex-end',
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {resolved}
      </div>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        --{token}
      </div>
    </div>
  );
}

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return rgb;
  const [r, g, b] = m.map(Number);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

const Scale = ({ name, base = 600 }: { name: string; base?: number }) => {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return (
    <div>
      <SubTitle>{name}</SubTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
        {steps.map((s) => (
          <Swatch key={s} token={`color-${name.toLowerCase()}-${s}`} invert={s >= 500} />
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// Stories
// =============================================================================

export const Colors: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Brand</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 480 }}>
        <Swatch token="color-brand-blue" invert />
        <Swatch token="color-brand-orange" invert />
      </div>

      <SectionTitle>Escalas brand</SectionTitle>
      <Scale name="Blue" />
      <Scale name="Orange" />

      <SectionTitle>Status</SectionTitle>
      <Scale name="Green" />
      <Scale name="Yellow" />
      <Scale name="Red" />
      <Scale name="Info" />

      <SectionTitle>Neutrales</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 8 }}>
        {[50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
          <Swatch key={s} token={`color-gray-${s}`} invert={s >= 500} />
        ))}
      </div>

      <SectionTitle>Semánticos (background)</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 720 }}>
        <Swatch token="bg-canvas" />
        <Swatch token="bg-surface" />
        <Swatch token="bg-subtle" />
        <Swatch token="bg-muted" />
      </div>

      <SectionTitle>Semánticos (foreground / texto)</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 720 }}>
        <Swatch token="fg-default" invert />
        <Swatch token="fg-muted" invert />
        <Swatch token="fg-subtle" invert />
        <Swatch token="fg-on-brand" />
      </div>

      <SectionTitle>Bordes</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 720 }}>
        <Swatch token="border-default" />
        <Swatch token="border-strong" />
        <Swatch token="border-brand" invert />
        <Swatch token="border-focus" invert />
      </div>
    </div>
  ),
};

// =============================================================================
// Typography
// =============================================================================

export const Typography: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Fuentes</SectionTitle>
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <Caption>--font-display · Integral CF</Caption>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginTop: 4 }}>FERRETERÍA EL ALBA 0123</div>
        </div>
        <div>
          <Caption>--font-body · Metropolis</Caption>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, marginTop: 4 }}>The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <Caption>--font-mono · ui-monospace stack</Caption>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, marginTop: 4 }}>const total = price * quantity;</div>
        </div>
      </div>

      <SectionTitle>Roles tipográficos</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><Caption>.h1</Caption><div className="h1">Heading 1 · Display</div></div>
        <div><Caption>.h2</Caption><div className="h2">Heading 2 · Section</div></div>
        <div><Caption>.h3</Caption><div className="h3">Heading 3 · Subsection</div></div>
        <div><Caption>.h4</Caption><div className="h4">Heading 4 · Card title</div></div>
        <div><Caption>.eyebrow</Caption><div className="eyebrow">Eyebrow / overline</div></div>
        <div><Caption>.body-lg</Caption><div className="body-lg">Body large — para hero descriptions y leads.</div></div>
        <div><Caption>.body</Caption><div className="body">Body normal — el texto por defecto del kit.</div></div>
        <div><Caption>.body-sm</Caption><div className="body-sm">Body small — texto secundario, hints, metadata.</div></div>
        <div><Caption>.label</Caption><div className="label">Label · uppercase</div></div>
        <div><Caption>.caption</Caption><div className="caption">Caption — leyendas, footnotes, metadatos pequeños.</div></div>
        <div><Caption>code / .mono</Caption><div><code>const x = 42;</code></div></div>
      </div>

      <SectionTitle>Escala de tamaños</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'baseline' }}>
        {[
          ['xs', '12px'], ['sm', '14px'], ['md', '16px'], ['lg', '18px'],
          ['xl', '20px'], ['2xl', '24px'], ['3xl', '30px'], ['4xl', '40px'],
          ['5xl', '52px'], ['6xl', '68px'], ['7xl', '88px'],
        ].map(([key, px]) => (
          <React.Fragment key={key}>
            <Caption>--text-{key} · {px}</Caption>
            <div style={{ fontSize: `var(--text-${key})`, fontFamily: 'var(--font-body)' }}>Aa Bb Cc 123</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};

// =============================================================================
// Spacing
// =============================================================================

export const Spacing: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Escala (4pt grid)</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((n) => (
          <React.Fragment key={n}>
            <Caption>--space-{n}</Caption>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'var(--color-brand-orange)', height: 16, width: `var(--space-${n})`, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{n * 4}px</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  ),
};

// =============================================================================
// Radii
// =============================================================================

export const Radii: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Border radius</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, maxWidth: 720 }}>
        {['none', 'sm', 'md', 'lg', 'xl', 'pill'].map((r) => (
          <div key={r} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 64, background: 'var(--color-brand-blue)', borderRadius: `var(--radius-${r})` }} />
            <Caption>--radius-{r}</Caption>
          </div>
        ))}
      </div>
    </div>
  ),
};

// =============================================================================
// Shadows
// =============================================================================

export const Shadows: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Elevation</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, maxWidth: 800, padding: 24, background: 'var(--bg-subtle)' }}>
        {['xs', 'sm', 'md', 'lg', 'brand'].map((s) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <div style={{ height: 80, width: '100%', background: 'var(--bg-surface)', borderRadius: 8, boxShadow: `var(--shadow-${s})` }} />
            <Caption>--shadow-{s}</Caption>
          </div>
        ))}
      </div>
    </div>
  ),
};

// =============================================================================
// Motion
// =============================================================================

export const Motion: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Duraciones</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 200px 1fr', gap: 12, alignItems: 'center' }}>
        {[['fast', '120ms'], ['base', '200ms'], ['slow', '320ms']].map(([k, ms]) => (
          <React.Fragment key={k}>
            <Caption>--duration-{k}</Caption>
            <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{ms}</span>
            <div className={`motion-demo motion-demo--${k}`} style={{ height: 8, background: 'var(--color-brand-orange)', borderRadius: 4, width: '40%' }} />
          </React.Fragment>
        ))}
      </div>
      <SectionTitle>Easings</SectionTitle>
      <div style={{ display: 'grid', gap: 8 }}>
        <div><Caption>--ease-standard</Caption> <span style={{ color: 'var(--fg-muted)', fontSize: 12, marginLeft: 8 }}>cubic-bezier(0.2, 0.8, 0.2, 1) — uso general</span></div>
        <div><Caption>--ease-in</Caption> <span style={{ color: 'var(--fg-muted)', fontSize: 12, marginLeft: 8 }}>cubic-bezier(0.4, 0, 1, 1) — entrada</span></div>
        <div><Caption>--ease-out</Caption> <span style={{ color: 'var(--fg-muted)', fontSize: 12, marginLeft: 8 }}>cubic-bezier(0, 0, 0.2, 1) — salida</span></div>
      </div>
    </div>
  ),
};

// =============================================================================
// Logos
// =============================================================================

interface LogoVariant {
  name: string;
  type: 'horizontal' | 'vertical' | 'mark' | 'wordmark';
  bg: 'light' | 'dark';
  format: 'svg' | 'png';
  path: string;
}

// Manifest. Agrega entradas conforme subas archivos a public/assets/logos/.
// Naming convention: <type>-<bg>.<format>
//   type: horizontal | vertical | mark | wordmark
//   bg:   light | dark
//   format: svg | png
//
// Ejemplo: si tienes "logo-vertical-dark.svg", agrega:
//   { name: 'Vertical', type: 'vertical', bg: 'dark', format: 'svg', path: '/assets/logos/logo-vertical-dark.svg' }
const LOGOS: LogoVariant[] = [
  // Horizontal — disponible en SVG (recomendado) y PNG
  { name: 'Horizontal · light · SVG', type: 'horizontal', bg: 'light', format: 'svg', path: '/assets/logos/logo-horizontal-light.svg' },
  { name: 'Horizontal · light · PNG', type: 'horizontal', bg: 'light', format: 'png', path: '/assets/logos/logo-horizontal-light.png' },
  { name: 'Horizontal · dark · SVG',  type: 'horizontal', bg: 'dark',  format: 'svg', path: '/assets/logos/logo-horizontal-dark.svg' },
  { name: 'Horizontal · dark · PNG',  type: 'horizontal', bg: 'dark',  format: 'png', path: '/assets/logos/logo-horizontal-dark.png' },

  // Vertical — solo PNG por ahora
  { name: 'Vertical · light · PNG',   type: 'vertical', bg: 'light', format: 'png', path: '/assets/logos/logo-vertical-light.png' },
  { name: 'Vertical · dark · PNG',    type: 'vertical', bg: 'dark',  format: 'png', path: '/assets/logos/logo-vertical-dark.png' },

  // Mark (isotipo) — disponible en SVG (recomendado) y PNG
  { name: 'Mark · light · SVG',       type: 'mark', bg: 'light', format: 'svg', path: '/assets/logos/mark-light.svg' },
  { name: 'Mark · light · PNG',       type: 'mark', bg: 'light', format: 'png', path: '/assets/logos/mark-light.png' },
  { name: 'Mark · dark · SVG',        type: 'mark', bg: 'dark',  format: 'svg', path: '/assets/logos/mark-dark.svg' },
  { name: 'Mark · dark · PNG',        type: 'mark', bg: 'dark',  format: 'png', path: '/assets/logos/mark-dark.png' },

  // Wordmark (solo texto) — solo PNG por ahora
  { name: 'Wordmark · light · PNG',   type: 'wordmark', bg: 'light', format: 'png', path: '/assets/logos/wordmark-light.png' },
  { name: 'Wordmark · dark · PNG',    type: 'wordmark', bg: 'dark',  format: 'png', path: '/assets/logos/wordmark-dark.png' },
];

export const Logos: StoryObj = {
  render: () => {
    const grouped = LOGOS.reduce<Record<string, LogoVariant[]>>((acc, l) => {
      (acc[l.type] ??= []).push(l);
      return acc;
    }, {});
    return (
      <div>
        <SectionTitle>Logos</SectionTitle>
        <p style={{ color: 'var(--fg-muted)', maxWidth: 640, marginBottom: 24 }}>
          Las variantes <strong>light bg</strong> se diseñaron para fondos claros (logo en colores brand sobre blanco).
          Las <strong>dark bg</strong> tienen el logo invertido para fondos oscuros (azul corporativo, negro, etc).
        </p>
        {Object.entries(grouped).map(([type, list]) => (
          <div key={type}>
            <SubTitle>{type}</SubTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
              {list.map((l) => (
                <div key={l.path} style={{
                  background: l.bg === 'dark' ? 'var(--color-brand-blue)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 160,
                  justifyContent: 'center',
                }}>
                  <img
                    src={l.path}
                    alt={l.name}
                    style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: 12, color: l.bg === 'dark' ? 'var(--color-white)' : 'var(--fg-default)', fontWeight: 700 }}>
                      {l.name}
                    </span>
                    <Caption>{l.path}</Caption>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ background: 'var(--color-yellow-50)', border: '1px solid var(--color-yellow-200)', borderRadius: 8, padding: 16, marginTop: 24 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Para agregar nuevos logos:</strong>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--fg-default)' }}>
            <li>Ponlos en <code>public/assets/logos/</code></li>
            <li>Sigue el naming: <code>{`<type>-<bg>.<format>`}</code> (ej: <code>logo-vertical-dark.svg</code>, <code>wordmark-light.png</code>)</li>
            <li>Agrega una entrada al array <code>LOGOS</code> en <code>src/Foundations.stories.tsx</code></li>
          </ol>
        </div>
      </div>
    );
  },
};
