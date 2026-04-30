/* global React */
const { useState } = React;
const { Section, Stage, PageHeader } = window.KitPrimitives;
const { Btn } = window.KitButtons;

// Template helpers
function Frame({ children, label }) {
  return (
    <div className="template-frame">
      <div className="template-frame__chrome">{label}</div>
      <div className="template-frame__body">{children}</div>
    </div>
  );
}

// ============================================================================
// TEMPLATE: ADMIN DASHBOARD
// ============================================================================
function TemplateDashboard() {
  return (
    <Frame label="https://admin.elalba.cl/dashboard">
      <div style={{ display: 'flex', minHeight: 600 }}>
        {/* sidebar */}
        <div className="tpl-sb">
          <div className="tpl-sb__brand">
            <img src="assets/mark-lightbg.svg?v=2" alt=""/>
            <div className="tpl-sb__title">Admin</div>
          </div>
          <div className="tpl-sb__nav">
            <div className="tpl-sb__group">General</div>
            <a className="tpl-sb__link active"><I.Dashboard size={16}/> Dashboard</a>
            <a className="tpl-sb__link"><I.Receipt size={16}/> Pedidos</a>
            <a className="tpl-sb__link"><I.Package size={16}/> Inventario</a>
            <a className="tpl-sb__link"><I.Truck size={16}/> Despachos</a>
            <div className="tpl-sb__group">Comercial</div>
            <a className="tpl-sb__link"><I.Users size={16}/> Clientes</a>
            <a className="tpl-sb__link"><I.Tag size={16}/> Promociones</a>
            <a className="tpl-sb__link"><I.Building size={16}/> Sucursales</a>
            <div className="tpl-sb__group">Sistema</div>
            <a className="tpl-sb__link"><I.Settings size={16}/> Configuración</a>
          </div>
        </div>

        {/* content */}
        <div style={{ flex: 1, background: 'var(--bg-subtle)', padding: 24, overflow: 'auto' }}>
          {/* topbar */}
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="caption">Lunes, 27 de abril</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', margin: '4px 0 0' }}>Dashboard</h2>
            </div>
            <div className="row gap-2">
              <Btn variant="subtle" size="sm" icon={I.Calendar}>Abr 2026</Btn>
              <Btn variant="subtle" size="sm" asIcon><I.Bell size={16}/></Btn>
              <div className="avatar avatar--sm" style={{ background: 'var(--color-brand-orange)', color: 'white' }}>VC</div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { l: 'Ventas hoy', v: '$8.42M', d: '+12%', up: true },
              { l: 'Pedidos', v: '142', d: '+8', up: true },
              { l: 'Tickets prom', v: '$59.300', d: '+4%', up: true },
              { l: 'Stock crítico', v: '23', d: '5 nuevos', up: false },
            ].map((k, i) => (
              <div key={i} className="kpi-card" style={{ padding: '14px 16px' }}>
                <div className="kpi-card__label">{k.l}</div>
                <div className="kpi-card__value" style={{ fontSize: 28 }}>{k.v}</div>
                <span className={`kpi-card__trend ${k.up ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
                  {k.up ? <I.TrendUp size={12}/> : <I.TrendDown size={12}/>} {k.d}
                </span>
              </div>
            ))}
          </div>

          {/* charts row */}
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="card">
              <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="card__title">Ventas — últimos 12 meses</h4>
                <div className="tabs tabs--pill" style={{ padding: 2 }}>
                  <button className="tab active" style={{ padding: '4px 10px', fontSize: 11 }}>Mes</button>
                  <button className="tab" style={{ padding: '4px 10px', fontSize: 11 }}>Trim</button>
                  <button className="tab" style={{ padding: '4px 10px', fontSize: 11 }}>Año</button>
                </div>
              </div>
              <div className="card__body">
                <svg viewBox="0 0 480 160" width="100%" height="160">
                  {(() => {
                    const data = [42, 56, 51, 68, 72, 58, 84, 92, 78, 95, 110, 124];
                    const max = Math.max(...data), min = 30;
                    const sx = i => 16 + i * (448/11);
                    const sy = v => 144 - ((v-min)/(max-min)) * 128;
                    const path = data.map((v, i) => `${i ? 'L' : 'M'}${sx(i)},${sy(v)}`).join(' ');
                    return (<>
                      <path d={`${path} L${sx(11)},144 L${sx(0)},144 Z`} fill="var(--color-brand-blue)" opacity="0.08"/>
                      <path d={path} fill="none" stroke="var(--color-brand-blue)" strokeWidth="2.5" strokeLinejoin="round"/>
                      {data.map((v, i) => <circle key={i} cx={sx(i)} cy={sy(v)} r="3" fill="var(--color-brand-blue)"/>)}
                    </>);
                  })()}
                </svg>
              </div>
            </div>
            <div className="card">
              <div className="card__header"><h4 className="card__title">Mix de canales</h4></div>
              <div className="card__body" style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                {(() => {
                  const r = 50, c = 2*Math.PI*r;
                  return (
                    <svg viewBox="0 0 140 140" width="140" height="140">
                      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth="14"/>
                      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-brand-blue)" strokeWidth="14" strokeDasharray={c} strokeDashoffset={c*0.4} transform="rotate(-90 70 70)"/>
                      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-brand-orange)" strokeWidth="14" strokeDasharray={c} strokeDashoffset={c*0.7} transform="rotate(-90 70 70)" style={{ mixBlendMode: 'multiply' }}/>
                      <text x="70" y="70" textAnchor="middle" dy="-2" fontFamily="Integral CF" fontWeight="700" fontSize="20" fill="var(--fg-default)">60%</text>
                      <text x="70" y="70" textAnchor="middle" dy="14" fontSize="9" fill="var(--fg-muted)" letterSpacing="1">PATIO</text>
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* recent orders table */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="card__title">Pedidos recientes</h4>
              <Btn variant="link" size="sm">Ver todos →</Btn>
            </div>
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Pedido</th><th>Cliente</th><th>Sucursal</th><th>Fecha</th><th className="table__num">Total</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['#12489', 'Constructora Andes Sur', 'Maipú', '27/04 09:14', 418500, 'En preparación', 'badge--warning'],
                  ['#12488', 'Juan Pérez', 'La Florida', '27/04 08:42', 28990, 'Listo retiro', 'badge--primary'],
                  ['#12487', 'Maestranza López', 'Maipú', '27/04 08:11', 152340, 'Despachado', 'badge--success'],
                  ['#12486', 'Obras Magdalena', 'Quilicura', '26/04 17:55', 87200, 'Entregado', 'badge--success'],
                  ['#12485', 'Renato Aguilar', 'Maipú', '26/04 16:30', 12450, 'Cancelado', 'badge--danger'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td><code className="mono">{r[0]}</code></td>
                    <td style={{ fontWeight: 700 }}>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                    <td className="table__num">${r[4].toLocaleString('es-CL')}</td>
                    <td><span className={`badge ${r[6]}`}>{r[5]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// TEMPLATE: LOGIN
// ============================================================================
function TemplateLogin() {
  return (
    <Frame label="https://app.elalba.cl/login">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 560 }}>
        <div style={{ background: 'var(--color-brand-blue)', color: 'white', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          {/* blueprint pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.06 }}/>
          <div style={{ position: 'relative' }}>
            <img src="assets/logo-primary-dark.png" style={{ height: 48 }}/>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="page-eyebrow" style={{ color: 'var(--color-brand-orange)' }}>Patio constructor</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 44, textTransform: 'uppercase', margin: '8px 0 16px', lineHeight: 1.05 }}>
              Tu obra, despachada a tiempo.
            </h2>
            <p style={{ color: 'var(--color-blue-200)', fontSize: 16, margin: 0, maxWidth: 360 }}>
              Cotiza, pide y revisa tu cuenta corriente desde un solo lugar.
            </p>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 24, fontSize: 13, color: 'var(--color-blue-200)' }}>
            <span>+34 sucursales</span>
            <span>·</span>
            <span>Despacho 24-48 h</span>
          </div>
        </div>
        <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', margin: '0 0 8px' }}>Inicia sesión</h2>
            <p style={{ color: 'var(--fg-muted)', fontSize: 14, margin: '0 0 24px' }}>Ingresa con tu correo o RUT.</p>
            <form className="col gap-4" onSubmit={e => e.preventDefault()}>
              <div className="field">
                <label className="field__label">Correo o RUT</label>
                <input className="input" placeholder="tucorreo@dominio.cl"/>
              </div>
              <div className="field">
                <label className="field__label">Contraseña</label>
                <input className="input" type="password" placeholder="········"/>
                <a href="#" style={{ fontSize: 12, alignSelf: 'flex-end' }}>¿Olvidaste tu contraseña?</a>
              </div>
              <label className="check"><input type="checkbox"/><span className="check__box"><I.Check size={12}/></span><span>Mantener sesión iniciada</span></label>
              <Btn variant="primary" size="lg" block>Ingresar</Btn>
              <div className="text-center" style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
                ¿Aún no tienes cuenta? <a href="#">Crear cuenta</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// TEMPLATE: LIST WITH FILTERS
// ============================================================================
function TemplateList() {
  return (
    <Frame label="https://admin.elalba.cl/inventario">
      <div style={{ display: 'flex', minHeight: 560 }}>
        <div style={{ width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-default)', padding: 20 }}>
          <div className="caption" style={{ marginBottom: 12 }}>Filtros</div>
          <div className="col gap-5">
            <div>
              <h4 className="subsection__title">Categoría</h4>
              <div className="col gap-2">
                {['Cemento', 'Fierro', 'Herramientas', 'Pinturas'].map(c => (
                  <label key={c} className="check"><input type="checkbox" defaultChecked={c==='Cemento'}/><span className="check__box"><I.Check size={12}/></span><span>{c}</span></label>
                ))}
              </div>
            </div>
            <div className="divider"/>
            <div>
              <h4 className="subsection__title">Sucursal</h4>
              <select className="select"><option>Todas</option><option>Maipú</option><option>La Florida</option></select>
            </div>
            <div>
              <h4 className="subsection__title">Estado</h4>
              <div className="col gap-2">
                <label className="check"><input type="checkbox" defaultChecked/><span className="check__box"><I.Check size={12}/></span><span>Activo</span></label>
                <label className="check"><input type="checkbox"/><span className="check__box"><I.Check size={12}/></span><span>Stock bajo</span></label>
                <label className="check"><input type="checkbox"/><span className="check__box"><I.Check size={12}/></span><span>Sin stock</span></label>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: 24, background: 'var(--bg-subtle)' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <nav className="breadcrumbs" style={{ marginBottom: 4 }}>
                <a>Admin</a><span className="breadcrumbs__sep">/</span><span className="breadcrumbs__current">Inventario</span>
              </nav>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', margin: 0 }}>Inventario</h2>
            </div>
            <div className="row gap-2">
              <Btn variant="subtle" size="sm" icon={I.Download}>Exportar</Btn>
              <Btn variant="primary" size="sm" icon={I.Plus}>Nuevo producto</Btn>
            </div>
          </div>
          <div className="row gap-2" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
            <div className="chip chip--active">Cemento <I.X size={12}/></div>
            <div className="chip chip--active">Activo <I.X size={12}/></div>
            <div className="chip" style={{ background: 'transparent', borderStyle: 'dashed', cursor: 'pointer' }}>+ Filtro</div>
          </div>
          <div className="table-wrap" style={{ borderRadius: 8 }}>
            <div className="table-toolbar">
              <div className="grow input-group" style={{ maxWidth: 320 }}>
                <span className="input-group__addon"><I.Search size={16}/></span>
                <input className="input" placeholder="Buscar SKU o nombre…"/>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>248 productos</div>
            </div>
            <table className="table">
              <thead>
                <tr><th>SKU</th><th>Producto</th><th>Categoría</th><th className="table__num">Stock</th><th className="table__num">Precio</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {[
                  ['CEM-425-50', 'Cemento gris 42,5 kg', 'Cemento', 1240, 8990, 'Activo', 'badge--success'],
                  ['CEM-COL-25', 'Cemento color 25 kg', 'Cemento', 87, 12400, 'Activo', 'badge--success'],
                  ['CEM-RAP-25', 'Cemento rápido 25 kg', 'Cemento', 8, 14990, 'Stock bajo', 'badge--warning'],
                  ['CEM-BLA-25', 'Cemento blanco 25 kg', 'Cemento', 0, 19990, 'Sin stock', 'badge--danger'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td><code className="mono">{r[0]}</code></td>
                    <td style={{ fontWeight: 700 }}>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td className="table__num">{r[3]}</td>
                    <td className="table__num">${r[4].toLocaleString('es-CL')}</td>
                    <td><span className={`badge ${r[6]}`}>{r[5]}</span></td>
                    <td><button className="btn btn--ghost btn--sm btn--icon"><I.More size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// TEMPLATE: ERROR (404 / 500)
// ============================================================================
function TemplateError() {
  return (
    <Frame label="404 · 500">
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', minHeight: 460 }}>
        {[
          { code: '404', title: 'Página no encontrada', desc: 'La página que buscas no existe o fue movida.', icon: I.Search },
          { code: '500', title: 'Algo salió mal', desc: 'Estamos trabajando en restablecer el servicio. Inténtalo de nuevo en unos minutos.', icon: I.AlertTri },
        ].map(e => (
          <div key={e.code} style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: e.code === '404' ? '1px solid var(--border-default)' : 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 96, color: 'var(--color-brand-blue)', lineHeight: 1, letterSpacing: '-0.02em' }}>{e.code}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, textTransform: 'uppercase', margin: '12px 0 8px' }}>{e.title}</h3>
            <p style={{ color: 'var(--fg-muted)', maxWidth: 320, margin: '0 0 20px' }}>{e.desc}</p>
            <div className="row gap-2">
              <Btn variant="primary" size="sm" icon={I.Home}>Ir al inicio</Btn>
              <Btn variant="ghost" size="sm">Volver atrás</Btn>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ============================================================================
// TEMPLATE: SETTINGS
// ============================================================================
function TemplateSettings() {
  return (
    <Frame label="https://admin.elalba.cl/configuracion">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 520 }}>
        <div style={{ borderRight: '1px solid var(--border-default)', padding: '20px 12px', background: 'var(--bg-surface)' }}>
          <div className="caption" style={{ padding: '0 12px', marginBottom: 8 }}>Configuración</div>
          {[
            { l: 'Cuenta', icon: I.User, active: true },
            { l: 'Sucursales', icon: I.Building },
            { l: 'Métodos de pago', icon: I.CreditCard },
            { l: 'Notificaciones', icon: I.Bell },
            { l: 'Equipo', icon: I.Users },
            { l: 'Integraciones', icon: I.Globe },
          ].map(it => {
            const Ic = it.icon;
            return (
              <a key={it.l} className={`tpl-sb__link ${it.active ? 'active' : ''}`}><Ic size={16}/> {it.l}</a>
            );
          })}
        </div>
        <div style={{ padding: 32, overflow: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', margin: '0 0 8px' }}>Cuenta</h2>
          <p style={{ color: 'var(--fg-muted)', margin: '0 0 24px' }}>Datos de la empresa y preferencias generales.</p>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__header"><h4 className="card__title">Datos de la empresa</h4></div>
            <div className="card__body">
              <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="field"><label className="field__label">Razón social</label><input className="input" defaultValue="Ferretería El Alba SpA"/></div>
                <div className="field"><label className="field__label">RUT</label><input className="input" defaultValue="76.812.345-7"/></div>
                <div className="field"><label className="field__label">Email principal</label><input className="input" defaultValue="contacto@elalba.cl"/></div>
                <div className="field"><label className="field__label">Teléfono</label><input className="input" defaultValue="+56 2 2456 7890"/></div>
              </div>
            </div>
            <div className="card__footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn variant="primary" size="sm">Guardar cambios</Btn>
            </div>
          </div>

          <div className="card">
            <div className="card__header"><h4 className="card__title">Preferencias</h4></div>
            <div className="card__body">
              <div className="col gap-3">
                <label className="switch"><input type="checkbox" defaultChecked/><span className="switch__track"/><span>Mostrar precios con IVA</span></label>
                <label className="switch"><input type="checkbox" defaultChecked/><span className="switch__track"/><span>Notificarme nuevos pedidos por email</span></label>
                <label className="switch"><input type="checkbox"/><span className="switch__track"/><span>Modo de stock estricto</span></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// TEMPLATE: WIZARD (cotización multi-paso)
// ============================================================================
function TemplateWizard() {
  const [step, setStep] = useState(1);
  return (
    <Frame label="https://app.elalba.cl/cotizar">
      <div style={{ padding: 32, background: 'var(--bg-subtle)', minHeight: 520 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="text-center" style={{ marginBottom: 32 }}>
            <div className="page-eyebrow">Cotización express</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', margin: '4px 0 0' }}>Cotiza tu obra en 3 pasos</h2>
          </div>
          <div className="stepper" style={{ marginBottom: 32 }}>
            {['Materiales', 'Despacho', 'Confirmación'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`stepper__item ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  <div className="stepper__circle">{i < step ? <I.Check size={16}/> : i+1}</div>
                  <div className="stepper__label">{s}</div>
                </div>
                {i < 2 && <div className={`stepper__line ${i < step ? 'done' : ''}`}/>}
              </React.Fragment>
            ))}
          </div>
          <div className="card">
            <div className="card__body">
              {step === 0 && (
                <div className="col gap-4">
                  <h4 className="card__title">¿Qué necesitas?</h4>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label className="field__label">Producto</label>
                      <select className="select"><option>Cemento gris 42,5 kg</option><option>Fierro estriado 12 mm</option></select>
                    </div>
                    <div className="field">
                      <label className="field__label">Cantidad</label>
                      <input className="input" type="number" defaultValue="50"/>
                    </div>
                  </div>
                  <Btn variant="outline" icon={I.Plus} size="sm" style={{ alignSelf: 'flex-start' }}>Agregar otro material</Btn>
                </div>
              )}
              {step === 1 && (
                <div className="col gap-4">
                  <h4 className="card__title">¿Dónde lo entregamos?</h4>
                  <div className="col gap-3">
                    <label className="check check--radio"><input type="radio" name="ent" defaultChecked/><span className="check__box"/><span><strong>Retiro en patio</strong> — sin costo</span></label>
                    <label className="check check--radio"><input type="radio" name="ent"/><span className="check__box"/><span><strong>Despacho a obra</strong> — desde $9.990</span></label>
                  </div>
                  <div className="field" style={{ maxWidth: 400 }}>
                    <label className="field__label">Comuna</label>
                    <select className="select"><option>Maipú</option><option>La Florida</option><option>Quilicura</option></select>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="col gap-4">
                  <h4 className="card__title">Listo. Revisa tu cotización.</h4>
                  <div className="kv">
                    <div className="kv__k">Productos</div><div className="kv__v">50 sacos cemento gris 42,5 kg</div>
                    <div className="kv__k">Subtotal</div><div className="kv__v">$449.500</div>
                    <div className="kv__k">Despacho</div><div className="kv__v">Retiro en patio · sin costo</div>
                    <div className="kv__k" style={{ fontSize: 16 }}>Total</div><div className="kv__v" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand-blue)' }}>$449.500</div>
                  </div>
                  <div className="alert alert--info">
                    <I.Info size={18} className="alert__icon"/>
                    <div className="alert__body">Cotización válida por 7 días corridos.</div>
                  </div>
                </div>
              )}
            </div>
            <div className="card__footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(s => s-1)}><I.ChevronLeft size={14}/> Anterior</Btn>
              {step < 2
                ? <Btn variant="primary" onClick={() => setStep(s => s+1)}>Continuar <I.ChevronRight size={14}/></Btn>
                : <Btn variant="primary" icon={I.Check}>Enviar cotización</Btn>}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function PageTemplates() {
  const [active, setActive] = useState('dashboard');
  const items = [
    { id: 'dashboard', l: 'Dashboard admin', C: TemplateDashboard },
    { id: 'list', l: 'Listado con filtros', C: TemplateList },
    { id: 'login', l: 'Login / signup', C: TemplateLogin },
    { id: 'wizard', l: 'Wizard cotización', C: TemplateWizard },
    { id: 'settings', l: 'Settings', C: TemplateSettings },
    { id: 'error', l: 'Errores 404 / 500', C: TemplateError },
  ];
  const Active = items.find(i => i.id === active).C;
  return (
    <div data-screen-label="Templates">
      <PageHeader eyebrow="Patterns" title="Templates de pantallas"
        lede="Pantallas completas armadas con los componentes del kit. Cópialas como punto de partida para cada flujo." />
      <div className="row gap-2" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
        {items.map(it => (
          <button key={it.id} className={`chip ${active === it.id ? 'chip--active' : ''}`} onClick={() => setActive(it.id)}>{it.l}</button>
        ))}
      </div>
      <Active/>
    </div>
  );
}

window.KitTemplates = { PageTemplates };
