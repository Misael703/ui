# Fase 1 — Hygiene (no breaking) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the kit's gates real (typecheck of everything, CI on every PR, lint rules that block), remove the stale/company noise from shipped code and docs, and switch the public language to English, all without any change a consumer could notice at runtime. Ships as `4.4.0`.

**Architecture:** Twelve independent, mechanical tasks on a `chore/hygiene-4.4` branch. Gates first (typecheck, CI, lint), then content (names, strings, comments, blocks, docs), then build script. No component behaviour changes; the only runtime-visible change is that a handful of `aria-label` defaults now come from the locale dictionary with identical Spanish values.

**Tech Stack:** TypeScript 5.4, ESLint 9 flat config, Vitest 2, tsup 8, GitHub Actions, Node 22 local / 20 in publish.

**Spec:** `docs/superpowers/specs/2026-09-16-kit-cleanup-design.md` (decisions D1–D10). Exact targets: `docs/superpowers/specs/2026-09-16-kit-cleanup-inventory.md` (I1–I10).

## Global Constraints

- Never run `prettier --write`. Edit by hand in the file's compact style (look at neighbouring lines).
- Commits: Conventional Commits, English, lowercase subject, no Claude attribution lines.
- No push / PR / merge / release without the owner's explicit go.
- Every task ends with the three gates run separately, judged by exit code, never through a pipe:
  ```bash
  npm run lint; echo "lint=$?"
  npm run typecheck; echo "tsc=$?"
  npx vitest run > /tmp/vitest.log 2>&1; echo "vitest=$?"
  ```
  All three must print `0`. `npm run typecheck` exists after Task 1.
- No new export from `src/index.ts` in this phase, so the smoke gate is untouched except in Task 12 (build script), which runs it.
- Stories are generic: sample company "Northwind Builders", products "Taladro", "Sierra", orders "Pedido #1042", persona "Satoru Gojo". Never a real company, RUT, phone, address, tax id, or copy lifted from an app.
- Line numbers below are from `main` at 4.3.0 (commit `ff55f66`). Re-grep before editing if HEAD moved.

---

### Task 1: Typecheck covers `tests/` and `.storybook/`

**Files:**
- Modify: `tsconfig.json`
- Create: `tsconfig.build.json`
- Modify: `tsup.config.ts:13` (add `tsconfig`)
- Modify: `package.json` (scripts, devDependencies)
- Modify: `tests/DataTable.test.tsx:586`, `tests/DataTableExpansion.test.tsx:57`, `tests/DateRangeReport.test.tsx:74`

**Interfaces:**
- Produces: `npm run typecheck` (used by every later task and by CI in Task 2).

- [ ] **Step 1: Reproduce the gap**

Run: `npx tsc --noEmit -p tsconfig.json; echo $?`
Expected: `0` (tests are simply not included).

- [ ] **Step 2: Add `@types/node`**

Run: `npm install -D @types/node@^22`
Expected: `package.json` devDependencies gains `"@types/node": "^22.x"`; lockfile updated.

- [ ] **Step 3: Widen `tsconfig.json`**

Replace the whole file with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "isolatedModules": true,
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", ".storybook"]
}
```

- [ ] **Step 4: Keep the build scoped to `src`**

Create `tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "include": ["src"],
  "exclude": ["src/**/*.stories.tsx", "src/**/*.test.tsx", "src/blocks"]
}
```

In `tsup.config.ts`, inside `defineConfig({ … })`, add after `entry: [...]`:

```ts
  tsconfig: 'tsconfig.build.json',
```

- [ ] **Step 5: Add the script**

In `package.json` scripts, after `"lint:fix"`, add:

```json
    "typecheck": "tsc --noEmit -p tsconfig.json",
```

- [ ] **Step 6: Run typecheck to see the 3 real errors**

Run: `npm run typecheck; echo $?`
Expected: exit `2` with exactly three errors: `tests/DataTable.test.tsx:586` (`WebkitLineClamp`), `tests/DataTableExpansion.test.tsx:57` (`colSpan` on `HTMLElement`), `tests/DateRangeReport.test.tsx:74` (`.at`). If `node:fs` / `__dirname` errors remain, `@types/node` did not install: check `rtk proxy ls node_modules/@types/node`.

If `.at()` still errors after `lib: ES2022`, that file is fine; the error was only the lib. If it persists, replace `.at(-1)` with `[arr.length - 1]` on that line.

- [ ] **Step 7: Fix the three**

`tests/DataTable.test.tsx:586`: change `WebkitLineClamp` to `webkitLineClamp` (CSSStyleDeclaration uses the lowercase-w form).

`tests/DataTableExpansion.test.tsx:57`: wrap the element: `(cell as HTMLTableCellElement).colSpan`.

`tests/DateRangeReport.test.tsx:74`: no change if Step 6 passed after the lib bump.

- [ ] **Step 8: Verify all gates**

Run: `npm run typecheck; echo $?` → `0`. Run: `npm run build; echo $?` → `0` and `rtk proxy ls dist | head` still shows `index.mjs`, `Button.mjs`, no `tests/` output. Run: `npx vitest run > /tmp/vitest.log 2>&1; echo $?` → `0`.

- [ ] **Step 9: Commit**

```bash
git add tsconfig.json tsconfig.build.json tsup.config.ts package.json package-lock.json tests/DataTable.test.tsx tests/DataTableExpansion.test.tsx
git commit -m "chore: typecheck tests and storybook config, add typecheck script"
```

---

### Task 2: CI on every pull request

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/smoke.yml:17` (node 22)
- Create: `.nvmrc`
- Modify: `package.json` (`engines`)

**Interfaces:**
- Produces: workflow `ci` with jobs `lint`, `typecheck`, `test`, `build`. Fase 2 appends a `storybook` job to this same file.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  checks:
    name: Lint · Typecheck · Test · Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Pin Node**

Create `.nvmrc` with the single line `22`.

In `package.json`, after `"publishConfig"`, add:

```json
  "engines": {
    "node": ">=20"
  }
```

In `.github/workflows/smoke.yml`, replace `node-version: 20` with `node-version-file: .nvmrc`. Leave `publish.yml` on Node 20: its `npm install -g npm@^11` step documents a Node 22 bootstrap bug; changing it is verified only by a real release and is out of this plan.

