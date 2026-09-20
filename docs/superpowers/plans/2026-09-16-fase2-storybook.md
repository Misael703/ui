# Fase 2 — Storybook as Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the kit's Storybook from a set of showcase pages into its documentation: one story file per component with `component:` + `args`, an English title tree, neutral fixtures, MDX guides, interaction tests, and a CI build.

**Architecture:** Story files stay next to their sources in `src/components/` (Fase 3 moves sources into folders and updates imports then). Each old multi-component `*.stories.tsx` is split into one file per exported component; the meta always declares `component`, `tags: ['autodocs']`, `args` for `Default` and `argTypes` for enum props. A vitest guard enforces the convention. The preview drops the nested-iframe bridge (AppShell simply opts out of autodocs). Foundations become per-topic files under `src/foundations/`; guides live as MDX under `src/docs/`. Storybook 9 migration is the last, owner-gated task.

**Tech Stack:** Storybook 8.6 (react-vite), `@storybook/addon-interactions` + `@storybook/test`, `@storybook/blocks`, Vitest 2 (jsdom), Node 20/22.

**Spec:** `docs/superpowers/specs/2026-09-16-kit-cleanup-design.md` (decisions D1–D10) and `docs/superpowers/specs/2026-09-16-kit-cleanup-inventory.md` (section I11).

## Global Constraints

- Never run `prettier --write` (D6). Write edits by hand in the file's compact style.
- Commits: Conventional Commits, English, lowercase subject, no Claude attribution lines. One commit per task.
- No push / PR / merge / release without the owner's explicit go.
- Every task ends with: `npm run lint` (exit 0), `npm run typecheck` (exit 0; script created in Fase 1), `npx vitest run > /tmp/vitest.log 2>&1; echo "exit=$?"` (exit 0), and `npm run build-storybook > /tmp/sb.log 2>&1; echo "exit=$?"` (exit 0). Judge every gate by `$?`, never through `| grep` or `| tail`.
- Fixtures are generic (spec): company "Northwind Builders", branch "Sucursal Centro", products "Taladro", "Sierra circular", orders "Pedido #1042", persona "Satoru Gojo" (email `satoru@example.com`). Never "El Alba", "Ferretería", RUT, `+56`, `CLP` literals, real addresses, `IVA`. Money via `formatCurrency(n)` from `../utils/format` so the preset's brand currency applies.
- Objects or arrays that contain React elements (`icon: <X />`) are hoisted to module scope, never created inside `render` (Storybook's jsx decorator recurses into them and overflows the stack on `_owner`).
- A story file never imports another story file.
- No new exports from `src/index.ts` in this phase (the smoke gate stays untouched).
- Prerequisite from Fase 1: the 11 domain blocks (`DispatchBoard`, `DeliveryTimeline`, `RouteMap`, `RouteSchedule`, `RentalAgreement`, `RentalBoard`, `RentalBooking`, `RentalDetail`, `ReturnInspection`, `ToolCatalog`, `AvailabilityCalendar`) are already deleted, `.github/workflows/ci.yml` exists, and `npm run typecheck` exists. Verify with `rtk proxy ls src/blocks | wc -l` (expect 33: 16 blocks × 2 + README.md) and `rtk proxy ls .github/workflows` before starting.

## Story file template (used by every split task)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Display';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { variant: 'neutral', children: 'Pendiente' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Rules: `satisfies Meta<typeof X>` (not `as Meta`), `type Story = StoryObj<typeof meta>`, `Default` is always `{}` or `{ args }` (never `render`), state stories use `args` when the prop exists and `render` only for compositions. Components that need state (`value`/`onChange`) get a tiny wrapper function declared at module scope and passed as `render`.

---

### Task 1: Storybook infrastructure

**Files:**
- Modify: `package.json` (devDependencies lines 95-98, 118)
- Modify: `.storybook/main.ts`
- Rewrite: `.storybook/preview.tsx`
- Delete: `.storybook/fonts.css`, `public/` (16 logo files + `.DS_Store`s)
- Modify: `src/components/AppShell.stories.tsx:9-20`
- Modify: `Dockerfile:20-22` (comment only)

**Interfaces:**
- Produces: toolbar globals `preset` (`generic` | `elalba`) and `theme` (`light` | `dark`) — unchanged values, English labels; `parameters.options.storySort.order` used by every later task's titles.

- [ ] **Step 1: Bump Storybook packages and add addon-interactions + test**

Edit `package.json` devDependencies (hand edit, keep key order):

```json
    "@storybook/addon-a11y": "^8.6.0",
    "@storybook/addon-essentials": "^8.6.0",
    "@storybook/addon-interactions": "^8.6.0",
    "@storybook/blocks": "^8.6.0",
    "@storybook/react": "^8.6.0",
    "@storybook/react-vite": "^8.6.0",
    "@storybook/test": "^8.6.0",
```

and `"storybook": "^8.6.0"`. Then:

Run: `npm install > /tmp/npm-i.log 2>&1; echo "exit=$?"; grep '"version"' node_modules/storybook/package.json node_modules/@storybook/addon-interactions/package.json`
Expected: `exit=0`, both `8.6.x`.

- [ ] **Step 2: Rewrite `.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  // `<Logo>` resolves `/assets/logos/*` (its default `logoBasePath`). Serve the
  // preset's own logo files there so there is no second copy under public/.
  staticDirs: [{ from: '../src/presets/elalba/logos', to: '/assets/logos' }],
  viteFinal: (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      // `src/styles/fonts.css` uses `./fonts/*.woff2` (the dist layout). In dev the
      // file lives at src/styles/, so `./fonts/` would be src/styles/fonts/. Alias it.
      alias: { ...(cfg.resolve?.alias ?? {}), '/fonts/': `${resolve(here, '../src/fonts')}/` },
    },
  }),
};
export default config;
```

Why alias over a copied CSS: the alias resolves the `url()` at build time so `src/styles/fonts.css` is the single source; if Vite does not rewrite relative `url()` through `resolve.alias` (verify in Step 5), fall back to keeping `.storybook/fonts.css` as-is and skip Step 3.

- [ ] **Step 3: Delete the Storybook font copy and the public logo copy**

Run: `git rm -q .storybook/fonts.css && git rm -rq public && rtk proxy ls .storybook`
Expected: `main.ts  preview.tsx  reset.css`.

- [ ] **Step 4: Rewrite `.storybook/preview.tsx`** (drops the nested-iframe bridge, L62-126, and its imports)

```tsx
import * as React from 'react';
import type { Preview } from '@storybook/react';
import '../src/styles/fonts.css';
import './reset.css';
import '../src/styles/index.css';
// Vite `?inline` returns the file content as a string; the decorator toggles it
// so Storybook uses the exact preset file consumers import.
// @ts-expect-error — `?inline` is a Vite query, no ambient type
import presetCss from '../src/presets/elalba/styles.css?inline';

const PRESET_STYLE_ID = 'sb-preset';

// Dark theme is opt-in via `data-theme="dark"` on a root ancestor.
const withTheme = (Story: React.FC, context: { globals: { theme?: string } }) => {
  const theme = context.globals.theme ?? 'light';
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    document.body.style.background = 'var(--bg-canvas)';
    document.body.style.color = 'var(--fg-default)';
  }, [theme]);
  return <Story />;
};

const withPreset = (Story: React.FC, context: { globals: { preset?: string } }) => {
  const preset = context.globals.preset ?? 'generic';
  React.useEffect(() => {
    let el = document.getElementById(PRESET_STYLE_ID) as HTMLStyleElement | null;
    if (preset === 'elalba') {
      if (!el) { el = document.createElement('style'); el.id = PRESET_STYLE_ID; document.head.appendChild(el); }
      el.textContent = presetCss as string;
    } else if (el) {
      el.remove();
    }
  }, [preset]);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    preset: {
      description: 'Brand preset overlay (injects the example preset CSS)',
      defaultValue: 'generic',
      toolbar: {
        title: 'Preset',
        icon: 'paintbrush',
        items: [
          { value: 'generic', title: 'Generic (espresso)' },
          { value: 'elalba', title: 'Example preset (El Alba)' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Color theme (data-theme on the root)',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withPreset, withTheme],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] }, options: { runOnly: ['wcag2a', 'wcag2aa'] } },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile (400)', styles: { width: '400px', height: '800px' } },
        tablet: { name: 'Tablet (768)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1280)', styles: { width: '1280px', height: '800px' } },
      },
    },
    options: {
      storySort: {
        order: ['Docs', ['Introduction', 'Getting started', 'Theming', 'Accessibility', 'Hooks'], 'Foundations', 'Components', 'Patterns', 'Blocks', 'Internal'],
      },
    },
  },
};
export default preview;
```

- [ ] **Step 5: Opt AppShell out of autodocs (replaces the iframe bridge)**

In `src/components/AppShell.stories.tsx` replace lines 9-20 with:

```tsx
export default {
  title: 'Components/AppShell',
  component: AppShell,
  // The shell owns 100vh (internal-scroll model); it cannot render inside the
  // bounded docs column, so it has no autodocs page. Each story is full-screen.
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>;
```

Run: `npm run storybook > /tmp/sb-dev.log 2>&1 & sleep 15; curl -s -o /dev/null -w '%{http_code}\n' http://localhost:6006/iframe.html; kill %1`
Expected: `200`. Then open `http://localhost:6006/?path=/story/foundations--typography` in the browser (Playwright MCP `browser_navigate` + `browser_take_screenshot`) and confirm the display face is Outfit (not a serif fallback). If the fallback shows, the alias did not apply: restore `.storybook/fonts.css` from git (`git checkout HEAD -- .storybook/fonts.css`), re-add `import './fonts.css';` in preview.tsx replacing the `../src/styles/fonts.css` import, and remove `viteFinal` from main.ts.

- [ ] **Step 6: Update the Dockerfile comment** (lines 20-22): replace "public/ (staticDirs)" with "src/presets/elalba/logos (staticDirs)". No functional change.

- [ ] **Step 7: Gates**

Run: `npm run lint; echo "lint=$?"; npm run typecheck; echo "tsc=$?"; npx vitest run > /tmp/vitest.log 2>&1; echo "vitest=$?"; npm run build-storybook > /tmp/sb.log 2>&1; echo "sb=$?"`
Expected: all four `=0`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .storybook src/components/AppShell.stories.tsx Dockerfile
git commit -m "chore(storybook): bump to 8.6, add interactions addon, drop iframe bridge and public logo copy"
```

---

### Task 2: Conventions doc and meta guard test

**Files:**
- Create: `docs/STORYBOOK.md`
- Create: `tests/StoriesMeta.test.tsx`

**Interfaces:**
- Produces: the guard every later task must satisfy (`component:` and `tags: ['autodocs']` in every story file outside `Internal/`, `Blocks/`, and the AppShell exception).

- [ ] **Step 1: Write `docs/STORYBOOK.md`**

```markdown
# Storybook conventions

Storybook is the kit's documentation. Every export of `src/index.ts` has a story file.

## One file per component
- `src/components/<Name>.stories.tsx`, title `Components/<Name>` (English, PascalCase name as in the export).
- Transversal groups: `Foundations/*` (tokens), `Patterns/*` (compositions such as the list page), `Blocks/*` (copy-paste pages), `Internal/*` (regressions and experiments), `Docs/*` (MDX guides).
- Sub-components (`CardHeader`, `TabList`, `AccordionItem`…) are documented in the parent's file via `subcomponents`.

## Meta
- `component:` is mandatory; `tags: ['autodocs']` is mandatory (only `Internal/*`, `Blocks/*` and `Components/AppShell` opt out).
- `args` for the `Default` story; `argTypes` with `control: 'select'` / `'inline-radio'` for every enum prop.
- `satisfies Meta<typeof X>`; `type Story = StoryObj<typeof meta>`.

## Story names (English)
`Default`, `Sizes`, `Variants`, `Disabled`, `Loading`, `Invalid`, `Empty`, `Controlled`, `WithIcons`, `Playground`. A `Playground` is the one composition story with args; never one story per consumer case.

## Fixtures
Company "Northwind Builders", branch "Sucursal Centro", products "Taladro" / "Sierra circular", orders "Pedido #1042", persona "Satoru Gojo" (`satoru@example.com`). Money through `formatCurrency(n)`. Never a real company, RUT, phone, address, tax rate, or copy lifted from an app.

## Gotchas
- Objects/arrays holding React elements (`icon: <X />`) are hoisted to module scope (the jsx decorator recurses into `_owner` otherwise).
- A story file never imports another story file; shared compositions live in `src/components/__fixtures__/`.
- `play` functions use `@storybook/test` (`within`, `userEvent`, `expect`).
```

- [ ] **Step 2: Write the guard test (fails now)**

`tests/StoriesMeta.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', 'src');
const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.stories.tsx'))
  .map((f) => join(SRC, f));

const EXEMPT_TITLES = /title:\s*'(Internal|Blocks)\//;
const NO_AUTODOCS = /title:\s*'Components\/AppShell'/;

describe('story metas', () => {
  it('found story files', () => { expect(files.length).toBeGreaterThan(40); });

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const rel = file.slice(SRC.length + 1);
    it(`${rel} declares component:`, () => {
      if (EXEMPT_TITLES.test(src)) return;
      expect(src).toMatch(/^\s*component:\s*[A-Z]\w+,/m);
    });
    it(`${rel} declares tags: ['autodocs']`, () => {
      if (EXEMPT_TITLES.test(src) || NO_AUTODOCS.test(src)) return;
      expect(src).toMatch(/tags:\s*\['autodocs'\]/);
    });
    it(`${rel} has an English title`, () => {
      expect(src).toMatch(/title:\s*'(Docs|Foundations|Components|Patterns|Blocks|Internal)\//);
    });
    it(`${rel} does not import another story`, () => {
      expect(src).not.toMatch(/from '\.\/[A-Za-z]+\.stories'/);
    });
  }
});
```

Run: `npx vitest run tests/StoriesMeta.test.tsx > /tmp/guard.log 2>&1; echo "exit=$?"; grep -c '✓\|×' /tmp/guard.log`
Expected: `exit=1` (most files fail until the split tasks land). This test stays red until Task 19; the per-task gate uses `npx vitest run --exclude tests/StoriesMeta.test.tsx` until then.

- [ ] **Step 3: Commit**

```bash
git add docs/STORYBOOK.md tests/StoriesMeta.test.tsx
git commit -m "docs(storybook): conventions and meta guard test"
```

---

### Task 3: Shared list-page fixture; Patterns/List page and Internal/Register

**Files:**
- Create: `src/components/__fixtures__/listPage.tsx`
- Modify: `src/components/Filters.stories.tsx` (keep only FilterBar; see Task 16 for the rest)
- Create: `src/components/ListPage.stories.tsx`
- Modify: `src/components/Register.stories.tsx:1-5`

**Interfaces:**
- Produces: `export function ListPagePlayground(args: ListPageArgs): JSX.Element` and `export interface ListPageArgs` in `__fixtures__/listPage.tsx`, consumed by `ListPage.stories.tsx` and `Register.stories.tsx`.

- [ ] **Step 1: Move the playground composition out of the story file**

Read `src/components/Filters.stories.tsx` and locate `interface ListPageArgs` and `PaginaDeListadoPlayground` (line 126) with its `render` function, plus `ListadoCompleto` (line ~251). Create `src/components/__fixtures__/listPage.tsx` containing: the `ListPageArgs` interface, every module-scope fixture the render used (rows, columns, the hoisted `overflow` array with `<Download />`), and

```tsx
export function ListPagePlayground(args: ListPageArgs) { /* body = the former render(args) */ }
export function FullListPage() { /* body = the former ListadoCompleto render */ }
```

Fixture copy: table title "Pedidos", rows named after "Pedido #1042", "Pedido #1043"…, customer "Satoru Gojo", branch "Sucursal Centro"; replace any "despacho", "guía", "El Alba" strings found.

- [ ] **Step 2: Create `src/components/ListPage.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './Filters';
import { ListPagePlayground, FullListPage, type ListPageArgs } from './__fixtures__/listPage';

