# Blocks — copy-paste recipes

Recetas de página completas que componen los componentes del kit en
secciones reales. **No se publican en el paquete** (viven en `src/blocks/`,
excluidas del `dist` por la config de `tsup`).

**Cómo usar uno:**

1. Abre el `.tsx` desde `src/blocks/<Block>.tsx`.
2. Copia el archivo a tu app (por ejemplo `app/(routes)/orders/page.tsx`).
3. Reemplaza el import `from '../index'` por `from '@misael703/ui'`.
4. Adapta data, columnas, handlers y copy a tu dominio.

Son **puntos de partida**, no componentes configurables: una vez copiado, el
código es tuyo. Tienen los patrones visuales más recientes del kit (v1.15.0)
pero cuando bumpeás la versión del paquete, los blocks ya copiados **no se
actualizan solos** — es a propósito.

Stories renderizadas: `npm run storybook` → carpeta **Blocks/** en el sidebar.

---

## Índice

### Shell / layout

- [Admin dashboard](#admin-dashboard) — AppShell `headerLayout="top"` + PageHeader + KPIs + tabla

### Auth

- [Auth screen (centered)](#auth-screen) — card centered simple
- [Auth split](#auth-split) — form izquierda + brand panel derecha

### Listas y detalle

- [Data table page](#data-table-page) — filtros + tabla con toolbar + bulk + paginación
- [Detail page](#detail-page) — vista de 1 entidad con tabs + meta sidebar

### Configuración

- [Settings page](#settings-page) — sidebar de secciones + form area

### Estados

- [Empty state page](#empty-state-page) — colección sin datos
- [Error page](#error-page) — algo falló
- [Not found](#not-found) — 404

### Utility

- [Onboarding checklist](#onboarding-checklist) — activation pattern
- [Notifications page](#notifications-page) — inbox con filtros
- [Wizard page](#wizard-page) — multi-step form
- [Audit log page](#audit-log-page) — registro con DiffViewer

### Commerce

- [Product catalog](#product-catalog) — grid de ProductCards con filtros
- [Cart drawer](#cart-drawer) — carrito en side drawer
- [Invoice document](#invoice-document) — factura print-friendly
- [Checkout](#checkout) — address + order summary + promo + envío

### Domain-specific

- [Kanban board](#kanban-board) — columnas por estado (sin DnD)
- [Schedule week](#schedule-week) — grid 7 días × N horas

---

## Admin dashboard

Dashboard con AppShell variante `headerLayout="top"` (v1.15.0): header
full-width arriba con tres slots (`header.{left, center, right}`), centro
real del viewport vía `1fr·auto·1fr`. El sidebar colapsa sin afectar el
header. Con `theme="brand"`, ambos paneles tintan con `--color-primary`
separados por una hairline.

**Source:** [`src/blocks/AdminDashboard.tsx`](../src/blocks/AdminDashboard.tsx)
**Story:** Storybook → Blocks → Admin dashboard

```tsx
import { AppShell, PageHeader, Kpi, Logo, Avatar, Button, DataTable, Badge } from '@misael703/ui';
import { MenuIcon, Bell } from '@misael703/ui';

<AppShell
  headerLayout="top"
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  sections={sections}
  header={{
    left:   <button onClick={() => setCollapsed(c => !c)}><MenuIcon size={20} /></button>,
    center: <Logo variant="horizontal" bg="light" height={28} />,
    right:  <><button><Bell size={18} /></button><Avatar name="…" /></>,
  }}
>
  <PageHeader title="Resumen del día" actions={<Button>Nuevo pedido</Button>} />
  {/* KPIs + DataTable de pedidos recientes */}
</AppShell>
```

---

## Auth screen

Card centered simple — adecuada para apps internas con login básico.

**Source:** [`src/blocks/AuthScreen.tsx`](../src/blocks/AuthScreen.tsx)
**Story:** Storybook → Blocks → Auth screen

```tsx
import { Card, CardBody, FormField, Input, Button, Logo } from '@misael703/ui';