- [ ] **Step 3: Validate the YAML locally**

Run: `node -e "require('js-yaml')" 2>/dev/null || npx --yes js-yaml .github/workflows/ci.yml > /dev/null; echo $?`
Expected: `0` (parses). If `npx js-yaml` is unavailable offline, `cat` the file and eyeball indentation; the real check is the first PR run.

- [ ] **Step 4: Run the same commands locally, in the same order**

Run: `npm ci && npm run lint && npm run typecheck && npm test && npm run build; echo $?`
Expected: `0`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/smoke.yml .nvmrc package.json
git commit -m "ci: run lint, typecheck, test and build on pull requests"
```

---

### Task 3: Remove Prettier (decision D6)

**Files:**
- Delete: `.prettierrc.json`, `.prettierignore`
- Modify: `package.json` (scripts `format`, `format:check`; devDependencies `prettier`, `eslint-config-prettier`)
- Modify: `eslint.config.mjs:5,71`

- [ ] **Step 1: Record the state**

Run: `npx prettier --check src 2>&1 | tail -1`
Expected: a line like `[warn] Code style issues found in 213 files.` This is the reason for the decision: the repo's style is compact and hand-written; a formatter that is present but never applied only produces noise.

- [ ] **Step 2: Remove config and scripts**

```bash
git rm .prettierrc.json .prettierignore
npm uninstall prettier eslint-config-prettier
```

In `package.json` scripts, delete the two lines `"format": "prettier --write .",` and `"format:check": "prettier --check .",`.

- [ ] **Step 3: Remove from ESLint**

In `eslint.config.mjs`, delete line 5 `import prettier from 'eslint-config-prettier/flat';` and the last config entry `prettier,` (line 71, just before the closing `);`).

- [ ] **Step 4: Verify lint still runs and still has 0 errors**

Run: `npm run lint; echo $?`
Expected: `0`. Warning count may change slightly because `eslint-config-prettier` also disabled a few stylistic core rules; if any NEW rule now reports (e.g. `no-mixed-spaces-and-tabs`), add it to the `rules` block of the `src/**` config as `'off'` with a one-line comment `// formatting is hand-written (see spec D6)`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove prettier, the kit keeps its compact hand-written style"
```

---

### Task 4: commitlint and pre-push gate

**Files:**
- Create: `commitlint.config.mjs`, `.husky/commit-msg`, `.husky/pre-push`
- Modify: `package.json` (devDependencies, `prepare` script)
- Modify: `README.md` (release PR title convention; the full README rewrite is Task 11, this task only adds one paragraph in the existing "Releases & CI" section)

- [ ] **Step 1: Install**

Run: `npm install -D husky@^9 @commitlint/cli@^19 @commitlint/config-conventional@^19`
Then: `npx husky init` (creates `.husky/pre-commit` and adds `"prepare": "husky"` to scripts).

- [ ] **Step 2: Hooks**

Delete the generated `.husky/pre-commit` (we do not gate commits on tests; pushes are gated).

Create `.husky/commit-msg`:

```sh
npx --no -- commitlint --edit "$1"
```

Create `.husky/pre-push`:

```sh
npm run lint && npm run typecheck
```

Run: `chmod +x .husky/commit-msg .husky/pre-push`

- [ ] **Step 3: Config**

Create `commitlint.config.mjs`:

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
  },
};
```

- [ ] **Step 4: Verify the hook rejects and accepts**

Run: `echo "4.4.0: cosas varias" | npx commitlint; echo $?` → non-zero (no type).
Run: `echo "chore(release): 4.4.0" | npx commitlint; echo $?` → `0`.

- [ ] **Step 5: Document the release title**

In `README.md`, in the "Releases & CI" section (currently L450+), add this paragraph right after the section heading:

```markdown
Release PRs are squash-merged with the title `chore(release): X.Y.Z` (commitlint rejects the old `X.Y.Z: …` form).
```

- [ ] **Step 6: Commit**

```bash
git add commitlint.config.mjs .husky package.json package-lock.json README.md
git commit -m "chore: add commitlint and a pre-push lint+typecheck hook"
```

---

### Task 5: Blocks — delete the domain screens, neutralize the generic ones (D8)

**Files:**
- Delete (22 files): `src/blocks/{DispatchBoard,RouteMap,RouteSchedule,DeliveryTimeline,RentalBoard,RentalBooking,ReturnInspection,ToolCatalog,AvailabilityCalendar,RentalDetail,RentalAgreement}.tsx` and their `.stories.tsx`
- Modify: `src/blocks/{AuthScreen,AuthSplit,OnboardingChecklist,DetailPage,SettingsPage,CheckoutSummary,InvoiceDocument}.tsx`
- Delete: `docs/BLOCKS.md`
- Modify: `src/blocks/README.md`, `README.md:152-208`

- [ ] **Step 1: Record the last SHA that contains the domain blocks**

Run: `git rev-parse --short HEAD` and keep the value; it goes into the CHANGELOG in Task 11 ("removed domain blocks; last commit containing them: `<sha>`").

- [ ] **Step 2: Delete**

```bash
cd src/blocks
git rm DispatchBoard.tsx DispatchBoard.stories.tsx RouteMap.tsx RouteMap.stories.tsx RouteSchedule.tsx RouteSchedule.stories.tsx DeliveryTimeline.tsx DeliveryTimeline.stories.tsx RentalBoard.tsx RentalBoard.stories.tsx RentalBooking.tsx RentalBooking.stories.tsx ReturnInspection.tsx ReturnInspection.stories.tsx ToolCatalog.tsx ToolCatalog.stories.tsx AvailabilityCalendar.tsx AvailabilityCalendar.stories.tsx RentalDetail.tsx RentalDetail.stories.tsx RentalAgreement.tsx RentalAgreement.stories.tsx
cd ../..
```

- [ ] **Step 3: Find the real data in the generic blocks**

Run: `grep -nE 'El Alba|SpA|RUT|\+56|IVA|elalba\.cl|contacto@|Providencia|Santiago' src/blocks/*.tsx`
Expected: hits in the 7 files listed above (InvoiceDocument ~8, CheckoutSummary ~4, DetailPage 2, SettingsPage 2, AuthScreen 1, AuthSplit 1, OnboardingChecklist 1).

- [ ] **Step 4: Replace, line by line**

Rules: company → `Northwind Builders`; `RUT` rows and values → `Pedido #1042` / `Cliente #8841` (or delete the row); emails → `hola@northwind.example`; phones → `+1 555 0100`; addresses → `Av. Principal 123`; `SpA` and `giro` lines → delete; `IVA_RATE = 0.19` in `InvoiceDocument.tsx:46` → rename to `TAX_RATE = 0.19` with the comment `// Sample tax rate for the demo document.` and the label text `'IVA'` → `'Impuesto'`. `SettingsPage.tsx:217-223` `defaultValue`s → `Northwind Builders`, `hola@northwind.example`.

- [ ] **Step 5: Verify nothing real is left**

Run the Step 3 grep again. Expected: no output.

- [ ] **Step 6: One doc for blocks**

`git rm docs/BLOCKS.md`. Rewrite `src/blocks/README.md` (English) keeping its first 12 lines (contract + how to use) and replacing the rest with:

```markdown
## Index

| Block | Composes |
|---|---|
| AdminDashboard | AppShell, StatCard, DataTable |
| AuditLogPage | PageHeader, FilterBar, DataTable |
| AuthScreen / AuthSplit | Card, FormField, Button |
| CartDrawer / CheckoutSummary / ProductCatalog / InvoiceDocument | commerce components |
| DataTablePage / DetailPage | PageHeader, DataTable, DescriptionList |
| EmptyStatePage / ErrorPage / NotFound | EmptyState, Button |
| NotificationsPage / OnboardingChecklist / WizardPage | NotificationCenter, Stepper, Card |
| SettingsPage | Tabs, FormField, Switch |

Blocks are generic by rule: sample company "Northwind Builders", no real data.
Screens of a specific app do not belong here; keep them in that app.
```

In `README.md`, replace the whole `## Blocks (copy-paste)` section (L152 through the line before `## Componentes`, L209) with:

```markdown
## Blocks (copy-paste)

Page recipes that compose kit components. Not shipped in the package; copy the file from `src/blocks/` and change the import to `@misael703/ui`. Index and rules: [`src/blocks/README.md`](./src/blocks/README.md). Rendered under **Blocks/** in Storybook.
```

- [ ] **Step 7: Gates**

Run the three gates. Expected `0 0 0`. Also `npm run build-storybook > /tmp/sb.log 2>&1; echo $?` → `0` (deleted stories must not be referenced anywhere; if a `Register`/`Crud` story imported a block, the log names it: remove that import).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(blocks): remove app-specific screens and neutralize sample data"
```

---

### Task 6: Stale package name and consumer names in shipped code (I1, I2)

**Files:**
- Modify: `src/index.ts:1`, `src/brand.ts:15`, `src/styles/index.css:1-2`, `src/styles/tokens.css:2`, `src/styles/fonts.css:2,4,5`, `src/fonts/OFL.txt:1`, `src/presets/elalba/styles.css:13,124`, `src/presets/elalba/defaults.ts:16`, `README.md:32-44`
- Modify: `src/styles/_root.css:243,284`, `src/styles/index.css:656,2207,2404`, `src/components/AdvancedPickers.tsx:311,496`, `src/components/Display3.tsx:72`, `src/utils/smartTime.ts:36`

- [ ] **Step 1: Stale name, mechanical**

Run: `grep -rln 'elalba-ui' src README.md`
Expected: the 9 files from I1.

Run: `sed -i '' 's#@misael703/elalba-ui#@misael703/ui#g' src/index.ts src/brand.ts src/styles/index.css src/styles/tokens.css src/styles/fonts.css src/fonts/OFL.txt src/presets/elalba/styles.css src/presets/elalba/defaults.ts`

Then in `README.md` delete the whole `### Migrando desde elalba-ui` subsection (L32–44).

Run: `grep -rn 'elalba-ui' src README.md; echo $?` → no output, exit `1`. (`CHANGELOG.md` keeps its historical mentions.)

- [ ] **Step 2: Consumer names in comments, keep the why**

The preset is legitimately called "El Alba"; those mentions stay. Only app names go. Edit each line so the technical reason survives and the app name disappears:

| File:line | Now | After |
|---|---|---|
| `src/styles/_root.css:243` | `… despachos …` | `… the picking table consumer …` → reword as `… dense data tables …` |
| `src/styles/_root.css:284` | `despachos reports` | `reports dashboards` |
| `src/styles/index.css:656` | `despachos` | `a dense-table consumer` |
| `src/styles/index.css:2207` | `despachos picking table` | `a picking-style dense table` |
| `src/styles/index.css:2404` | `despachos "Fecha de …"` | `a "Fecha de …" date column` |
| `src/components/AdvancedPickers.tsx:311` | `(Bsale-style)` | `(same shortcuts as common ERP report filters)` |
| `src/components/AdvancedPickers.tsx:496` | `(like Bsale)` | delete the parenthetical |
| `src/components/Display3.tsx:72` | `(a despachos …)` | delete the parenthetical |
| `src/utils/smartTime.ts:36` | `from Bsale/APIs` | `from APIs` |

- [ ] **Step 3: Verify**

Run: `grep -rniE 'despachos|rentools|cobros|barritas|marginapp|bsale' src --include=*.ts --include=*.tsx --include=*.css | grep -v stories; echo $?`
Expected: no output, exit `1`.

- [ ] **Step 4: Gates, then commit**

```bash
git add -A
git commit -m "chore: drop stale package name and consumer app names from shipped code"
```

---

### Task 7: Hardcoded UI strings go through the locale dictionary (I4)

**Files:**
- Modify: `src/locale/messages.ts` (before the closing `}` of `UiKitMessages`), `src/locale/es.ts` (before the closing `};`)
- Modify: `src/components/NavigationMenu.tsx:34`, `Menubar.tsx:29`, `ContextMenu.tsx:26`, `Resizable.tsx:129`, `Carousel.tsx:25,113,122`, `Marketing.tsx:117`, `DataTable.tsx:927`, `AdvancedPickers.tsx:276-278,319` and the `DateRangePicker` body, `InputsExtra.tsx:348`
- Create: `tests/LocaleDefaults.test.tsx`

**Interfaces:**
- Produces: 16 new keys in `UiKitMessages` (names below). `dateRangePresets(opts)` keeps its signature; `DateRangePicker` passes `labels` from the dictionary.

- [ ] **Step 1: Failing test first**

Create `tests/LocaleDefaults.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider, Carousel, NavigationMenu, Menubar, Breadcrumbs, CategoryNav } from '../src/index';

describe('component aria defaults come from the locale dictionary', () => {
  it('Carousel controls and region', () => {
    render(
      <LocaleProvider messages={{ 'carousel.label': 'Slides', 'carousel.prev': 'Back', 'carousel.next': 'Forward' }}>
        <Carousel items={[<div key="a">A</div>, <div key="b">B</div>]} />
      </LocaleProvider>,
    );
    expect(screen.getByRole('region', { name: 'Slides' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
  });
  it('NavigationMenu, Menubar, Breadcrumbs, CategoryNav landmarks', () => {
    render(
      <LocaleProvider messages={{ 'navigationMenu.label': 'Main', 'menubar.label': 'Bar', 'breadcrumbs.label': 'Trail', 'categoryNav.label': 'Cats' }}>
        <NavigationMenu items={[]} />
        <Menubar menus={[]} />
        <Breadcrumbs items={[{ label: 'Home' }]} />
        <CategoryNav items={[]} />
      </LocaleProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('menubar', { name: 'Bar' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Trail' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Cats' })).toBeInTheDocument();
  });
});
```

Check each component's actual prop names first (`grep -n 'export function Carousel\|export interface CarouselProps' -A 12 src/components/Carousel.tsx`, same for the others) and adjust the props in the test to the real API; the assertions are the contract.

Run: `npx vitest run tests/LocaleDefaults.test.tsx; echo $?` → non-zero (keys don't exist, labels are hardcoded).

- [ ] **Step 2: Add the keys**

Append inside `UiKitMessages` in `src/locale/messages.ts`, before the closing `}`:

```ts
  // Landmarks and controls (v4.4.0: previously hardcoded defaults)
  'navigationMenu.label': string;
  'menubar.label': string;
  'contextMenu.label': string;
  'resizable.handle': string;
  'carousel.label': string;
  'carousel.prev': string;
  'carousel.next': string;
  'categoryNav.label': string;
  'breadcrumbs.label': string;
  // DateRangePicker presets
  'dateRange.today': string;
  'dateRange.yesterday': string;
  'dateRange.thisWeek': string;
  'dateRange.lastWeek': string;
  'dateRange.thisMonth': string;
  'dateRange.lastMonth': string;
  'dateRange.thisYear': string;
  'dateRange.lastYear': string;
```

Append in `src/locale/es.ts` before `};`:

```ts
  // Landmarks and controls
  'navigationMenu.label': 'Navegación principal',
  'menubar.label': 'Barra de menús',
  'contextMenu.label': 'Menú contextual',
  'resizable.handle': 'Redimensionar',
  'carousel.label': 'Carrusel',
  'carousel.prev': 'Anterior',
  'carousel.next': 'Siguiente',
  'categoryNav.label': 'Categorías',
  'breadcrumbs.label': 'Navegación de ruta',
  // DateRangePicker presets
  'dateRange.today': 'Hoy',
  'dateRange.yesterday': 'Ayer',
  'dateRange.thisWeek': 'Esta semana',
  'dateRange.lastWeek': 'Semana anterior',
  'dateRange.thisMonth': 'Este mes',
  'dateRange.lastMonth': 'Mes anterior',
  'dateRange.thisYear': 'Este año',
  'dateRange.lastYear': 'Año anterior',
```

- [ ] **Step 3: Wire each component**

Pattern for a default-parameter label (NavigationMenu, Menubar, ContextMenu, ResizableHandle, Carousel): remove the default from the parameter list and resolve inside the body.

`src/components/NavigationMenu.tsx:34`:

```tsx
export function NavigationMenu({ items, className, ariaLabel, linkAs, rootLinkAs }: NavigationMenuProps) {
  const t = useLocale();
  const label = ariaLabel ?? t['navigationMenu.label'];
```

and use `label` where `ariaLabel` was used on the `<nav>`. Add `import { useLocale } from '../locale';` if the file lacks it (check with `grep -n useLocale src/components/NavigationMenu.tsx`).

Same shape: `Menubar.tsx:29` → `t['menubar.label']`; `ContextMenu.tsx:26` → `t['contextMenu.label']`; `Resizable.tsx:129` (`ResizableHandle`) → `t['resizable.handle']`; `Carousel.tsx:25` → `t['carousel.label']`, and `:113` `aria-label={t['carousel.prev']}`, `:122` `aria-label={t['carousel.next']}`.

`Marketing.tsx:117` (`CategoryNav`): `aria-label={t['categoryNav.label']}` with `const t = useLocale();` at the top of the component (it is a `forwardRef` body; hooks are fine there).

`DataTable.tsx:927` (`Breadcrumbs`): `aria-label={t['breadcrumbs.label']}`; add `const t = useLocale();` (the file already imports `useLocale` for DataTable; verify with grep).

`AdvancedPickers.tsx`: keep `DEFAULT_PRESET_LABELS` (it is the fallback for the exported non-React `dateRangePresets`). In `DateRangePicker` (starts L324), where presets are computed (grep `dateRangePresets(` inside the component), pass the dictionary:

```tsx
const t = useLocale();
const presetLabels: Record<DateRangePresetKey, string> = {
  today: t['dateRange.today'], yesterday: t['dateRange.yesterday'],
  thisWeek: t['dateRange.thisWeek'], lastWeek: t['dateRange.lastWeek'],
  thisMonth: t['dateRange.thisMonth'], lastMonth: t['dateRange.lastMonth'],
  thisYear: t['dateRange.thisYear'], lastYear: t['dateRange.lastYear'],
};
const presets = dateRangePresets({ ...presetOpts, labels: { ...presetLabels, ...presetOpts?.labels } });
```

(adapt `presetOpts` to the real local variable name; the point is `labels` defaults to the dictionary and consumer overrides win).

`InputsExtra.tsx:348` (`PhoneInput`): remove `placeholder = '9 1234 5678'` from the destructuring default (leave `placeholder` undefined by default; consumers pass their own format).

- [ ] **Step 4: Run the new test and the suite**

Run: `npx vitest run tests/LocaleDefaults.test.tsx; echo $?` → `0`. Then all three gates → `0 0 0`. If an existing test asserted the Spanish literal (e.g. `getByLabelText('Anterior')`), it still passes: the Spanish values are unchanged.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(locale): route remaining hardcoded aria labels and date presets through the dictionary"
```

---

### Task 8: ESLint — react plugin and non-a11y rules to `error`

**Files:**
- Modify: `eslint.config.mjs`
- Modify: `src/components/Charts.tsx:70,114,215,222,260,264,303,310,430,450`, `src/components/InputsExtra.tsx:129`, `src/components/AdvancedPickers.tsx:350`, `src/components/NavigationMenu.tsx:89`, `src/utils/dateFormat.ts:110`, `src/Foundations.stories.tsx:734`, `src/components/Crud.stories.tsx:87`, `src/components/DataTable.stories.tsx:6`, `src/components/Form.stories.tsx:2`, `tests/Button.test.tsx:77`, `tests/FloatingConvergence.test.tsx:8`, `tests/FloatingPortal.test.tsx:5`, `tests/Layout.test.tsx:1`, `tests/Slot.test.tsx:4`

- [ ] **Step 1: Install the react plugin**

Run: `npm install -D eslint-plugin-react@^7.37`

- [ ] **Step 2: Rewrite the `src/**` rules block**

In `eslint.config.mjs`, add `import react from 'eslint-plugin-react';` after the `jsxA11y` import. Replace the `rules` object of the `files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}']` entry with:

```js
    plugins: { 'react-hooks': reactHooks, react },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/self-closing-comp': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'prefer-const': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-escape': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
    },
```

Also update the file's header comment: replace the sentence about "pre-existing debt … is `warn`" with `// Every enabled rule is an error; debt was paid in 4.4.0 (Fase 1 plan).`

- [ ] **Step 3: See the errors**

Run: `npm run lint; echo $?` → non-zero, 26 errors (10 `no-explicit-any` in Charts, 9 unused vars, 4 useless escapes, 2 exhaustive-deps, 1 prefer-const) plus whatever `react/self-closing-comp` finds (run `npx eslint . --fix` ONLY for that rule: `npx eslint . --fix --rule 'react/self-closing-comp: error'` is not how flat config takes rules; instead run `npx eslint . --fix` and then `git diff --stat` to confirm only `<X></X>` → `<X />` style changes happened; revert anything else).

- [ ] **Step 4: Fix by hand**

`Charts.tsx`: the 10 `any` are the injected recharts component types. Replace `React.ComponentType<any>` with `React.ElementType` and `props: any` with `props: Record<string, unknown>`; where a callback receives recharts payloads typed `any`, type them as `{ value?: number; name?: string; payload?: Record<string, unknown> }`. Run `npm run typecheck` after: `ElementType` accepts JSX usage `<Comp {...props} />` without further casts.

`InputsExtra.tsx:129`: `let` → `const`.

`AdvancedPickers.tsx:350` and `NavigationMenu.tsx:89` (`exhaustive-deps`): read the effect; add the missing dependency if it is stable, or wrap the referenced function in `React.useCallback`. Do not silence with a disable comment.

`dateFormat.ts:110`: remove the four unnecessary backslashes ESLint points at (inside a character class `[\-\/]` only `\]` and `\\` need escaping; `-` at the end of the class needs none).

Unused vars/imports in the 4 stories and 5 tests: delete the unused import or variable named in the message.

- [ ] **Step 5: Gates**

Run the three gates → `0 0 0`. Warnings remaining must be only `jsx-a11y/*` (Task 9 pays them).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(lint): add eslint-plugin-react and promote correctness rules to error"
```

---

### Task 9: ESLint — jsx-a11y to `error`, debt paid in three batches

**Files:**
- Modify: `eslint.config.mjs` (remove the `a11yWarnings` object and its config entry; add the rule options below)
- Batch A (labels): `src/components/Form.tsx:104,130,149,175`, `Filters.tsx:118,468`, `InputsExtra.tsx:550,586`, `AdvancedPickers.tsx:589,606`, `Comments.tsx:172`, `Commerce.tsx:522`, `src/blocks/DataTablePage.tsx:95,102`, `ProductCatalog.tsx:89,96`, stories `InputsExtra.stories.tsx`, `Pickers.stories.tsx`, `Form.stories.tsx`, `Filters.stories.tsx`, `Overlay.stories.tsx`
- Batch B (interactions): `Overlay.tsx:51,101`, `Popover.tsx:81`, `UserMenu.tsx:68`, `AppShell.tsx:321`, `AdvancedPickers.tsx:124,746`, `ContextMenu.tsx:118`, `NavigationMenu.tsx:173`, `Editing.tsx:206,213`, `InputsExtra.tsx:141,449`, `Display3.tsx:321`, `Display2.tsx:182`, `Gallery.tsx:141,160`, `Carousel.tsx:81,86`, `Resizable.tsx:147,149`, `src/blocks/NotificationsPage.tsx:93`
- Batch C (roles, controls, anchors): `DataTable.tsx:684,686,693,736,745`, `Commerce.tsx:590`, `InputsExtra.tsx:62`, `src/blocks/AdminDashboard.tsx:112`, `AuthScreen.tsx:63`, `AuthSplit.tsx:73,78`, stories `UserMenu.stories.tsx` (9 `aria-role`), `AppShell.stories.tsx`, `Marketing.stories.tsx`, `Foundations.stories.tsx`, `Display.stories.tsx`, `Layout.stories.tsx`, `InputOTP.stories.tsx`

- [ ] **Step 1: Config — errors with sensible options**

In `eslint.config.mjs` delete the `a11yWarnings` constant (L12–14) and the config entry `{ files: ['src/**/*.{ts,tsx}'], rules: a11yWarnings }`. Replace the `{ ...jsxA11y.flatConfigs.recommended, files: [...] }` entry with:

```js
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // Deprecated in the plugin; superseded by label-has-associated-control.
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/label-has-associated-control': ['error', {
        controlComponents: ['Input', 'Select', 'Textarea', 'NumberInput', 'MoneyInput', 'PhoneInput', 'TagInput', 'TimePicker', 'Slider', 'Combobox', 'MultiCombobox', 'DatePicker', 'DateRangePicker', 'Checkbox', 'Radio', 'Switch', 'FileUpload', 'PasswordInput'],
        depth: 3,
      }],
    },
  },
```

Run: `npm run lint; echo $?` → non-zero. Count errors: `npx eslint . -f json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);let n=0;for(const f of r)n+=f.errorCount;console.log(n)})"`. Expected ≈ 73 (107 minus the 34 `label-has-for`).

- [ ] **Step 2: Batch A — labels**

For every remaining `label-has-associated-control`: the `<label>` must either wrap the control or carry `htmlFor={id}` matching the control's `id`. In shipped components (Form.tsx `FormField`, Filters.tsx `FilterField`, InputsExtra.tsx `RadioGroup`/`CheckboxGroup`, AdvancedPickers.tsx, Comments.tsx, Commerce.tsx `AddressForm`) generate the id with `React.useId()` when none is passed:

```tsx
const autoId = React.useId();
const inputId = id ?? autoId;
// <label htmlFor={inputId}> … <input id={inputId} …/>
```

