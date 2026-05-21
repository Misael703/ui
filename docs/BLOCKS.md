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
pero cuando bumpeas la versión del paquete, los blocks ya copiados **no se
actualizan solos** — es a propósito.

Stories renderizadas: `npm run storybook` → carpeta **Blocks/** en el sidebar.

---

## Índice

### Shell / layout

- [Admin dashboard (sidebar)](#admin-dashboard) — AppShell + PageHeader + KPIs + tabla
- [AppShell top](#appshell-top) — `headerLayout="top"` con header full-width

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

### Commerce

- [Checkout](#checkout) — address + order summary + promo + envío

---

## Admin dashboard

Sidebar shell clásico (default de AppShell, `headerLayout="side"`).
PageHeader + grid de Kpi + tabla de pedidos recientes. Para la variante con
header full-width, ver [AppShell top](#appshell-top).

**Source:** [`src/blocks/AdminDashboard.tsx`](../src/blocks/AdminDashboard.tsx)
**Story:** Storybook → Blocks → Admin dashboard

```tsx
import {
  AppShell, PageHeader, Kpi, Logo, Avatar, Button, DataTable, Badge,
} from '@misael703/ui';
import { Home, Package, Truck, Users, Settings, ShoppingCart } from '@misael703/ui';

// sections, recent data… ver el archivo

<AppShell
  brand={<Logo variant="horizontal" bg="light" height={32} />}
  brandCollapsed={<Logo variant="mark" bg="light" height={32} />}
  sections={sections}
  topbar={<input className="input" placeholder="Buscar…" />}
  user={<Avatar name="…" size={32} />}
>
  <PageHeader title="Resumen del día" actions={<Button>Nuevo pedido</Button>} />
  {/* KPIs + DataTable de pedidos recientes */}
</AppShell>
```

---

## AppShell top

Showcase del `headerLayout="top"` (v1.15.0). Header full-width arriba con tres
slots (`header.{left, center, right}`), centro lookup en el viewport real
(`1fr·auto·1fr`). El sidebar colapsa sin afectar el header. Con
`theme="brand"`, ambos paneles tintan con `--color-primary` separados por una
hairline.

**Source:** [`src/blocks/AppShellTop.tsx`](../src/blocks/AppShellTop.tsx)
**Story:** Storybook → Blocks → AppShell top

```tsx
import { AppShell, Logo, Avatar } from '@misael703/ui';
import { MenuIcon, Bell } from '@misael703/ui';

<AppShell
  headerLayout="top"
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  sections={sections}
  header={{
    left: <button onClick={() => setCollapsed(c => !c)}><MenuIcon size={20} /></button>,
    center: <Logo variant="horizontal" bg="light" height={28} />,
    right: <><button><Bell size={18} /></button><Avatar name="…" /></>,
  }}
>
  {/* contenido */}
</AppShell>
```

---

## Auth screen

Card centered simple — adecuada para apps internas con login básico.

**Source:** [`src/blocks/AuthScreen.tsx`](../src/blocks/AuthScreen.tsx)
**Story:** Storybook → Blocks → Auth screen

```tsx
import { Card, CardBody, FormField, Input, Button, Logo } from '@misael703/ui';

<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-canvas)' }}>
  <Card style={{ width: '100%', maxWidth: 380 }}>
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
import { FormField, Input, Button, Logo } from '@misael703/ui';

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
import { DataTable, TableToolbar, FilterPanel, BulkActionBar, Input, Button } from '@misael703/ui';

<DataTable
  rows={visible}
  rowKey={(r) => r.id}
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
      <><span>{r.name}</span><span className="cell-meta">{r.categoryLabel}</span></>
    ) },
    { key: 'sku', header: 'SKU', accessor: (r) => <span className="cell-mono cell-meta">{r.sku}</span> },
    /* … */
  ]}
/>
```

---

## Detail page

Vista de 1 entidad (opuesto del DataTablePage). PageHeader con breadcrumbs +
status Badge + acciones, Tabs (`Información / Historial / Relacionados`), y
layout 2-col con meta sidebar sticky.

**Source:** [`src/blocks/DetailPage.tsx`](../src/blocks/DetailPage.tsx)
**Story:** Storybook → Blocks → Detail page

```tsx
import { PageHeader, Tabs, TabList, Tab, TabPanel, Badge, Card, KeyValue, KeyValueRow } from '@misael703/ui';

