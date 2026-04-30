/* global React */
const { useState, useRef, useEffect } = React;
const { Section, Subsection, Stage, PageHeader } = window.KitPrimitives;
const { Btn } = window.KitButtons;

// ============================================================================
// CARDS
// ============================================================================
function PageCards() {
  return (
    <div data-screen-label="Cards">
      <PageHeader eyebrow="Components" title="Cards"
        lede="Card base, KPI card, info card, product card y category card. Border 1px, radius 12px, shadow-sm." />

      <Section title="Card base">
        <Stage modifier="stage--subtle">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div className="card">
              <div className="card__body">
                <h4 className="card__title">Card simple</h4>
                <p className="card__subtitle">Subtítulo o descripción corta.</p>
              </div>
            </div>
            <div className="card">
              <div className="card__header">
                <h4 className="card__title">Con header</h4>
                <p className="card__subtitle">Tres áreas: header, body, footer.</p>
              </div>
              <div className="card__body" style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
                Cuerpo principal con texto de soporte y datos.
              </div>
              <div className="card__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Btn variant="ghost" size="sm">Cancelar</Btn>
                <Btn variant="primary" size="sm">Aceptar</Btn>
              </div>
            </div>
            <div className="card">
              <div className="card__body">
                <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
                  <div className="avatar avatar--lg" style={{ background: 'var(--color-orange-100)', color: 'var(--color-brand-orange)' }}>JP</div>
                  <div className="col gap-1">
                    <h4 className="card__title">Juan Pérez</h4>
                    <p className="card__subtitle">Maestro · Cliente desde 2021</p>
                    <div className="row gap-2" style={{ marginTop: 6 }}>
                      <span className="badge badge--success">Activo</span>
                      <span className="badge badge--primary">Cuenta corriente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="KPI cards">
        <Stage modifier="stage--subtle">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="kpi-card">
              <div className="kpi-card__label">Ventas hoy</div>
              <div className="kpi-card__value">$8.420.300</div>
              <span className="kpi-card__trend kpi-card__trend--up"><I.TrendUp size={14}/> +12,4% vs. ayer</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__label">Pedidos</div>
              <div className="kpi-card__value">142</div>
              <span className="kpi-card__trend kpi-card__trend--up"><I.TrendUp size={14}/> +8 pedidos</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__label">Stock crítico</div>
              <div className="kpi-card__value" style={{ color: 'var(--color-danger)' }}>23</div>
              <span className="kpi-card__trend kpi-card__trend--down"><I.TrendDown size={14}/> 5 SKUs nuevos</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__label">Despachos en ruta</div>
              <div className="kpi-card__value">17</div>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>3 con retraso &gt;1 h</span>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Product cards">
        <Stage modifier="stage--subtle">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { sku: 'CEM-425-50', name: 'Cemento gris 42,5 kg', price: '$8.990', tag: 'OFERTA' },
              { sku: 'FIE-12-6M', name: 'Fierro estriado 12mm × 6m', price: '$12.450' },
              { sku: 'TAL-VAR-5', name: 'Set 5 brocas SDS+', price: '$14.900', tag: 'NUEVO' },
              { sku: 'PIN-LAT-1G', name: 'Pintura látex blanco 1 gal', price: '$18.700' },
            ].map(p => (
              <article key={p.sku} className="product-card">
                {p.tag && <span className="product-card__tag">{p.tag}</span>}
                <div className="product-card__media">
                  <div className="product-card__placeholder">[ {p.sku} ]</div>
                </div>
                <div className="product-card__body">
                  <div className="product-card__sku">{p.sku}</div>
                  <h4 className="product-card__title">{p.name}</h4>
                  <div className="product-card__price">{p.price}</div>
                </div>
                <div className="product-card__footer">
                  <Btn variant="primary" size="sm" icon={I.Plus}>Agregar</Btn>
                  <button className="btn btn--ghost btn--sm btn--icon" aria-label="ver"><I.Arrow size={16}/></button>
                </div>
              </article>
            ))}
          </div>
        </Stage>
      </Section>

      <Section title="Category cards">
        <Stage>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { name: 'Cemento', icon: I.Package },
              { name: 'Fierro', icon: I.Ruler },
              { name: 'Herramientas', icon: I.Hammer },
              { name: 'Pinturas', icon: I.Drill },
            ].map(c => {
              const C = c.icon;
              return (
                <a key={c.name} href="#" style={{
                  background: 'var(--color-brand-blue)',
                  color: 'white',
                  borderRadius: 12,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 140,
                  borderBottom: 0,
                }}>
                  <C size={32}/>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-blue-200)', marginTop: 4 }}>
                      Ver catálogo →
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </Stage>
      </Section>
    </div>
  );
}