const meta = {
  title: 'Patterns/List page',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FilterBar>;
export default meta;

export const Playground: StoryObj<ListPageArgs> = {
  args: { fields: 7, layout: 'inline', visibleCount: 'auto', barMobile: 'drawer', mobileLayout: 'cards', summary: true, filtersApplied: false, exportAction: true, sort: true, rowActions: 'inline', pagination: 'inside' },
  argTypes: { /* copy the argTypes block verbatim from the former PaginaDeListadoPlayground, translating `description` strings to English */ },
  render: (args) => <ListPagePlayground {...args} />,
};
export const Full: StoryObj = { render: () => <FullListPage /> };
```

Copy the argTypes block from `Filters.stories.tsx:129-140` and translate each `description` to English (e.g. `layout`: "How much to hide: inline (all, wraps) · collapse (first N, only when the set does not fit one line) · drawer (all behind the funnel; search pinned; applied values as chips)").

- [ ] **Step 3: Point Register at the fixture**

In `src/components/Register.stories.tsx` replace line 3 with `import { ListPagePlayground } from './__fixtures__/listPage';`, line 5 with `export default { title: 'Internal/Register', tags: ['autodocs'] } as Meta;`, every `<PaginaDeListadoPlayground` with `<ListPagePlayground`, and rename `export const Registro` → `export const Register`, `name: 'Playground · registro'` → `name: 'Playground · register'`.

- [ ] **Step 4: Remove the moved stories from `Filters.stories.tsx`** (`PaginaDeListadoPlayground`, `ListadoCompleto`, `ListPageArgs`, and their now-unused imports).

- [ ] **Step 5: Gates** (exclude the guard: `npx vitest run --exclude tests/StoriesMeta.test.tsx > /tmp/vitest.log 2>&1; echo "vitest=$?"`), lint, typecheck, build-storybook.

- [ ] **Step 6: Commit**

```bash
git add src/components/__fixtures__/listPage.tsx src/components/ListPage.stories.tsx src/components/Register.stories.tsx src/components/Filters.stories.tsx
git commit -m "docs(storybook): list page pattern owns the playground; register imports a fixture, not a story"
```

---

### Task 4: Split `Display.stories.tsx` into Card, Badge, Alert, Skeleton, Spinner, Chip, ProductCard

**Files:**
- Delete: `src/components/Display.stories.tsx` (559 lines)
- Create: `src/components/Card.stories.tsx`, `Badge.stories.tsx`, `Alert.stories.tsx`, `Skeleton.stories.tsx`, `Spinner.stories.tsx`, `Chip.stories.tsx`, `ProductCard.stories.tsx`

**Interfaces:** imports stay `from './Display'` (Fase 3 updates them).

- [ ] **Step 1: Create the seven files.** Story moves (old export → new file / new name):

| New file | title | component | args (Default) | argTypes | Stories moved (old → new) |
|---|---|---|---|---|---|
| Card | Components/Card | Card | `{ children: 'Pedido #1042' }` | `variant: inline-radio ['default','inset']`, `interactive: boolean` | CardBasica→Default (render, keeps header/body/footer), CardRegistros→Registers, CardInset→Inset, SuperficiesPlayground→SurfacesPlayground, CardConAccent→WithAccent, CategoricalAccents→CategoricalAccents, CardComoLink→AsLink, CardAsChildLink→AsChildLink |
| Badge | Components/Badge | Badge | `{ variant: 'neutral', children: 'Pendiente' }` | `variant: select [primary, accent, success, warning, danger, info, neutral]`, `tone: inline-radio [data, label]`, `appearance: inline-radio [soft, solid, outline]`, `dot`, `pulse` | Badges→Variants, BadgeRegisters→Registers, BadgeAppearances→Appearances, BadgePulse→Pulse, BadgePlayground→Playground |
| Alert | Components/Alert | Alert | `{ variant: 'info', children: 'El pedido se guardó.' }` | `variant: select` (read the union in `Display.tsx:156` area) | Alerts→Variants |
| Skeleton | Components/Skeleton | Skeleton | `{ width: 160, height: 16 }` (check `SkeletonProps` at `Display.tsx:175-181` for the real prop names) | — | Skeletons→Default, SkeletonSobreTresNiveles→OnThreeTiers |
| Spinner | Components/Spinner | Spinner | `{ size: 'md' }` (check `SpinnerProps`) | `size` | Spinners→Sizes |
| Chip | Components/Chip | Chip, `subcomponents: { ChipGroup }` | `{ children: 'Taladro' }` | — | Chips→Default |
| ProductCard | Components/ProductCard | ProductCard | read `ProductCardProps` at `Display.tsx:245-259`: name 'Taladro percutor 650W', price via `formatCurrency(45990)` | — | ProductCardDemo→Default |

For each file use the template from the header. Example `Badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Display';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { variant: 'neutral', children: 'Pendiente', tone: 'data', appearance: 'soft' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] },
    tone: { control: 'inline-radio', options: ['data', 'label'] },
    appearance: { control: 'inline-radio', options: ['soft', 'solid', 'outline'] },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Variants: Story = {
  render: (a) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge {...a} variant="primary">Primary</Badge>
      <Badge {...a} variant="accent">Accent</Badge>
      <Badge {...a} variant="success" dot>Activo</Badge>
      <Badge {...a} variant="warning">Pendiente</Badge>
      <Badge {...a} variant="danger">Vencido</Badge>
      <Badge {...a} variant="info">Nuevo</Badge>
      <Badge {...a} variant="neutral">Neutral</Badge>
    </div>
  ),
};
// Registers, Appearances, Pulse, Playground: body copied from Display.stories.tsx lines 321-420 with the render props spread `{...a}`.
```

Fixtures to neutralize while moving (inventory I5: 6 hits in this file): grep the old file for `El Alba|Ferreter|RUT|\$ ?[0-9]` and replace with "Northwind Builders" / "Pedido #1042" / `formatCurrency(...)`.

- [ ] **Step 2: Delete the old file**

Run: `git rm -q src/components/Display.stories.tsx`

- [ ] **Step 3: Gates** (lint, typecheck, vitest without guard, build-storybook). Open `http://localhost:6006/?path=/docs/components-badge--docs` and confirm the props table renders with controls.