<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
  <Card style={{ maxWidth: 380 }}>
    <CardBody>
      <Logo variant="horizontal" bg="light" height={36} />
      <h1 className="h3">Inicia sesión</h1>
      <form onSubmit={submit}>
        <FormField label="Correo"><Input type="email" /></FormField>
        <FormField label="Contraseña"><Input type="password" /></FormField>
        <Button type="submit" fullWidth>Entrar</Button>
      </form>
    </CardBody>
  </Card>
</div>
```

---

## Auth split

Split-screen: form a la izquierda + brand panel con logo watermark a la
derecha. El panel derecho se oculta bajo 768px. Aprovecha el `--color-primary`
del preset activo.

**Source:** [`src/blocks/AuthSplit.tsx`](../src/blocks/AuthSplit.tsx)
**Story:** Storybook → Blocks → Auth split

```tsx
<div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
  <div style={{ background: 'var(--bg-surface)' }}>{/* form */}</div>
  <div className="auth-split__brand" style={{ background: 'var(--color-primary)' }}>
    <Logo variant="mark" bg="dark" height={220} />
  </div>
</div>
```

---

## Data table page

Filtros a la izquierda + DataTable con `toolbar` slot embebido. El `toolbar`
prop hace que la tabla viva en una sola superficie redondeada (`.table-surface`)
sin seam entre toolbar y tabla. Cells usan `.cell-mono` para SKUs/precios y
`.cell-meta` para línea secundaria (categoría, RUT).

**Source:** [`src/blocks/DataTablePage.tsx`](../src/blocks/DataTablePage.tsx)
**Story:** Storybook → Blocks → Data table page

```tsx
<DataTable
  rows={visible}
  selectable
  toolbar={
    <TableToolbar>
      <Input placeholder="Buscar…" />
      <SortDropdown />
      {sel.size > 0 && <BulkActionBar selectedCount={sel.size}><Button>Eliminar</Button></BulkActionBar>}
    </TableToolbar>
  }
  columns={[
    { key: 'name', header: 'Producto', accessor: (r) => (
      <><span>{r.name}</span><span className="cell-meta">{r.category}</span></>
    ) },
    { key: 'sku', header: 'SKU', accessor: (r) => <span className="cell-mono cell-meta">{r.sku}</span> },
  ]}