In stories and blocks, add `htmlFor`/`id` pairs with literal ids (`"sb-name"`).

Run: `npx eslint src/components/Form.tsx src/components/Filters.tsx src/components/InputsExtra.tsx src/components/AdvancedPickers.tsx src/components/Comments.tsx src/components/Commerce.tsx src/blocks src/components/InputsExtra.stories.tsx src/components/Pickers.stories.tsx src/components/Form.stories.tsx src/components/Filters.stories.tsx src/components/Overlay.stories.tsx; echo $?` → `0` for these files. Gates. Commit:

```bash
git add -A && git commit -m "fix(a11y): associate every label with its control"
```

- [ ] **Step 3: Batch B — interactions**

Three shapes, pick per line:

1. **Dismiss backdrops** (`Overlay.tsx:51,101`, `Popover.tsx:81`, `UserMenu.tsx:68`, `AppShell.tsx:321`, `ContextMenu.tsx:118`, `NavigationMenu.tsx:173`, `AdvancedPickers.tsx:124`): a `<div onClick={close}>` that only exists to catch outside clicks. Add `role="presentation"` — the plugin exempts presentational elements from both `click-events-have-key-events` and `no-static-element-interactions`. Keyboard dismissal is already covered by `useEscape`/`useDismiss` (verify the component uses one: `grep -n 'useEscape\|useDismiss' <file>`; if not, add `useEscape(close)`).
2. **Really interactive non-button elements** (`Gallery.tsx:141,160` thumbnails, `Editing.tsx:206,213` transfer-list rows, `Display3.tsx:321` tree row, `InputsExtra.tsx:141` slider track, `:449` time option, `Display2.tsx:182` menu item, `src/blocks/NotificationsPage.tsx:93`): convert the element to `<button type="button" className={…}>` when it contains no other interactive element, otherwise add `role="button" tabIndex={0}` and