- [ ] **Step 4: Commit**

```bash
git add src/components/*.stories.tsx
git commit -m "docs(storybook): split display stories into card, badge, alert, skeleton, spinner, chip, product card"
```

---

### Task 5: Split `Display2.stories.tsx` into Avatar, Stat, Menu (+ Menu play)

**Files:**
- Delete: `src/components/Display2.stories.tsx`
- Create: `src/components/Avatar.stories.tsx`, `Stat.stories.tsx`, `Menu.stories.tsx`

- [ ] **Step 1: Create the files**

| New file | title | component | args (Default) | argTypes | Stories moved |
|---|---|---|---|---|---|
| Avatar | Components/Avatar | Avatar, `subcomponents: { AvatarGroup }` | `{ name: 'Satoru Gojo', size: 32, shape: 'circle' }` | `size: inline-radio [24,32,40,48]`, `shape: inline-radio [circle, square]`, `status` (read `AvatarProps` at `Display2.tsx:11`) | Avatares→Default, GrupoDeAvatares→Group |
| Stat | Components/Stat | Stat | `{ label: 'Pedidos hoy', value: '128', delta: 12 }` | `align: inline-radio [start, center, end]` | StatBasico→Default, StatDeltaInvertYLegacy→DeltaInvertAndLegacy |
| Menu | Components/Menu | Menu | `{ trigger: <Button variant="outline">Acciones</Button>, items: MENU_ITEMS, align: 'start' }` | `align: inline-radio [start, end]` | MenuContextual→Default |

`Menu.stories.tsx` with the interaction test:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Menu, type MenuProps } from './Display2';
import { Button } from './Button';
import { Edit, Trash } from './Icons';

// Hoisted: items hold React elements.
const MENU_ITEMS: MenuProps['items'] = [
  { label: 'Editar', icon: <Edit size={16} />, shortcut: '⌘E' },
  { label: 'Duplicar' },
  { type: 'separator' },
  { label: 'Eliminar', icon: <Trash size={16} />, destructive: true },
];

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  args: { trigger: <Button variant="outline">Acciones</Button>, items: MENU_ITEMS, align: 'start' },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Acciones' });
    await userEvent.click(trigger);
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(menu).getAllByRole('menuitem')[1]).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};
```

If the menu is not portaled, `within(canvasElement).findByRole('menu')` works too; keep `document.body` (works in both cases).

- [ ] **Step 2:** `git rm -q src/components/Display2.stories.tsx`
- [ ] **Step 3: Gates** + open `?path=/story/components-menu--keyboard-navigation` and check the Interactions panel is green.
- [ ] **Step 4: Commit** — `docs(storybook): split display2 stories into avatar, stat, menu with keyboard play`

---

### Task 6: Split `Display3.stories.tsx` into UserCell, StatusIndicator, Timeline, Tree, Calendar

**Files:**
- Delete: `src/components/Display3.stories.tsx` (284 lines, 7 fixture hits)
- Create: `UserCell.stories.tsx`, `StatusIndicator.stories.tsx`, `Timeline.stories.tsx`, `Tree.stories.tsx`, `Calendar.stories.tsx`

- [ ] **Step 1: Create the files**

| New file | title | component | args (Default) | Stories moved |
|---|---|---|---|---|
| UserCell | Components/UserCell | UserCell | `{ name: 'Satoru Gojo', meta: 'satoru@example.com' }` (read `UserCellProps` at `Display3.tsx:10-18`) | UserCellDemo→Default |
| StatusIndicator | Components/StatusIndicator | StatusIndicator | `{ status: 'success', label: 'Activo' }` (read props at `:30-40`) | StatusIndicators→Variants |
| Timeline | Components/Timeline | Timeline, `subcomponents: { TimelineItem }` | `{ items: TIMELINE_ITEMS }` hoisted | TimelineDemo→Default, TimelineNumeric→Numeric (`name: '#2 Numeric'` → drop the `#2`), TimelineCompact→Compact, TimelineEventTyped→EventTyped, TimelinePayload→Payload, TimelineMilestoneTones→MilestoneTones, CicloDePedidoPlayground→OrderLifecyclePlayground (`name: 'Playground · order lifecycle'`) |
| Tree | Components/Tree | Tree | `{ nodes: TREE_NODES }` hoisted; nodes: "Northwind Builders" › "Sucursal Centro" › "Bodega A" | TreeDemo→Default |
| Calendar | Components/Calendar | Calendar | `{ value: new Date(2026, 8, 16) }` | CalendarDemo→Default |

Fixtures: replace "despacho" / "guía" / "El Alba" in timeline copy with "Pedido #1042 creado", "Pedido #1042 pagado", "Pedido #1042 entregado".

- [ ] **Step 2:** `git rm -q src/components/Display3.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): split display3 stories into user cell, status indicator, timeline, tree, calendar`

---

### Task 7: Split `Form.stories.tsx` into the form controls