/>
```

---

## Detail page

Vista de 1 entidad. PageHeader con breadcrumbs + status Badge + acciones,
Tabs (`Información / Historial / Relacionados`), y layout 2-col con meta
sidebar sticky.

**Source:** [`src/blocks/DetailPage.tsx`](../src/blocks/DetailPage.tsx)
**Story:** Storybook → Blocks → Detail page

```tsx
<PageHeader
  title={<>Pedido <span className="cell-mono">#{id}</span></>}
  breadcrumbs={[{ label: 'Pedidos', href: '/orders' }, { label: `#${id}` }]}
  meta={<Badge variant="success">Despachado</Badge>}
  actions={<><Button variant="outline">Imprimir</Button><Button>Editar</Button></>}
/>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
  <Tabs value={tab} onChange={setTab}>
    <TabList><Tab value="info">Información</Tab>{/* … */}</TabList>
    <TabPanel value="info">{/* items */}</TabPanel>
  </Tabs>
  <aside style={{ position: 'sticky', top: 24 }}>
    <Card><KeyValue><KeyValueRow label="Cliente">{cliente}</KeyValueRow></KeyValue></Card>
  </aside>
</div>
```

---

## Settings page

Sidebar vertical de secciones + form area que cambia con la sección activa.
En tu app, ruteá cada sección a su propia URL y leé la activa del router.

**Source:** [`src/blocks/SettingsPage.tsx`](../src/blocks/SettingsPage.tsx)
**Story:** Storybook → Blocks → Settings page

```tsx
<PageHeader title="Configuración" />
<div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
  <nav>{/* SECTIONS.map(s => <button onClick={() => setActive(s.id)}>{s.label}</button>) */}</nav>
  <Card><CardBody>
    {active === 'cuenta' && <CuentaSection />}
  </CardBody></Card>
</div>
```

---

## Empty state page

Wrap del componente `EmptyState` en un layout de página con CTA.

**Source:** [`src/blocks/EmptyStatePage.tsx`](../src/blocks/EmptyStatePage.tsx)
**Story:** Storybook → Blocks → Empty state page

```tsx
<EmptyState
  icon={<Package size={40} />}
  title="Aún no hay pedidos"
  description="Cuando un cliente confirme su primer pedido, vas a verlo acá."
  action={<Button>Crear pedido manual</Button>}
/>
```

---

## Error page

Algo falló. Retry CTA + link a soporte. Pasale un `onRetry` para que el botón
re-dispare la query.

**Source:** [`src/blocks/ErrorPage.tsx`](../src/blocks/ErrorPage.tsx)
**Story:** Storybook → Blocks → Error page

```tsx
export function ErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card><CardBody>
      <AlertTriangle size={32} />
      <h1 className="h3">Algo salió mal</h1>
      <p>No pudimos cargar la información.</p>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
    </CardBody></Card>
  );
}
```

---

## Not found

404 con numeral grande en `--color-primary` (se ve branded con el preset) y
dos recoveries: "Volver atrás" y "Ir al inicio".

**Source:** [`src/blocks/NotFound.tsx`](../src/blocks/NotFound.tsx)
**Story:** Storybook → Blocks → Not found

```tsx
<div className="cell-mono" style={{ fontSize: 96, color: 'var(--color-primary)' }}>404</div>
<h1 className="h2">Esta página no existe</h1>
<Button onClick={() => history.back()} variant="outline">Volver atrás</Button>
<Button onClick={() => location.href = '/'}>Ir al inicio</Button>
```

---

## Onboarding checklist

Card con tareas chequeables + Progress + CTA por tarea. El completion state
vive en tu store / API; el recipe lo stubea con `useState` para el demo.

**Source:** [`src/blocks/OnboardingChecklist.tsx`](../src/blocks/OnboardingChecklist.tsx)
**Story:** Storybook → Blocks → Onboarding checklist

```tsx
<Card>
  <CardHeader>
    <h2 className="h3">Configura tu cuenta</h2>
    <Progress value={pct} variant={allDone ? 'green' : 'blue'} />
  </CardHeader>
  <CardBody style={{ padding: 0 }}>
    {TASKS.map(t => (
      <li>
        <span>{isDone ? <Check /> : null}</span>
        <div>{t.title}<div className="cell-meta">{t.description}</div></div>
        {!isDone && <Button size="sm" variant="outline">{t.cta}</Button>}
      </li>
    ))}
  </CardBody>
</Card>
```

---

## Notifications page

Inbox de notificaciones con filtros por tono (info/success/warning/danger)
+ "Marcar todas como leídas". Comparte el shape `NotificationItem` con el
`NotificationCenter` del kit (la bell dropdown), así una sola fuente de
verdad en tu store alimenta ambos.

**Source:** [`src/blocks/NotificationsPage.tsx`](../src/blocks/NotificationsPage.tsx)
**Story:** Storybook → Blocks → Notifications page

```tsx
<PageHeader
  title="Notificaciones"
  description={unread > 0 ? `Tienes ${unread} sin leer` : 'Estás al día'}
  actions={unread > 0 && <Button onClick={markAllRead}>Marcar todas</Button>}
/>
<div style={{ display: 'flex', gap: 8 }}>
  <FilterChip active={filter === 'all'}>Todas</FilterChip>
  <FilterChip active={filter === 'unread'}>Sin leer <Badge>{unread}</Badge></FilterChip>