```tsx
onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } }}
```
   Check the CSS class still applies (a `<button>` needs `all: unset`-style reset only if the class assumed a `<div>`; look at the class in `src/styles/index.css` and add `.thumb { appearance: none; border: 0; background: none; padding: 0; }` in the same section if needed).
3. **Composite widgets with their own keyboard model** (`Carousel.tsx:81,86` region with `tabIndex`, `Resizable.tsx:147,149` separator handle, `AdvancedPickers.tsx:746` listbox): these already implement arrow-key handling. Give the element the correct ARIA role so the plugin recognises it: Carousel region `role="region"` keeps `tabIndex={0}` only if it handles keys (it does: verify `onKeyDown` exists, else remove `tabIndex`); Resizable handle `role="separator" aria-orientation=… tabIndex={0}` is valid for `no-noninteractive-tabindex` when `aria-valuenow` is present — add `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}` from the panel size if missing; listbox option gets `role="option"`.

Run eslint on the batch files → `0`. Run the three gates (tests cover Modal/Drawer/Popover/Menu keyboard behaviour; a regression shows here). Commit:

```bash
git add -A && git commit -m "fix(a11y): keyboard parity and roles for interactive elements"
```

- [ ] **Step 4: Batch C — roles, controls, anchors, autofocus**

- `control-has-associated-label` on `DataTable.tsx:684,686,693,736,745` (selection checkboxes, expand toggles): add `aria-label={t['table.selectAll']}` / `aria-label={format(t['table.selectRow'], { label })}` / `aria-label={t['table.expandRow']}` (add the key `'table.expandRow': string` to `messages.ts` and `'table.expandRow': 'Expandir fila'` to `es.ts` if it does not exist: `grep -n expandRow src/locale/messages.ts`). `Commerce.tsx:590` (CompareTable remove button) and `InputsExtra.tsx:62` (slider thumb) likewise get an `aria-label` from an existing key or a new one (`'compare.remove': 'Quitar'`, `'slider.thumb': 'Valor'`).
- `anchor-is-valid` in blocks (`AdminDashboard.tsx:112`, `AuthScreen.tsx:63`, `AuthSplit.tsx:73,78`) and stories (`Foundations`, `Display`, `Layout`): replace `href="#"` with a plausible path (`"/settings"`, `"/forgot-password"`), or turn it into `<Button variant="link">` when it triggers an action.
- `aria-role` in `UserMenu.stories.tsx` (9), `AppShell.stories.tsx`, `Marketing.stories.tsx`: the stories pass a non-standard `role` string (open the lines; typically `role="menu-item"` or a made-up role). Use the valid ARIA role (`menuitem`) or drop the attribute.
- `no-autofocus` in `InputOTP.stories.tsx`: remove `autoFocus` from the story (an OTP demo does not need it; the component prop stays).