**Files:**
- Delete: `src/components/Form.stories.tsx` (105 lines)
- Create: `Input.stories.tsx`, `Textarea.stories.tsx`, `Select.stories.tsx`, `Checkbox.stories.tsx`, `Radio.stories.tsx`, `Switch.stories.tsx`, `Label.stories.tsx`, `FormField.stories.tsx`, `InputGroup.stories.tsx`, `PasswordInput.stories.tsx`

- [ ] **Step 1: Create the ten files**

| New file | title | component | args (Default) | Stories moved |
|---|---|---|---|---|
| Input | Components/Input | Input | `{ placeholder: 'Buscar pedido…' }` | InputBasico→Default, InputInvalido→Invalid (`args: { invalid: true }`), InputPlayground→Playground |
| Textarea | Components/Textarea | Textarea | `{ placeholder: 'Notas del pedido' }` | TextareaBasico→Default |
| Select | Components/Select | Select | `{ children: <><option>Pendiente</option><option>Pagado</option></> }` (hoist the options node to a `const OPTIONS`) | SelectBasico→Default |
| Checkbox | Components/Checkbox | Checkbox | `{ label: 'Enviar factura' }` (check `CheckboxProps` at `Form.tsx:80-86`) | CheckboxYRadio→ split: Checkbox part → Default |
| Radio | Components/Radio | Radio | `{ name: 'tipo', label: 'Retiro en tienda' }` | CheckboxYRadio→ Radio part → Default |
| Switch | Components/Switch | Switch | `{ label: 'Notificaciones' }` | SwitchBasico→Default |
| Label | Components/Label | Label | `{ children: 'Nombre', htmlFor: 'name' }` | (new) Default |
| FormField | Components/FormField | FormField | `{ label: 'Correo', hint: 'Usamos tu correo para la factura', children: <Input id="email" /> }` (hoist) | FormFieldCompleto→Complete, FormFieldConError→WithError |
| InputGroup | Components/InputGroup | InputGroup, `subcomponents: { InputGroupAddon }` | render | InputGroupConPrefijo→WithPrefix |
| PasswordInput | Components/PasswordInput | PasswordInput | `{ placeholder: 'Contraseña' }` | PasswordConToggle→WithToggle → rename to Default |

- [ ] **Step 2:** `git rm -q src/components/Form.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): one story file per form control`

---

### Task 8: Split `Inputs.stories.tsx` into NumberInput, Pagination, EmptyState

**Files:**
- Delete: `src/components/Inputs.stories.tsx` (87 lines)
- Create: `NumberInput.stories.tsx`, `Pagination.stories.tsx`, `EmptyState.stories.tsx`

- [ ] **Step 1: Create the files.** `KpiBasico` is dropped (component deprecated, removed in Fase 3).

| New file | title | component | args (Default) | argTypes | Stories moved |
|---|---|---|---|---|---|
| NumberInput | Components/NumberInput | NumberInput | `{ value: 3, min: 0, max: 99, size: 'md' }` with a module-scope stateful wrapper as `render` | `size: inline-radio [sm, md]` | NumberInputBasico→Default, NumberInputFullWidth→FullWidth, NumberInputTamanos→Sizes (`name: 'Sizes · sm vs md'`), NumberInputPlayground→Playground |
| Pagination | Components/Pagination | Pagination | `{ page: 2, pageCount: 12 }` (read `PaginationProps` at `Inputs.tsx:90-99`) | — | PaginationBasico→Default |
| EmptyState | Components/EmptyState | EmptyState | `{ title: 'Sin pedidos', description: 'Crea el primer pedido para verlo aquí.' }` | — | EmptyBasico→Default |

Stateful wrapper pattern (module scope):

```tsx
function Controlled(args: NumberInputProps) {
  const [v, setV] = React.useState<number | null>(args.value ?? 0);
  return <NumberInput {...args} value={v} onChange={setV} />;
}
export const Default: Story = { render: (a) => <Controlled {...a} /> };
```

- [ ] **Step 2:** `git rm -q src/components/Inputs.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): split inputs stories into number input, pagination, empty state`

---

### Task 9: Split `InputsExtra.stories.tsx`

**Files:**
- Delete: `src/components/InputsExtra.stories.tsx` (164 lines, 4 fixture hits)
- Create: `Slider.stories.tsx`, `Progress.stories.tsx`, `TagInput.stories.tsx`, `MoneyInput.stories.tsx`, `PhoneInput.stories.tsx`, `TimePicker.stories.tsx`, `RadioGroup.stories.tsx`, `CheckboxGroup.stories.tsx`

- [ ] **Step 1: Create the files**

| New file | title | component | args (Default) | Stories moved |
|---|---|---|---|---|
| Slider | Components/Slider | Slider | `{ value: 40, min: 0, max: 100 }` stateful wrapper | SliderBasico→Default |
| Progress | Components/Progress | Progress, `subcomponents: { ProgressCircle }` | `{ value: 60 }` | ProgressLineal→Default, ProgressCircular→Circular |
| TagInput | Components/TagInput | TagInput | `{ value: ['Taladro', 'Sierra'] }` stateful | TagInputDemo→Default |
| MoneyInput | Components/MoneyInput | MoneyInput | `{ value: 45990, currency: 'USD', locale: 'en-US', liveFormat: true }` stateful; argTypes `currency: inline-radio ['USD','EUR','CLP','MXN']`, `locale: inline-radio ['en-US','es-CL','es-MX','de-DE']` | MoneyInputCLP→Currency (the story shows the `currency` control; `Default` uses the brand default by omitting `currency`/`locale`) |
| PhoneInput | Components/PhoneInput | PhoneInput | `{ prefix: '+1' }` stateful | PhoneInputCL→Default |
| TimePicker | Components/TimePicker | TimePicker | `{ value: '09:30' }` stateful | TimePickerDemo→Default, TimePickerGranularity→Granularity |
| RadioGroup | Components/RadioGroup | RadioGroup | `{ name: 'envio', options: RADIO_OPTIONS, value: 'retiro' }` hoisted | RadioGroupDemo→Default |
| CheckboxGroup | Components/CheckboxGroup | CheckboxGroup | `{ options: CHECK_OPTIONS, value: ['factura'] }` hoisted | CheckboxGroupDemo→Default |

- [ ] **Step 2:** `git rm -q src/components/InputsExtra.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): split advanced inputs stories into one file per control`

---

### Task 10: Split `Pickers.stories.tsx` (Combobox with play)

**Files:**
- Delete: `src/components/Pickers.stories.tsx` (253 lines)
- Create: `Combobox.stories.tsx`, `DatePicker.stories.tsx`, `FileUpload.stories.tsx`, `YearPicker.stories.tsx`, `MonthPicker.stories.tsx`, `CalendarView.stories.tsx`

- [ ] **Step 1: Create the files**

| New file | title | component | Stories moved |
|---|---|---|---|
| Combobox | Components/Combobox | Combobox | ComboboxBasico→Default, ComboboxConSeleccion→WithSelection, ComboboxAsync→Async, ComboboxSinInput→WithoutInput, ComboboxRenderOption→RenderOption, + new `SelectByTyping` (play) |
| DatePicker | Components/DatePicker | DatePicker | DatePickerBasico→Default, DatePickerDiasDeshabilitados→DisabledDays, DatePickerFormatos→Formats |
| FileUpload | Components/FileUpload | FileUpload | FileUploadBasico→Default |
| YearPicker | Components/YearPicker | YearPicker | YearPickerBasico→Default |
| MonthPicker | Components/MonthPicker | MonthPicker | MonthPickerBasico→Default |
| CalendarView | Components/CalendarView | CalendarView (`import { CalendarView } from './CalendarView'`) | CalendarioPlayground→Playground (`name: 'Playground · calendar'`) |

`Combobox.stories.tsx`:

```tsx
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Combobox, type ComboboxProps } from './Pickers';

const OPTIONS = [
  { value: 'taladro', label: 'Taladro percutor' },
  { value: 'sierra', label: 'Sierra circular' },
  { value: 'lijadora', label: 'Lijadora orbital' },
];

function Controlled(args: ComboboxProps<string>) {
  const [v, setV] = React.useState<string | null>(args.value ?? null);
  return <Combobox {...args} value={v} onChange={setV} />;
}

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: { value: null, options: OPTIONS, placeholder: 'Buscar producto…', searchable: true },
  argTypes: { searchable: { control: 'boolean' }, loading: { control: 'boolean' } },
  render: (a) => <Controlled {...a} />,
} satisfies Meta<typeof Combobox<string>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSelection: Story = { args: { value: 'sierra' } };
export const WithoutInput: Story = { args: { searchable: false } };

export const SelectByTyping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'sie');
    const option = await within(document.body).findByRole('option', { name: /Sierra circular/ });
    await userEvent.click(option);
    await expect(input).toHaveValue('Sierra circular');
    await expect(within(document.body).queryByRole('listbox')).toBeNull();
  },
};
// Async, RenderOption: bodies copied from Pickers.stories.tsx (ComboboxAsync at ~L60, ComboboxRenderOption at ~L95) with `render` wrappers hoisted to module scope.
```

If `Combobox` renders `role="combobox"` on a wrapper instead of the input, use `canvas.getByRole('textbox')` for the typing steps; verify against `src/components/Pickers.tsx:78-200` before writing.

