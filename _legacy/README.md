# El Alba — UI Kit

Sistema de diseño y librería de componentes para las aplicaciones de **Ferretería El Alba / Patio Constructor**. Pensado para Next.js (App Router) + React.

---

## 📦 Qué incluye

```
tokens/
  colors_and_type.css   ← variables CSS (color, type, spacing, radii, shadows, motion)
  kit.css               ← layout shell del showcase (sidebar, topbar, content)
  components.css        ← API de clases para todos los componentes
fonts/
  IntegralCF-*.otf      ← display
  Metropolis-*.otf      ← body
assets/
  logo-primary-light.png  ← logo full sobre fondo claro
  logo-primary-dark.png   ← logo full sobre fondo oscuro
  mark-lightbg.svg        ← isotipo para fondos claros
  mark-darkbg.svg         ← isotipo para fondos oscuros
app/
  Foundations.jsx, Components*.jsx, Templates.jsx, Icons.jsx
UI Kit.html             ← showcase navegable
```

---

## 🚀 Migración a Next.js

### 1. Crear el repo de la librería (recomendado)

Saca el kit a un paquete propio para reusarlo entre apps:

```bash
mkdir el-alba-ui && cd el-alba-ui
npm init -y
npm i -D typescript @types/react @types/react-dom react react-dom tsup
```

Estructura sugerida:
```
el-alba-ui/
├── src/
│   ├── styles/
│   │   ├── tokens.css         (= colors_and_type.css)
│   │   └── components.css     (limpiando lo del shell del showcase)
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── icons/
│   │   └── index.tsx          (= Icons.jsx tipado)
│   └── index.ts
├── public/
│   ├── fonts/
│   └── assets/
└── package.json
```

`package.json`:
```json
{
  "name": "@elalba/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./styles": "./dist/styles/index.css",
    "./fonts": "./public/fonts/*",
    "./assets": "./public/assets/*"
  },
  "peerDependencies": { "react": "^18", "react-dom": "^18" }
}
```

### 2. En cada app Next.js

```bash
npm i @elalba/ui
```

`app/layout.tsx`:
```tsx
import '@elalba/ui/styles';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'El Alba' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Fuentes con `next/font/local`

Copia los `.otf` a `public/fonts/` y carga:

```tsx
// app/fonts.ts
import localFont from 'next/font/local';

export const integral = localFont({
  src: [
    { path: '../public/fonts/IntegralCF-Regular.otf', weight: '400' },
    { path: '../public/fonts/IntegralCF-Bold.otf',    weight: '700' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const metropolis = localFont({
  src: [
    { path: '../public/fonts/Metropolis-Regular.otf', weight: '400' },
    { path: '../public/fonts/Metropolis-Bold.otf',    weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
});
```

```tsx
// app/layout.tsx
import { integral, metropolis } from './fonts';

<html lang="es" className={`${integral.variable} ${metropolis.variable}`}>
```

Y elimina los `@font-face` de `tokens.css`.

---

## 🛠️ Lo que falta para prod

### Crítico
- [ ] **Tipado TypeScript** de los componentes (hoy son `.jsx`)
- [ ] **Convertir clases a componentes React** con props (`<Button variant="primary" size="md">`)
- [ ] **Forwarded refs + asChild** (patrón Radix) para componer
- [ ] **A11y**: roles ARIA, focus-trap en modal/drawer, navegación por teclado en menus/tabs
- [ ] **Empaquetar con `tsup`** (ESM + CJS + d.ts)

### Importante
- [ ] **Tests**: Vitest + Testing Library para los componentes
- [ ] **Storybook** o equivalente para documentar variantes
- [ ] **Tailwind preset** opcional (mapear tokens a `theme.extend`) si vas a usar Tailwind
- [ ] **`prefers-reduced-motion`**: respetar en transiciones
- [ ] **CSS layers** (`@layer tokens, components, utilities`) para evitar conflictos de especificidad

### Nice to have
- [ ] **CLI / generador** estilo `shadcn add button` para copiar componente al repo
- [ ] **Changesets** para versionado
- [ ] **CI**: lint + type-check + tests en PR
- [ ] **Visual regression** (Chromatic / Percy)

---

## 🎨 Cómo usar los tokens

Todos los componentes consumen variables CSS. Para overrides per-app:

```css
/* app/globals.css */
:root {
  --color-brand-blue: #002f87;     /* puedes ajustar por tenant */
  --radius-md: 6px;                /* radii más cerrados */
}
```

### Tokens semánticos disponibles

| Token | Uso |
|---|---|
| `--bg-canvas` / `--bg-surface` / `--bg-subtle` / `--bg-muted` | jerarquía de fondos |
| `--fg-default` / `--fg-muted` / `--fg-subtle` | jerarquía de texto |
| `--accent-primary` / `--accent-secondary` | azul / naranjo de marca |
| `--border-default` / `--border-strong` / `--border-focus` | bordes |
| `--color-success/warning/danger/info` | estados semánticos |
| `--shadow-xs/sm/md/lg` | elevación |
| `--space-1..24` | spacing (4pt grid) |
| `--radius-sm/md/lg/xl/pill` | radios |
| `--text-xs..7xl` | escala tipográfica |

---

## 📐 Convenciones

- **Iconos**: 16px en buttons sm, 18px en md, 20px+ en headings
- **Hit targets**: mínimo 36px en desktop, 44px en mobile
- **Buttons**: `primary` (CTA principal), `secondary` (azul marca), `outline`, `ghost`, `subtle`, `danger`
- **Badges**: `primary | accent | success | warning | danger | info | neutral`
- **Modal vs Drawer**: modal para confirmaciones, drawer para flujos largos / formularios
- **Skeletons**: úsalos cuando la carga es > 200ms; para < 200ms, no muestres nada

---

## 🔍 Showcase

Abre `UI Kit.html` para navegar todos los componentes, patrones y templates en vivo.