</div>
{visible.map(n => <NotificationRow item={n} onToggle={toggleRead} />)}
```

---

## Wizard page

Multi-step form. `Stepper` a la izquierda + form area a la derecha + Back/
Next/Finish footer. En tu app, persistí el draft entre pasos (Redux/Zustand/
localStorage) y usá react-hook-form por paso.

**Source:** [`src/blocks/WizardPage.tsx`](../src/blocks/WizardPage.tsx)
**Story:** Storybook → Blocks → Wizard page

```tsx
<PageHeader title="Nueva orden de despacho" description={`Paso ${step + 1} de ${STEPS.length}`} />
<div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
  <Stepper steps={STEPS} current={step} />
  <div>
    <Card><CardBody>{/* render del paso activo */}</CardBody></Card>
    <Button variant="ghost" onClick={back} disabled={step === 0}>Atrás</Button>
    {isLast ? <Button onClick={finish}>Crear</Button> : <Button onClick={next}>Siguiente</Button>}
  </div>
</div>
```

---

## Audit log page

DataTable cronológico de eventos del sistema + `DiffViewer` (en Modal)
cuando hacés click en una edición. Wirea dos piezas del kit que casi nunca
se usan juntas (DiffViewer + Modal) en un patrón concreto de auditing.

**Source:** [`src/blocks/AuditLogPage.tsx`](../src/blocks/AuditLogPage.tsx)
**Story:** Storybook → Blocks → Audit log page

```tsx
<DataTable
  rows={events}
  onRowClick={(r) => r.diff && setOpenEvent(r)}
  columns={[
    { key: 'ts',     accessor: (r) => <span className="cell-mono cell-meta">{r.ts}</span> },
    { key: 'kind',   accessor: (r) => <Badge variant={KIND_BADGE[r.kind].variant}>{KIND_BADGE[r.kind].label}</Badge> },
    { key: 'entity', accessor: (r) => <><span>{r.entity}</span><span className="cell-meta">{r.description}</span></> },
  ]}
/>
<Modal open={openEvent !== null} title={`Cambios en ${openEvent?.entity}`} footer={<Button>Cerrar</Button>}>
  <DiffViewer entries={openEvent?.diff} />
</Modal>
```

---

## Product catalog

E-commerce catalog: FilterPanel + grid responsivo de `ProductCard`s +
toolbar (search + sort).

**Source:** [`src/blocks/ProductCatalog.tsx`](../src/blocks/ProductCatalog.tsx)
**Story:** Storybook → Blocks → Product catalog

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
  <FilterPanel><FilterSection title="Categoría">{/* … */}</FilterSection></FilterPanel>
  <div>
    <Input placeholder="Buscar…" />
    <Select>{/* sort */}</Select>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {visible.map(p => (
        <ProductCard
          sku={p.sku} name={p.name} price={`$${p.price.toLocaleString('es-CL')}`}
          tag={p.isNew && <Badge variant="primary" appearance="solid">Nuevo</Badge>}
          footer={<Button size="sm" fullWidth>Agregar al carrito</Button>}
        />
      ))}
    </div>
  </div>
</div>
```

---

## Cart drawer

Side `Drawer` con line items (qty stepper + remove), subtotal/shipping/total
summary, y CTA Pagar. Pareja natural de `ProductCatalog`.

**Source:** [`src/blocks/CartDrawer.tsx`](../src/blocks/CartDrawer.tsx)
**Story:** Storybook → Blocks → Cart drawer

```tsx
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  side="right"
  title={`Tu carrito (${itemCount})`}
  footer={<><OrderSummary rows={[{label: 'Total', value: `$${total}`, emphasis: true}]} /><Button fullWidth>Pagar</Button></>}
>
  {lines.map(l => (
    <li>
      <div>{l.name} <div className="cell-meta">${l.price} c/u</div></div>
      <NumberInput value={l.qty} onChange={(v) => setQty(l.id, v ?? 1)} min={1} />
      <button onClick={() => remove(l.id)}><Trash /></button>
    </li>
  ))}
</Drawer>
```

---

## Invoice document