- [ ] **Step 2:** `git rm -q src/components/Pickers.stories.tsx`
- [ ] **Step 3: Gates** + Interactions panel green on `components-combobox--select-by-typing`.
- [ ] **Step 4: Commit** — `docs(storybook): split pickers stories; combobox typing interaction test`

---

### Task 11: Split `AdvancedPickers.stories.tsx`

**Files:**
- Delete: `src/components/AdvancedPickers.stories.tsx` (162 lines)
- Create: `MultiCombobox.stories.tsx`, `DateRangePicker.stories.tsx`, `CommandPalette.stories.tsx`

- [ ] **Step 1: Create the files**

| New file | title | component | Stories moved |
|---|---|---|---|
| MultiCombobox | Components/MultiCombobox | MultiCombobox | MultiSeleccion→Default, MultiSeleccionConInactivos→WithInactiveValues (`name: 'Value outside options'`) |
| DateRangePicker | Components/DateRangePicker | DateRangePicker | RangoDeFechas→Default, RangoReporte→ReportRange (`name: 'Report range'`), RangoDeFechasModoAplicar→ApplyMode (`name: 'Apply mode'`) |
| CommandPalette | Components/CommandPalette | CommandPalette | PaletaDeComandos→Default |

Args: `MultiCombobox` `{ value: [], options: OPTIONS }` stateful; `DateRangePicker` `{ value: null }` stateful; `CommandPalette` `{ open: true, commands: COMMANDS }` hoisted (commands: "Nuevo pedido", "Buscar producto", "Ir a reportes").

- [ ] **Step 2:** `git rm -q src/components/AdvancedPickers.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): split advanced pickers stories into multi combobox, date range picker, command palette`

---

### Task 12: Split `Layout.stories.tsx` and `Primitives.stories.tsx`

**Files:**
- Delete: `src/components/Layout.stories.tsx` (328 lines), `src/components/Primitives.stories.tsx`
- Create: `Tabs.stories.tsx`, `Table.stories.tsx`, `Tooltip.stories.tsx`, `Separator.stories.tsx`, `Stack.stories.tsx`, `Container.stories.tsx`, `Grid.stories.tsx`, `Cluster.stories.tsx`, `Spacer.stories.tsx`, `KeyValue.stories.tsx`, `ListGroup.stories.tsx`, `Stepper.stories.tsx`, `SectionHeader.stories.tsx`

- [ ] **Step 1: Create the files**

| New file | title | component | Stories moved |
|---|---|---|---|
| Tabs | Components/Tabs | Tabs, `subcomponents: { TabList, Tab, TabPanel }` | TabsBasicos→Default, TabsVariantes→Variants |
| Table | Components/Table | Table (`Layout.tsx:124`, plain semantic table) | new `Default` (3 columns: Producto, Cantidad, Total via `formatCurrency`) |
| Tooltip | Components/Tooltip | Tooltip | TooltipBasico→Default, TooltipLargo→LongContent, TooltipEnContextoSticky→InStickyContext |
| Separator | Components/Separator | Separator (from `./Primitives`) | Primitives Horizontal→Horizontal, Vertical→Vertical, NoDecorativo→Semantic; Layout DividerHorizontal/DividerVertical → dropped (`Divider` is a deprecated alias, removed in Fase 3) |
| Stack | Components/Stack | Stack, `subcomponents: { HStack, VStack }` | StackHorizontal→Horizontal, StackVertical→Vertical |
| Container | Components/Container | Container | ContainerDemo→Default |
| Grid | Components/Grid | Grid | GridDemo→Default, GridResponsive→Responsive |
| Cluster | Components/Cluster | Cluster | ClusterDemo→Default |
| Spacer | Components/Spacer | Spacer | SpacerDemo→Default |
| KeyValue | Components/KeyValue | KeyValue, `subcomponents: { KeyValueRow }` | KeyValueDemo→Default (rows: "Pedido", "#1042"; "Cliente", "Satoru Gojo"; "Total", `formatCurrency(45990)`) |
| ListGroup | Components/ListGroup | ListGroup, `subcomponents: { ListGroupItem }` | ListGroupDemo→Default |
| Stepper | Components/Stepper | Stepper | StepperBasico→Default |
| SectionHeader | Components/SectionHeader | SectionHeader | SectionHeaderDemo→Default |

Fixtures (4 hits): replace any "Ferretería"/RUT rows in KeyValue/Table with the values above.

- [ ] **Step 2:** `git rm -q src/components/Layout.stories.tsx src/components/Primitives.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): one story file per layout primitive`

---

### Task 13: Split `DataTable.stories.tsx` (DataTable with sort play, Accordion, Breadcrumbs)

**Files:**
- Modify: `src/components/DataTable.stories.tsx` (616 lines → DataTable only)
- Create: `Accordion.stories.tsx`, `Breadcrumbs.stories.tsx`

- [ ] **Step 1: Retitle and add meta to `DataTable.stories.tsx`**

Replace the default export with:

```tsx
const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  subcomponents: { TablePagination, TableToolbar, ColumnToggle },
  tags: ['autodocs'],
  args: { rows: ROWS, columns: COLUMNS, rowKey: 'id', density: 'compact' },
  argTypes: { density: { control: 'inline-radio', options: ['compact', 'comfortable'] }, mobileLayout: { control: 'inline-radio', options: ['cards', 'table'] } },
} satisfies Meta<typeof DataTable>;
export default meta;
type Story = StoryObj<typeof meta>;
```

where `ROWS`/`COLUMNS` are the file's existing base fixture (hoisted; rows "Pedido #1042"…, customer "Satoru Gojo"; replace the 5 company hits). Renames: DataTableBasica→Default (`{}`), TruncadoPorColumna→TruncatePerColumn, Virtualizada→Virtualized, ConVisibilidadDeColumnas→ColumnVisibility, ConToolbar→WithToolbar, StickyHeader→StickyHeader, StickyHeaderEnModal→StickyHeaderInModal (`name: 'Sticky header in Modal (single scroll)'`), ColumnaAccionAlineada→AlignedActionColumn, CardLayoutMobile→CardLayoutMobile, PaginacionCompleta→FullPagination, PaginacionSimple→SimplePagination, DataTableConPaginacion→WithPagination, DataTablePlayground→Playground, RegionDeScrollPlayground→ScrollRegionPlayground (`name: 'Playground · scroll region'`). Move `AccordionBasico` and `BreadcrumbsBasico` out (Step 2).

Add the sort interaction:

```tsx
function SortableTable(args: React.ComponentProps<typeof DataTable>) {
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  return <DataTable {...args} sort={sort} onSortChange={setSort} />;
}

export const SortToggle: Story = {
  args: { columns: COLUMNS.map((c) => (c.key === 'total' ? { ...c, sortable: true } : c)) },
  render: (a) => <SortableTable {...a} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: /Total/ });
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  },
};
```

- [ ] **Step 2: Create `Accordion.stories.tsx` and `Breadcrumbs.stories.tsx`**

| New file | title | component | args |
|---|---|---|---|
| Accordion | Components/Accordion | Accordion, `subcomponents: { AccordionItem }` | render from AccordionBasico → Default |
| Breadcrumbs | Components/Breadcrumbs | Breadcrumbs | `{ items: [{ label: 'Inicio', href: '#' }, { label: 'Pedidos', href: '#' }, { label: 'Pedido #1042' }] }` (read `BreadcrumbItem` at `DataTable.tsx:920`) → Default |

- [ ] **Step 3: Gates** + Interactions green on `components-datatable--sort-toggle`.
- [ ] **Step 4: Commit** — `docs(storybook): datatable meta with args and sort interaction; accordion and breadcrumbs stories`

---

### Task 14: Split `Overlay.stories.tsx` (Modal with play, Drawer)

**Files:**
- Delete: `src/components/Overlay.stories.tsx`
- Create: `Modal.stories.tsx`, `Drawer.stories.tsx`

- [ ] **Step 1: Create the files**

`Modal.stories.tsx`:

```tsx
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Modal, type OverlayProps } from './Overlay';
import { Button } from './Button';

function Launcher(args: OverlayProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: { open: false, onClose: () => {}, title: 'Confirmar pedido', size: 'md', children: 'Se enviará el Pedido #1042 a Sucursal Centro.' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (a) => <Launcher {...a} />,
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoColumnGrid: Story = { /* body of former ModalGridDosColumnas */ };

export const EscapeClosesAndRestoresFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Abrir modal' });
    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};
```

If the exit animation keeps the dialog mounted for `EXIT_MS`, replace the `queryByRole` line with `await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());` (`waitFor` also comes from `@storybook/test`).

`Drawer.stories.tsx`: same `Launcher` pattern with `Drawer`, title `Components/Drawer`, DrawerLateral→Default.

- [ ] **Step 2:** `git rm -q src/components/Overlay.stories.tsx`
- [ ] **Step 3: Gates** + Interactions green.
- [ ] **Step 4: Commit** — `docs(storybook): modal and drawer stories; escape and focus restore interaction`

---

### Task 15: Split Charts, Code, Metrics

