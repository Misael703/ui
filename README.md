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
| **Data** | `DataTable` (sort + selección + skeleton + empty + `ariaLabel` + `rowLabel`) |
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

Si no usás `next/font`, podés cargar Integral CF + Metropolis empaquetadas con el kit:

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

Reemplaza los archivos en `public/fonts/` y `src/fonts/`, y actualiza:
- Las declaraciones `@font-face` en `src/styles/index.css` (líneas 9-37) y `src/styles/fonts.css`
- Los tokens `--font-display` y `--font-body` en `src/styles/index.css` (~línea 117)

Todo el kit usa `var(--font-display)` y `var(--font-body)`, no hace referencia directa a "Integral CF" ni "Metropolis" en componentes.

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
