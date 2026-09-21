# @misael703/ui

React + TypeScript UI kit for Next.js (App Router). Design tokens, accessible components with no runtime dependencies, runtime-configurable branding through presets. Built for the author's own applications and published on npm under MIT; not positioned as a community project.

---

## Install

The package is published on the **public npm registry** ([registry.npmjs.org](https://www.npmjs.com/package/@misael703/ui)) under the MIT license. No authentication required.

```bash
npm install @misael703/ui
# pares
npm install react react-dom
```

### Upgrading to a new version

```bash
npm outdated @misael703/ui          # ver si hay versión nueva
npm update @misael703/ui            # sube hasta donde el rango permite
npm install @misael703/ui@latest    # fuerza la última (ignora rango)
npm install @misael703/ui@0.2.1     # fija una versión específica
```

> Since `1.0.0` the package follows stable [SemVer](https://semver.org/): `breaking changes` only happen in `major` bumps. Read the [release notes](https://github.com/Misael703/ui/releases) or the [CHANGELOG](./CHANGELOG.md) before upgrading across a major.

## Use in Next.js

**1) Import the styles in `app/layout.tsx` (once):**

```tsx
import '@misael703/ui/styles.css';
import { ToastProvider } from '@misael703/ui';

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

**2) Use the components:**

```tsx
import {
  Button, Card, CardBody, CardHeader,
  Input, FormField, Badge, Alert,
  Modal, Drawer, Tabs, TabList, Tab, TabPanel,
  Stepper, useToast,
} from '@misael703/ui';

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

## Theming

### Layers and precedence

The kit wraps its styles in `@layer elalba` so your non-layered rules (your own CSS, or your framework's) always win — you can override any component without fighting specificity.

The flip side: **if your global reset isn't inside a layer, it wins over the kit**. The most common case is Tailwind v3+ with `preflight` enabled, which applies:

```css
*, ::before, ::after {
  border-width: 0;
  border-style: solid;
  border-color: ...;
}
```

…outside any `@layer`. As a result, a kit rule like `border-left-width: 4px` (which lives inside `@layer elalba`) **loses** against the preflight, and the accent border "goes dark".

Three ways to avoid it, from least to most invasive:

1. **Wrap your styles in a layer too**: add `@import "tailwindcss"` (Tailwind v4) or `@layer base, components, utilities;` (Tailwind v3) explicitly, and make sure your utilities live inside layers. When both sides are layered, layer order decides who wins.
2. **Disable preflight** — in `tailwind.config.js`: `corePlugins: { preflight: false }`. You lose the reset but the kit stays intact.
3. **Targeted override from your app**: if only one component bothers you, you can re-establish the property outside any layer:
   ```css
   .card[class*="card--accent-"] { border-style: solid; }
   ```

From v0.4.5 the kit mitigates this in `Card` by using an inset `box-shadow` for the accent rail instead of `border-left`. Other components with thin borders (`Input`, `Select`, `Table`) still rely on `border-*` and are affected by the preflight. If this hits you, use option (1) or (2).

### CSS cost (single stylesheet)

The kit ships **a single stylesheet** (`@misael703/ui/styles.css`, ~173 KB uncompressed, **~27 KB gzip**) with the CSS for every component. There is no per-component CSS code-splitting.

Implication: your app loads the CSS for every component regardless of how many you actually use. The **JS is tree-shakeable** (one `.mjs` per component; your bundler drops what you don't import), but the CSS doesn't split.

This is a deliberate decision, not an oversight:

- For internal apps that use many components (barritas) the ~27 KB gzip amortizes and the marginal cost of each extra component is ~0.
- Doing CSS code-splitting would force importing CSS per component and break the single-line `import "@misael703/ui/styles.css"` model. For an internal kit, that simplicity is prioritized over the KB.
- If you only need the tokens (no component CSS), import `@misael703/ui/tokens.css` (~7 KB).

If size becomes a concern for a specific consumer in the future, the path is exposing per-component CSS entry points without removing the single sheet (additive, not breaking).

### Presets

A preset restores a brand's own token values on top of the kit's generic defaults. It's a plain CSS file, imported after the base stylesheet, that redeclares the semantic/brand tokens inside the same `@layer elalba` the kit uses — the cascade takes care of the rest.

The **El Alba preset** (`@misael703/ui/presets/elalba`) ships in the package as the reference implementation: it restores the El Alba blue/orange palette and, via `elalbaDefaults` (`@misael703/ui/presets/elalba-defaults`), the brand's `name`/`currency`/`locale`/`logoBasePath` for `configureBrand()`.

```ts
import "@misael703/ui/styles.css";
import "@misael703/ui/presets/elalba";

import { configureBrand } from "@misael703/ui";
import { elalbaDefaults } from "@misael703/ui/presets/elalba-defaults";
configureBrand(elalbaDefaults);
```

To write your own preset, follow the same two-file shape: a CSS file overriding the token values your brand needs (see `src/presets/elalba/styles.css` for the full list), and, optionally, a `BrandDefaults` object (`name`, `currency`, `locale`, `logoBasePath`) passed to `configureBrand()`. See [Forking / Rebrand](#forking--rebrand) for the token-by-token walkthrough.

### Tokens (CSS variables)

Tokens live in `:root`. The brand palette and semantic tokens are available for overriding in your app.

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

Use them directly in your CSS:

```css
.my-card { background: var(--bg-surface); color: var(--fg-default); }
```

Only want the tokens (without the components)? Import just `tokens.css`:

```ts
import '@misael703/ui/tokens.css';
```

### Inverted surfaces (dark-background zones)

The kit resets `color` on `<p>`, `<h1>`–`<h6>`, anchors and `.caption` to keep typography consistent. When you place those elements inside a dark footer / hero / sidebar, the kit's inherited color wins over the parent's `color` (specificity). To invert the whole subtree in one line, use `.surface-inverse`:

```html
<footer class="surface-inverse surface-inverse--brand">
  <h3 class="h3">Footer en navy</h3>
  <p>Texto blanco automáticamente — herencia vía CSS vars.</p>
  <p class="caption">Captions caen a blanco translúcido.</p>
  <p><a href="#">Anchors</a> usan el naranja de marca en hover.</p>
</footer>
```

Variants:
- `.surface-inverse` alone (no bg) — for when you paint the background yourself.
- `.surface-inverse--brand` — bg `var(--color-brand-blue)`.
- `.surface-inverse--dark` — bg `var(--color-blue-900)`.
- `[data-tone="inverse"]` — equivalent attribute, no extra classes needed.

The mechanism re-scopes tokens (`--fg-default`, `--fg-muted`, `--fg-subtle`, `--border-default`, `--fg-link*`) inside the subtree. Any kit component that resolves those vars inside it inherits the light values without touching the component itself. **Careful**: components with their own background (Card, Modal, Button, Input) are **not** inverted — the utility targets the container's text and borders, not re-skinning every nested component.

---

## Components

| Category | Components |
|---|---|
| **Action** | `Button`, `Menu` (accessible dropdown), `Toggle`, `ToggleGroup` |
| **Forms** | `Input`, `Textarea`, `Select`, `Checkbox` (with `indeterminate` and `invalid`), `Radio`, `Switch` (with `role="switch"`), `Label`, `FormField` (auto-id + aria-describedby), `NumberInput`, `Slider`, `MoneyInput` (CLP), `PhoneInput`, `TimePicker`, `TagInput`, `RadioGroup`, `CheckboxGroup`, `InputOTP` |
| **Pickers** | `Combobox`, `MultiCombobox`, `DatePicker`, `DateRangePicker` (with presets), `FileUpload` |
| **Command** | `CommandPalette` + `useCommandPalette({ hotkey: 'mod+k' })` |
| **Display** | `Card`, `Badge`, `Alert`, `Skeleton`, `Spinner`, `EmptyState`, `Avatar`, `AvatarGroup`, `Stat`, `Progress`, `ProgressCircle` |
| **Overlay** | `Modal`, `Drawer` (focus trap + ESC + backdrop + body scroll lock + portal to `document.body`), `Popover`, `HoverCard`, `ContextMenu` |
| **Layout** | `Tabs`, `Table`, `Tooltip`, `Stepper`, `Accordion`, `Breadcrumbs`, `Pagination`, `AppShell` (with `default`/`brand` theme), `PageHeader`, `Menubar`, `NavigationMenu`, `Resizable`, `Carousel` |
| **Data** | `DataTable` (sort + selection + skeleton + empty + error + `stickyHeader` + `mobileLayout="cards"` + `ariaLabel` + `rowLabel`), `TablePagination` |
| **Primitives** | `AspectRatio`, `Collapsible`, `ScrollArea`, `Separator`, `Slot` |
| **Charts** | `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `Sparkline` (Recharts wrappers; pass `recharts={Recharts}`) |
| **Feedback** | `ToastProvider` + `useToast()` (pauses on hover/focus) |
| **Hooks** | `useCommandPalette()` |

> `Kpi` is deprecated — use `StatCard` (metric card) or `Stat` (inline stat) instead; removal planned for `5.0.0`.

All components are **type-safe**, expose `forwardRef` where it applies, and accept `className` to extend styles.

### AppShell + Next.js Link

```tsx
import Link from 'next/link';
import { AppShell } from '@misael703/ui';

<AppShell
  brand={<img src="/logo.svg" alt="Northwind Builders" height={28} />}
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

For the nav's `items.icon` (especially with the sidebar collapsed to a rail, where only the icon shows), use the set already bundled in `@misael703/ui` — no need to hand-draw SVGs: `Home`, `List`, `Wallet`, `History`, `ShoppingCart`, `CreditCard`, `Settings`, `Users`, etc. Full catalog in the [Icons](#icons) section below.

For the hamburger toggle (mobile drawer + collapsing the rail on desktop), pass `showMenuToggle` and the kit renders it at the start of `header.left` with `aria-label`, `aria-expanded`, visible focus, and the same DWIM `toggle()` (drawer on mobile, collapse on desktop). If you need a custom trigger you still have the render prop `header.left={(api) => <button onClick={api.toggle}>…</button>}` — both coexist (the kit's toggle first, the consumer's content after).

### DataTable with thousands of rows (virtualization)

The kit doesn't include built-in virtualization — for large datasets (>200 rows), wrap `<DataTable>` with `react-window` or `@tanstack/react-virtual`. Base pattern:

```tsx
'use client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { DataTable } from '@misael703/ui';

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

Notes:
- The kit passes `stickyHeader` so the thead stays visible while scrolling.
- The outer `<div>` with a fixed `height` is the scroll container the virtualizer measures.
- If you need keyboard navigation between virtual rows, add it in the wrapper — it's the consumer's responsibility since it depends on the desired UX (Enter to open vs. expand, etc.).

For cases where sort/filter go through the server, keep `<DataTable rows={pageData}>` with normal pagination and `<TablePagination>`. Virtualization only pays off when the whole dataset fits in memory.

### Charts (Recharts optional)

`@misael703/ui` doesn't bundle Recharts: it receives it as a prop. Install `recharts` in your app and pass it in:

```tsx
'use client';
import * as Recharts from 'recharts';
import { LineChart } from '@misael703/ui';

<LineChart
  recharts={Recharts}
  data={data}
  categoryKey="mes"
  series={[{ key: 'ventas', label: 'Ventas' }]}
/>
```

### Icons

`@misael703/ui` exports a set of SVG icons (24×24, `currentColor`, stroke 1.75) directly from the barrel — no need to redraw them by hand. The geometry comes from [Lucide](https://lucide.dev) (ISC; the ones derived from Feather, MIT), inlined with no runtime dependency; the full notice ships in the package as `LICENSE-lucide`:

```tsx
import { Search, ShoppingCart, ChevronRight } from '@misael703/ui';

<Button iconLeft={<ShoppingCart />}>Ver carro</Button>
<ChevronRight size={16} />
```

They inherit `color` from the parent and accept `size`, `strokeWidth`, `className` and `title` (a11y).

Catalog (see the full searchable grid in Storybook → `Foundations/Icons` → Gallery):

| Category | Available icons |
|---|---|
| **Chevrons / arrows** | `ChevronUp`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| **Status / feedback** | `Check`, `X`, `Plus`, `Minus`, `Info`, `AlertTriangle`, `AlertCircle`, `CheckCircle` |
| **Navigation / actions** | `Search`, `Filter`, `Settings`, `Bell`, `User`, `Users`, `Home`, `LogOut`, `MenuIcon`, `List`, `MoreHorizontal`, `MoreVertical` |
| **Files / data** | `FileText`, `Folder`, `Download`, `Upload`, `Trash`, `Edit`, `Eye`, `EyeOff`, `Copy`, `Link`, `ExternalLink` |
| **Commerce / hardware** | `ShoppingCart`, `Package`, `Truck`, `Tag`, `CreditCard`, `Wallet`, `Tool`, `Wrench` |
| **Dates / time** | `CalendarIcon`, `CalendarDays`, `Clock`, `History`, `RefreshCw`, `Loader` |
| **Views (switchers)** | `Rows3`, `LayoutGrid`, `Columns3` |
| **Text formatting** | `Bold`, `Italic`, `Underline`, `AlignLeft`, `AlignCenter`, `AlignRight` |
| **Misc** | `Star`, `Heart`, `Mail`, `Phone`, `MapPin`, `Map`, `Lock`, `Unlock`, `Sun`, `Moon`, `Globe`, `Building` |
| **Documents (4.3.0)** | `Printer`, `Undo2`, `Redo2`, `Save`, `Send`, `Paperclip`, `FileDown`, `FileUp`, `ClipboardList`, `ClipboardCheck`, `Archive` |
| **Status (4.3.0)** | `XCircle`, `PlusCircle`, `MinusCircle`, `HelpCircle`, `Ban`, `Shield`, `Flag`, `Pin` |
| **Navigation / data (4.3.0)** | `ChevronsLeft`, `ChevronsRight`, `ArrowUpDown`, `SlidersHorizontal`, `TableIcon`, `Layers`, `Maximize2`, `Minimize2` |
| **Commerce / logistics (4.3.0)** | `Receipt`, `Banknote`, `Calculator`, `Percent`, `Barcode`, `QrCode`, `ScanLine`, `Store`, `Warehouse`, `Box` |
| **People / communication (4.3.0)** | `UserPlus`, `UserCheck`, `MessageSquare`, `Image`, `Camera` |

### Fonts (optional)

If you're not using `next/font`, you can load Outfit (display) + DM Sans (body) bundled with the kit. Both are variable fonts, ~80 KB total:

```ts
// app/layout.tsx
import "@misael703/ui/fonts.css";
import "@misael703/ui/styles.css";
```

---

## Blocks (copy-paste)

Page recipes that compose kit components. Not shipped in the package; copy the file from `src/blocks/` and change the import to `@misael703/ui`. Index and rules: [`src/blocks/README.md`](./src/blocks/README.md). Rendered under **Blocks/** in Storybook.

---

## Development

### Build locally

```bash
npm install
npm run build           # emite dist/ con .mjs, .cjs, .d.ts y styles.css
npm test                # Vitest + Testing Library
npm run storybook       # http://localhost:6006
npm run build-storybook # builds storybook-static/ for deploy
```

To consume it without publishing (iterative development across repos): `npm install file:../ui_kit`.

### Storybook

Every component has a `*.stories.tsx` with interactive variants and autodocs. Run it locally with `npm run storybook`. A static build is deployed on Railway from the `Dockerfile` on every push to `main` (the URL lives in the Railway dashboard). Sidebar order: Docs → Foundations → Components → Patterns → Blocks → Internal. Conventions: [`docs/STORYBOOK.md`](./docs/STORYBOOK.md).

### Tests

`npm test` runs Vitest + Testing Library in jsdom. Current coverage: **~1,934 tests** across every public component, including a11y regressions (FormField wiring, indeterminate, hover-pause, focus rings). Adding tests is trivial — copy an existing one as a reference.

### Code style

The code style is compact and hand-written; there is no formatter. ESLint is the only gate.

---

## Releases & CI

Release PRs are squash-merged with the title `chore(release): X.Y.Z` (commitlint rejects the old `X.Y.Z: …` form).

npm publishes are automated with a GitHub Actions workflow (`.github/workflows/publish.yml`) triggered when a release is created.

**Authentication**: the workflow uses **npm Trusted Publishing** (OIDC) — no `NPM_TOKEN`, no static secrets. npm trusts GitHub Actions directly via OpenID Connect, and every publish is signed with `--provenance` so the tarball is cryptographically tied to the commit + workflow that produced it.

Configured at: [npmjs.com/package/@misael703/ui/access](https://www.npmjs.com/package/@misael703/ui/access) → Trusted Publisher → `Misael703/ui` workflow `publish.yml`.

### Cutting a new release

```bash
npm version patch     # o minor / major — bumpea package.json y crea tag
git push && git push --tags
gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."
```

The workflow runs tests, builds, and publishes automatically. No OTP, no tokens on your machine.

### Publishing manually (exceptional case)

If you need to publish from local (e.g. CI is down):

```bash
npm publish --otp=<código de 2FA>
```

Requires `~/.npmrc` with your npm token, and having run `npm login` beforehand.

---

## Forking / Rebrand

The kit is designed to be reused across multiple brands. There are 4 axes you can adjust independently.

### 1. Colors (no kit changes required)

Override the tokens from your app — the kit uses `@layer` so your rules win automatically without fighting specificity:

```css
/* tu globals.css */
:root {
  --color-brand-blue: #6366f1;
  --color-brand-orange: #f59e0b;
  /* opcional: cambiar escalas completas si quieres */
}
```

### 2. Brand defaults (currency, locale, name, logoBasePath)

The kit only stores what it needs to render — **visual identity** (`name`, `logoBasePath`) and **UI formatting** (`currency`, `locale` BCP 47 for `Intl.NumberFormat` / `DateTimeFormat`). It doesn't assume a country.

Call `configureBrand()` once at startup:

```tsx
// app/layout.tsx (Next.js)
import { configureBrand } from '@misael703/ui';

configureBrand({
  name: 'Mi Marca',
  currency: 'USD',
  locale: 'en-US',
  logoBasePath: '/static/brand',
});
```

After configuring, `<Logo>`, `<PriceDisplay>`, `<MoneyInput>`, `<CartDrawer>` and `<FreeShippingProgress>` pick up the new defaults automatically. Props still work as a one-off override.

**Country data** (regions, phone prefix, RUT/SSN/etc. validation) is passed by the consumer as props, or modeled in their own `<AddressForm fields={...}>`. See "Language" (section 5) and the `Commerce → AddressFormDemo` story for a Chile-flavored example.

### 3. Fonts

Replace the files in `src/fonts/` and update:
- The `@font-face` declarations in `src/styles/fonts.css` (the only place; `styles.css` and `tokens.css` don't declare them)
- The `--font-display` and `--font-body` tokens in `src/styles/_root.css` (single source of truth; `tokens.css` and `styles.css` import it)

The whole kit uses `var(--font-display)` and `var(--font-body)`; no component references "Outfit" or "DM Sans" directly.

### 4. Logos

Replace the files in `src/presets/elalba/logos/` (Storybook serves them at `/assets/logos` through `staticDirs`), keeping the naming (`logo-horizontal-light.svg`, `mark-dark.svg`, etc.). If you use another path, configure it:

```tsx
configureBrand({ logoBasePath: '/static/mi-marca' });
```

### 5. Language (i18n)

By default the kit's strings are in Spanish ("Cerrar", "Sin datos", "Página anterior", etc.). For an app in another language, wrap the tree in a `LocaleProvider` with the keys you want to translate:

```tsx
import { LocaleProvider } from '@misael703/ui';

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

**How it works**:
- The `UiKitMessages` dict is fully typed (TypeScript autocompletes every key).
- Keys you don't provide fall back to the Spanish default (`esMessages`) — you don't need to declare everything.
- Templates with placeholders (`"Eliminar {name}"`, `"{n} sin leer"`, etc.) are resolved with the `format(tpl, vars)` helper, which is also exported.

Without `LocaleProvider` the kit works in Spanish as always — the provider is optional.

### Effort summary

| Change | Effort |
|---|---|
| Colors | 5 min (CSS override) |
| Brand defaults (name, currency, locale) | 5 min (`configureBrand()`) |
| Font | 10 min (swap files + tokens) |
| Logos | 5 min (swap files) |
| Language | 15 min (wrap in `LocaleProvider` with a dict) |