**Files:**
- Modify: `src/components/Charts.stories.tsx` → keep as `Components/Charts` with `component: LineChart` and `subcomponents: { AreaChart, BarChart, DonutChart, Sparkline }`
- Delete: `src/components/Code.stories.tsx`, `src/components/Metrics.stories.tsx`
- Create: `CodeBlock.stories.tsx`, `JsonViewer.stories.tsx`, `DeltaBadge.stories.tsx`, `StatCard.stories.tsx`, `Meter.stories.tsx`, `Sparkbar.stories.tsx`, `ProportionBar.stories.tsx`, `BulletChart.stories.tsx`, `CalendarHeatmap.stories.tsx`

- [ ] **Step 1: Charts** — one file (charts share the injected `recharts` prop): meta `title: 'Components/Charts'`, `component: LineChart`, args `{ data: SERIES, recharts: Recharts }` (`import * as Recharts from 'recharts'`, hoisted `SERIES`). Renames: SinDatos→Empty, Linea→Line, Area→Area, Barras→Bars, BarrasSinTabStop→BarsNoTabStop, BarrasHorizontal→HorizontalBars, BarrasConteo→CountBars, Decimales→Decimals, LineaDensa→DenseLine, Donut→Donut, SparklineDemo→Sparkline.

- [ ] **Step 2: Code** — `CodeBlock.stories.tsx` (`Components/CodeBlock`, args `{ code: 'npm install @misael703/ui', language: 'bash' }`; CodeBlockDemo→Default, CodeBlockSinHeader→NoHeader) and `JsonViewer.stories.tsx` (`Components/JsonViewer`, args `{ value: { id: 1042, customer: 'Satoru Gojo' } }`; JsonViewerDemo→Default). Replace the 1 company hit.

- [ ] **Step 3: Metrics** — seven files, titles `Components/<Name>`, `component` each; Default args: DeltaBadge `{ value: 12 }`; StatCard `{ label: 'Pedidos hoy', value: '128', delta: 12 }`; Meter `{ value: 64, max: 100 }`; Sparkbar `{ values: [3,5,2,8,6] }`; ProportionBar `{ segments: SEGMENTS }`; BulletChart `{ value: 72, target: 80 }`; CalendarHeatmap `{ values: HEAT }`. Read each `*Props` interface in `Metrics.tsx` (lines 42, 97, 177, 231, 280, 340, 405) for the exact prop names before writing. Old `Dashboard` showcase → `StatCard.stories.tsx` as `DashboardPlayground`. Replace the 3 company hits.

- [ ] **Step 4:** `git rm -q src/components/Code.stories.tsx src/components/Metrics.stories.tsx`
- [ ] **Step 5: Gates.**
- [ ] **Step 6: Commit** — `docs(storybook): charts meta; code block, json viewer and metric components get their own stories`

---

### Task 16: Split Commerce, Marketing, Permissions, Editing, Comments, Gallery, Filters

**Files:**
- Delete: `Commerce.stories.tsx`, `Marketing.stories.tsx`, `Permissions.stories.tsx`, `Editing.stories.tsx`, `Comments.stories.tsx`, `Gallery.stories.tsx`
- Modify: `Filters.stories.tsx` → `FilterBar.stories.tsx` (rename with `git mv`)
- Create: `Rating`, `PriceDisplay`, `QuantitySelector`, `VariantSelector`, `WishlistButton`, `PromoCodeInput`, `FreeShippingProgress`, `CartDrawer`, `OrderSummary`, `AddressForm`, `CompareTable`, `Hero`, `Testimonial`, `CategoryNav`, `PermissionMatrix`, `ConfirmDialog`, `DescriptionList`, `DiffViewer`, `TransferList`, `EditableCell`, `CommentThread`, `AttachmentList`, `ImageGallery`, `Lightbox`, `FilterPanel`, `BulkActionBar`, `SortDropdown` (each `<Name>.stories.tsx`)

- [ ] **Step 1: Create the files.** Title `Components/<Name>`, `component: <Name>`, `Default` with args. Renames: every `XDemo` → `Default`; `AttachmentVacio` → `Empty`; `HeroBrand/HeroImage/HeroSubtle` → `Brand/Image/Subtle` in `Hero.stories.tsx`; `CommentThreadInline` → `Inline`; `LightboxViewer` → `Default` in `Lightbox.stories.tsx`; Gallery `Default/ThumbsLeft` → `ImageGallery.stories.tsx` `Default/ThumbsLeft`; `Filters.stories.tsx` keeps `FilterBar` stories only (title `Components/FilterBar`, `subcomponents: { FilterField }`), `FilterPanelDemo` → `FilterPanel.stories.tsx` (`subcomponents: { FilterSection }`), `BulkActionBarDemo` → `BulkActionBar.stories.tsx`, `SortDropdownDemo` → `SortDropdown.stories.tsx`.

Fixtures (Commerce 8 hits, Marketing 3, Comments 3, Editing 2): products "Taladro percutor 650W" / "Sierra circular 7¼"", prices `formatCurrency(45990)`, `formatCurrency(89990)`; shipping threshold `formatCurrency(50000)`; address "Av. Ejemplo 123, Sucursal Centro"; comments by "Satoru Gojo"; no `$3.500` literals.

`ConfirmDialog` uses the `Launcher` pattern from Task 14 (module-scope wrapper with `open` state).

- [ ] **Step 2:** `git mv src/components/Filters.stories.tsx src/components/FilterBar.stories.tsx; git rm -q src/components/{Commerce,Marketing,Permissions,Editing,Comments,Gallery}.stories.tsx`
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): one story file per commerce, marketing, editing, comments, gallery and filter component`

---

### Task 17: Retitle single-component files and rename Spanish stories

**Files (modify each):** `AppShell` (title done in Task 1; add `PageHeader.stories.tsx`), `AspectRatio`, `Button`, `Carousel`, `Collapsible`, `ContextMenu`, `HoverCard`, `Icons`, `InputOTP`, `Logo`, `Menubar`, `NavigationMenu`, `Notifications`, `Popover`, `Resizable`, `ScrollArea`, `TimeAgo`, `Toast`, `Toggle`, `UserMenu`, `Crud`, `FloatingPortal`.

- [ ] **Step 1: Apply per file**

| File | New title | `component:` | Story renames / notes |
|---|---|---|---|
| AspectRatio | Components/AspectRatio | AspectRatio (from `./Primitives`) | args `{ ratio: 16/9 }`; add `Default` |
| Button | Components/Button | (has) | `Primary`→`Default`; translate the four Spanish JSDoc comments (PrimaryVsSecondary, Grouped, AsChildLink) to English |
| Carousel | Components/Carousel | Carousel | Basico→Default |
| Collapsible | Components/Collapsible | Collapsible, `subcomponents: { CollapsibleTrigger, CollapsibleContent }` | Basico→Default, FiltrosAvanzados→AdvancedFilters, Controlado→Controlled |
| ContextMenu | Components/ContextMenu | ContextMenu | Basico→Default |
| HoverCard | Components/HoverCard | HoverCard | Basico→Default, ConDelay→WithDelay |
| Icons | Foundations/Icons | keep no component (exempt: add `title: 'Foundations/Icons'` to the guard's exempt regex — extend `EXEMPT_TITLES` to `/title:\s*'(Internal|Blocks|Foundations)\//`) | Galeria→Gallery, Tamanos→Sizes, ColorHeredado→InheritedColor |
| InputOTP | Components/InputOTP | InputOTP | Basico→Default, Cuatro→FourDigits, Texto→Alphanumeric, Invalido→Invalid |
| Logo | Components/Logo | (has) | SobreFondoOscuro→OnDarkBackground, TodasLasVariantes→AllVariants, InspeccionDeArchivos→FileInspection, TamanosCustom→CustomSizes; JSDoc to English; description says "renders the configured brand's logo files (`configureBrand({ logoBasePath })`); the example preset ships El Alba's" |
| Menubar | Components/Menubar | Menubar | Basico→Default |
| NavigationMenu | Components/NavigationMenu | NavigationMenu | Basico→Default |
| Notifications | Components/NotificationCenter | NotificationCenter | ConNotificaciones→WithItems, Vacio→Empty; `git mv` to `NotificationCenter.stories.tsx` |
| Popover | Components/Popover | Popover | Basico→Default, Placements→Placements, Controlado→Controlled |
| Resizable | Components/Resizable | Resizable, `subcomponents: { ResizablePanel, ResizableHandle }` | — |
| ScrollArea | Components/ScrollArea | ScrollArea (from `./Primitives`) | Ambos→Both |
| TimeAgo | Components/TimeAgo | TimeAgo, `subcomponents: { TimeAgoDate }` | Casos→Cases, SoloFecha→DateOnly |
| Toast | Components/Toast | ToastProvider (export in `Toast.tsx`; `component` is the provider, `Default` renders a trigger that calls `useToast`) | Demo_→Default |
| Toggle | Components/Toggle + new `SegmentedControl.stories.tsx` (Components/SegmentedControl) | Toggle, `subcomponents: { ToggleGroup, ToggleGroupItem }` / SegmentedControl, `subcomponents: { SegmentedControlItem }` | ToggleSimple→Default, Variantes→Variants, ToggleGroupSingle→GroupSingle, ToggleGroupMultiple→GroupMultiple, TogglePlayground→Playground; SegmentedControlDemo→Default, ViewSwitcherIcons→ViewSwitcherIcons (`name: 'View switcher (icons)'`) |
| UserMenu | Components/UserMenu | UserMenu | Basico→Default, ConIconos→WithIcons, ConLinks→WithLinks, AvatarPropio→CustomAvatar, Compacto→Compact, PlacementYAlign→PlacementAndAlign, EnTopbar→InTopbar; `name:` overrides L58/83/111/138/167/204 to English |
| Crud | Patterns/CRUD | (exempt: Patterns is not exempt — add `component: DataTable`) | CrudPlayground→Playground, `name: 'Playground · CRUD'` |
| FloatingPortal | Internal/Floating in overflow | exempt | add three stories `PortalDefault`, `SlotDefault`, `SlottableDefault` rendering `Portal`, `Slot`, `Slottable` from `./Portal` / `./Primitives` (a `<Slot>` merging a class onto an `<a>`; a `<Portal>` rendering a box into `document.body`) — these are the four exports with no story at all (I11) |
| AppShell | (done) | add `PageHeader.stories.tsx`: `Components/PageHeader`, `component: PageHeader`, args `{ title: 'Pedidos', actions: <Button>Nuevo pedido</Button> }` hoisted | Playground, TopbarUncontrolledRenderProp→TopbarUncontrolled, TopbarOnlyNoNav→TopbarOnly, TopbarMobileDrawer→TopbarMobileDrawer; `name:` overrides L253/296/325 stay English |