Factura print-friendly con header (issuer + meta), customer block, line
items, totales (subtotal + IVA), y footer. El `@media print` strippea el
chrome del app y fuerza tinta negra para PDF/papel limpio.

**Source:** [`src/blocks/InvoiceDocument.tsx`](../src/blocks/InvoiceDocument.tsx)
**Story:** Storybook → Blocks → Invoice document

```tsx
<article className="invoice-block">
  <header>{/* Logo + Issuer + Numero factura */}</header>
  <section>{/* Cliente + Fechas */}</section>
  <table>{/* Líneas: SKU · Desc · Cant · Unit · Subtotal */}</table>
  <section>{/* Subtotal + IVA + Total */}</section>
  <footer>{/* Documento tributario electrónico · Resolución SII */}</footer>
</article>

<style>{`
  @media print {
    body * { visibility: hidden; }
    .invoice-block, .invoice-block * { visibility: visible; }
    .invoice-block__actions { display: none !important; }
  }
`}</style>
```

---

## Checkout

Página de checkout con AddressForm a la izquierda y aside sticky a la derecha
(progreso a envío gratis + OrderSummary + PromoCode + CTA Pagar). El kit no
trae data de país: definí el set de campos por mercado.

**Source:** [`src/blocks/CheckoutSummary.tsx`](../src/blocks/CheckoutSummary.tsx)
**Story:** Storybook → Blocks → Checkout

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
  <AddressForm fields={fields} value={addr} onChange={setAddr} />
  <aside style={{ position: 'sticky', top: 24 }}>
    <FreeShippingProgress current={42000} threshold={50000} />
    <OrderSummary rows={[/* … */]} />
    <PromoCodeInput onApply={validate} />
    <Button fullWidth>Pagar</Button>
  </aside>
</div>
```

---

## Kanban board

Columnas por estado, cards con priority/assignee/due. **Visual-only — sin
drag-and-drop** (deliberado): elegí dnd-kit, react-beautiful-dnd, o HTML5
nativo según tu app. Agregar DnD al recipe te acoplaría a una librería y
forzaría un peer dep en cada consumer.

**Source:** [`src/blocks/KanbanBoard.tsx`](../src/blocks/KanbanBoard.tsx)
**Story:** Storybook → Blocks → Kanban board

```tsx
<div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))`, gap: 16 }}>
  {columns.map(col => (
    <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-lg)', padding: 12 }}>
      <strong>{col.label}</strong> <Badge variant="neutral">{col.cards.length}</Badge>
      {col.cards.map(card => (
        <Card><CardBody>
          <Badge variant={PRIORITY_BADGE[card.priority].variant}>{PRIORITY_BADGE[card.priority].label}</Badge>
          <div>{card.title}</div>
          <Avatar name={card.assignee} size={24} />
          {card.due && <span className="cell-meta cell-mono">📅 {card.due}</span>}
        </CardBody></Card>
      ))}
    </div>
  ))}
</div>
```

---

## Schedule week

Grid 7 días × N horas con event blocks posicionados via CSS Grid
`gridRow: start / end`. Visual-only — click handlers stubeados; agregar
DnD/resize por app.

**Source:** [`src/blocks/ScheduleWeek.tsx`](../src/blocks/ScheduleWeek.tsx)
**Story:** Storybook → Blocks → Schedule week

```tsx
<div style={{ display: 'grid', gridTemplateColumns: `64px repeat(7, 1fr)`, gridTemplateRows: `repeat(${HOURS.length}, ${HOUR_HEIGHT}px)` }}>
  {/* hours column + empty cells + events */}
  {EVENTS.map(e => (
    <button
      style={{
        gridColumn: e.day + 2,
        gridRow: `${e.startHour - HOURS[0] + 1} / ${e.endHour - HOURS[0] + 1}`,
        background: TONE_BG[e.tone],
      }}
    >
      <div>{e.title}</div>
      <div>{e.subtitle}</div>
    </button>
  ))}
</div>
```
