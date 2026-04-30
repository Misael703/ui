/* global React */
const { useState } = React;
const { Section, Stage, PageHeader } = window.KitPrimitives;
const { Btn } = window.KitButtons;

// ============================================================================
// CHARTS, LAYOUT, DATE/UPLOAD/STEPPER
// ============================================================================

// Tiny inline charts using SVG
function LineChart({ data, color = 'var(--color-brand-blue)', height = 140 }) {
  const w = 480, h = height, p = 16;
  const max = Math.max(...data), min = Math.min(...data);
  const sx = i => p + i * ((w - 2*p) / (data.length - 1));
  const sy = v => h - p - ((v - min) / (max - min || 1)) * (h - 2*p);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${sx(i)},${sy(v)}`).join(' ');
  const area = `${path} L${sx(data.length-1)},${h-p} L${sx(0)},${h-p} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}>
      <path d={area} fill={color} opacity="0.1"/>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((v, i) => <circle key={i} cx={sx(i)} cy={sy(v)} r="3" fill={color}/>)}
    </svg>
  );
}
function BarChart({ data, color = 'var(--color-brand-orange)', height = 140 }) {
  const w = 480, h = height, p = 16;
  const max = Math.max(...data);
  const bw = (w - 2*p) / data.length - 8;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 2*p);
        return <rect key={i} x={p + i * ((w - 2*p) / data.length) + 4} y={h - p - bh} width={bw} height={bh} fill={color} rx="2"/>;
      })}
    </svg>
  );
}
function Donut({ value = 72, label = '', color = 'var(--color-brand-blue)' }) {
  const r = 40, c = 2 * Math.PI * r;
  const off = c - (value/100) * c;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth="10"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 50 50)" strokeLinecap="round"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value}%</div>
        <div style={{ fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function PageCharts() {
  const sales = [42, 56, 51, 68, 72, 58, 84, 92, 78, 95, 110, 124];
  const cats = [840, 620, 480, 320, 210];
  return (
    <div data-screen-label="Charts">
      <PageHeader eyebrow="Components" title="Charts & data viz"
        lede="Líneas, barras y gauges/donuts construidos en SVG inline. Sin librería — fácil de portar a Recharts/Chart.js." />

      <Section title="KPI con sparkline">
        <Stage modifier="stage--subtle">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { l: 'Ventas (12 meses)', v: '$94.2M', d: '+18% YoY', up: true, data: sales },
              { l: 'Pedidos', v: '4.182', d: '+12% MoM', up: true, data: sales.map(x => x*0.7) },
              { l: 'Devoluciones', v: '38', d: '-22% MoM', up: false, data: [12,18,15,14,11,9,8,9,7,6,5,4] },
            ].map((k, i) => (
              <div key={i} className="kpi-card" style={{ gap: 12 }}>
                <div className="kpi-card__label">{k.l}</div>
                <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div className="kpi-card__value">{k.v}</div>
                  <span className={`kpi-card__trend ${k.up ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
                    {k.up ? <I.TrendUp size={14}/> : <I.TrendDown size={14}/>} {k.d}
                  </span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <LineChart data={k.data} height={60} color={k.up ? 'var(--color-brand-blue)' : 'var(--color-danger)'}/>
                </div>
              </div>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Línea & barras">
        <Stage>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div>
              <h4 className="subsection__title">Ventas mensuales</h4>
              <LineChart data={sales}/>
            </div>
            <div>
              <h4 className="subsection__title">Top categorías</h4>
              <BarChart data={cats}/>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Donuts / gauges">
        <Stage>
          <div className="row row--lg" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="col" style={{ alignItems: 'center', gap: 6 }}>
              <Donut value={72} label="Cumplimiento" color="var(--color-brand-blue)"/>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Cumplimiento despacho</div>
            </div>
            <div className="col" style={{ alignItems: 'center', gap: 6 }}>
              <Donut value={45} label="Cupo usado" color="var(--color-brand-orange)"/>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Línea de crédito</div>
            </div>
            <div className="col" style={{ alignItems: 'center', gap: 6 }}>
              <Donut value={92} label="Stock OK" color="var(--color-success)"/>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Salud de inventario</div>
            </div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

// ============================================================================
// LAYOUT, DATEPICKER, UPLOAD, STEPPER, ACCORDION (extra)
// ============================================================================
function PageLayout() {
  return (
    <div data-screen-label="Layout">
      <PageHeader eyebrow="Components" title="Layout"
        lede="Grid 12-col, container, stack, divider, secciones inversas y bandas sutiles." />

      <Section title="Container & grid">
        <Stage>
          <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: 8 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--color-blue-100)', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--color-brand-blue)', fontWeight: 700 }}>{i+1}</div>
              ))}
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Section bands">
        <Stage style={{ padding: 0 }}>
          <div style={{ padding: '32px 24px' }}>
            <div className="caption">Default — white</div>
            <p style={{ margin: '4px 0 0' }}>Texto normal sobre fondo blanco.</p>
          </div>
          <div style={{ padding: '32px 24px', background: 'var(--bg-subtle)' }}>
            <div className="caption">Subtle — gray-100</div>
            <p style={{ margin: '4px 0 0' }}>Para separar secciones sin gritar.</p>
          </div>
          <div style={{ padding: '32px 24px', background: 'var(--color-brand-blue)', color: 'white' }}>
            <div className="caption" style={{ color: 'var(--color-blue-200)' }}>Inverse — brand-blue</div>
            <p style={{ margin: '4px 0 0', color: 'white' }}>Heroes y CTAs principales.</p>
          </div>
        </Stage>
      </Section>

      <Section title="Divider y stack">
        <Stage>
          <div className="col gap-4">
            <div>Texto A</div>
            <div className="divider"/>
            <div>Texto B</div>
            <div className="divider"/>
            <div>Texto C</div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

function PageMisc() {
  const [step, setStep] = useState(2);
  const [date, setDate] = useState(15);
  const [drag, setDrag] = useState(false);
  return (
    <div data-screen-label="Misc">
      <PageHeader eyebrow="Components" title="Date · Upload · Stepper"
        lede="Componentes especializados para flujos transaccionales." />

      <Section title="Date picker">
        <Stage modifier="stage--subtle">
          <div className="datepicker" style={{ margin: '0 auto' }}>
            <div className="datepicker__head">
              <button className="datepicker__nav"><I.ChevronLeft size={16}/></button>
              <div className="datepicker__title">Abril 2026</div>
              <button className="datepicker__nav"><I.ChevronRight size={16}/></button>
            </div>
            <div className="datepicker__grid">
              {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} className="datepicker__dow">{d}</div>)}
              {[null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d, i) => (
                d === null
                  ? <div key={i}/>
                  : <button key={i} className={`datepicker__day ${d === date ? 'selected' : ''} ${d === 27 ? 'today' : ''}`} onClick={() => setDate(d)}>{d}</button>
              ))}
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="File upload">
        <Stage>
          <div
            className={`upload ${drag ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); }}
            style={{ maxWidth: 520, margin: '0 auto' }}>
            <I.Upload size={28}/>
            <div className="upload__title">Arrastra tu archivo aquí</div>
            <div style={{ fontSize: 13 }}>o <a href="#" style={{ color: 'var(--color-brand-blue)' }}>busca en tu equipo</a>. PDF, JPG o PNG · máx 10 MB.</div>
          </div>
        </Stage>
      </Section>

      <Section title="Stepper">
        <Stage>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="stepper">
              {['Carro', 'Datos', 'Despacho', 'Pago'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`stepper__item ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                    <div className="stepper__circle">{i < step ? <I.Check size={16}/> : i+1}</div>
                    <div className="stepper__label">{s}</div>
                  </div>
                  {i < 3 && <div className={`stepper__line ${i < step ? 'done' : ''}`}/>}
                </React.Fragment>
              ))}
            </div>
            <div className="row gap-2" style={{ justifyContent: 'center', marginTop: 24 }}>
              <Btn variant="outline" size="sm" onClick={() => setStep(Math.max(0, step-1))}><I.ChevronLeft size={14}/> Anterior</Btn>
              <Btn variant="primary" size="sm" onClick={() => setStep(Math.min(3, step+1))}>Siguiente <I.ChevronRight size={14}/></Btn>
            </div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

window.KitD = { PageCharts, PageLayout, PageMisc };