Also translate every remaining Spanish `name:` override listed in inventory section D and every Spanish JSDoc block above a story in these files.

- [ ] **Step 2: Gates.** Run the guard now: `npx vitest run tests/StoriesMeta.test.tsx > /tmp/guard.log 2>&1; echo "exit=$?"` — expected: still `exit=1` only because of `src/blocks/*` and `src/Foundations.stories.tsx` (Tasks 18-19). Read the failing names to confirm.
- [ ] **Step 3: Commit** — `docs(storybook): english titles and story names for single-component files`

---

### Task 18: Blocks retitle

**Files:** the 16 `src/blocks/*.stories.tsx` (AdminDashboard, AuditLogPage, AuthScreen, AuthSplit, CartDrawer, CheckoutSummary, DataTablePage, DetailPage, EmptyStatePage, ErrorPage, InvoiceDocument, NotFound, NotificationsPage, OnboardingChecklist, ProductCatalog, SettingsPage, WizardPage — 17 if `InvoiceDocument` survived Fase 1 with neutral data; the domain ones are already gone).

- [ ] **Step 1: Rewrite each meta**

```tsx
export default {
  title: 'Blocks/Settings page',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Copy-paste recipe (not shipped). Settings page with a vertical section nav and one form area per section. Source: `src/blocks/SettingsPage.tsx`.' } } },
  tags: ['autodocs'],
} as Meta;
```

Titles: `Blocks/Admin dashboard`, `Blocks/Audit log page`, `Blocks/Auth screen`, `Blocks/Auth split`, `Blocks/Cart drawer`, `Blocks/Checkout`, `Blocks/Data table page`, `Blocks/Detail page`, `Blocks/Empty state page`, `Blocks/Error page`, `Blocks/Invoice document`, `Blocks/Not found`, `Blocks/Notifications page`, `Blocks/Onboarding checklist`, `Blocks/Product catalog`, `Blocks/Settings page`, `Blocks/Wizard page`. Move the existing JSDoc paragraph into `docs.description.component` (English). Remove "Toggle the El Alba preset" sentences (NotFound:6, AuthSplit:7) → "Switch the toolbar preset to see the brand overlay."

- [ ] **Step 2: Update `src/blocks/README.md` index** to the same 16/17 names; delete `docs/BLOCKS.md` if Fase 1 did not already merge it (`git rm -q docs/BLOCKS.md`; README links updated in Fase 1).
- [ ] **Step 3: Gates.**
- [ ] **Step 4: Commit** — `docs(storybook): english block titles with descriptions`

---

### Task 19: Split Foundations into per-topic files with Doc Blocks

**Files:**
- Delete: `src/Foundations.stories.tsx` (868 lines)
- Create: `src/foundations/Colors.stories.tsx`, `Typography.stories.tsx`, `Spacing.stories.tsx`, `Elevation.stories.tsx`, `Motion.stories.tsx`, `Localization.stories.tsx`, `Theming.stories.tsx`
- Modify: `tests/StoriesMeta.test.tsx` (`EXEMPT_TITLES` already includes `Foundations` from Task 17)

- [ ] **Step 1: Colors with `ColorPalette`**

```tsx
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPalette, ColorItem } from '@storybook/blocks';

const meta = { title: 'Foundations/Colors', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

const read = (token: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();

function useTokens(tokens: string[]): Record<string, string> {
  const [map, setMap] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    // Preset/theme decorators mutate <head>/<html> in parent effects: measure next frame and re-measure on mutation.
    const measure = () => requestAnimationFrame(() => setMap(Object.fromEntries(tokens.map((t) => [t, read(t)]))));
    measure();
    const mo = new MutationObserver(measure);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    mo.observe(document.head, { childList: true });
    return () => mo.disconnect();
  }, [tokens]);
  return map;
}

const SCALE = (name: string) => [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => `color-${name}-${s}`);
const BRAND = [...SCALE('primary'), ...SCALE('secondary')];
const SEMANTIC = ['bg-canvas', 'bg-surface', 'bg-subtle', 'bg-muted', 'fg-default', 'fg-muted', 'fg-subtle', 'fg-meta', 'border-default', 'border-strong', 'border-control', 'border-focus'];

function Palette({ tokens, title, subtitle }: { tokens: string[]; title: string; subtitle: string }) {
  const map = useTokens(tokens);
  return (
    <ColorPalette>
      <ColorItem title={title} subtitle={subtitle} colors={Object.fromEntries(tokens.map((t) => [`--${t}`, map[t] ?? '#00000000']))} />
    </ColorPalette>
  );
}

export const Brand: StoryObj = { render: () => <Palette title="Brand scales" subtitle="--color-primary-* / --color-secondary-*" tokens={BRAND} /> };
export const Semantic: StoryObj = { render: () => <Palette title="Semantic tokens" subtitle="backgrounds, foregrounds, borders" tokens={SEMANTIC} /> };
export const Status: StoryObj = { render: () => <Palette title="Status" subtitle="green / yellow / red / info at the 600 step" tokens={['color-success', 'color-warning', 'color-danger', 'color-info']} /> };
export const Categorical: StoryObj = { render: () => <Palette title="Categorical" subtitle="--cat-1…6 (distinguishable, not meaningful)" tokens={[1, 2, 3, 4, 5, 6].flatMap((n) => [`cat-${n}`, `cat-${n}-bg`, `cat-${n}-fg`])} /> };
```

Verify the scale steps that actually exist by `grep -oE '^\s*--color-primary-[0-9]+' src/styles/_root.css | sort -u` and adjust `SCALE`.

- [ ] **Step 2: Typography with `Typeset`**

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Typeset } from '@storybook/blocks';
import { formatCurrency } from '../utils/format';

