# @misael703/elalba-ui

UI Kit React + TypeScript multi-marca, optimizado para Next.js (App Router).

Incluye tokens (colores, tipografía, espacio, radii, sombras, motion) y componentes accesibles para producto, admin, POS, dashboards y e-commerce. Diseñado para reusarse en múltiples marcas: la identidad visual (colores, fuentes, logos, defaults de marca) se configura en runtime, sin tocar el código del kit.

> **Brand-neutral por diseño**: el primer consumer de este kit es **El Alba / Patio Constructor**, pero el paquete sirve a cualquier marca vía `configureBrand()`. Si necesitas un paquete completamente independiente con otra cara, ver la sección [Forking / Rebrand](#forking--rebrand).

---

## Instalación

El paquete está publicado en **npm público** ([registry.npmjs.org](https://www.npmjs.com/package/@misael703/elalba-ui)) bajo licencia MIT. No requiere autenticación.

```bash
npm install @misael703/elalba-ui
# pares
npm install react react-dom
```

### Actualizar a una nueva versión

```bash
npm outdated @misael703/elalba-ui          # ver si hay versión nueva
npm update @misael703/elalba-ui            # sube hasta donde el rango permite
npm install @misael703/elalba-ui@latest    # fuerza la última (ignora rango)
npm install @misael703/elalba-ui@0.2.1     # fija una versión específica
```

> ⚠️ Mientras el paquete esté en `0.x.x` la API se considera inestable — cualquier `minor` puede traer breaking changes. Lee las [release notes](https://github.com/Misael703/elalba-ui/releases) o el [CHANGELOG](./CHANGELOG.md) antes de subir de minor o major.

## Uso en Next.js (App Router)

**1) Importa los estilos en `app/layout.tsx` (una sola vez):**

```tsx
import '@misael703/elalba-ui/styles.css';
import { ToastProvider } from '@misael703/elalba-ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

**2) Usa los componentes:**

```tsx
import {
  Button, Card, CardBody, CardHeader,
  Input, FormField, Badge, Alert,
  Modal, Drawer, Tabs, TabList, Tab, TabPanel,
  Stepper, useToast,
} from '@misael703/elalba-ui';

export function NewOrder() {
  const { push } = useToast();
  return (
    <Card>
      <CardHeader>Nuevo pedido <Badge variant="success">Activo</Badge></CardHeader>
      <CardBody>
        {/* FormField genera automáticamente el id del input y enlaza
            label/aria-describedby con hint y error. */}
        <FormField label="SKU" required hint="Ej. ELT-12-AC">
          <Input placeholder="SKU del producto" />
        </FormField>
        <Button onClick={() => push({ title: 'Guardado', variant: 'success' })}>
          Guardar
        </Button>
      </CardBody>
    </Card>
  );
}
```

---

## Interop con Tailwind (u otro reset global)

El kit envuelve sus estilos en `@layer elalba` para que tus reglas no-layered (tu propio CSS o el de tu framework) ganen siempre por encima — así podés override-ear cualquier componente sin pelear con especificidad.

El reverso: **si tu reset global no está en un layer, gana sobre el kit**. El caso más común es Tailwind v3+ con `preflight` habilitado, que aplica:

```css
*, ::before, ::after {
  border-width: 0;
  border-style: solid;
  border-color: ...;
}
```

…fuera de cualquier `@layer`. Como resultado, una regla del kit del tipo `border-left-width: 4px` (que vive dentro de `@layer elalba`) **pierde** contra el preflight, y el borde de acento se "apaga".

Tres formas de evitarlo, ordenadas de menos a más invasiva:

1. **Envolver tus estilos en un layer también** — agregá `@import "tailwindcss"` (Tailwind v4) o `@layer base, components, utilities;` (Tailwind v3) explícitamente, y asegurate de que tus utilidades vivan dentro de layers. Cuando ambos están layered, el orden de capas controla quién gana.
2. **Desactivar el preflight** — en `tailwind.config.js`: `corePlugins: { preflight: false }`. Te pierde el reset pero el kit queda intacto.
3. **Override puntual desde tu app** — si solo te molesta un componente, podés re-establecer la propiedad afuera de cualquier layer:
   ```css
   .card[class*="card--accent-"] { border-style: solid; }
   ```

A partir de v0.4.5 el kit mitiga este problema en `Card` usando `box-shadow inset` para la accent rail en vez de `border-left`. Otros componentes con bordes finos (`Input`, `Select`, `Table`) siguen dependiendo de `border-*` y son afectados por el preflight — si te pasa, andá por la opción (1) o (2).

---

## Componentes

| Categoría | Componentes |
|---|---|
| **Acción** | `Button`, `Menu` (dropdown accesible), `Toggle`, `ToggleGroup` |
| **Forms** | `Input`, `Textarea`, `Select`, `Checkbox` (con `indeterminate` y `invalid`), `Radio`, `Switch` (con `role="switch"`), `Label`, `FormField` (auto-id + aria-describedby), `NumberInput`, `Slider`, `MoneyInput` (CLP), `PhoneInput`, `TimePicker`, `TagInput`, `RadioGroup`, `CheckboxGroup`, `InputOTP` |
| **Pickers** | `Combobox`, `MultiCombobox`, `DatePicker`, `DateRangePicker` (con presets), `FileUpload` |
| **Command** | `CommandPalette` + `useCommandPalette({ hotkey: 'mod+k' })` |
| **Display** | `Card`, `Badge`, `Alert`, `Skeleton`, `Spinner`, `Kpi`, `EmptyState`, `Avatar`, `AvatarGroup`, `Stat`, `Progress`, `ProgressCircle` |
| **Overlay** | `Modal`, `Drawer` (focus-trap + ESC + backdrop + body scroll lock + portal a `document.body`), `Popover`, `HoverCard`, `ContextMenu` |
| **Layout** | `Tabs`, `Table`, `Tooltip`, `Stepper`, `Accordion`, `Breadcrumbs`, `Pagination`, `AppShell` (con tema `default`/`brand`), `PageHeader`, `Menubar`, `NavigationMenu`, `Resizable`, `Carousel` |
| **Data** | `DataTable` (sort + selección + skeleton + empty + error + `stickyHeader` + `mobileLayout="cards"` + `ariaLabel` + `rowLabel`), `TablePagination` |
| **Primitives** | `AspectRatio`, `Collapsible`, `ScrollArea`, `Separator`, `Slot` |
| **Charts** | `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `Sparkline` (wrappers de Recharts; pasar `recharts={Recharts}`) |
| **Feedback** | `ToastProvider` + `useToast()` (con pausa al hover/focus) |
| **Hooks** | `useCommandPalette()` |

Todos los componentes son **type-safe**, exponen `forwardRef` cuando aplica y aceptan `className` para extender estilos.

### AppShell + Next.js Link

```tsx
import Link from 'next/link';
import { AppShell } from '@misael703/elalba-ui';

<AppShell
  brand={<img src="/logo.svg" alt="El Alba" height={28} />}
  sections={[{
    label: 'Operación',
    items: [
      { id: 'home', label: 'Inicio', href: '/', active: true },
      { id: 'pedidos', label: 'Pedidos', href: '/pedidos', badge: 12 },
    ],
  }]}
  linkAs={(item, content, className) => (
    <Link href={item.href!} className={className} aria-current={item.active ? 'page' : undefined}>
      {content}
    </Link>
  )}
  topbar={<input className="input" placeholder="Buscar…" />}
>
  {/* page content */}
</AppShell>
```

### DataTable con miles de filas (virtualization)

El kit no incluye virtualización built-in — para datasets grandes (>200 filas), envuelve el `<DataTable>` con `react-window` o `@tanstack/react-virtual`. Patrón base:

```tsx
'use client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { DataTable } from '@misael703/elalba-ui';

function VirtualTable({ rows, columns, rowKey }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const visibleRows = virtualizer.getVirtualItems().map((vi) => rows[vi.index]);

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        <DataTable
          columns={columns}
          rows={visibleRows}
          rowKey={rowKey}
          stickyHeader
        />
      </div>
    </div>
  );
}
```

Notas:
- El kit pasa `stickyHeader` para que el thead se mantenga visible durante el scroll.
- El `<div>` exterior con `height` fija es el contenedor de scroll que el virtualizer mide.
- Si necesitás keyboard navigation entre filas virtuales, agregalo en el wrapper — es responsabilidad del consumer porque depende del UX deseado (Enter para abrir vs. expandir, etc.).

Para casos donde el sort/filter pasa por el server, mantené `<DataTable rows={pageData}>` con paginación normal y `<TablePagination>`. Virtualization rinde solo cuando todo el dataset cabe en memoria.

### Charts (Recharts opcional)

`@misael703/elalba-ui` no incluye Recharts: lo recibe por prop. Instala `recharts` en tu app y pásalo:

```tsx
'use client';
import * as Recharts from 'recharts';
import { LineChart } from '@misael703/elalba-ui';

<LineChart
  recharts={Recharts}
  data={data}
  categoryKey="mes"
  series={[{ key: 'ventas', label: 'Ventas' }]}
/>
```

### Iconos

`@misael703/elalba-ui` exporta un set de íconos SVG (24×24, `currentColor`, stroke 1.75) listos para usar:

```tsx
import { Search, ShoppingCart, ChevronRight } from '@misael703/elalba-ui';

<Button iconLeft={<ShoppingCart />}>Ver carro</Button>
<ChevronRight size={16} />
```

Heredan `color` del padre y aceptan `size`, `strokeWidth`, `className` y `title` (a11y).

### Fuentes (opcional)

Si no usás `next/font`, podés cargar Outfit (display) + DM Sans (body) empaquetadas con el kit. Ambas son variable fonts, total ~80 KB:

```ts
// app/layout.tsx
import "@misael703/elalba-ui/fonts.css";
import "@misael703/elalba-ui/styles.css";
```

---

## Tokens (CSS variables)

Los tokens viven en `:root`. La paleta de marca y los tokens semánticos están disponibles para overrides en tu app.

```css
/* Brand */
--color-brand-orange: #ff671d;
--color-brand-blue:   #002f87;

/* Semánticos */
--bg-canvas, --bg-surface, --bg-subtle, --bg-inverse
--fg-default, --fg-muted, --fg-subtle
--border-default, --border-strong, --border-focus
--color-success, --color-warning, --color-danger, --color-info

/* Type */
--font-display, --font-body, --font-mono
--text-xs … --text-display

/* Espacio */
--space-1 … --space-16 (4px–64px)

/* Radii / sombras / motion */
--radius-sm … --radius-2xl
--shadow-sm … --shadow-xl
--duration-fast / --duration-base / --duration-slow
--ease-standard / --ease-emphasized
```

Úsalos directamente en tu CSS:

```css
.my-card { background: var(--bg-surface); color: var(--fg-default); }
```

¿Solo querés los tokens (sin los componentes)? Importá únicamente `tokens.css`:

```ts
import '@misael703/elalba-ui/tokens.css';
```

### Superficies invertidas (zonas con bg oscuro)

El kit resetea `color` en `<p>`, `<h1>`–`<h6>`, anchors y `.caption` para mantener consistencia tipográfica. Cuando metés esos elementos dentro de un footer / hero / sidebar oscuro, el color heredado del kit gana sobre el `color` del padre (especificidad). Para invertir el subtree completo en una línea, usá `.surface-inverse`:

```html
<footer class="surface-inverse surface-inverse--brand">
  <h3 class="h3">Footer en navy</h3>
  <p>Texto blanco automáticamente — herencia vía CSS vars.</p>
  <p class="caption">Captions caen a blanco translúcido.</p>
  <p><a href="#">Anchors</a> usan el naranja de marca en hover.</p>
</footer>
```

Variantes:
- `.surface-inverse` solo (sin bg) — para cuando vos pintás el fondo.
- `.surface-inverse--brand` — bg `var(--color-brand-blue)`.
- `.surface-inverse--dark` — bg `var(--color-blue-900)`.
- `[data-tone="inverse"]` — atributo equivalente, sin agregar clases.

El mecanismo es re-scope de tokens (`--fg-default`, `--fg-muted`, `--fg-subtle`, `--border-default`, `--fg-link*`) en el subtree. Cualquier componente del kit que resuelva esos vars adentro hereda los valores claros sin tocar el componente. **Cuidado**: componentes con bg propio (Card, Modal, Button, Input) **no** se invierten — la utilidad apunta al texto y bordes del contenedor, no a re-skinear cada componente anidado.

---

## Build local

```bash
npm install
npm run build           # emite dist/ con .mjs, .cjs, .d.ts y styles.css
npm test                # Vitest + Testing Library
npm run storybook       # http://localhost:6006
npm run build-storybook # genera storybook-static/ para deploy
```

Para consumir sin publicar (desarrollo iterativo entre repos): `npm install file:../ui_kit`.

## Storybook

Cada componente tiene un `*.stories.tsx` con variantes interactivas y autodocs.

## Tests

`npm test` corre Vitest + Testing Library en jsdom. Cobertura actual: **249 tests** sobre todos los componentes públicos, incluyendo regresiones de a11y (FormField wiring, indeterminate, hover-pause, focus rings). Agregar tests es trivial — copia uno existente como referencia.

---

## Releases & CI

Las publicaciones a npm están automatizadas con un workflow de GitHub Actions (`.github/workflows/publish.yml`) que se dispara al crear un release.

**Autenticación**: el workflow usa **npm Trusted Publishing** (OIDC) — no hay `NPM_TOKEN` ni secrets estáticos. npm confía directamente en GitHub Actions vía OpenID Connect, y cada publish se firma con `--provenance` para que el tarball quede criptográficamente atado al commit + workflow que lo produjo.

Configurado en: [npmjs.com/package/@misael703/elalba-ui/access](https://www.npmjs.com/package/@misael703/elalba-ui/access) → Trusted Publisher → `Misael703/elalba-ui` workflow `publish.yml`.

### Sacar una nueva versión

```bash
npm version patch     # o minor / major — bumpea package.json y crea tag
git push && git push --tags
gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."
```

El workflow corre tests, build, y publica automáticamente. Sin OTP, sin tokens en tu máquina.

### Publicar manualmente (caso excepcional)

Si necesitas publicar desde local (ej. CI caído):

```bash
npm publish --otp=<código de 2FA>
```

Requiere `~/.npmrc` con tu token de npm y haber corrido `npm login` antes.

---

## Forking / Rebrand

El kit está diseñado para reusarse en múltiples marcas. Hay 4 ejes que puedes ajustar de manera independiente.

### 1. Colores (sin tocar el kit)

Override los tokens desde tu app — el kit usa `@layer` así que tus reglas ganan automáticamente sin pelear con especificidad:

```css
/* tu globals.css */
:root {
  --color-brand-blue: #6366f1;
  --color-brand-orange: #f59e0b;
  /* opcional: cambiar escalas completas si quieres */
}
```

### 2. Defaults de marca (currency, locale, name, logoBasePath)

El kit guarda solo lo que necesita para renderizar — **identidad visual** (`name`, `logoBasePath`) y **formateo UI** (`currency`, `locale` BCP 47 para `Intl.NumberFormat` / `DateTimeFormat`). No asume país.

Llama a `configureBrand()` una sola vez al arranque:

```tsx
// app/layout.tsx (Next.js)
import { configureBrand } from '@misael703/elalba-ui';

configureBrand({
  name: 'Mi Marca',
  currency: 'USD',
  locale: 'en-US',
  logoBasePath: '/static/brand',
});
```

Después de configurar, `<Logo>`, `<PriceDisplay>`, `<MoneyInput>`, `<CartDrawer>` y `<FreeShippingProgress>` usan los nuevos defaults automáticamente. Las props siguen funcionando como override puntual.

**Datos de país** (regiones, prefijo telefónico, validaciones de RUT/SSN/etc.) los pasa el consumer como props o los modela en su `<AddressForm fields={...}>`. Ver "Idioma" (sección 5) y la story `Commerce → AddressFormDemo` para un ejemplo Chile-flavored.

### 3. Fuentes

Reemplaza los archivos en `src/fonts/` y actualiza:
- Las declaraciones `@font-face` en `src/styles/fonts.css` (única ubicación; `styles.css` y `tokens.css` no las declaran)
- Los tokens `--font-display` y `--font-body` en `src/styles/_root.css` (single source of truth; `tokens.css` y `styles.css` lo importan)

Todo el kit usa `var(--font-display)` y `var(--font-body)`, no hace referencia directa a "Outfit" ni "DM Sans" en componentes.

### 4. Logos

Reemplaza los archivos en `public/assets/logos/` manteniendo el naming (`logo-horizontal-light.svg`, `mark-dark.svg`, etc.). Si usas otro path, configúralo:

```tsx
configureBrand({ logoBasePath: '/static/mi-marca' });
```

### 5. Idioma (i18n)

Por defecto los strings del kit están en español ("Cerrar", "Sin datos", "Página anterior", etc.). Para una app en otro idioma, envuelve el árbol en un `LocaleProvider` con las claves que quieras traducir:

```tsx
import { LocaleProvider } from '@misael703/elalba-ui';

<LocaleProvider
  messages={{
    'modal.close': 'Close',
    'table.empty': 'No data',
    'pagination.range': '{from}–{to} of {total}',
    'calendar.weekdays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }}
>
  <App />
</LocaleProvider>
```

**Cómo funciona**:
- El dict `UiKitMessages` está completamente tipado (TypeScript te autocompleta cada clave).
- Las claves no provistas hacen fallback al default español (`esMessages`) — no hace falta declarar todo.
- Templates con placeholders (`"Eliminar {name}"`, `"{n} sin leer"`, etc.) se resuelven con el helper `format(tpl, vars)` que también está exportado.

Sin `LocaleProvider` el kit funciona en español como siempre — el provider es opcional.

### Resumen del esfuerzo

| Cambio | Esfuerzo |
|---|---|
| Colores | 5 min (override CSS) |
| Defaults marca (name, currency, locale) | 5 min (`configureBrand()`) |
| Fuente | 10 min (reemplazar archivos + tokens) |
| Logos | 5 min (reemplazar archivos) |
| Idioma | 15 min (envolver en `LocaleProvider` con un dict) |