// ============================================================================
// NAVIGATION (tabs, breadcrumbs, pagination, top nav, sidebar)
// ============================================================================
function PageNav() {
  const [tab, setTab] = useState(0);
  const [pill, setPill] = useState(1);
  const [page, setPage] = useState(3);
  return (
    <div data-screen-label="Navigation">
      <PageHeader eyebrow="Components" title="Navigation"
        lede="Top nav, sidebar de admin, breadcrumbs, tabs (línea y píldora) y paginación." />

      <Section title="Top nav (público)">
        <Stage style={{ padding: 0, overflow: 'hidden' }}>
          <nav className="tpl-nav">
            <div className="tpl-nav__brand">
              <img src="assets/mark-darkbg.svg?v=2" alt=""/>
              <div className="tpl-nav__title">El Alba</div>
            </div>
            <div className="tpl-nav__items">
              <a href="#" className="active">Catálogo</a>
              <a href="#">Cotizar</a>
              <a href="#">Cuenta corriente</a>
              <a href="#">Sucursales</a>
            </div>
            <div className="row gap-2">
              <button className="btn btn--ghost btn--sm" style={{ color: 'white' }}><I.Search size={16}/></button>
              <button className="btn btn--primary btn--sm" style={{ position: 'relative' }}>
                <I.Cart size={16}/> Carro
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--bg-surface)', color: 'var(--color-brand-orange)', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 6px' }}>3</span>
              </button>
            </div>
          </nav>
        </Stage>
      </Section>

      <Section title="Sidebar (admin)">
        <Stage style={{ padding: 0 }}>
          <div className="tpl-sb" style={{ height: 360 }}>
            <div className="tpl-sb__brand">
              <img src="assets/mark-lightbg.svg?v=2" alt=""/>
              <div className="tpl-sb__title">Admin</div>
            </div>
            <div className="tpl-sb__nav">
              <div className="tpl-sb__group">General</div>
              <a className="tpl-sb__link active" href="#"><I.Dashboard size={16}/> Dashboard</a>
              <a className="tpl-sb__link" href="#"><I.Receipt size={16}/> Pedidos</a>
              <a className="tpl-sb__link" href="#"><I.Package size={16}/> Inventario</a>
              <div className="tpl-sb__group">Comercial</div>
              <a className="tpl-sb__link" href="#"><I.Users size={16}/> Clientes</a>
              <a className="tpl-sb__link" href="#"><I.Tag size={16}/> Promociones</a>
              <a className="tpl-sb__link" href="#"><I.Building size={16}/> Sucursales</a>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Breadcrumbs">
        <Stage>
          <nav className="breadcrumbs">
            <a href="#">Inicio</a>
            <span className="breadcrumbs__sep">/</span>
            <a href="#">Cemento y áridos</a>
            <span className="breadcrumbs__sep">/</span>
            <a href="#">Cementos</a>
            <span className="breadcrumbs__sep">/</span>
            <span className="breadcrumbs__current">Cemento gris 42,5 kg</span>
          </nav>
        </Stage>
      </Section>

      <Section title="Tabs">
        <Stage>
          <div className="col gap-6">
            <div>
              <div className="tabs">
                {['Detalle', 'Especificaciones', 'Stock por sucursal', 'Reseñas'].map((t, i) => (
                  <button key={t} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
                ))}
              </div>
              <div style={{ padding: 16, fontSize: 14, color: 'var(--fg-muted)' }}>
                Contenido de "{['Detalle', 'Especificaciones', 'Stock por sucursal', 'Reseñas'][tab]}".
              </div>
            </div>
            <div>
              <div className="tabs tabs--pill">
                {['Hoy', 'Semana', 'Mes', 'Año'].map((t, i) => (
                  <button key={t} className={`tab ${pill === i ? 'active' : ''}`} onClick={() => setPill(i)}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </Stage>
      </Section>

      <Section title="Pagination">
        <Stage>
          <div className="pagination">
            <button className="pagination__btn" onClick={() => setPage(Math.max(1, page-1))} disabled={page === 1}><I.ChevronLeft size={14}/></button>
            {[1, 2, 3, '...', 12].map((p, i) => (
              p === '...'
                ? <span key={i} className="pagination__ellipsis">…</span>
                : <button key={i} className={`pagination__btn ${p === page ? 'active' : ''}`} onClick={() => typeof p === 'number' && setPage(p)}>{p}</button>
            ))}
            <button className="pagination__btn" onClick={() => setPage(Math.min(12, page+1))}><I.ChevronRight size={14}/></button>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

// ============================================================================
// TABLES (data table)
// ============================================================================
function PageTables() {
  const [sort, setSort] = useState({ k: 'sku', d: 'asc' });
  const [sel, setSel] = useState(new Set([2]));
  const rows = [
    { id: 1, sku: 'CEM-425-50', name: 'Cemento gris 42,5 kg', stock: 1240, price: 8990, status: 'Activo' },
    { id: 2, sku: 'FIE-12-6M', name: 'Fierro estriado 12mm × 6m', stock: 320, price: 12450, status: 'Activo' },
    { id: 3, sku: 'TAL-VAR-5', name: 'Set 5 brocas SDS+', stock: 18, price: 14900, status: 'Stock bajo' },
    { id: 4, sku: 'PIN-LAT-1G', name: 'Pintura látex blanco 1 gal', stock: 0, price: 18700, status: 'Sin stock' },
    { id: 5, sku: 'MAD-2X4', name: 'Madera pino 2×4 × 3,2m', stock: 540, price: 4290, status: 'Activo' },
  ];
  const sorted = [...rows].sort((a, b) => {
    const r = a[sort.k] > b[sort.k] ? 1 : -1;
    return sort.d === 'asc' ? r : -r;
  });
  const toggleSort = (k) => setSort(s => ({ k, d: s.k === k && s.d === 'asc' ? 'desc' : 'asc' }));
  const toggle = (id) => setSel(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allSelected = sel.size === rows.length;

  return (
    <div data-screen-label="Tables">
      <PageHeader eyebrow="Components" title="Data tables"
        lede="Tabla con sort, selección, búsqueda, filtros y acciones por fila. Toolbar superior, paginación inferior." />

      <Section title="Tabla con toolbar">
        <Stage style={{ padding: 0, background: 'transparent', border: 0 }}>
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="grow input-group" style={{ maxWidth: 320 }}>
                <span className="input-group__addon"><I.Search size={16}/></span>
                <input className="input" placeholder="Buscar por SKU, nombre…"/>
              </div>
              <div className="row gap-2">
                <Btn variant="subtle" size="sm" icon={I.Filter}>Filtros</Btn>
                <Btn variant="subtle" size="sm" icon={I.Download}>Exportar</Btn>
                <Btn variant="primary" size="sm" icon={I.Plus}>Nuevo producto</Btn>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <label className="check">
                      <input type="checkbox" checked={allSelected} onChange={() => setSel(allSelected ? new Set() : new Set(rows.map(r => r.id)))}/>
                      <span className="check__box"><I.Check size={12}/></span>
                    </label>
                  </th>
                  {[
                    { k: 'sku', l: 'SKU' },
                    { k: 'name', l: 'Producto' },
                    { k: 'stock', l: 'Stock', align: 'right' },
                    { k: 'price', l: 'Precio', align: 'right' },
                    { k: 'status', l: 'Estado' },
                  ].map(c => (
                    <th key={c.k}
                        className={`sortable ${sort.k === c.k ? 'sorted' : ''}`}
                        style={{ textAlign: c.align || 'left' }}
                        onClick={() => toggleSort(c.k)}>
                      {c.l}
                      <span className="sort">
                        {sort.k === c.k && sort.d === 'desc' ? <I.Chevron size={12}/> : <I.ChevronUp size={12}/>}
                      </span>
                    </th>
                  ))}
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <tr key={r.id}>
                    <td>
                      <label className="check">
                        <input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)}/>
                        <span className="check__box"><I.Check size={12}/></span>
                      </label>
                    </td>
                    <td><code className="mono">{r.sku}</code></td>
                    <td style={{ fontWeight: 700 }}>{r.name}</td>
                    <td className="table__num">{r.stock.toLocaleString('es-CL')}</td>
                    <td className="table__num">${r.price.toLocaleString('es-CL')}</td>
                    <td>
                      <span className={`badge ${r.status === 'Activo' ? 'badge--success' : r.status === 'Sin stock' ? 'badge--danger' : 'badge--warning'}`}>{r.status}</span>
                    </td>
                    <td><button className="btn btn--ghost btn--sm btn--icon"><I.More size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row" style={{ padding: '12px 16px', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
                {sel.size > 0 ? `${sel.size} seleccionado${sel.size === 1 ? '' : 's'} · ` : ''}Mostrando 1–5 de 248
              </div>
              <div className="pagination">
                <button className="pagination__btn"><I.ChevronLeft size={14}/></button>
                <button className="pagination__btn active">1</button>
                <button className="pagination__btn">2</button>
                <button className="pagination__btn">3</button>
                <span className="pagination__ellipsis">…</span>
                <button className="pagination__btn">50</button>
                <button className="pagination__btn"><I.ChevronRight size={14}/></button>
              </div>
            </div>
          </div>
        </Stage>
      </Section>
    </div>
  );
}

window.KitB = { PageCards, PageNav, PageTables };
