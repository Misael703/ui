/* global React */
const { useState, useEffect, useRef } = React;
const { Section, Subsection, Stage, PageHeader } = window.KitPrimitives;
const { Btn } = window.KitButtons;

// ============================================================================
// FEEDBACK (alerts, toasts, banners, empty states, loading)
// ============================================================================
function PageFeedback() {
  const [toasts, setToasts] = useState([]);
  const fire = (kind, title, msg) => {
    const id = Math.random();
    setToasts(t => [...t, { id, kind, title, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  return (
    <div data-screen-label="Feedback">
      <PageHeader eyebrow="Components" title="Feedback"
        lede="Alerts, banners, toasts, badges/chips, estados vacíos y skeletons de carga." />

      <Section title="Alerts">
        <Stage>
          <div className="col gap-3">
            <div className="alert alert--info">
              <I.Info size={20} className="alert__icon"/>
              <div className="alert__body">
                <div className="alert__title">Despacho gratis sobre $80.000</div>
                <div>Aplica a sucursales en RM. Revisa el horario de cada zona.</div>
              </div>
              <button className="alert__close"><I.X size={16}/></button>
            </div>
            <div className="alert alert--success">
              <I.CheckCircle size={20} className="alert__icon"/>
              <div className="alert__body">
                <div className="alert__title">Pedido #12489 confirmado</div>
                <div>Te enviamos los detalles a tu correo.</div>
              </div>
            </div>
            <div className="alert alert--warning">
              <I.AlertTri size={20} className="alert__icon"/>
              <div className="alert__body">
                <div className="alert__title">Stock bajo</div>
                <div>Te quedan menos de 10 unidades de Cemento gris 42,5 kg.</div>
              </div>
            </div>
            <div className="alert alert--danger">
              <I.XCircle size={20} className="alert__icon"/>
              <div className="alert__body">
                <div className="alert__title">No pudimos procesar tu pago</div>
                <div>Verifica el método de pago e inténtalo de nuevo.</div>
              </div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Toasts (transitorios)">
        <Stage>
          <div className="row gap-2">
            <Btn variant="subtle" size="sm" onClick={() => fire('default', 'Guardado', 'Cambios aplicados.')}>Default</Btn>
            <Btn variant="success" size="sm" onClick={() => fire('success', 'Pedido enviado', 'Despacho mañana 09–13h.')}>Success</Btn>
            <Btn variant="danger" size="sm" onClick={() => fire('danger', 'Sin conexión', 'Reintentando…')}>Error</Btn>
          </div>
          <div className="caption" style={{ marginTop: 8 }}>Click en los botones para disparar toasts en la esquina inferior derecha.</div>
        </Stage>
        <div className="toast-stack">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast--${t.kind}`}>
              <span className="toast__icon">
                {t.kind === 'success' ? <I.CheckCircle size={18}/> :
                 t.kind === 'danger' ? <I.XCircle size={18}/> :
                 <I.Info size={18}/>}
              </span>
              <div className="alert__body">
                <div className="toast__title">{t.title}</div>
                <div>{t.msg}</div>
              </div>
              <button className="alert__close" onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}><I.X size={14}/></button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Badges & chips">
        <Stage>
          <div className="col gap-4">
            <div className="row">
              <span className="badge">Default</span>
              <span className="badge badge--primary"><span className="badge__dot"/>Activo</span>
              <span className="badge badge--accent">Promo</span>
              <span className="badge badge--success">Stock OK</span>
              <span className="badge badge--warning">Stock bajo</span>
              <span className="badge badge--danger">Sin stock</span>
              <span className="badge badge--solid">Cuenta corriente</span>
              <span className="badge badge--solid-orange">Liquidación</span>
            </div>
            <div className="row">
              <div className="chip chip--active">Cemento <span className="chip__close"><I.X size={12}/></span></div>
              <div className="chip">Fierro</div>
              <div className="chip">Herramientas</div>
              <div className="chip">Pinturas</div>
              <div className="chip" style={{ background: 'transparent', borderStyle: 'dashed' }}>+ Agregar filtro</div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Empty states" desc="Variantes para ausencia de datos, errores y permisos.">
        <Stage modifier="stage--subtle">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="empty">
              <div className="empty__icon"><I.Cart size={24}/></div>
              <div className="empty__title">Tu carro está vacío</div>
              <div className="empty__desc">Agrega productos del catálogo para empezar tu pedido.</div>
              <Btn variant="primary" size="sm">Ir al catálogo</Btn>
            </div>
            <div className="empty">
              <div className="empty__icon"><I.Search size={24}/></div>
              <div className="empty__title">Sin resultados</div>
              <div className="empty__desc">No encontramos coincidencias para "torno cnc". Prueba con otros términos.</div>
              <Btn variant="ghost" size="sm">Limpiar filtros</Btn>
            </div>
            <div className="empty">
              <div className="empty__icon"><I.Receipt size={24}/></div>
              <div className="empty__title">Sin pedidos aún</div>
              <div className="empty__desc">Cuando hagas tu primer pedido, aparecerá acá.</div>
            </div>
            <div className="empty">
              <div className="empty__icon" style={{ color: 'var(--color-danger)' }}><I.WifiOff size={24}/></div>
              <div className="empty__title">Sin conexión</div>
              <div className="empty__desc">Revisa tu conexión a internet e intenta de nuevo.</div>
              <Btn variant="primary" size="sm">Reintentar</Btn>
            </div>
            <div className="empty">
              <div className="empty__icon" style={{ color: 'var(--color-warning)' }}><I.AlertTri size={24}/></div>
              <div className="empty__title">Algo salió mal</div>
              <div className="empty__desc">Hubo un error al cargar los datos. El equipo fue notificado.</div>
              <Btn variant="outline" size="sm">Recargar página</Btn>
            </div>
            <div className="empty">
              <div className="empty__icon"><I.Lock size={24}/></div>
              <div className="empty__title">Sin permisos</div>
              <div className="empty__desc">Necesitas rol de Bodeguero para ver esta sección.</div>
              <Btn variant="ghost" size="sm">Solicitar acceso</Btn>
            </div>
            <div className="empty">
              <div className="empty__icon" style={{ color: 'var(--color-success)' }}><I.CheckCircle size={24}/></div>
              <div className="empty__title">Todo al día</div>
              <div className="empty__desc">No hay tareas pendientes. ¡Buen trabajo!</div>
            </div>
            <div className="empty">
              <div className="empty__icon"><I.Filter size={24}/></div>
              <div className="empty__title">Aplica filtros</div>
              <div className="empty__desc">Selecciona al menos una categoría para ver productos.</div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Loading — skeletons & spinners">
        <Stage>
          <div className="col gap-6">
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Spinners</div>
              <div className="row gap-4" style={{ alignItems: 'center' }}>
                <span className="spinner"/>
                <span className="spinner spinner--lg"/>
                <Btn variant="primary" size="md" disabled><span className="spinner spinner--inverse"/> Procesando…</Btn>
              </div>
            </div>

            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Card grid skeleton</div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[0,1,2].map(i => (
                  <div key={i} className="card">
                    <div className="skel" style={{ height: 140, borderRadius: 0 }}/>
                    <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="skel" style={{ height: 14, width: '60%' }}/>
                      <div className="skel" style={{ height: 12, width: '90%' }}/>
                      <div className="skel" style={{ height: 24, width: '40%' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="caption" style={{ marginBottom: 8 }}>List rows skeleton</div>
              <div className="card" style={{ padding: 0 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ padding: 16, borderBottom: i < 3 ? '1px solid var(--border-default)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="skel" style={{ width: 40, height: 40, borderRadius: 999 }}/>
                    <div style={{ flex: 1 }}>
                      <div className="skel" style={{ height: 12, width: `${50 + Math.random()*30}%`, marginBottom: 6 }}/>
                      <div className="skel" style={{ height: 10, width: `${30 + Math.random()*30}%` }}/>
                    </div>
                    <div className="skel" style={{ width: 60, height: 24 }}/>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Table skeleton</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th><th>SKU</th><th>Stock</th><th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0,1,2,3,4].map(i => (
                      <tr key={i}>
                        <td><div className="skel" style={{ height: 12, width: '70%' }}/></td>
                        <td><div className="skel" style={{ height: 12, width: '60%' }}/></td>
                        <td><div className="skel" style={{ height: 12, width: '40%' }}/></td>
                        <td><div className="skel" style={{ height: 12, width: '50%' }}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="caption" style={{ marginBottom: 8 }}>Progress</div>
              <div className="col gap-3" style={{ maxWidth: 480 }}>
                <div className="progress"><div className="progress__bar" style={{ width: '72%' }}/></div>
                <div className="progress"><div className="progress__bar progress__bar--orange" style={{ width: '40%' }}/></div>
                <div className="progress"><div className="progress__bar progress__bar--success" style={{ width: '100%' }}/></div>
              </div>
            </div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

// ============================================================================
// OVERLAYS
// ============================================================================
function PageOverlays() {
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [popover, setPopover] = useState(false);
  const popRef = useRef(null);
  useEffect(() => {
    const off = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) setPopover(false);
    };
    if (popover) document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [popover]);

  return (
    <div data-screen-label="Overlays">
      <PageHeader eyebrow="Components" title="Overlays"
        lede="Modal, drawer, popover, tooltip y menú contextual. Backdrops oscurecidos, sin glassmorphism." />

      <Section title="Triggers">
        <Stage>
          <div className="row row--lg">
            <Btn variant="primary" onClick={() => setModal(true)}>Abrir modal</Btn>
            <Btn variant="secondary" onClick={() => setDrawer(true)}>Abrir drawer</Btn>
            <div className="tooltip-wrap">
              <Btn variant="outline">Hover por tooltip</Btn>
              <span className="tooltip">Tooltip simple</span>
            </div>
            <div ref={popRef} style={{ position: 'relative' }}>
              <Btn variant="outline" onClick={() => setPopover(p => !p)} iconRight={I.Chevron}>Acciones</Btn>
              {popover && (
                <div className="popover" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 30 }}>
                  <button className="menu-item"><I.Edit size={16}/> Editar</button>
                  <button className="menu-item"><I.Download size={16}/> Descargar</button>
                  <button className="menu-item"><I.Save size={16}/> Duplicar</button>
                  <div className="menu-divider"/>
                  <button className="menu-item menu-item--danger"><I.Trash size={16}/> Eliminar</button>
                </div>
              )}
            </div>
          </div>
        </Stage>
      </Section>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__head">
              <h3 className="modal__title">Confirmar pedido</h3>
              <button className="modal__close" onClick={() => setModal(false)}><I.X size={18}/></button>
            </div>
            <div className="modal__body">
              <p style={{ margin: '0 0 12px' }}>Estás a punto de enviar el pedido <strong>#12489</strong> a la sucursal Maipú.</p>
              <div className="kv">
                <div className="kv__k">Productos</div><div className="kv__v">12 ítems</div>
                <div className="kv__k">Subtotal</div><div className="kv__v">$418.500</div>
                <div className="kv__k">Despacho</div><div className="kv__v">$0 — retiro en patio</div>
                <div className="kv__k">Total</div><div className="kv__v" style={{ fontWeight: 700 }}>$418.500</div>
              </div>
            </div>
            <div className="modal__foot">
              <Btn variant="ghost" onClick={() => setModal(false)}>Revisar</Btn>
              <Btn variant="primary" icon={I.Check} onClick={() => setModal(false)}>Confirmar</Btn>
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="drawer-backdrop" onClick={() => setDrawer(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer__head">
              <h3 className="modal__title">Filtros</h3>
              <button className="modal__close" onClick={() => setDrawer(false)}><I.X size={18}/></button>
            </div>
            <div className="drawer__body">
              <div className="col gap-6">
                <div>
                  <h4 className="subsection__title">Categoría</h4>
                  <div className="col gap-2">
                    {['Cemento', 'Fierro', 'Herramientas', 'Pinturas', 'Madera'].map(c => (
                      <label key={c} className="check">
                        <input type="checkbox"/>
                        <span className="check__box"><I.Check size={12}/></span>
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="divider"/>
                <div>
                  <h4 className="subsection__title">Disponibilidad</h4>
                  <div className="col gap-2">
                    <label className="check"><input type="checkbox"/><span className="check__box"><I.Check size={12}/></span><span>En stock</span></label>
                    <label className="check"><input type="checkbox"/><span className="check__box"><I.Check size={12}/></span><span>Promoción</span></label>
                  </div>
                </div>
              </div>
            </div>
            <div className="drawer__foot">
              <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                <Btn variant="ghost" onClick={() => setDrawer(false)}>Limpiar</Btn>
                <Btn variant="primary" onClick={() => setDrawer(false)}>Aplicar</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DATA DISPLAY (avatars, lists, kv, accordion)
// ============================================================================
function PageDataDisplay() {
  const [open, setOpen] = useState(0);
  const items = [
    { q: '¿Cómo funciona el despacho a obra?', a: 'Coordinamos despacho directo a obra dentro de 24-48 h en RM. Sobre $80.000 es gratis; bajo ese monto, el costo depende de la zona.' },
    { q: '¿Aceptan cuenta corriente?', a: 'Sí, para clientes contratistas con línea de crédito aprobada. Solicítala en cualquier sucursal o desde el portal B2B.' },
    { q: '¿Puedo retirar en sucursal?', a: 'Sí, todos los pedidos pueden retirarse en patio sin costo. Te avisamos por SMS cuando esté listo.' },
  ];
  return (
    <div data-screen-label="DataDisplay">
      <PageHeader eyebrow="Components" title="Data display"
        lede="Avatares, listas, key-value, accordion. Tipografía estricta y bordes neutros." />

      <Section title="Avatares">
        <Stage>
          <div className="col gap-4">
            <div className="row" style={{ alignItems: 'center' }}>
              <div className="avatar avatar--xs">JP</div>
              <div className="avatar avatar--sm">MC</div>
              <div className="avatar">RA</div>
              <div className="avatar avatar--lg" style={{ background: 'var(--color-orange-100)', color: 'var(--color-brand-orange)' }}>EL</div>
              <div className="avatar avatar--xl" style={{ background: 'var(--color-brand-blue)', color: 'white' }}>VS</div>
            </div>
            <div className="row gap-4" style={{ alignItems: 'center' }}>
              <div className="avatar-stack">
                <div className="avatar avatar--sm">JP</div>
                <div className="avatar avatar--sm" style={{ background: 'var(--color-orange-100)', color: 'var(--color-brand-orange)' }}>MC</div>
                <div className="avatar avatar--sm">RA</div>
                <div className="avatar avatar--sm" style={{ background: 'var(--color-brand-blue)', color: 'white' }}>+4</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>7 vendedores asignados</div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="List group">
        <Stage modifier="stage--subtle">
          <div className="list-group" style={{ maxWidth: 520 }}>
            {[
              { name: 'Cemento gris 42,5 kg', sub: '12 unidades · $107.880', icon: I.Package },
              { name: 'Fierro estriado 12mm', sub: '8 unidades · $99.600', icon: I.Ruler },
              { name: 'Set 5 brocas SDS+', sub: '1 unidad · $14.900', icon: I.Drill },
            ].map((it, i) => (
              <div key={i} className="list-group__item">
                <div className="avatar" style={{ background: 'var(--color-blue-100)' }}><it.icon size={18}/></div>
                <div className="grow" style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{it.sub}</div>
                </div>
                <button className="btn btn--ghost btn--sm btn--icon"><I.More size={16}/></button>
              </div>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Key-value">
        <Stage>
          <div className="kv" style={{ maxWidth: 520 }}>
            <div className="kv__k">Razón social</div><div className="kv__v">Constructora Andes Sur SpA</div>
            <div className="kv__k">RUT</div><div className="kv__v">76.812.345-7</div>
            <div className="kv__k">Sucursal preferente</div><div className="kv__v">Maipú · Av. Pajaritos 4520</div>
            <div className="kv__k">Vendedor asignado</div><div className="kv__v">Marcela Contreras</div>
            <div className="kv__k">Cupo crédito</div><div className="kv__v">$2.500.000 — $1.870.000 disponibles</div>
            <div className="kv__k">Estado</div><div className="kv__v"><span className="badge badge--success">Activo</span></div>
          </div>
        </Stage>
      </Section>

      <Section title="Accordion">
        <Stage>
          <div className="accordion" style={{ maxWidth: 720 }}>
            {items.map((it, i) => (
              <div key={i} className={`accordion__item ${open === i ? 'open' : ''}`}>
                <button className="accordion__head" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{it.q}</span>
                  <I.Chevron size={18} className="accordion__chevron"/>
                </button>
                <div className="accordion__body">{it.a}</div>
              </div>
            ))}
          </div>
        </Stage>
      </Section>
    </div>
  );
}

window.KitC = { PageFeedback, PageOverlays, PageDataDisplay };