Run: `npm run lint; echo $?` → `0` with **0 warnings** (`npx eslint . | tail -3` should print nothing; judge by the exit code and the absence of a summary line). Gates. Commit:

```bash
git add -A && git commit -m "fix(a11y): name controls, valid roles and anchors; jsx-a11y is now an error"
```

---

### Task 10: Comments and JSDoc in English (I3)

**Files:**
- Modify (21 files, by descending count): `src/components/Logo.tsx`, `src/brand.ts`, `src/components/Commerce.tsx`, `src/utils/format.ts`, `src/components/Toggle.tsx`, `src/styles/index.css`, `src/components/Icons.tsx`, `src/cl/index.ts`, `src/styles/fonts.css`, `src/components/AdvancedPickers.tsx`, `src/styles/_root.css`, `src/locale/messages.ts`, `src/components/Marketing.tsx`, `src/components/Editing.tsx`, `src/components/DataTable.tsx`, `src/components/AppShell.tsx`, `src/components/Notifications.tsx`, `src/components/Layout.tsx`, `src/components/Form.tsx`, `src/components/Display3.tsx`, `src/components/Comments.tsx`

- [ ] **Step 1: Find them**

Run: `grep -nE '(//|\*) .*\b(el|la|los|las|que|para|con|del|una|por|se|si|es)\b' src/components/Logo.tsx | head -30`
Repeat per file. Only comments and JSDoc: string literals (UI copy) stay Spanish.

