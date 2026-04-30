/* global React */
const { useState, useRef, useEffect } = React;
const { Section, Subsection, Stage, PageHeader } = window.KitPrimitives;

// Reusable Btn primitive
function Btn({ variant = 'primary', size = 'md', icon: IconC, iconRight, children, block, asIcon, ...rest }) {
  const cls = [
    'btn', `btn--${variant}`, `btn--${size}`,
    block && 'btn--block',
    asIcon && 'btn--icon',
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {IconC && <IconC size={size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : 18}/>}
      {children}
      {iconRight && React.createElement(iconRight, { size: 16 })}
    </button>
  );
}

// ============================================================================
// BUTTONS
// ============================================================================
function PageButtons() {
  return (
    <div data-screen-label="Buttons">
      <PageHeader eyebrow="Components" title="Buttons"
        lede="Naranja para acción primaria (CTA principal). Azul para acción secundaria estructural. Outline y ghost para acciones suaves." />

      <Section title="Variantes">
        <Stage>
          <div className="row row--lg">
            <Btn variant="primary" icon={I.Cart}>Agregar al carro</Btn>
            <Btn variant="secondary" icon={I.Truck}>Cotizar despacho</Btn>
            <Btn variant="outline">Ver detalle</Btn>
            <Btn variant="ghost">Cancelar</Btn>
            <Btn variant="subtle" icon={I.Filter}>Filtros</Btn>
            <Btn variant="danger" icon={I.Trash}>Eliminar</Btn>
            <Btn variant="success" icon={I.Check}>Aprobar</Btn>
            <Btn variant="link">Ver más →</Btn>
          </div>
        </Stage>
      </Section>

      <Section title="Tamaños">
        <Stage>
          <div className="row row--lg" style={{ alignItems: 'center' }}>
            <Btn variant="primary" size="xs">XS</Btn>
            <Btn variant="primary" size="sm">Small</Btn>
            <Btn variant="primary" size="md">Medium</Btn>
            <Btn variant="primary" size="lg">Large</Btn>
            <Btn variant="primary" size="xl">Extra large</Btn>
          </div>
        </Stage>
      </Section>

      <Section title="Con ícono · solo ícono · bloque">
        <Stage>
          <div className="col gap-4">
            <div className="row row--lg">
              <Btn variant="primary" icon={I.Plus}>Agregar producto</Btn>
              <Btn variant="outline" iconRight={I.Arrow}>Continuar</Btn>
              <Btn variant="secondary" asIcon size="md"><I.Settings size={18}/></Btn>
              <Btn variant="outline" asIcon size="md"><I.Edit size={18}/></Btn>
              <Btn variant="ghost" asIcon size="md"><I.More size={18}/></Btn>
            </div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px' }}>
                <Btn variant="primary" block icon={I.CreditCard}>Pagar pedido — $124.500</Btn>
              </div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Estados">
        <Stage>
          <div className="row row--lg">
            <Btn variant="primary">Default</Btn>
            <Btn variant="primary" disabled>Disabled</Btn>
            <Btn variant="primary"><span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}/> Cargando…</Btn>
            <Btn variant="outline" disabled>Outline disabled</Btn>
          </div>
        </Stage>
      </Section>

      <Section title="Button group">
        <Stage>
          <div className="row row--lg">
            <div className="btn-group">
              <Btn variant="outline" size="sm">Día</Btn>
              <Btn variant="outline" size="sm">Semana</Btn>
              <Btn variant="outline" size="sm">Mes</Btn>
              <Btn variant="outline" size="sm">Año</Btn>
            </div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

// ============================================================================
// FORM CONTROLS
// ============================================================================
function PageForms() {
  const [val, setVal] = useState({ name: '', email: '', notes: '', cat: 'cemento', tipo: 'patio', acepta: false, news: true });
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div data-screen-label="Forms">
      <PageHeader eyebrow="Components" title="Form controls"
        lede="Inputs, selects, checkboxes, radios, switches y textareas. Estados default, hover, focus, error, disabled y patrones de label/help/error." />

      <Section title="Inputs de texto">
        <Stage>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 720 }}>
            <div className="field">
              <label className="field__label">Nombre <span className="req">*</span></label>
              <input className="input" placeholder="Ej. Juan Pérez" value={val.name} onChange={e => setVal({ ...val, name: e.target.value })}/>
              <div className="field__help">Como aparece en tu RUT.</div>
            </div>
            <div className="field">
              <label className="field__label">Email <span className="opt">(opcional)</span></label>
              <input className="input" type="email" placeholder="tucorreo@dominio.cl" value={val.email} onChange={e => setVal({ ...val, email: e.target.value })}/>
            </div>
            <div className="field field--error">
              <label className="field__label">Teléfono <span className="req">*</span></label>
              <input className="input" placeholder="+56 9 1234 5678" defaultValue="+56 9 12"/>
              <div className="field__error"><I.AlertTri size={12}/> Falta completar el número.</div>
            </div>
            <div className="field">
              <label className="field__label">Disabled</label>
              <input className="input" disabled value="No editable"/>
            </div>
            <div className="field">
              <label className="field__label">Con ícono</label>
              <div className="input-group">
                <span className="input-group__addon"><I.Search size={16}/></span>
                <input className="input" placeholder="Buscar producto, SKU, categoría…"/>
              </div>
            </div>
            <div className="field">
              <label className="field__label">Con addon</label>
              <div className="input-group">
                <span className="input-group__addon">$</span>
                <input className="input" placeholder="0" type="text"/>
                <span className="input-group__addon">CLP</span>
              </div>
            </div>
            <div className="field">
              <label className="field__label">Contraseña</label>
              <div className="input-group">
                <span className="input-group__addon"><I.Lock size={16}/></span>
                <input className="input" type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="········"/>
                <button className="input-group__addon" style={{ cursor: 'pointer', border: 0 }} onClick={() => setShow(!show)}><I.Eye size={16}/></button>
              </div>
            </div>
            <div className="field">
              <label className="field__label">Select</label>
              <select className="select" value={val.cat} onChange={e => setVal({ ...val, cat: e.target.value })}>
                <option value="cemento">Cemento y áridos</option>
                <option value="fierro">Fierro y mallas</option>
                <option value="herramientas">Herramientas eléctricas</option>
                <option value="pinturas">Pinturas y solventes</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="field">
              <label className="field__label">Notas para el despacho</label>
              <textarea className="textarea" placeholder="Llamar al maestro al llegar, portón azul a la izquierda…" value={val.notes} onChange={e => setVal({ ...val, notes: e.target.value })}/>
              <div className="field__help">Máximo 280 caracteres.</div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Checkbox · Radio · Switch">
        <Stage>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 32 }}>
            <div className="col gap-3">
              <h3 className="subsection__title" style={{ margin: 0 }}>Checkbox</h3>
              <label className="check">
                <input type="checkbox" checked={val.acepta} onChange={e => setVal({ ...val, acepta: e.target.checked })}/>
                <span className="check__box"><I.Check size={14}/></span>
                <span>Acepto los términos y condiciones</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={val.news} onChange={e => setVal({ ...val, news: e.target.checked })}/>
                <span className="check__box"><I.Check size={14}/></span>
                <span>Recibir ofertas y novedades</span>
              </label>
              <label className="check">
                <input type="checkbox" disabled/>
                <span className="check__box"><I.Check size={14}/></span>
                <span style={{ color: 'var(--fg-subtle)' }}>Disabled</span>
              </label>
            </div>
            <div className="col gap-3">
              <h3 className="subsection__title" style={{ margin: 0 }}>Radio</h3>
              {[
                { v: 'patio', l: 'Retiro en patio' },
                { v: 'despacho', l: 'Despacho a domicilio' },
                { v: 'obra', l: 'Despacho directo a obra' },
              ].map(o => (
                <label key={o.v} className="check check--radio">
                  <input type="radio" name="tipo" checked={val.tipo === o.v} onChange={() => setVal({ ...val, tipo: o.v })}/>
                  <span className="check__box"/>
                  <span>{o.l}</span>
                </label>
              ))}
            </div>
            <div className="col gap-3">
              <h3 className="subsection__title" style={{ margin: 0 }}>Switch</h3>
              <label className="switch">
                <input type="checkbox" defaultChecked/>
                <span className="switch__track"/>
                <span>Notificaciones por SMS</span>
              </label>
              <label className="switch">
                <input type="checkbox"/>
                <span className="switch__track"/>
                <span>Cuenta corriente activa</span>
              </label>
              <label className="switch">
                <input type="checkbox" disabled/>
                <span className="switch__track"/>
                <span style={{ color: 'var(--fg-subtle)' }}>Disabled</span>
              </label>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Form pattern — alta de cliente" desc="Composición típica con secciones, label/help/error y botones de acción al pie.">
        <Stage>
          <form onSubmit={e => e.preventDefault()} style={{ maxWidth: 720 }}>
            <div className="col gap-6">
              <div>
                <h3 className="subsection__title" style={{ marginBottom: 12 }}>Datos de contacto</h3>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div className="field">
                    <label className="field__label">Razón social <span className="req">*</span></label>
                    <input className="input" placeholder="Constructora..."/>
                  </div>
                  <div className="field">
                    <label className="field__label">RUT <span className="req">*</span></label>
                    <input className="input" placeholder="76.123.456-7"/>
                  </div>
                  <div className="field">
                    <label className="field__label">Sucursal preferente</label>
                    <select className="select"><option>Sucursal Maipú</option><option>Sucursal La Florida</option></select>
                  </div>
                  <div className="field">
                    <label className="field__label">Vendedor asignado</label>
                    <select className="select"><option>Asignar automáticamente</option></select>
                  </div>
                </div>
              </div>
              <div className="divider"/>
              <div>
                <h3 className="subsection__title" style={{ marginBottom: 12 }}>Crédito</h3>
                <label className="switch" style={{ marginBottom: 12 }}>
                  <input type="checkbox"/>
                  <span className="switch__track"/>
                  <span>Habilitar línea de crédito</span>
                </label>
                <div className="field" style={{ maxWidth: 320 }}>
                  <label className="field__label">Cupo aprobado</label>
                  <div className="input-group">
                    <span className="input-group__addon">$</span>
                    <input className="input" placeholder="0" disabled/>
                  </div>
                  <div className="field__help">Habilita el switch para ingresar un cupo.</div>
                </div>
              </div>
              <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                <Btn variant="ghost">Cancelar</Btn>
                <Btn variant="outline">Guardar borrador</Btn>
                <Btn variant="primary" icon={I.Save}>Crear cliente</Btn>
              </div>
            </div>
          </form>
        </Stage>
      </Section>
    </div>
  );
}

window.KitButtons = { PageButtons, Btn };
window.KitForms = { PageForms };