const meta = { title: 'Foundations/Typography', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

const SIZES = ['11px', '12px', '13px', '14px', '16px', '20px', '25px', '31px', '39px', '49px', '61px', '88px'];
const SAMPLE = 'Pedido #1042 · Northwind Builders';

export const Display: StoryObj = { render: () => <Typeset fontFamily="var(--font-display)" fontSizes={SIZES} fontWeight={600} sampleText={SAMPLE} /> };
export const Body: StoryObj = { render: () => <Typeset fontFamily="var(--font-body)" fontSizes={SIZES.slice(0, 8)} fontWeight={400} sampleText={SAMPLE} /> };
export const Mono: StoryObj = { render: () => <Typeset fontFamily="var(--font-mono)" fontSizes={['12px', '13px', '14px']} fontWeight={400} sampleText={`total: ${formatCurrency(1245000)}`} /> };
// WeightScale, BodyReview: copied from Foundations.stories.tsx L254-420; in BodyReview replace L345 `RUT 76.123.456-7` with `Pedido #1042` and L349 `$1.245.000` with `{formatCurrency(1245000)}`, and the L329 paragraph's company with "Northwind Builders".
// TextTransformRoles: copied from CapsOptOut (L823) — belongs here, not in Theming.
```

- [ ] **Step 3: Remaining files** — `Spacing.stories.tsx` (Spacing L423 + Radii L446 → stories `Spacing`, `Radii`), `Elevation.stories.tsx` (Shadows L466 → `Shadows`; InvertedSurfaces L700 → `InvertedSurfaces`), `Motion.stories.tsx` (L526 → `Easing`, `Durations`), `Localization.stories.tsx` (L730 → `LocaleProvider`), `Theming.stories.tsx` (ExtendingVariants L847 → `ExtendingVariants`; JSDoc mentions `@layer elalba` twice at L845/858 — write "the kit's cascade layer (`@layer elalba`, renamed `ui` in 5.0.0)"; plus a new `PresetSwitch` story: a paragraph telling the reader to use the toolbar Preset control and showing a `Button variant="primary"` + `Badge`). Copy the `SectionTitle`/`SubTitle`/`Caption` helpers into `src/foundations/_helpers.tsx` (not a story file) and import them. Delete the `Logos` story (L594-692) entirely: it is covered by `Components/Logo`.

- [ ] **Step 4:** `git rm -q src/Foundations.stories.tsx`
- [ ] **Step 5: Gates** — now the guard must pass: `npx vitest run > /tmp/vitest.log 2>&1; echo "vitest=$?"` expected `0`.
- [ ] **Step 6: Commit** — `docs(storybook): foundations split by topic using doc blocks; logos story removed`

---

### Task 20: MDX guides

**Files:**
- Create: `src/docs/Introduction.mdx`, `src/docs/GettingStarted.mdx`, `src/docs/Theming.mdx`, `src/docs/Accessibility.mdx`, `src/docs/Hooks.mdx`

- [ ] **Step 1: `Introduction.mdx`**

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Docs/Introduction" />

# @misael703/ui

An internal React + TypeScript component library for the owner's applications, optimized for Next.js App Router (every component is a client component). It ships design tokens, accessible components with hand-owned WAI-ARIA behaviour, and runtime brand configuration through presets. Zero runtime dependencies; `react` and `react-dom` are peers; `recharts` is injected by the consumer for charts.

## How to read this Storybook
- **Foundations** — the tokens (colors, typography, spacing, elevation, motion) and how theming works.
- **Components** — one page per exported component: props table, controls, states.
- **Patterns** — compositions the apps share (list page, CRUD).
- **Blocks** — copy-paste page recipes, not shipped in the package.
- **Internal** — regression and experiment stories.

Use the toolbar to switch the brand preset and the light/dark theme.
```

- [ ] **Step 2: `GettingStarted.mdx`** — `<Meta title="Docs/Getting started" />`, then the install command, the `app/layout.tsx` snippet (from README L46-95: `import '@misael703/ui/fonts.css'; import '@misael703/ui/styles.css'; import '@misael703/ui/presets/elalba';`), the `providers.tsx` snippet (`configureBrand({...elalbaDefaults})`, `<LocaleProvider>`, `<ToastProvider>`), and a "Next steps" list linking `?path=/docs/docs-theming--docs`.

- [ ] **Step 3: `Theming.mdx`** — `<Meta title="Docs/Theming" />`. Sections copied and condensed from `DESIGN.md` "Theme model" (light default, dark via `data-theme="dark"`, additive-light elevation), "Cascade isolation" (`@layer`, unlayered consumer CSS wins), "Extending variants" (the `.btn--brand-x` example verbatim from DESIGN.md), and "Writing a preset" (override the same token names in an unlayered stylesheet; re-assert in the preset's own `[data-theme="dark"]` block every token it overrides in light — the cascade gotcha from DESIGN.md).

- [ ] **Step 4: `Accessibility.mdx`** — `<Meta title="Docs/Accessibility" />`: the focus ring rule (`:focus-visible` + `box-shadow`, never bare `outline: none`), owned WAI-ARIA patterns (TreeView, Accordion, Menu, Menubar, Combobox), the a11y addon panel, the touch guard (`@media (pointer: coarse)` → 44px), and the documented AA exception (El Alba preset primary button, 2.91:1, pinned by `tests/Contrast.test.tsx`).

- [ ] **Step 5: `Hooks.mdx`** — `<Meta title="Docs/Hooks" />` with the three public signatures, copied verbatim from the sources:

```ts
function usePopoverPosition(
  anchorRef: React.RefObject<HTMLElement | VirtualElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  { open, side = 'bottom', align = 'center', offset = 8, matchAnchorWidth = false }: UsePopoverPositionOptions,
): PopoverPosition; // { top, left, side, ready }

function useDismiss({ open, onDismiss, refs, closeOnEscape = true, closeOnOutsideClick = true, returnFocusRef }: UseDismissOptions): void;

function useVirtualRows(
  scrollRef: React.RefObject<HTMLElement | null>,
  { count, rowHeight, overscan = 6, enabled = true }: UseVirtualRowsOptions
): VirtualRowsRange; // { start, end, padTop, padBottom }
```

plus one usage paragraph each (fixed-position portal; trigger + panel refs; fixed row height contract).

- [ ] **Step 6: Gates** + open `http://localhost:6006` and confirm the sidebar order is Docs → Foundations → Components → Patterns → Blocks → Internal.
- [ ] **Step 7: Commit** — `docs(storybook): mdx guides for introduction, getting started, theming, accessibility, hooks`

---

### Task 21: Storybook build in CI and the hosted URL

**Files:**
- Modify: `.github/workflows/ci.yml` (created in Fase 1)
- Modify: `README.md` "Storybook" section (English, rewritten in Fase 1), `package.json` `homepage`

- [ ] **Step 1: Append a job to `ci.yml`**

```yaml
  storybook:
    name: Storybook build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build-storybook
```

- [ ] **Step 2: Find the hosted URL.** Run `railway status` in the repo (or open the Railway dashboard for the Storybook service) and copy the public domain. If the CLI is not logged in, ask the owner for the URL. Railway builds from the Dockerfile on push to `main`; no extra workflow is needed (verified: `Dockerfile` L1-5).

- [ ] **Step 3: Write it** into README "Storybook" section (`Hosted at <URL>, rebuilt on every push to main.`) and `package.json` `"homepage": "<URL>"`.

- [ ] **Step 4: Gates.**
- [ ] **Step 5: Commit** — `ci: build storybook on pull requests; link the hosted storybook`

---

### Task 22: Storybook 9 migration (owner-gated)

**Files:** `package.json`, `package-lock.json`, `.storybook/main.ts`, `.storybook/preview.tsx`, every `*.stories.tsx` importing `@storybook/test`, `src/foundations/*.stories.tsx` importing `@storybook/blocks`, `src/docs/*.mdx`.

- [ ] **Step 0: Ask the owner.** This task replaces 30+ devDependencies and the addon layout. Do not start without an explicit "go" for Storybook 9 in this session.

- [ ] **Step 1: Upgrade**

Run: `npx storybook@9 upgrade --yes > /tmp/sb9.log 2>&1; echo "exit=$?"`
Expected: `exit=0`; the automigrations rewrite `main.ts` addons and remove `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/test`, `@storybook/blocks`.

- [ ] **Step 2: Fix imports the codemod may miss**

Run: `grep -rln "@storybook/test'" src | xargs sed -i '' "s#from '@storybook/test'#from 'storybook/test'#"` and `grep -rln "@storybook/blocks'" src | xargs sed -i '' "s#from '@storybook/blocks'#from '@storybook/addon-docs/blocks'#"`.
`main.ts` addons become `['@storybook/addon-docs', '@storybook/addon-a11y']` (controls, actions, viewport, toolbars and interactions are core in 9). `viewport` parameters move to `initialGlobals`/`globals.viewport` per the 9 migration guide (`MIGRATION.md` in the storybook repo); if the build warns, follow the warning text.

- [ ] **Step 3: Gates**

Run: `npm run lint; echo "lint=$?"; npm run typecheck; echo "tsc=$?"; npx vitest run > /tmp/vitest.log 2>&1; echo "vitest=$?"; npm run build-storybook > /tmp/sb.log 2>&1; echo "sb=$?"`
Expected: all `0`. Open the dev server and check one `play` story (`components-combobox--select-by-typing`) runs green.

- [ ] **Step 4: Rollback if any gate fails and the fix is not obvious within the task**

```bash
git checkout -- package.json package-lock.json .storybook src && npm ci
```

Report to the owner what failed with the log excerpt.

- [ ] **Step 5: Commit** — `chore(storybook): migrate to storybook 9`

---

## Self-review

- **Spec coverage (D4, I11):** one file per component (Tasks 4-17), `component:` + `args` everywhere (guard, Task 2), English tree and names (Tasks 3-19), neutral fixtures (each split task + Task 19), MDX (Task 20), `play` on Combobox/Menu/DataTable/Modal (Tasks 5, 10, 13, 14), preview simplified and AppShell out of autodocs (Task 1), `public/` duplicate removed (Task 1), Register no longer imports a story (Task 3), the six never-documented exports get stories (Task 17 `FloatingPortal` adds Portal/Slot/Slottable; Task 7 adds Label; Task 12 adds Table; `ToolbarActions` is not in the barrel and stays undocumented on purpose), hooks documented (Task 20), CI + URL (Task 21), SB 9 gated (Task 22).
- **Placeholders:** the argTypes copy in Task 3 and the "bodies copied from" notes point at exact line ranges of existing files, which the executor has; no "TBD"/"similar to".
- **Names:** `ListPagePlayground`/`FullListPage` (Task 3) used identically in Register; `Launcher` wrapper defined in Task 14 and referenced by name in Task 16 with its definition location; guard regex `EXEMPT_TITLES` extended in Task 17 before Foundations move in Task 19.