- [ ] **Step 2: Translate, same meaning, same compactness**

Example, `src/components/Logo.tsx:50-64`:

```tsx
  /** Force the format (svg|png). Defaults to the variant's preferred format. */
  format?: LogoFormat;
  /**
   * When `true`, renders `mark` on mobile (<768px) and `variant` on desktop.
   * Useful for AppShell / topbars / headers that get narrow.
   */
  responsive?: boolean;
  /** Base URL of the assets. Defaults to `getBrand().logoBasePath`. */
  basePath?: string;
  /** Height in px. Default depends on the variant (mark: 32, horizontal: 32, vertical: 64, wordmark: 28). */
  height?: number;
  /** Alternative text (a11y). Defaults to `brandName`. */
  alt?: string;
  /** Brand name; fallback for `alt`. Defaults to `getBrand().name`. */
  brandName?: string;
```

Do the same for every hit. JSDoc on exported props is public API (it lands in `.d.ts` and IDE hovers), so read each sentence twice.

- [ ] **Step 3: Verify**

Run the Step 1 grep over all 21 files: `for f in <the 21 paths>; do grep -cE '(//|\*) .*\b(el|la|los|las|que|para|con|del|una|por)\b' $f; done`. Expected: `0` per file, except false positives on English words (`el` never; `si`/`se` may match "se" in "see"? the regex uses word boundaries: "see" does not match `\bse\b`). Inspect any non-zero by eye.

- [ ] **Step 4: Gates, three commits (by group to keep diffs reviewable)**

```bash
git add src/components/Logo.tsx src/brand.ts src/utils/format.ts src/cl/index.ts src/locale/messages.ts && git commit -m "docs: english jsdoc in brand, format, locale, cl and logo"
git add src/components && git commit -m "docs: english comments in components"
git add src/styles && git commit -m "docs: english comments in stylesheets"
```

---

### Task 11: README, CHANGELOG, PRODUCT.md, DESIGN.md

**Files:**
- Rewrite: `README.md`
- Modify: `CHANGELOG.md` (top), `PRODUCT.md:72-77` and `## Users`, `DESIGN.md:85-86`

- [ ] **Step 1: Count what the README states**

Run: `npx vitest run > /tmp/vitest.log 2>&1; grep -E 'Tests +[0-9]+ passed' /tmp/vitest.log` → e.g. `Tests  1340 passed`. Run: `gzip -c dist/styles.css | wc -c` after `npm run build:css` → bytes gzipped (≈ 28 000). These replace "249 tests" and "~19 KB gzip".

- [ ] **Step 2: Rewrite `README.md` in English with this outline**

```markdown
# @misael703/ui

React + TypeScript UI kit for Next.js (App Router). Design tokens, accessible components with no runtime dependencies, runtime-configurable branding through presets. Built for the author's own applications and published on npm under MIT; not positioned as a community project.

## Install
(npm install, peer deps, upgrade commands — from the current L11–31)

## Use in Next.js
(RootLayout with styles.css + fonts.css + optional preset, configureBrand, LocaleProvider, ToastProvider — current L46–95, translated)

## Theming
(tokens cascade, `@layer elalba`, presets: the El Alba preset ships as the reference implementation of the preset mechanism; how to write your own — current L97–125 + L364–427 condensed)

## Components
(current L210–363: AppShell, DataTable, Charts, Icons, Fonts — translated; drop `Kpi` from lists and mark it deprecated in one line)

## Blocks (copy-paste)
(the 4 lines from Task 5)

## Development
(Build local, Storybook `npm run storybook`, Tests with the real count, no formatter: "The code style is compact and hand-written; there is no formatter. ESLint is the only gate.")

## Releases & CI
(current L450–479 translated, including the `chore(release): X.Y.Z` paragraph from Task 4)

## Forking / Rebrand
(current L480–561 translated)
```

Delete: the "Brand-neutral … El Alba / Patio Constructor" blockquote (L7), "Mirálas", `alt="El Alba"` example → `alt="Northwind Builders"`.

Keep every code snippet's content; only prose changes language.

- [ ] **Step 3: CHANGELOG**

Add at the top of `CHANGELOG.md`, after the intro lines and before the first version:

```markdown
## [4.4.0] — Unreleased

Entries from this version on are written in English.

### Changed
- Typecheck now covers `tests/` and `.storybook/`; new `npm run typecheck`.
- CI runs lint, typecheck, test and build on every pull request.
- ESLint: every enabled rule is an error, including `jsx-a11y/recommended`; added `eslint-plugin-react`.
- Prettier removed; the code style is compact and hand-written.
- commitlint + husky (`commit-msg`, `pre-push`).
- Remaining hardcoded `aria-label` defaults and DateRangePicker preset labels go through `UiKitMessages` (new keys, same Spanish values).
- JSDoc and code comments in English; stale `@misael703/elalba-ui` references removed.
- Build script moved to `scripts/build.mjs` (cross-platform).

### Removed
- Domain blocks (DispatchBoard, RouteMap, RouteSchedule, DeliveryTimeline, RentalBoard, RentalBooking, RentalDetail, RentalAgreement, ReturnInspection, ToolCatalog, AvailabilityCalendar). Last commit containing them: `<sha from Task 5>`. Blocks were never part of the package.
- `docs/BLOCKS.md` (merged into `src/blocks/README.md`).
```