<PageHeader
  title={<>Pedido <span className="cell-mono">#{id}</span></>}
  breadcrumbs={[{ label: 'Pedidos', href: '/orders' }, { label: `#${id}` }]}
  meta={<Badge variant="success">Despachado</Badge>}
  actions={<><Button variant="outline">Imprimir</Button><Button>Editar</Button></>}
/>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
  <Tabs value={tab} onChange={setTab}>
    <TabList><Tab value="info">Información</Tab>{/* … */}</TabList>
    <TabPanel value="info">{/* items del pedido */}</TabPanel>
  </Tabs>
  <aside style={{ position: 'sticky', top: 24 }}>
    <Card><KeyValue><KeyValueRow label="Cliente">{cliente}</KeyValueRow>{/* … */}</KeyValue></Card>
  </aside>
</div>
```

---

## Settings page

Sidebar vertical de secciones (Cuenta · Notificaciones · Seguridad ·
Facturación) + form area que cambia con la sección activa. En tu app, ruteá
cada sección a su propia URL y leé la activa del router (en vez de
`useState`).

**Source:** [`src/blocks/SettingsPage.tsx`](../src/blocks/SettingsPage.tsx)
**Story:** Storybook → Blocks → Settings page

```tsx
import { PageHeader, Card, CardBody, FormField, Input, Switch, Button } from '@misael703/ui';

<PageHeader title="Configuración" />
<div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
  <nav>{/* SECTIONS.map(s => <button onClick={() => setActive(s.id)}>{s.label}</button>) */}</nav>
  <Card><CardBody>
    {active === 'cuenta' && <CuentaSection />}
    {/* … */}
  </CardBody></Card>
</div>
```

---

## Empty state page

Wrap del componente `EmptyState` en un layout de página con CTA. Es lo que
ves la primera vez que abrís una vista que todavía no tiene datos.

**Source:** [`src/blocks/EmptyStatePage.tsx`](../src/blocks/EmptyStatePage.tsx)
**Story:** Storybook → Blocks → Empty state page

```tsx
import { EmptyState, Button, Card, CardBody, Package } from '@misael703/ui';

<Card><CardBody>
  <EmptyState
    icon={<Package size={40} />}
    title="Aún no hay pedidos"
    description="Cuando un cliente confirme su primer pedido, vas a verlo acá."
    action={<Button>Crear pedido manual</Button>}
  />
</CardBody></Card>
```

---

## Error page

Algo falló. Retry CTA + link a soporte. Pasale un `onRetry` para que el botón
re-dispare la query.

**Source:** [`src/blocks/ErrorPage.tsx`](../src/blocks/ErrorPage.tsx)
**Story:** Storybook → Blocks → Error page

```tsx
import { Button, Card, CardBody, AlertTriangle } from '@misael703/ui';

export function ErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <Card><CardBody>
        <AlertTriangle size={32} />
        <h1 className="h3">Algo salió mal</h1>
        <p>No pudimos cargar la información. Intenta de nuevo.</p>
        {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
      </CardBody></Card>
    </div>
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
<div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
  <div className="cell-mono" style={{ fontSize: 96, color: 'var(--color-primary)' }}>404</div>
  <h1 className="h2">Esta página no existe</h1>
  <div>
    <Button onClick={() => history.back()} variant="outline">Volver atrás</Button>
    <Button onClick={() => location.href = '/'}>Ir al inicio</Button>
  </div>
</div>
```

---

## Checkout

Página de checkout con AddressForm a la izquierda y aside sticky a la derecha
(progreso a envío gratis + OrderSummary + PromoCode + CTA Pagar). El kit no
trae data de país: definí el set de campos por mercado.

**Source:** [`src/blocks/CheckoutSummary.tsx`](../src/blocks/CheckoutSummary.tsx)
**Story:** Storybook → Blocks → Checkout

```tsx
import { AddressForm, OrderSummary, PromoCodeInput, FreeShippingProgress, Button } from '@misael703/ui';

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