- [ ] **Step 4: PRODUCT.md and DESIGN.md**

`PRODUCT.md` "Users": replace the consumer list with `despachos-ferreteria (Next.js, in production), cobros-meson, barritas, rentools`. "Known constraints": replace the light-theme bullet with `Dark theme is opt-in via data-theme="dark" (v1.79.0); no automatic prefers-color-scheme switch.` and the CSS size bullet with the measured gzip size from Step 1.

`DESIGN.md:85`: `> Last synced to tokens: **v4.3.0** (2026-09-11).`

- [ ] **Step 5: Gates (lint covers nothing here; run them anyway) and commit**

```bash
git add README.md CHANGELOG.md PRODUCT.md DESIGN.md
git commit -m "docs: english readme, changelog 4.4.0 entry, product and design sync"
```

---

### Task 12: Cross-platform build script and narrower `'use client'`

**Files:**
- Create: `scripts/build.mjs`
- Modify: `scripts/add-use-client.mjs`, `package.json` (`build`, `build:css`)

- [ ] **Step 1: Snapshot the current dist layout**

Run: `npm run build > /tmp/build-before.log 2>&1; echo $?` → `0`. Then `find dist -type f | sort > /tmp/dist-before.txt; wc -l /tmp/dist-before.txt`.

- [ ] **Step 2: Write the script**

Create `scripts/build.mjs`:

```js
// Kit build: tsup (JS + d.ts) → 'use client' directive → PostCSS bundles → static assets.
// One Node script instead of a shell chain so it runs the same on every OS.
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

run('npx tsup');
run('node scripts/add-use-client.mjs');

const css = [
  ['src/styles/index.css', 'dist/styles.css'],
  ['src/styles/fonts.css', 'dist/fonts.css'],
  ['src/styles/tokens.css', 'dist/tokens.css'],
  ['src/presets/elalba/styles.css', 'dist/presets/elalba/styles.css'],
];
mkdirSync(join(root, 'dist/presets/elalba'), { recursive: true });
for (const [from, to] of css) run(`npx postcss ${from} -o ${to}`);

mkdirSync(join(root, 'dist/fonts'), { recursive: true });
cpSync(join(root, 'src/fonts'), join(root, 'dist/fonts'), {
  recursive: true,
  filter: (src) => /(\.woff2|OFL\.txt|src\/fonts)$/.test(src),
});
cpSync(join(root, 'src/presets/elalba/logos'), join(root, 'dist/presets/elalba/logos'), { recursive: true });
console.log('build: done');
```

In `package.json` scripts: `"build": "node scripts/build.mjs"`, and replace `build:css` with `"build:css": "node -e \"import('./scripts/build.mjs')\""`? No: keep `build:css` as it is (it is used on its own by docs steps), only `build` changes.

- [ ] **Step 3: Narrow the directive**

In `scripts/add-use-client.mjs`, inside `walk`, after `if (!/\.(mjs|js)$/.test(name) || /\.map$/.test(name)) continue;` add:

```js
    // Pure modules a Server Component may import directly: no client boundary.
    if (/\/(cl|utils)\//.test(full) || /\/brand\.(m?js)$/.test(full)) continue;
```

- [ ] **Step 4: Compare layouts**

Run: `npm run build > /tmp/build-after.log 2>&1; echo $?` → `0`. `find dist -type f | sort > /tmp/dist-after.txt; diff /tmp/dist-before.txt /tmp/dist-after.txt; echo $?` → `0` (identical file list). `head -1 dist/index.mjs` → `'use client';`. `head -1 dist/cl/index.mjs` → NOT the directive.

- [ ] **Step 5: Smoke**

Run: `npm run smoke:ci > /tmp/smoke.log 2>&1; echo $?` → `0`. This is the gate that proves Next still accepts the package (RSC boundary, ESM/CJS, fonts path).

- [ ] **Step 6: Commit**

```bash
git add scripts/build.mjs scripts/add-use-client.mjs package.json
git commit -m "build: node build script and no client directive on pure modules"
```

---

### Task 13: Prepare 4.4.0 and stop

**Files:**
- Modify: `package.json` (`version`), `CHANGELOG.md` (date)

- [ ] **Step 1: Version and date**

`package.json` `"version": "4.4.0"`. `CHANGELOG.md`: `## [4.4.0] — Unreleased` → `## [4.4.0] — <today YYYY-MM-DD>`.

- [ ] **Step 2: Full gate run, judged by exit codes**

```bash
npm run lint; echo "lint=$?"
npm run typecheck; echo "tsc=$?"
npx vitest run > /tmp/vitest.log 2>&1; echo "vitest=$?"
npm run build > /tmp/build.log 2>&1; echo "build=$?"
npm run smoke:ci > /tmp/smoke.log 2>&1; echo "smoke=$?"
npm run build-storybook > /tmp/sb.log 2>&1; echo "storybook=$?"
```
All `0`.

- [ ] **Step 3: Commit and stop**

```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): 4.4.0"
```

Report to the owner: branch name, commit list (`git log --oneline main..HEAD`), the six gate results. Do NOT push, open a PR, tag or release. The owner decides.

---

## Self-review

- Spec coverage (Fase 1 scope list in the spec): CI ✔ T2 · typecheck ✔ T1 · Prettier removed ✔ T3 · commitlint/husky ✔ T4 · eslint-plugin-react ✔ T8 · a11y and correctness to error ✔ T8, T9 · stale name ✔ T6 · consumer names ✔ T6 · strings to dictionary ✔ T7 · English comments ✔ T10 · blocks ✔ T5 · README English ✔ T11 · PRODUCT/DESIGN sync ✔ T11 · engines ✔ T2 · build script ✔ T12.
- Deferred on purpose: `react/no-array-index-key` (25 hits, behavioural review) → Fase 3 with the per-component split; `es-CL` fallback removal → Fase 3 (behaviour); Node 22 in `publish.yml` → needs a real release to verify.
- Name consistency: `npm run typecheck` (T1) used by T2, T4 hook, and every gate; `TAX_RATE` (T5); dictionary keys in T7 match between `messages.ts`, `es.ts` and component usage; `table.expandRow` (T9) added conditionally.
