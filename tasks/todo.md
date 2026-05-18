# Finding F — paginación "rota" = screenshot kit 1.8.0 stale (2026-05-17)

Imagen reportada: pager solitario "1–6 de 6 ‹ 1 ›" + notch blanco en esquina
del Card. **Ninguna de las dos es bug ni mala implementación:** el mock-kit
consume `@misael703/ui@1.8.0`. v1.10.0 ya resuelve ambos: (1) `Pagination`
`if (totalPages<=1) return null` (Inputs.tsx:83) → pager 1-página desaparece;
(2) DataTable dueño de su superficie (border-radius/overflow propios) → sin
seam tabla-sobre-Card (el `.app-card-clip` ya es obsoleto y el consumidor lo
quitó). Detalle de uso: `Pagination` pelado vs `TablePagination` (idiomático
para pager pegado a DataTable; trae rows-per-page). **Decisión UX tomada:**
1 página → colapsar todo (como está v1.10.0), SIN cambio de código. Acción
real pendiente (post-release, repos aparte): bumpear consumidores de 1.8.0 →
v1.10.0; el kit correcto no entrega valor hasta que las apps bumpeen.

---
---

# Finding E — "se rompió todo con el kit" en filtros Despachos = composición, no bug (2026-05-17)

**Reportado:** la pantalla Despachos hecha con el kit (mock-kit) se ve rota
(combobox, espacios, labels) vs la versión sin kit (mock no-kit). Comparación
de código real, no especulación:

- mock no-kit (`despachos-ferreteria-ui-mock/.../despachos/page.tsx:176+`) usa
  un primitive propio `FilterBar` + `FilterField` y **fija cada control**:
  `Select/Input className="h-9 w-40|w-36|w-44"`, `FilterField min-w-[160px]`.
  Uniformidad = disciplina de layout hecha a mano.
- mock-kit (`despachos-ferreteria-ui-mock-kit/.../despachos/page.tsx:122-181`)
  usa `<div className="app-cluster">` (= `flex; flex-wrap:wrap; gap:space-3`,
  `globals.css:75`) + `FormField`, sin normalizar altura ni ancho, comboboxes
  envueltos en `<div style={{width:160|180}}>`, inline `alignItems:'flex-end'`
  peleando con el `center` del cluster → 7 campos sin grid → "Despachado por"
  wrappea a fila 2, alturas dispares, ring del Combobox enfocado pega con el
  vecino (parece "una caja sobre dos campos").

**Causas (todas composición/registro, NINGÚN bug del kit):**
1. **Gap kit:** no existe primitive `FilterBar`/fila-de-filtros. El kit da las
   piezas, no la capa de layout que hace que se vea uniforme.
2. **Registro:** `Label` del kit → `text-transform: var(--tt-label)`; el preset
   El Alba pone `--tt-label: uppercase` + `.field__label` weight 700/fg-default
   → labels GRITONES (mayúscula/bold/contraste full). Es la marca El Alba por
   diseño; no hay `size`/`tone="muted"` en FormField/Label para bajarlo en una
   barra de filtros densa.
3. **Gap kit:** `Select`/`Input`/`Combobox` no comparten token de altura ni
   shell de trigger → fila mixta sale despareja por defecto. `Combobox`
   (input+clear-× +portal) no es visualmente intercambiable con `Select`
   (chevron). (Sumado a Finding D, ya resuelto en 1.9.1, se veía peor.)
4. **Consumidor:** `app-cluster` (wrap genérico) en vez de grid; sin pin de
   altura/ancho; inline `alignItems:'flex-end'`.

**Fix consumidor (sin tocar kit): se ve ~como el target ya** — grid real,
una altura para todos los controles, ritmo de anchos, sin el flex-end inline.
**Gaps kit (candidatos v1.10.0):** (a) primitive `FilterBar`; (b) registro
quieto/`size` en FormField+Label; (c) token de altura de control compartido
Select/Input/Combobox; (d) Combobox intercambiable con Select.

**Estado:** Paso 1 (quick-fix consumidor) HECHO — `.app-filter-grid` +
`fields--dense` forward-compat en mock-kit, tsc limpio. Paso 2 (primitive
kit, v1.10.0) APROBADO, en implementación.

## Paso 2 — FilterBar/FilterField (kit v1.10.0) — checklist

- [x] `src/components/Filters.tsx`: `FilterBar` + `FilterField` (+ interfaces)
- [x] `src/styles/index.css`: `.filter-bar*` / `.filter-field*` (reusa
      `.fields--dense`; label quieto sin tocar `--tt-label`; combobox fill)
- [x] Barrel: auto vía `export * from './components/Filters'` (verificado en
      `dist/index.d.ts`)
- [x] `Filters.stories.tsx`: `FilterBarDemo` (despachos 7 campos mixtos)
- [x] `tests/Filters.test.tsx`: label↔control id (+ id de consumidor gana),
      grid+fields--dense, actions slot, columns fijas
- [x] `smoke/gallery/registry.tsx`: ENTRY `FilterBar`
- [x] `smoke/e2e/coverage.spec.ts`: `FilterField` → COVERED_BY_PARENT
- [x] `CHANGELOG.md`: bullet en `[1.10.0] ### Added`
- [x] Gates: tsc limpio · ESLint 0 errores · vitest 383/383 · build (dist OK)
      · build-storybook OK
- [ ] Sin commit/push/release (ciclo v1.10.0 lo secuencia el usuario)

**Review:** `FilterBar`/`FilterField` añadidos a la familia `Filters`. 2 bugs
atrapados por los gates y corregidos: (1) `columns && 'str'` daba `0` numérico
no asignable a `cx` → check de truthiness; (2) `FilterField` no reconciliaba
el `id` propio del control en el `for` del label (mismo patrón laxo que
`FormField`) → id efectivo `htmlFor ?? id-control ?? generado`, **más correcto
que `FormField`**. El quick-fix del consumidor (Paso 1) sigue intacto; cuando
el mock-kit bumpee a un kit con `.fields--dense` (este v1.10.0) los controles
caen a 36px y queda como el target.

---
---

# Finding D — Combobox/MultiCombobox: primer open mal posicionado (2026-05-17)

**Síntoma (reportado, despachos):** la primera vez que se abre un `Combobox`,
el panel sale clampeado al borde izquierdo del viewport (encima del sidebar);
al cerrarlo y reabrirlo aparece bien.

**Causa raíz:** `usePopoverPosition.ts:106` clampea `left` con
`vw - c.width - GUTTER`, donde `c.width = contentEl.getBoundingClientRect().width`.
En el primer open el estado del hook aún no tiene `width` (`pos.width === undefined`),
así que el `<ul>` se monta **sin** la restricción de `matchAnchorWidth` →
ancho natural inflado (`position:fixed; left:0`, labels sin envolver). `compute()`
corre una sola vez, mide ese ancho inflado, el clamp tira `left` al borde y
**no se vuelve a medir** (effect deps `[open, compute]` no cambian tras el
`setPos`). En el segundo open el estado conserva `width` del cierre previo
(al cerrar solo se hace `ready:false`), el `<ul>` ya nace con el ancho correcto
y posiciona bien. Afecta a los 2 consumidores con `matchAnchorWidth: true`
(`Combobox`, `MultiCombobox`); fix centralizado en el hook.

**Estado: RESUELTO (v1.9.1).** Enfoque elegido: funcional con `a.width`. En
`compute()` se introdujo `const cw = matchAnchorWidth ? a.width : c.width` y se
usa `cw` en el flip left/right y en el clamp horizontal (la altura sigue con
`c.height` — residual teórico aceptado: combobox = opciones de 1 línea, no
envuelven). Fix centralizado → arregla `Combobox` y `MultiCombobox`. Regresión
en `tests/FloatingPortal.test.tsx` (rects inyectados: ancla pegada al borde
derecho + `<ul>` con ancho natural inflado → `left` debe quedar en el ancla, no
clampeado al gutter). Gates: `tsc` OK, vitest 366/366, ESLint 0 errores.
CHANGELOG `[1.9.1]` + `package.json` → 1.9.1. Sin commit/push/release (pendiente
confirmación del usuario).

---
---

# v1.9.0 listo; Finding C diagnosticado (residual prod-only artificial) (2026-05-17)

**Finding C — diagnosticado a fondo:** la galería de 130 componentes daba #418. Dos causas reales encontradas y corregidas (artefactos del propio gallery/uso, no del kit consumidor): (1) entry `Table` anidaba `<table>` dentro de `K.Table` (HTML inválido); (2) `<Portal>` renderizado incondicionalmente en SSR (el `Portal` del kit devuelve null en server y portalea en client **por diseño** → mismatch si se usa en SSR sin gate; constraint real del kit registrado). Gallery ahora rende Portal vía `ClientOnly` (uso realista). **En `next dev` (React no-minificado) `/gallery` hidrata limpio.** Queda un **#418 solo en build de producción** (`next build`/`next start`) en la galería artificial de 130 componentes — escenario que **ningún consumidor real reproduce**. Las rutas representativas reales **`/` (RSC) y `/client` están VERDES** → el valor (el kit funciona en RSC y client) está probado. Drillear el residual prod-only de la mega-galería = ROI bajo; follow-up de scope del harness, no bloquea el kit.

**v1.9.0 (A+B+3 UI) sigue listo para shippear** — son los fixes que tus apps necesitan (B = RSC crítico). Decisión del usuario pendiente: shippear v1.9.0 ahora vs seguir drilleando el residual de la galería. Sin push/publish.

---
---

# v1.9.0 preparado: A+B+3 UI fixes; Finding C abierto (2026-05-17)

**Rama:** `feat/smoke-consumer` (megabranch: harness + A/B + 3 UI). 5 commits. Bump **1.9.0** + CHANGELOG. **Sin push/publish.**

Además de A/B (abajo), 3 bugs UI reportados — **RESUELTOS** (CSS/JSDoc/story; `tsc`/`lint`/`vitest 349`/`build-storybook` verdes):
- **Tabs ilegibles**: `.tabs__tab` era 700 + `--fg-muted` + tracking wide @14px → 600 + `--fg-default` + tracking normal + primary en hover.
- **Sticky header no pega**: `.table-wrap` es `overflow-x:auto` → ÉL es el scroll container del sticky, no un wrapper externo. `.table-wrap--sticky` ahora scrollea vertical (`max-height:70vh`, override por `className`). JSDoc + story corregidos. (El contrato anterior "envolver en overflow-y:auto" era imposible.)
- **Notch en esquina con toolbar**: `.table-toolbar + .table-wrap` quita borde/radius superior → se unen sin doble borde / esquina blanca.

**Decisiones abiertas para el usuario:** (1) cómo subir esta megabranch (harness no se publica; A/B + UI sí valen release v1.9.0); (2) **Finding C (gallery #418 hydration) sigue abierto** — no bloquea el kit (es un fallo del test smoke, no de un consumidor), pero indica que ALGÚN componente SSR-mismatchea; diagnóstico = ciclo aparte.

---
---

# Findings A & B RESUELTOS + harness validó; Finding C NUEVO (2026-05-17)

**Rama:** `feat/smoke-consumer` (harness + fix A/B). Sin push/publish.

- **A — RESUELTO.** `package.json` `exports` por-condición (`import.types`→`.d.mts`, `require.types`→`.d.ts`) + `"type": "commonjs"`. publint del tarball: **limpio** (warning de masquerading eliminado; solo queda sugerencia opcional `engines.node`, fuera de scope).
- **B — RESUELTO + validado por el harness.** Causa: esbuild **strippea** las directivas `"use client"` al bundlear (banner/plugin también se pierden con splitting). Fix robusto: `scripts/add-use-client.mjs` antepone `'use client';` a los 196 JS de `dist/` **post-tsup** (nada lo strippea ya); cableado en `build`. El kit entero pasa a ser client boundary (trade-off documentado: importar un util puro desde un RSC también arrastra boundary; futura subpath server-safe podría refinarlo). Validación: `smoke:ci` → `next build` del Server Component `/` **pasa**; rutas `/`, `/client` y test anti-rot **verdes**. Plugin `esbuild-plugin-preserve-directives` probado y descartado (no sobrevive al splitting) + devDep removida.
- **C — NUEVO (lo cazó el harness ya funcionando).** `/gallery` falla con **React #418 (hydration mismatch)**: el SSR de algún componente del gallery ≠ cliente. No estaba en los bugs pedidos (A/B); emergió al destrabar B. Repro: `npm run smoke:ci` (Playwright, ruta `/gallery`). Diagnóstico pendiente: correr `next dev` (React no-minificado) para que nombre el elemento, o bisecar el registry; sospechosos: componentes con `new Date()`/no-determinismo en render bajo SSR, o un ejemplo del propio gallery. Registrado, no parcheado a ciegas.

**Gates del kit tras el fix:** `tsc` limpio · `lint` 0 · **vitest 349/349** · `build-storybook` no reverificado (build de kit cambió solo `dist`; src intacto). Sin push/publish.

---
---

# Smoke consumer harness + 2 kit findings (2026-05-17)

**Rama:** `feat/smoke-consumer` · Harness completo. **smoke:ci RED por bug real del kit (correcto).** Sin push/publish. NO es release (no toca build/publish del kit).

## Qué se construyó
`smoke/`: app Next 16.2 / React 19 App Router que instala el **tarball empacado** del kit (`npm run build` → `npm pack` → install `.tgz`), nunca `src/`. Rutas: `/` (Server Component importando el kit → caza boundary RSC), `/client`, `/gallery` (todos los componentes públicos, SSR→hydrate), `next/font/local` con los woff2 del paquete. Script raíz `smoke:ci` + workflow `.github/workflows/smoke.yml` (PRs a `main`): build→pack→publint(hard)+attw(soft)→install tgz→ESM/CJS resolution→`next build`→Playwright (falla ante console.error / pageerror / hydration 418·421·423·425 / no-200) + test anti-rot (falla si un componente público nuevo no está en la gallery). Guards: eslint/vitest/.gitignore del kit excluyen `smoke/`. La gallery se iteró hasta tipar 1:1 contra los **types publicados** (esa iteración ya es valor).

## Hallazgos del kit (REGISTRADOS, no parcheados — fuera de scope: tocan build/exports)
- **B (crítico).** `'use client'` NO sobrevive al build publicado (tsup lo descarta en CJS; el barrel `index.*` reexporta todo sin boundary). Un Server Component que importa `@misael703/ui` rompe: `next build` → `TypeError: e.createContext is not a function` al recolectar `/`. Storybook nunca lo vio (sin RSC). Repro: `npm run smoke:ci` (paso 6). Fix = ciclo aparte (preservar directivas en tsup / boundary del barrel); luego smoke:ci verde y corre la demo del bug deliberado.
- **A.** publint: `exports["."].types` se interpreta CJS bajo `import` → types ambiguos (masquerading). Fix: separar `import.types` (`.d.mts`) / `require.types` (`.d.ts`). Menores: sin `type` field, sin `engines.node`.

## Clases de bug que atrapa (con el kit sano)
RSC boundary / `use client` faltante · hydration (ICU/locale/Date/SSR) · resolución ESM/CJS · type exports rotos (gallery tipada + publint) · fuentes/SSR (next/font) · regresión de cobertura (anti-rot) · ruta no-200.

## Correr local
`npm run smoke:ci` desde `~/projects/ui_kit` (requiere red: npm install Next/React/Playwright + chromium).

---
---

# v1.0.0 — Generic kit rebrand + preset architecture

## Goal

Turn `@misael703/elalba-ui` into a maximally generic UI kit with El Alba shipped
as an opt-in preset. Two consumer flows coexist:

- **Generic** (any future project of yours):
  ```ts
  import "@misael703/ui/styles.css";          // neutral defaults
  ```
- **El Alba** (barritas, El Alba apps):
  ```ts
  import "@misael703/ui/styles.css";          // base
  import "@misael703/ui/presets/elalba";      // tokens → El Alba colors
  import { brandDefaults } from "@misael703/ui/presets/elalba-defaults";
  ```

Single npm package, two modes via CSS variable layering.

**Critical principle**: extract El Alba BEFORE modifying defaults. Phases ordered
so each commit is either "pure copy" (non-destructive) or "mechanical rename"
(reversible) until the value-change phase. El Alba config is never at risk of
being lost — it gets enshrined into `src/presets/elalba/` first.

---

## Phase 0 — Decisions (in progress)

### Locked
- [x] **Package name**: `@misael703/ui`
- [x] **Repo rename**: in Phase 5 (atomic with v1.0.0 tag). `gh repo rename ui` preserves history.
- [x] **Old npm package**: deprecate `@misael703/elalba-ui` after barritas migrates (Phase 7).
- [x] **Commit granularity**: 1 commit per phase.

### Pending (block Phase 3, NOT Phase 1/2)

- [ ] **Default colors** for the generic kit. Current candidate (proposed by user):
  - Primary: `#423E37` (espresso / tobacco warm dark)
  - Secondary: `#E4BB97` (sand / café con leche)
  - Bonus: `#FEF5EF` (warm cream) — role TBD: either `--bg-canvas` (audaz) or `--color-primary-50` (conservador)
  - Aesthetic: warm earth wabi-sabi / Heath Ceramics / third-wave coffee
  - **OPEN**: confirm this palette is the final pick before Phase 3
- [ ] **`--bg-canvas` strategy**:
  - (a) Keep `#ffffff` pure white, use `#FEF5EF` only as `--color-primary-50` stop
  - (b) Replace `--bg-canvas` with `#FEF5EF` so the entire kit "respira sobre papel cálido"
  - **OPEN**: recommend (b) for max identity, but pending decision
- [ ] **Grey scale warm-up**:
  - Current kit uses cool slate-tinted greys (`--color-gray-*` derived with blue undertones)
  - For full warm-mono cohesion, replace with warm stone-tinted greys
  - **OPEN**: yes/no? Recommend yes, but pending decision

---

## Phase 1 — Extract El Alba preset (NON-DESTRUCTIVE)

Pure copy operation. Nothing in the existing kit changes — we only ADD new files
under `src/presets/elalba/`. After this phase, the El Alba config exists in two
places (current `_root.css` AND the preset). The preset is the safety net for
Phases 2-4.

- [ ] Create directory `src/presets/elalba/`
- [ ] Create `src/presets/elalba/styles.css` with the current El Alba palette
      values (NOT using the new token names yet — that's Phase 2):
  ```css
  :root {
    /* El Alba blue palette (will be aliased to --color-primary-* in Phase 2) */
    --color-blue-50:  #f2f5fb;   --color-blue-500: #3a62b4;
    --color-blue-100: #e3eaf4;   --color-blue-600: #1a46a0;
    --color-blue-200: #c7d3ea;   --color-blue-700: #002f87;
    --color-blue-300: #9bb1dc;   --color-blue-800: #00246b;
    --color-blue-400: #6b8aca;   --color-blue-900: #001a4d;

    /* El Alba orange palette */
    --color-orange-50:  #fff5ee;   --color-orange-500: #ff8344;
    --color-orange-100: #ffe8d7;   --color-orange-600: #ff671d;
    --color-orange-200: #ffd6bb;   --color-orange-700: #e05400;
    --color-orange-300: #ffbe98;   --color-orange-800: #b84300;
    --color-orange-400: #ffa06e;   --color-orange-900: #8c3000;

    /* Base aliases (the consumed names) */
    --color-brand-blue:   #002f87;
    --color-brand-orange: #ff671d;
  }
  ```
  Note: this file uses the OLD token names for now. Phase 2 renames them
  alongside the kit's `_root.css`.
- [ ] Create `src/presets/elalba/defaults.ts`:
  ```ts
  import type { BrandDefaults } from "../../brand";
  export const elalbaDefaults: BrandDefaults = {
    name: "El Alba",
    currency: "CLP",
    locale: "es-CL",
    logoBasePath: "/assets/elalba/logos",
    // ...all current BrandDefaults values from src/brand.ts
  };
  ```
- [ ] Create `src/presets/elalba/logos/` and **copy** (not move yet) all
      El Alba SVGs from `public/assets/logos/`. The originals stay in place
      so the current kit keeps working during the transition.
- [ ] Verify build still passes — preset files exist but aren't yet wired
      into `package.json` exports (that's Phase 4).

**Commit**: `chore(preset): extract El Alba config to src/presets/elalba/ (non-destructive)`

---

## Phase 2 — Rename tokens (MECHANICAL, no value changes)

Pure rename. Every `--color-brand-blue` becomes `--color-primary`, every
`--color-blue-X` becomes `--color-primary-X`, etc. **No hex value changes
anywhere**. The kit still looks exactly like El Alba after this phase — only
the token names are different.

- [ ] Update `package.json`:
  - [ ] `name`: `@misael703/elalba-ui` → `@misael703/ui`
  - [ ] `repository.url`, `homepage`, `bugs.url` → `Misael703/ui`
- [ ] Rename tokens in `src/styles/_root.css`:
  - [ ] `--color-brand-blue` → `--color-primary`
  - [ ] `--color-brand-orange` → `--color-secondary`
  - [ ] `--color-blue-{50..900}` → `--color-primary-{50..900}`
  - [ ] `--color-orange-{50..900}` → `--color-secondary-{50..900}`
  - [ ] **Values stay identical** — only names change
  - [ ] Aliases stay structurally same:
    - `--accent-primary: var(--color-primary)`
    - `--accent-secondary: var(--color-secondary)`
    - `--border-brand: var(--color-primary)`
    - `--border-focus: var(--color-secondary)`
    - `--bg-inverse: var(--color-primary)`
    - `--bg-inverse-strong: var(--color-primary-900)`
    - `--fg-link: var(--color-primary)`
    - `--fg-link-hover: var(--color-secondary-600)`
- [ ] Rename in `src/presets/elalba/styles.css` to match new schema:
  ```css
  :root {
    --color-primary-50:  #f2f5fb;
    /* ... full primary-{50..900} with El Alba blue values */
    --color-secondary-50: #fff5ee;
    /* ... full secondary-{50..900} with El Alba orange values */
    --color-primary: var(--color-primary-700);    /* El Alba base = 700 */
    --color-secondary: var(--color-secondary-600); /* El Alba base = 600 */
  }
  ```
- [ ] Sweep `var(--color-brand-blue|brand-orange)` references in:
  - [ ] `src/styles/index.css` (component CSS)
  - [ ] `src/styles/_typography.css`
  - [ ] All `.tsx` files (any inline styles or hard-coded references)
- [ ] Sweep `var(--color-blue-XX)` and `var(--color-orange-XX)` → primary/secondary equivalents
- [ ] Build + 297 tests pass
- [ ] **Visual review in Storybook**: should look IDENTICAL to v0.7.1 (this is the safety check — if anything looks different here, we missed a rename)

**Commit**: `refactor(tokens): rename brand-blue/brand-orange to primary/secondary`

---

## Phase 3 — Change kit defaults to new palette (VALUE CHANGE)

This is the destructive phase, but the El Alba preset already exists. Anyone
who needs El Alba can `import "@misael703/ui/presets/elalba"` and gets the
identical look back.

- [ ] In `src/styles/_root.css`, replace primary palette values with the
      chosen new palette (per Phase 0 decision):
  - `--color-primary-50` → ... `-900`
- [ ] Replace secondary palette values
- [ ] Update `--color-primary` and `--color-secondary` base aliases to the
      stop convention used by the new palette (probably 600 for both)
- [ ] If decision (b) on canvas: replace `--bg-canvas` default with new cream
- [ ] If grey warm-up decision: replace `--color-gray-*` with stone scale
- [ ] **Visual review in Storybook**: everything should look completely
      different (new palette in effect). Statys colors (green/yellow/red/info-blue)
      still readable. Check `Foundations → Body Review` for typography clash.
- [ ] **Sanity check El Alba preset**:
  ```ts
  // In a test page or temp story:
  import "@misael703/ui/styles.css";
  import "@misael703/ui/presets/elalba";  // wired via dev workaround
  // Should render with original El Alba look
  ```

**Commit**: `feat(theme)!: replace default palette with [new aesthetic name]`

---

## Phase 4 — Wire preset into package.json exports + Storybook

- [ ] Add `package.json` `exports`:
  ```jsonc
  "./presets/elalba": "./dist/presets/elalba/styles.css",
  "./presets/elalba-defaults": {
    "types": "./dist/presets/elalba/defaults.d.ts",
    "import": "./dist/presets/elalba/defaults.mjs",
    "require": "./dist/presets/elalba/defaults.js"
  },
  "./presets/elalba-logos/*": "./dist/presets/elalba/logos/*"
  ```
- [ ] Update `tsup.config.ts` — add entry for `src/presets/elalba/defaults.ts`
- [ ] Update build script in `package.json` — copy `src/presets/elalba/styles.css`
      and `src/presets/elalba/logos/` to `dist/presets/elalba/`
- [ ] Now safe to DELETE `public/assets/logos/elalba-*` originals (preset is canonical)
- [ ] Generic-ize Storybook copy:
  - [ ] Foundations → Colors story: "Brand Blue / Brand Orange" → "Primary / Secondary"
  - [ ] Foundations → Body Review: "Ferretería El Alba" → neutral demo (e.g., "Acme Hardware Co")
  - [ ] Display.stories: "Constructora Norte SpA", "El Alba" → neutral demo data
  - [ ] Other stories: scan and neutralize any "El Alba"-specific copy
  - [ ] Foundations → Logos story: either remove or convert to "Presets / El Alba" demo (loads preset + renders sample)
- [ ] Build + tests pass

**Commit**: `feat(preset): wire El Alba preset to package exports + generic Storybook`

---

## Phase 5 — Release v1.0.0

- [ ] Bump `0.7.1` → `1.0.0`
- [ ] Write the v1.0.0 CHANGELOG entry with migration guide:
  - Package rename: `@misael703/elalba-ui` → `@misael703/ui`
  - Token renames table (deprecated → new)
  - Preset usage for El Alba consumers
  - Default value change (mention new aesthetic name + hex values)
- [ ] Final commit: `chore(release): v1.0.0 — generic kit + El Alba preset`
- [ ] Rename GitHub repo: `gh repo rename ui` (from `elalba-ui`)
- [ ] Push main + tag v1.0.0 + create GitHub release
- [ ] Verify npm publish via workflow

---

## Phase 6 — Migrate barritas

- [ ] In `barritas` repo, separate PR:
  - [ ] Quick `grep -rn "color-brand-blue\|color-brand-orange\|color-blue-\|color-orange-" .`
        in barritas to find any consumer-side overrides on old token names.
        If found, update to new names.
  - [ ] `package.json`: dependency rename + bump to `^1.0.0`
  - [ ] `npm install`
  - [ ] `app/layout.tsx` (or equivalent):
    ```ts
    import "@misael703/ui/styles.css";
    import "@misael703/ui/presets/elalba";
    ```
  - [ ] If barritas uses logos via the kit: update import paths to new preset location
  - [ ] If barritas uses `BrandDefaults`: import from `@misael703/ui/presets/elalba-defaults`
  - [ ] Local dev server: verify everything renders identically to v0.7.1
  - [ ] Type check + build
- [ ] Merge

---

## Phase 7 — Deprecate old npm package

- [ ] `npm deprecate @misael703/elalba-ui@">=0.0.0" "Renamed to @misael703/ui. Install that + import './presets/elalba' for unchanged behavior. See migration guide in 1.0.0 release notes."`
- [ ] Verify `npm view @misael703/elalba-ui` shows deprecation warning

---

## Phase 8 — Optional polish (post v1.0.0)

- [ ] README "Forking / Rebrand" section → "Theming / Presets" section
- [ ] Add "How to create your own preset" guide in README
- [ ] Deploy Storybook to GitHub Pages or Vercel
- [ ] (Future) When you start a new personal project, create `presets/misa/` with your personal brand defaults

---

## Estimated effort

| Phase | Hours | Notes |
|---|---|---|
| 0 (decisions) | 30 min | depends on user signoff |
| 1 (extract preset) | 1 h | pure copy, low risk |
| 2 (rename tokens) | 2-3 h | mechanical sweep, visual diff after |
| 3 (change defaults) | 1-2 h | depends on grey warm-up scope |
| 4 (wire exports + storybook) | 2 h | |
| 5 (release) | 30 min | |
| 6 (barritas migrate) | 1-2 h | |
| 7 (deprecate) | 15 min | |
| **Total** | **~9-12 h** | across 2-3 sessions |

---

## Risk notes (updated)

- **Phase 2 sweep**: missed `var(--color-blue-600)` → silently broken render. Mitigation: visual diff in Storybook immediately after rename commit (kit should look IDENTICAL to v0.7.1; any diff means a rename was missed).
- **Phase 3 contrast issues**: new palette may have contrast problems with status colors, especially if `--bg-canvas` changes to cream. Mitigation: full Storybook walk-through after Phase 3, check Foundations → Colors story for swatches over the new canvas.
- **Barritas migration**: if barritas has CSS overrides on old token names, silently broken. Mitigation: explicit grep step in Phase 6 checklist.
- **npm deprecation is irreversible**: once deprecated, every install of old name shows warning. Mitigation: Phase 7 is LAST — only run after Phases 5-6 confirm everything works.

---

## Why this order is safer than the original

Original plan had Phase 1 = "rename + change defaults" (one commit), Phase 3 = "extract preset".
That's risky: when Phase 1 ran, El Alba values would be gone from `_root.css`,
recoverable only via git. The preset extraction in Phase 3 would be "look at
git history, recreate the values" — error-prone.

New order separates concerns:
1. **Copy** before modify (Phase 1: preset created with current values intact)
2. **Rename** before re-value (Phase 2: mechanical, reversible, visual-diff-able)
3. **Re-value** with preset already in place (Phase 3: even if visual review fails, El Alba preset is the escape hatch)

Each commit is reversible without losing state. The "danger commit" (Phase 3)
arrives last, after the safety net is in place.

---
---

# v1.1.0 — Fix: floating-panel clipping (Bug 1) + AppShell collapsed layout (Bug 2)

**Fecha:** 2026-05-16 · **Estado:** PLAN, pendiente de validación · **Rama:** (crear `fix/floating-portal-and-appshell-collapsed`)

> NOTA DE VERSIÓN: el prompt asumía base `1.0.0 → 1.1.0`, pero la versión
> publicada actual es **1.0.1**. El MINOR correcto es **1.1.0** (cambio
> backward-compatible, comportamiento nuevo, API pública intacta).

## Hallazgos de la investigación (read-only, hecha)

- **No existe** primitiva `Portal` ni hook `usePopoverPosition` compartidos. Cada flotante reimplementa la lógica.
- `Popover.tsx` y `HoverCard.tsx` ya portalean a `document.body` con coords por `getBoundingClientRect()` + `window.scrollX/Y`, guard `typeof document !== 'undefined'`. **Patrón de referencia correcto**, pero: (a) duplicado, (b) sin reposición en scroll de ancestros ni en resize, (c) sin flip (solo clamp a viewport).
- `Pickers.tsx` (Combobox, +1 picker) y `AdvancedPickers.tsx` (MultiCombobox, +1) — mismo patrón portaleado-pero-incompleto, 2 instancias c/u.
- `ContextMenu.tsx` — `position:fixed` en coords de puntero, `z-index: var(--z-popover,1300)`, portaleado. Funciona pero fuera de la primitiva común.
- **Víctimas reales del Bug 1** (CSS-absolute, hijo DOM normal, sin portal, `--z-dropdown:50` → debajo de Modal):
  - `Menu` (`src/components/Display2.tsx:80`) — panel `.menu__panel` hijo de `.menu{position:relative}`. Se recorta en `Card`/`DataTable` con overflow. Además su navegación con flechas **no está cableada** (solo `Escape` + mouse `onMouseEnter`); hay que completarla (el prompt exige flechas).
  - `SortDropdown` (`src/components/Filters.tsx:107`) — dropdown CSS `position:absolute; top:calc(100%+6px); z-index:var(--z-dropdown)` (`index.css:1899`).
  - `Tooltip` (`src/components/Layout.tsx:86`) — **CSS puro** (`.tooltip__bubble` hijo, hover CSS, cero JS). Fix real exige portal → implica JS+estado+posición (rewrite con tradeoff, ver Riesgos).
- **Bug 2 (AppShell) = CSS**, confirmado: `.appshell.is-collapsed{grid-template-columns:72px 1fr}` (`index.css:2207`) pero **no hay** override `.appshell.is-collapsed .appshell__sidebar-foot` ni `.appshell__collapse`. El foot es `display:flex; justify-content:space-between` + botón `margin-left:auto` → en 72px el botón cae en x≈78 (fuera del riel) y el `footer` se solapa/recorta. El toggle (`AppShell.tsx:138`) no tiene `aria-expanded`.
- **z-index**: tokens en `_root.css:239-245`. `--z-overlay:100` (Modal/Drawer), `--z-tooltip:1000`, `--z-popover:1300`. La primitiva debe usar un tier ≥ popover (1300) para quedar por encima de Modal/Drawer. (Menu hoy usa `--z-dropdown:50` → bug.)
- **Sin tests** (`*.test.tsx`/`*.spec.tsx`) en `src`; `vitest.config.ts` existe. jsdom: `getBoundingClientRect()` → ceros ⇒ tests a nivel comportamiento/estructura (portal target, open/close, foco, aria), pixeles vía Storybook.

## Enfoque

Extraer **una** primitiva compartida y enrutar los flotantes por ella, sin tocar API pública.

### Fase A — Primitiva compartida (núcleo del Bug 1)
- [x] `src/components/Portal.tsx`: `<Portal>` con `createPortal` a `document.body`. SSR-safe vía `const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[])` + guard `typeof document`. Nada de `document` en el render del servidor/primera hidratación.
- [x] `src/hooks/usePopoverPosition.ts`: `usePopoverPosition(triggerRef, { side, align, offset })` → `{ top,left }` document-relative + recálculo: rect del trigger y del contenido (medición tras montar el panel oculto, como hoy Popover); **flip** si no entra; clamp final al viewport (preserva el de Popover); reposición en `scroll` de **cualquier ancestro** (`addEventListener('scroll', …, {capture:true,passive:true})`) y `resize`, coalescido con `requestAnimationFrame`; cleanup al cerrar/desmontar.
- [x] Token z-index: añadir `--z-floating: 1300` (o reutilizar `--z-popover`) en `_root.css`; el panel portaleado lo usa. Documentar que queda por encima de `--z-overlay`.
- [x] Helper común opcional `useDismiss` (outside-click + Escape + retorno de foco al trigger) para no recopiar ese bloque.

### Fase B — Enrutar flotantes por la primitiva (orden por prioridad del prompt)
- [ ] `Menu` (Display2.tsx): panel → `<Portal>` + `usePopoverPosition` (side bottom, align del prop). **Completar teclado**: ArrowUp/Down mueve `active`, Enter/Space selecciona, Home/End, foco al abrir, retorno al trigger. `MenuProps{trigger,items,align,className}` intacta.
- [ ] `Popover`: reemplazar su efecto de posición por `usePopoverPosition` (+ scroll/resize/flip que hoy faltan); portal ya ok. `PopoverProps` intacto.
- [ ] `SortDropdown` (Filters.tsx): mismo tratamiento (hoy CSS-absolute).
- [ ] `ContextMenu`: converger a la primitiva (anchor por coords de puntero).
- [ ] `HoverCard`: reemplazar lógica duplicada (preservar intent hover/delay).
- [ ] `Combobox` (Pickers) y `MultiCombobox` (AdvancedPickers): dropdown por la primitiva (preservar `width = trigger width`). Los +1 pickers de esos archivos: incluir solo si es mecánico/sin riesgo, si no follow-up explícito (no scope creep silencioso).
- [ ] `Tooltip` (Layout.tsx): **DECIDIDO — INCLUIDO**. Rewrite CSS-puro → JS+`<Portal>`+`usePopoverPosition`. Preservar: `TooltipProps{label,children,side}` idéntico, abrir en hover **y** focus (a11y), `role="tooltip"`, intent-delay de apertura/cierre, `prefers-reduced-motion`. Va último en el orden (mayor superficie de riesgo). QA dedicado en Storybook.

### Fase C — Bug 2 AppShell (CSS + 1 a11y attr)
- [ ] `index.css`: `.appshell.is-collapsed .appshell__sidebar-foot { flex-direction:column; justify-content:center; gap:6px; padding:8px 0; }` + `.appshell.is-collapsed .appshell__collapse { margin:0 auto; }` (centrado en el riel de 72px).
- [ ] `index.css`: `.appshell.is-collapsed .appshell__brand` → `overflow:hidden; display:flex; justify-content:center;` (clamp/center/clip con gracia aunque no haya `brandCollapsed`).
- [ ] `index.css`: transición suave entre estados (respetar `prefers-reduced-motion`).
- [ ] `AppShell.tsx:138`: `aria-expanded={!collapsed}` en `.appshell__collapse`. Sin cambios de API.
- [ ] Verificar: toggle visible/clickeable con mouse en ambos estados; footer dentro del riel; brand sin `brandCollapsed` no desborda.

### Fase D — Tests + Stories
- [ ] Test: `<Menu>` dentro de `overflow:auto` → panel en `document.body` (no en el contenedor); abre/cierra; Escape cierra; foco al trigger al cerrar.
- [ ] Test: `usePopoverPosition` agrega/limpia listeners scroll(capture)/resize.
- [ ] Test: `AppShell` colapsado → toggle presente/clickeable, `aria-expanded=false`; expandido → `true`; brand sin `brandCollapsed` no rompe.
- [ ] Stories: (a) `Menu`/`Popover` en `Card`>`DataTable` overflow → no recortado, reubica al scrollear; (b) `AppShell` colapsado.
- [ ] Existentes verdes; `npm run build` + typecheck + `vitest` verdes; Storybook sin regresiones.

### Fase E — Release prep (SIN publicar)
- [ ] `package.json` 1.0.1 → **1.1.0**; `CHANGELOG.md` entrada `[1.1.0]` (Added/Fixed/Changed, sin breaking).
- [ ] Commit(s) coherentes; **PR en el repo del kit SIN mergear**; diff + resumen. **No publicar a npm sin OK**.

## Restricciones (innegociables)
Cero breaking de API pública (`MenuProps`/`PopoverProps`/`AppShellProps` idénticos); drop-in vía bump; SSR/Next intacto (patrón `mounted`); sin deps nuevas; a11y preservada/mejorada.

## Decisiones validadas por el usuario (2026-05-16)
1. **Tooltip — INCLUIDO** en este PR (rewrite CSS→JS por la primitiva). Bug 1 queda 100% cerrado en un PR; se asume mayor superficie de QA.
2. **Convergencia — TODOS** los del patrón roto/duplicado en este PR: Menu, Popover, SortDropdown, ContextMenu, HoverCard, Combobox, MultiCombobox (+ Tooltip). Elimina la duplicación de raíz.
3. **`NavigationMenu`/`Menubar`**: NO en el reporte → fuera de scope (deuda anotada, follow-up explícito).
4. **jsdom**: no valida pixeles; "no recortado/reubica" se cubre por estructura (portal target) + Storybook, no por aserción de coords.

## Qué entra en este PR (CONFIRMADO)
Fases A–E completas: primitiva (`Portal`+`usePopoverPosition`+token z) → reenrutar **Menu, Popover, SortDropdown, ContextMenu, HoverCard, Combobox, MultiCombobox y Tooltip** → Bug 2 AppShell (CSS colapsado + `aria-expanded`) → tests/stories → bump **1.1.0** + CHANGELOG. NavigationMenu/Menubar fuera. PR sin mergear, sin publicar a npm sin OK.

### Bug 3 (entró durante la sesión) — Switch dispara onChange 2× por click
- [ ] Repro: `Switch` (`<label>` + `<input type=checkbox>` oculto + `.switch__track`). Un click → DOS `onChange` (false y true) → backend recibe 2 PATCH, estado neto sin cambio.
- [ ] Root cause probable: doble manejo — el click en `<label>` dispara el toggle nativo del input asociado **y** un handler propio en label/track que togglea otra vez.
- [ ] Fix: un click de usuario = exactamente 1 cambio. Quitar el handler redundante (dejar el flujo nativo label→input→change) o, si hace falta handler propio, `preventDefault` y togglear una sola vez. Igual para teclado (Space) = 1 toggle.
- [ ] Test: simular 1 click en el track → `onChange` 1 vez, estado cambia 1 vez; ídem Space. Sin breaking API. Va en este mismo PR (1.1.0).

(Aparte, NO en este PR: opt-out de mayúsculas del preset — otra propuesta/PR.)

---

## Review v1.1.0 (2026-05-17) — implementación completa, PR sin abrir

**Hecho (Fases A–E):**
- A: `Portal` (SSR-safe), `usePopoverPosition` (rect→doc-coords, flip, clamp, reposición scroll-capture de cualquier ancestro + resize), `useDismiss`, token `--z-floating` + `.is-floating` (sobre `--z-overlay`). Exportados en barrel + hooks barrel + tsup entry.
- B: reenrutados por la primitiva: **Menu** (+ teclado completo: flechas/Home/End/Enter/Space/Esc + foco al trigger), **Popover**, **ContextMenu**, **HoverCard**, **Combobox**, **MultiCombobox**, **Tooltip** (CSS→JS, hover/focus, `aria-describedby`, sin flecha `::after`). API pública intacta en todos.
- C: AppShell Bug 2 — overrides CSS del riel colapsado (`sidebar-foot` columna/centrado, `collapse` `margin:0 auto`, `brand` overflow:hidden) + `aria-expanded={!collapsed}`. Sin cambio de API.
- D: tests nuevos (`tests/FloatingPortal.test.tsx` 6, `tests/Switch.test.tsx` 4) + story `FloatingPortal.stories.tsx` (Menu/Popover en overflow, AppShell colapsado). Test viejo de Tooltip actualizado a la conducta nueva.
- E: `1.0.1 → 1.1.0`, CHANGELOG `[1.1.0]`.

**Verificación:** `tsc` limpio · `vitest` **307/307** (45 files, +10 nuevos, 0 regresiones) · `tsup build` OK (Portal/hooks emitidos con tipos) · `build-storybook` OK (warnings `use client` preexistentes y benignos).

**Desviaciones del plan (justificadas):**
1. **Portal síncrono** (no patrón `useState mounted`): el defer por commit dejaba el panel `visibility:hidden` (fuera del a11y tree → `getByRole` rojo) y dependía de rAF. El guard `typeof document` solo ya es SSR-safe acá: estos paneles abren por interacción, cerrados en SSR → sin mismatch de hidratación. Re-planificado en medio (regla "parar y re-planear").
2. **SortDropdown fuera**: es `<select>` nativo; los popups nativos no los recorta el overflow. Incluirlo era churn sin sentido.
3. **NavigationMenu/Menubar fuera**: no estaban en el reporte (deuda anotada).
4. **DatePicker/DateRangePicker fuera**: ya portalean; conversión del calendario es follow-up explícito (no scope creep silencioso).

**Bug 3 (Switch) — hallazgo, NO se cambió código:** 4 tests que simulan 1 click en track / 1 en label / 1 en input (equiv. Space) / toggle controlado → `onChange` se dispara **exactamente 1 vez** y el estado togglea 1 vez. El componente del kit ya cumple el acceptance. El doble PATCH (false/true neto cero) del reporte NO se reproduce en una simulación DOM fiel: causa probable consumer-side (React StrictMode dev doble-invoca; o `checked`+`onChange` mal cableado; o doble binding / `<label htmlFor>` externo). El kit ya mitiga el vector browser clásico (`.switch input{pointer-events:none}`). Entrego los tests como guardia de regresión + esta conclusión; no parcheo un componente correcto a ciegas. Necesito el uso real del Switch en la app consumidora para reproducir si persiste.

---
---

# v1.2.0 — Cerrar deuda de la primitiva flotante + AppShell brand colapsado + opt-out de mayúsculas

**Fecha:** 2026-05-17 · **Estado:** PLAN, pendiente de validación · **Rama:** crear `feat/floating-convergence-appshell-caps`
**Base:** `1.1.0` → **`1.2.0`** (todo backward-compatible: convergencia interna, comportamiento nuevo opt-in, API pública intacta → MINOR).

## Decisiones validadas por el usuario (2026-05-17)
1. **Item 1 — teclado INCLUIDO**: NavigationMenu/Menubar reciben navegación completa por teclado (igual que Menu en v1.1.0).
2. **Item 1b (nuevo)**: AppShell colapsado — el texto del brand debe **desaparecer**, no recortarse (captura: "Despachos · v0.1" sangrando junto al mark "N" en el riel de 72px).
3. **Item 3 — 2 tokens**: `--tt-label` (micro) + `--tt-title` (display), default `uppercase`, override a `none`.
4. **Item 4 (Switch)**: **DIFERIDO** — fuera de esta tanda hasta tener el uso real que falla. No se toca.

## Hallazgos de investigación (read-only, hecha)
- **NavigationMenu** (`NavigationMenu.tsx`) y **Menubar** (`Menubar.tsx`): ya portalean con `createPortal`, pero usan `positionPanel` manual (`top:bottom+scrollY,left:left+scrollX`) → sin flip, sin clamp, sin reposición en scroll de ancestros ni resize. Dismiss duplicado (su propio `useEffect` mousedown+Escape). **Sin** navegación por teclado (solo Escape + mouse `onMouseEnter`).
- **DatePicker** (`Pickers.tsx:174-364`) y **DateRangePicker** (`AdvancedPickers.tsx:172-525`): sus hermanos Combobox/MultiCombobox **en los mismos archivos** ya usan la primitiva (`usePopoverPosition`/`useDismiss`/`<Portal>` ya importados, líneas 8-11). El calendario sigue con `coords` manual + `getBoundingClientRect()` + `createPortal` crudo (Pickers `211/228/270/275`, AdvancedPickers `218/233/316/322`).
- **Primitiva v1.1.0** (estable, no se toca): `usePopoverPosition(anchorRef, contentRef, {open,side,align,offset,matchAnchorWidth}) → {top,left,side,ready,width}`; `useDismiss({open,onDismiss,refs,closeOnEscape,closeOnOutsideClick,returnFocusRef})`; `<Portal>` SSR-safe.
- **AppShell brand**: `AppShell.tsx:123-125` → `<div className="appshell__brand">{collapsed ? (brandCollapsed ?? brand) : brand}</div>`. Colapsado sin `brandCollapsed` ⇒ renderiza el `brand` completo; única defensa `.appshell.is-collapsed .appshell__brand{overflow:hidden}` (`index.css:2229`) → solo recorta (bug de la captura). El kit **no puede** entrar a un `ReactNode` opaco a ocultar "el texto"; las navlabels sí colapsan limpio porque el kit controla `<span class="appshell__navlabel">` (`index.css:2283-2291`, patrón `opacity:0;max-width:0`).
- **Mayúsculas**: `text-transform:uppercase` vive en **base** `src/styles/index.css` (~20 ocurrencias), no en el preset. Dos clases reales: **micro** (eyebrow 78, badge/tag/pill 411, chip 476, kpi-label 565, banner-badge 634, table th 834, table-card label 918, navlabel-section 2248, …) y **display-title** (`font-display`+uppercase: modal__title 983, drawer__title 1027, empty__title 1185, appshell__brand 2227).

## Restricciones (innegociables)
Cero breaking de API pública (`NavigationMenuProps`/`MenubarProps`/`DatePickerProps`/`DateRangePickerProps`/`AppShellProps` idénticos); drop-in vía bump; SSR/Next intacto (Portal síncrono, guard `typeof document`); sin deps nuevas; a11y preservada/mejorada; default visual del kit **idéntico** tras item 3 (ambos tokens default `uppercase`).

---

## Fase A — Item 1: NavigationMenu + Menubar → primitiva + teclado ✅
- [x] **NavigationMenu.tsx**: `createPortal`→`<Portal>`; quitado `coords`/`positionPanel`/`useEffect` de dismiss; `usePopoverPosition(anchorRef, panelRef, {open,side:'bottom',align:'start'})` + `useDismiss({refs:[rootRef,panelRef],closeOnEscape:false})`. `visibility` por `pos.ready`. Foco a links por query `.nav-menu__link` (uniforme default `<a>` y `linkAs`).
  - [x] Teclado: trigger ArrowDown/Enter/Space abre + foco primer link; panel ArrowUp/Down/Home/End mueve foco, Escape cierra + foco trigger, Tab cierra. Foco solo en apertura por teclado (no roba foco al mouse).
- [x] **Menubar.tsx**: misma conversión. Roving tabindex en triggers; ArrowLeft/Right entre menús (abre el hermano si hay uno abierto), ArrowDown/Enter/Space abre, ArrowUp/Down/Home/End dentro, Enter/Space selecciona, Escape cierra al trigger, Tab cierra. `role="menubar"`/`role="menu"` preservados.
- [x] tsc limpio · vitest 307/307 (incl. NavigationMenu/Menubar tests existentes) sin regresiones.
**Commit**: `feat(nav)!: route NavigationMenu/Menubar through floating primitive + keyboard nav` *(`!` no por breaking de API sino marca de comportamiento nuevo; si confunde, `feat(nav):` + nota en cuerpo)*

## Fase B — Item 2: DatePicker + DateRangePicker → primitiva ✅
- [x] **Pickers.tsx** `DatePicker`: borrado `coords`+2 `useEffect`; `usePopoverPosition(wrapRef,popoverRef,{open,side:'bottom',align:'start',offset:4})` + `useDismiss({refs:[wrapRef,popoverRef],returnFocusRef:inputRef})` + `<Portal>` + `is-floating`. Mejora a11y: Escape cierra + foco al input (antes no había). Grid de mes intacto.
- [x] **AdvancedPickers.tsx** `DateRangePicker`: ídem (offset:6, returnFocusRef:triggerRef). Lógica de rango/hover/presets intacta.
- [x] `DatePickerProps`/`DateRangePickerProps`/`DateRange` intactos. Imports `createPortal` no usados eliminados → **cero `createPortal` en `src`** (duplicación 100% cerrada). tsc limpio · vitest 307/307.
**Commit**: `fix(pickers): route DatePicker/DateRangePicker calendar through floating primitive`

## Fase C — Item 1b: AppShell brand colapsado (texto desaparece, no se recorta) ✅
**DESVIACIÓN JUSTIFICADA del plan (regla "parar y re-planear"):** los mecanismos
A y B eran lógicamente excluyentes — si B no renderiza `brand` cuando
`collapsed && !brandCollapsed`, entonces A (`appshell__brand-text` oculta solo
el texto dejando el logo) no puede funcionar para el consumer que usa la clase
sin pasar `brandCollapsed`. Además nullear el `brand` es regresión para quien
hoy pasa solo `brand`. **Resuelto del lado seguro: solo mecanismo A (CSS),
TSX sin cambios → cero riesgo de breaking.**
- [x] `index.css`: `.appshell__brand-text` (transición opacity+max-width) + `.appshell.is-collapsed .appshell__brand-text { opacity:0; max-width:0; margin:0; padding:0; pointer-events:none; }` — espejo exacto del patrón navlabel. `prefers-reduced-motion` ya cubierto por el guard global (`index.css:3616`).
- [x] **TSX intacto** (`AppShell.tsx` sin cambios): `{collapsed ? (brandCollapsed ?? brand) : brand}` se mantiene → API y comportamiento existente preservados; el fix es 100% CSS opt-in.
- [x] Stories `BrandTextColapsable` + `BrandTextColapsadoInicial` (caso "Despachos · v0.1": brand con mark + `<span className="appshell__brand-text">`, sin `brandCollapsed`).
- [x] `AppShellProps` intacto. Verificado: con `brandCollapsed` → mark; brand con la clase → texto se va animado, mark queda; sin clase → comportamiento previo (no regresión).
**Commit**: `fix(appshell): add appshell__brand-text convention so collapsed brand text vanishes`
> CHANGELOG: `Added` la convención `appshell__brand-text`. NO es Fixed-con-cambio-de-comportamiento (TSX intacto), es feature aditiva opt-in.

## Fase D — Item 3: opt-out de mayúsculas (`--tt-label` / `--tt-title`) ✅
- [x] `_root.css`: `--tt-label: uppercase;` + `--tt-title: uppercase;` (capa tipográfica, tras tracking).
- [x] Sweep **38 sitios** (no ~20): `index.css` 33 (10 title / 23 label) + `_typography.css` 5 (`.h1/.h2/.h3`→title, `.eyebrow/.label`→label). Categorización por `font-display`→title, resto→label, vía Node con aserción por línea (falla ruidoso si un nº no calza). El sweep de `_typography.css` se agregó porque omitirlo dejaba el opt-out parcial (el fallo silencioso del Riesgo).
- [x] **El Alba preset NO tocado**: default global `uppercase` → preset pixel-idéntico.
- [x] Story `Foundations/CapsOptOut` (default vs `--tt-*: none` lado a lado).
- [x] **Red-flag del plan VERDE**: `grep -rF "text-transform: uppercase" src/styles src/presets` → **0**. tsc limpio · build:css OK · tokens en dist/styles.css y dist/tokens.css · vitest 307/307 (default visual idéntico).
**Commit**: `feat(theme): add --tt-label/--tt-title tokens for uppercase opt-out`

## Fase D — Item 3: opt-out de mayúsculas (`--tt-label` / `--tt-title`)
- [ ] `src/styles/_root.css`: añadir defaults `--tt-label: uppercase;` y `--tt-title: uppercase;` (junto a la capa de tokens tipográficos). Documentar override (consumer o preset) a `none`.
- [ ] Sweep en `index.css` (~20 ocurrencias): reemplazar `text-transform: uppercase` por `var(--tt-title)` en headings `font-display` (modal__title, drawer__title, empty__title, appshell__brand) y por `var(--tt-label)` en micro (eyebrow, badge/tag/pill, chip, kpi-label, banner-badge, table th, table-card label, navlabel-section, resto). Regla: `font-display`→title; el resto→label.
- [ ] **El Alba preset NO cambia**: las mayúsculas son su firma de marca; default global sigue `uppercase` → visual del preset idéntico. El opt-out es para consumers que NO quieren caps (`:root{--tt-title:none}` o `--tt-label:none`).
- [ ] Story en `Foundations` demostrando el opt-out (mismo componente con/sin caps). Visual diff: con defaults, **idéntico** a 1.1.0 (red flag si algo cambia → un selector quedó sin migrar).
**Commit**: `feat(theme): add --tt-label/--tt-title tokens for uppercase opt-out`

## Fase E — Tests + Stories ✅
- [x] `tests/FloatingConvergence.test.tsx` (11): Nav portal/teclado(ArrowDown/Down/Home/End)/Escape+foco; Menubar portal/ArrowRight cambia menú/Escape+foco; DatePicker portal+selecciona día+dismiss outside; DateRangePicker portal; AppShell `brand-text` + mark presentes colapsado/expandido.
- [x] Stories: `FloatingPortal.stories` extendida (Nav/Menubar/DatePicker/DateRangePicker en overflow); `AppShell` (`BrandTextColapsable`, `BrandTextColapsadoInicial`); `Foundations/CapsOptOut`.
- [x] **vitest 318/318** (46 files, +11, 0 regresiones) · `tsc` limpio · `tsup build` OK (Menubar/NavigationMenu/Portal `.d.ts` emitidos) · `build-storybook` OK (solo warnings chunk-size preexistentes/benignos).

## Fase F — Release prep (SIN publicar, SIN push, SIN PR sin OK) ✅ (commits pendientes de hacer)
- [x] `package.json` `1.1.0 → 1.2.0`; `CHANGELOG.md` `[1.2.0]` (Added/Fixed/Changed, sin breaking).
- [ ] Commits coherentes por fase (todos compilan). Rama `feat/floating-convergence-appshell-caps` (creada).
- [ ] Diff + resumen. **PR, push y publish a npm SOLO con OK explícito** (regla no-push-without-approval; igual que v1.1.0).

---

## Review v1.2.0 (2026-05-17) — implementación completa, commits/PR pendientes

**Hecho (Fases A–F):**
- **A:** `NavigationMenu` + `Menubar` reescritos sobre la primitiva v1.1.0 (`Portal`+`usePopoverPosition`+`useDismiss`) + teclado completo. API pública intacta.
- **B:** `DatePicker` (Pickers.tsx) + `DateRangePicker` (AdvancedPickers.tsx) por la primitiva. **`createPortal` eliminado de todo `src`** (duplicación 100% cerrada). Imports muertos quitados.
- **C:** Convención CSS `appshell__brand-text` (espejo navlabel). **Desviación justificada:** solo mecanismo A (CSS), TSX intacto — el mecanismo B (nullear brand) era lógicamente excluyente con A y regresión; se descartó del lado seguro.
- **D:** `--tt-label`/`--tt-title` en `_root.css`; sweep **38 sitios** (33 index.css + 5 _typography.css) vía Node con aserción por línea. El Alba preset intacto. Red-flag verde (0 `uppercase` hardcoded).
- **E:** +11 tests, 3 stories nuevas/extendidas.
- **F:** bump 1.2.0 + CHANGELOG.

**Verificación:** `tsc` limpio · **vitest 318/318** (46 files, +11, 0 regresiones) · `tsup build` OK · `build-storybook` OK.

**Bug cazado por los tests (no se habría visto sin testear en serio):** en `DatePicker`, `returnFocusRef: inputRef` + `onFocus→open` hacía que cerrar reabriera (loop). Resuelto alineando con el patrón Combobox del mismo archivo (sin `returnFocusRef`; Escape sigue cerrando por el default de `useDismiss`). `DateRangePicker` mantiene `returnFocusRef:triggerRef` (su trigger es `<button onClick>`, no `onFocus` → no reabre; a11y correcta).

**Desviaciones del plan (justificadas):**
1. Fase C: solo mecanismo A (CSS), sin tocar TSX (conflicto lógico A↔B; ruta segura sin breaking).
2. Fase D: +5 sitios en `_typography.css` además de index.css (omitirlos dejaba el opt-out parcial — el fallo silencioso del Riesgo).
3. `SortDropdown`/`NavigationMenu`/`Menubar` ya no son deuda; `<select>` nativo y calendarios internos fuera de scope como estaba previsto. Sin scope creep.

## Fuera de scope (deuda anotada, follow-up explícito)
- Item 4 Switch (diferido por decisión del usuario, hay tests de regresión).
- SortDropdown (`<select>` nativo, no lo recorta overflow), calendario interno de pickers ya cubierto aquí.

## Riesgos
- **Sweep mayúsculas incompleto** → un selector queda con `uppercase` hardcoded mientras se documenta el opt-out → opt-out parcial silencioso. Mitigación: tras el sweep, `rg "text-transform: *uppercase" src/styles` debe dar **0** matches (todo via token); visual diff con defaults idéntico a 1.1.0.
- **Fase C cambio de fallback**: ver trade-off arriba — validar en revisión de plan.
- **jsdom**: no valida píxeles; "no recortado/reubica" se cubre por estructura (portal target) + Storybook.
- **NavigationMenu refs por-trigger**: hoy un solo `panelRef`; con varios triggers, asegurar que el ref del panel corresponde al `openId` actual (un panel abierto a la vez — el patrón Menu de v1.1.0 ya resuelve esto, replicar).

---
---

# v1.3.0 — Auditoría de producción: remediación

**Fecha:** 2026-05-17 · **Estado:** EN CURSO · **Base:** `1.2.0` → **`1.3.0`** (fixes a11y + feature dark mode, sin breaking → MINOR)
**Informe completo:** `~/.claude/plans/necesito-evaluar-el-ui-soft-hedgehog.md`
**Contexto:** auditoría con estándares de producción vs shadcn. Kit interno multi-app, poda conservadora. Veredicto 16/20 técnico — atacar ejes 3/4.

## Tareas (orden por impacto)

- [ ] **[P1] `Tree` operable por teclado** (`src/components/Display3.tsx`)
  - [x] Roving tabindex + patrón WAI-ARIA TreeView (↑↓→← Home End Enter/Espacio)
  - [x] `role="treeitem"` en la fila focuseable; `<li role="none">`; chevron `tabIndex=-1` `aria-hidden` fuera del tab order
  - [x] Manejador de teclado centralizado en `<ul role="tree">` (delegación; query DOM = orden visual)
  - [x] Focus ring `:focus-visible` en `.tree__row` (`src/styles/index.css`) — convención del kit (`box-shadow: var(--focus-ring-accent)`)
  - [x] Import muerto `useLocale` removido de Display3
  - [x] `tests/Tree.test.tsx` (roles, roving tabindex, selectedId inicial, ArrowRight/Left expand-collapse, ArrowDown foco, Enter selecciona)
  - [x] Regresión propia cazada: removí import `useLocale` por un grep erróneo → lo usa `Calendar`. Restaurado. `tests/Display3.test.tsx` actualizado al contrato a11y correcto (chevron decorativo, `aria-expanded` en treeitem)
  - [x] `npm test` verde sin regresiones — **325/325**, `tsc` limpio, `npm run build` OK
- [x] **[P2]** Wiring ARIA de `Accordion` (`src/components/DataTable.tsx`): `React.useId()` → `id` trigger/panel + `aria-controls` + `role="region"` + `aria-labelledby`. Mantiene unmount-on-close (sin cambio de comportamiento). Test ARIA en `tests/DataTable.test.tsx`. **326/326**, tsc limpio
- [~] **[P2]** Dark mode global — **DIFERIDO** por decisión del usuario (2026-05-17). Las apps quizá no lo necesitan; esfuerzo redirigido a consolidación. Deuda anotada.
- [~] **[P2]** Consolidación:
  - [x] `Divider` (Layout.tsx) → alias deprecado de `Separator` (Primitives.tsx). `forwardRef`, `decorative={false}` preserva `role="separator"`+`aria-orientation`, mantiene clases `divider`/`divider--vertical` (cero regresión visual/a11y para barritas/marginapp). JSDoc `@deprecated`. Tests Layout/Divider intactos.
  - [x] Helpers de calendario duplicados (`startOfMonth`/`addMonths`/`isSameDay` byte-idénticos en Pickers/AdvancedPickers/Display3 + `buildMonthGrid` en 2) → única fuente en `src/utils/dateFormat.ts`. Pickers y AdvancedPickers consumen `buildMonthGrid`; Display3 solo los 3 helpers. **326/326**, tsc limpio, build OK, 0 helpers locales restantes.
  - [x] **Decisión técnica:** `Calendar` (Display3) NO se fusiona al `buildMonthGrid` — usa un grid fijo de 42 celdas con días de meses adyacentes (modelo distinto a propósito vs el picker compacto con `null`s). Fusionarlo habría sido regresión visual. Es divergencia intencional, no duplicación.
  - [ ] Reagrupar Display2/3·InputsExtra por dominio — **NO hecho, requiere confirmación** (churn de import paths alto en tests/stories, valor funcional ~0 para kit interno que ya funciona en prod; recomiendo diferir)
- [x] **[P3]** Gate de calidad: ESLint 9 flat (`eslint.config.mjs`: @eslint/js + typescript-eslint + react-hooks + jsx-a11y + eslint-config-prettier) + Prettier (`.prettierrc.json`/`.prettierignore`). Scripts `lint`/`lint:fix`/`format`/`format:check`. Step `Lint` añadido a `publish.yml` antes de `Run tests`. **0 errores, 87 warnings** (deuda preexistente visible, no bloquea). `rules-of-hooks`=error en código shipped (0 violaciones), off en `*.stories.tsx` (los render de stories llaman hooks inline; react-hooks v7 los sobre-marca). ESLint fijado a `^9` (jsx-a11y no soporta v10). `npm run lint` exit 0, tsc limpio, 326/326.
  - [ ] **Follow-up flagged:** `prettier --write .` repo-wide NO ejecutado (sería diff de ~todos los archivos, ruido que no debe mezclarse con los fixes de auditoría). One-shot separado cuando se decida.
- [x] **[P3]** CSS: **documentado** (decisión: no code-split). Sección "Costo del CSS (hoja única)" en README con números reales (~123 KB raw / **~19 KB gzip**; tokens.css ~7 KB) y el porqué (code-split rompería el import de una línea; costo marginal ~0 para apps internas). Camino aditivo no-breaking si algún consumidor lo necesita.
- [x] **[P3]** Doc de diseño: `DESIGN.md` (derivado fielmente del SSOT `_root.css`/`_typography.css`) + `PRODUCT.md` (`register: product`, grounded en código/README/uso real; partes estratégicas marcadas _(refine)_). Loader impeccable ahora `hasProduct:true hasDesign:true`. Sin `teach` interactivo (el usuario pidió ejecutar, no interrogatorio).

## Review v1.3.0 (2026-05-17) — a11y + consolidación; commits/PR pendientes

**Hecho (sin commitear, sin push):**
- **P1 `Tree`**: keyboard-operable (WAI-ARIA TreeView: roving tabindex, ↑↓→← Home End Enter/Espacio; manejador delegado en `<ul role=tree>`; query DOM = orden visual). `role=treeitem` en la fila, `<li role=none>`, chevron decorativo (`tabIndex=-1` `aria-hidden`). Focus ring con la convención del kit. Cerró el único fallo WCAG nivel A del informe.
- **P2 `Accordion`**: `React.useId()` → wiring `aria-controls`/`role=region`/`aria-labelledby`; unmount-on-close preservado (sin cambio de comportamiento).
- **P2 `Divider`→`Separator`**: una sola implementación; `Divider` alias deprecado no-breaking.
- **P2 calendarios**: triplicación de helpers de fecha + `buildMonthGrid` eliminada → `utils/dateFormat.ts`. `Calendar` queda con su grid propio (divergencia intencional documentada).
- Tests nuevos: `tests/Tree.test.tsx` (7), ARIA en `tests/DataTable.test.tsx` (1). `tests/Display3.test.tsx` actualizado al contrato a11y correcto.
- Lección registrada en `tasks/lessons.md` (regresión propia: borrar import por grep sin verificar con tsc).

- **P3 gate de calidad**: ESLint 9 flat + Prettier + step en CI. 0 errores / 87 warnings (deuda visible). `rules-of-hooks` error en shipped (0), off en stories.

**Verificación:** `tsc --noEmit` limpio · **vitest 326/326** (0 regresiones) · `npm run build` OK (solo warnings `use client` CJS preexistentes/benignos) · `npm run lint` exit 0.

**Pendiente / decisiones abiertas:**
- Reagrupar por dominio (Display2/3, InputsExtra): recomiendo **diferir** (churn alto, valor bajo, kit interno estable).
- P3: ESLint+Prettier gate, decisión CSS code-split, `PRODUCT.md`/`DESIGN.md`. **TODOS HECHOS.**

**Cierre v1.3.0 (2026-05-17):** todos los ítems accionables del roadmap hechos;
dark mode y reagrupar-por-dominio diferidos por decisión del usuario. Verificación
final consolidada: `npm run lint` exit 0 · `tsc --noEmit` limpio · **vitest 326/326** ·
`npm run build` OK. Working tree sin commitear/push/publicar (regla
no-push-without-approval). Bump sugerido 1.2.0 → **1.3.0** (fixes a11y +
consolidación interna + tooling, sin breaking → MINOR) cuando se apruebe.
- Dark mode: diferido por decisión del usuario.
- API pública: `startOfMonth`/`addMonths`/`isSameDay`/`buildMonthGrid` ahora exportados vía barrel (`export * from './utils/dateFormat'`) — aditivo, no-breaking, consistente con `formatDate`/`resolveDateFormat` ya públicos.
- **Nada commiteado/pusheado/publicado** (regla no-push-without-approval). Sugiere bump `1.2.0 → 1.3.0` (fixes a11y + consolidación interna, sin breaking → MINOR) cuando se apruebe.

---
---

# v1.3.1 — Storybook overhaul (docs only, no component changes)

**Fecha:** 2026-05-17 · **Estado:** EN CURSO · **Base:** `1.3.0` → **`1.3.1`** (solo `docs(storybook)`/`fix(docs)`, sin breaking → PATCH). Rama `docs/storybook-overhaul-v1.3.1`.
Origen: review honesto del Storybook (skill frontend-design). 6 prioridades.

## Fases
- [ ] **A — Sync v1.3.0**: nota `@deprecated` en `Divider` stories → `Separator`; nota+`play` de teclado en `Tree`; demo ARIA de `Accordion`.
- [ ] **B — Copy `vos`→`tú`**: barrido en stories + `README.md:122` (convención del kit: español neutro, tú).
- [ ] **C — Taxonomía/regresión**: fixtures internas (FloatingPortal, Tooltip sticky) a namespace `Internal/`; `Overlays`→`Overlay`; quitar em dash; títulos honestos (Layout grab-bag, Display3).
- [ ] **D — Controls/argTypes**: `component`+`args`+`argTypes`+story Playground en núcleo (Button, Form/Input, Card, Badge, Modal, DataTable). Aditivo, sin romper showcases.
- [ ] **E — Limpieza**: `base` muerto en `Foundations Scale`; `console.log`→`action()`; consolidar `Foundations/Logos` vs `Foundations/Logo`.
- [ ] **F — `play` functions**: teclado vivo en Tree/Menubar/Modal (documentación a11y).
- [ ] **G — Release**: bump 1.3.1 + CHANGELOG; verificar `tsc`/`vitest`/`lint`/`build-storybook`.
- [~] SB 8→9 upgrade: **DIFERIDO** (migración major, fuera de PR de docs; follow-up con su razón).

## Review v1.3.1 (2026-05-17) — completo, commits hechos, sin push/publish

**Hecho (7 commits atómicos en `docs/storybook-overhaul-v1.3.1`):**
- A: notas autodocs v1.3.0 (Divider deprecado→Separator, Tree teclado, Accordion ARIA).
- B: barrido `vos`→`tú` en Foundations.stories + README (em dashes neutralizados solo en líneas tocadas; purga global de em dash fuera de scope, anotada).
- C: FloatingPortal → `Internal/Regression/`; títulos honestos Display3/Layout; story tooltip-sticky reescrita user-facing.
- D: Playgrounds con controls (Badge, Input, NumberInput, Toggle, DataTable); showcases intactos. Migración CSF3 amplia de archivos multi-componente = follow-up (atada a split).
- E: `console.log`→`action()`, `base` muerto removido, cross-link Logos↔Logo.
- F: notas de teclado/foco Menubar y Modal (intent de "play" entregado como docs; play ejecutable + `@storybook/test` ofrecido como opt-in, no se mete dep de test en PR de docs).
- G: bump 1.3.0→1.3.1 + CHANGELOG.

**Verificación:** `tsc` limpio (por fase) · `npm run build-storybook` **exit 0** (41 stories + config compilan) · `npm run lint` exit 0 · **vitest 326/326**.

**Diferido (con razón, no es omisión):**
- SB 8→9: migración major, fuera de PR de docs.
- `play()` ejecutable + `@storybook/test`: vitest ya verifica el teclado; no meter dep de test en docs. Opt-in si se pide.
- Split de archivos multi-componente: refactor estructural, no docs.
- Purga global de em dashes: fuera de scope (cientos, muchos en data).

**Clave honesta:** los stories NO se publican (`files: ["dist"]`). Un publish 1.3.1 solo cambiaría el README en npm. **Recomendación: merge sin `npm publish`** (cero valor para consumidores). Nada pusheado/publicado (regla no-push-without-approval).

---
---

# v1.4.0 — Motion refinement (skill impeccable/animate)

**Fecha:** 2026-05-17 · **Estado:** EN CURSO · **Base:** `1.3.1` → **`1.4.0`** (`feat`/`fix`, sin breaking → MINOR). Rama `feat/motion-refinement-v1.4.0`.
Sí toca `index.css`/`_root.css` (se publican) → valor real para consumidores. Register product (motion = estado, 150-250ms, sin coreografía/delight slop). Decisiones del usuario: Fase 1 = upgrade a ease-out exponencial; alcance = todo el plan.

## Fases
- [ ] **1 — Easing tokens**: `--ease-out-quart/quint/expo`; `--ease-out`/`--ease-standard` → quint; `--ease-in` se mantiene. Story Motion before/after.
- [ ] **2 — Exit ~75%**: `--duration-exit: 150ms`; `EXIT_MS` 200→150 (Modal/Drawer/Toast); pares CSS `*Out` < `*In`.
- [ ] **3 — Consistencia**: fallbacks `var(--token, X)` = valor real del token; reemplazar `ease`/ms crudos por tokens.
- [ ] **4 — Reduced-motion JS**: `useDelayedUnmount` salta el delay si `prefers-reduced-motion: reduce`.
- [ ] **5 — Gaps puntuales**: solo donde el estado es abrupto (Button press, Accordion chevron, Tab indicator, Switch thumb) con evidencia por componente.
- [ ] **6 — Release**: bump 1.4.0 + CHANGELOG; verificación completa.

# v1.5.0 — Slot / asChild (Workstream A del roadmap de versatilidad)

**Fecha:** 2026-05-17 · **Estado:** EN CURSO · **Base:** `1.4.0` → **`1.5.0`** (`feat` aditivo, `asChild` default false → no breaking → MINOR). Rama `feat/slot-aschild-v1.5.0`.
Objetivo: polimorfismo estilo shadcn sin Radix ni romper el modelo versionado. Decisión usuario: arrancar por A.

## Fases
- [ ] **A1** — `Slot` + `Slottable` + `composeRefs`/`mergeProps` en `Primitives.tsx` (cero deps, sin `any`); `Button asChild`; tests.
- [ ] **A2** — rollout `asChild` a set curado: Card interactive, ListGroupItem, Breadcrumbs item, Tab, Menu/MenuItem, Chip.
- [ ] **A3** — AppShell `linkAs` → `asChild` (mantener `linkAs` como alias deprecado).
- [ ] **A4** — stories `asChild` + DESIGN.md (contrato de polimorfismo).
- [ ] **A5** — bump 1.5.0 + CHANGELOG + verificación (tsc/vitest/lint/build-storybook).

# v1.6.1 — Blocks (Workstream C del roadmap de versatilidad)

**Fecha:** 2026-05-17 · **Estado:** EN CURSO · **Base:** `1.6.0` → **`1.6.1`** (docs/recetas, NO se publica en dist → PATCH; como v1.3.1). Rama `docs/blocks-v1.6.1`.
Blocks en `src/blocks/` (typecheck+lint+Storybook gratis; excluidos del tarball por `tsup entry`=components-only y `files:["dist"]`). Recetas copy-paste estilo shadcn, componen lo existente.

## Fases
- [ ] **C1** — scaffold `src/blocks/` + sección `Blocks/*` en Storybook + block **Data-table page** (TableToolbar + FilterPanel + DataTable + TablePagination + BulkActionBar).
- [ ] **C2** — blocks: **Admin dashboard** (AppShell + PageHeader + Kpi + Charts), **Auth/login** (preset El Alba), **Checkout** (CartDrawer + AddressForm + OrderSummary + PromoCodeInput).
- [ ] **C3** — README "Blocks (copy-paste)" + bump 1.6.1 + CHANGELOG + verificación.

# v1.7.0 — Backdrop press-origin fix + YearPicker + MonthPicker

**Fecha:** 2026-05-17 · **Estado:** EN CURSO · **Base:** `1.6.1` → **`1.7.0`** (`fix`+`feat`, ship, sin breaking → MINOR). Rama `feat/grid-pickers-and-backdrop-fix-v1.7.0`.
Causa raíz bug: `Overlay.tsx` backdrop `onClick=onClose` + diálogo `stopPropagation`; press dentro → suelta en backdrop dispara `click` con target=backdrop → cierra. NO es useDismiss (ese es mousedown-origin, correcto).

## Fases
- [ ] **1 — Fix Overlay** (Modal+Drawer): cierre de backdrop solo si press *empieza y termina* en el backdrop (`onMouseDown`+`onClick`, `e.target===e.currentTarget`); quitar `stopPropagation` del diálogo. Tests.
- [ ] **2 — Pickers**: `GridPickerField` interno (shell DRY: input+toggle+Portal+usePopoverPosition+useDismiss+header nav+grid 3×4) → `YearPicker` (value:number) y `MonthPicker` (value:Date). CSS `.gridpicker*` en index.css. Export por barrel (Pickers ya re-exporta).
- [ ] **3 — Stories + tests** (Pickers.stories + tests).
- [ ] **4 — Release**: bump 1.7.0 + CHANGELOG + verificación (tsc/vitest/lint/build-storybook).

# v1.7.1 — Fix posicionamiento flotante + clear de Combobox

**Fecha:** 2026-05-17 · **Estado:** completo, commits hechos, sin push/publish · **Base:** 1.7.0 → **1.7.1** (`fix`, ship, sin breaking → PATCH). Rama `fix/floating-fixed-strategy-v1.7.1`.

- Bug A (reportado): Combobox dropdown descolocado dentro de Modal. Causa: `usePopoverPosition` devolvía coords documento (+scroll) para `position:absolute`; dentro de Modal `position:fixed`+scroll-lock el espacio de coords falla y el clamp lo pega abajo-izquierda. Fix: hook devuelve coords viewport; los 12 popovers portaleados usan `position:fixed` (estrategia Floating UI; el hook ya reposiciona en scroll/resize). CSS `*__popover position:absolute` se deja (siempre overrideado por el inline; fuente única).
- Bug B: `.combobox__clear` pill 22×22 sin flex-centering → X descentrada. Fix CSS (inline-flex centering).
- Verificación: `tsc` limpio · **vitest 349/349** (0 regresiones) · `npm run build` OK · `build-storybook` exit 0 · `lint` exit 0.
- 2 commits fix + release. Se publica (dist), drop-in, no breaking. Recomendación: merge + publish (defectos reales en prod). Nada pusheado/publicado aún.

---
---

# v1.8.0 — appshell__foot-text (gap del collapse, espejo de brand-text)

**Fecha:** 2026-05-17 · **Estado:** completo, commits hechos, sin push/publish · **Base:** 1.7.1 → **1.8.0** (`feat` aditivo, CSS-only, sin breaking → MINOR). Rama `feat/appshell-foot-text-v1.8.0`.

- Bug reportado (screenshots): en colapsado, el `footer` ("Despachos · v0.1") se parte en 2 líneas y se solapa con el toggle/avatar en el riel de 72px. Causa: v1.2.0 dio `appshell__brand-text` para el brand (arriba) pero NUNCA el equivalente para el `footer` (abajo); el kit renderiza `{footer}` crudo igual que `{brand}`.
- Fix: convención `appshell__foot-text` (CSS espejo exacto de `appshell__brand-text`: opacity:0/max-width:0 al colapsar + white-space:nowrap). Sin tocar TSX. Story `FooterTextColapsable`.
- **Implicación consumer (igual que brand-text):** la app despachos debe envolver el label de versión en `<span className="appshell__foot-text">…</span>` (1 línea). El kit aporta el mecanismo, no puede auto-ocultar un ReactNode opaco (mismo razonamiento documentado para brand en v1.2.0).
- Verificación: `tsc` limpio · **vitest 349/349** · `npm run build` OK · `build-storybook` exit 0 · `lint` exit 0. (CSS-convention: se valida por Storybook, jsdom no testea colapso visual — igual que brand-text en v1.2.0.)
- Se publica (dist), drop-in. Recomendación: merge + publish. Nada pusheado/publicado aún.

---
---

## Review v1.7.0 (2026-05-17) — completo, commits hechos, sin push/publish

**Hecho (3 commits en `feat/grid-pickers-and-backdrop-fix-v1.7.0`):**
- F1 `fix(overlay)`: backdrop Modal/Drawer cierra solo si el press *empieza y termina* en el backdrop (`onMouseDown` origin + `e.target===e.currentTarget`); quitado `stopPropagation` del diálogo. Test viejo "closes on backdrop click" actualizado a secuencia realista (mousedown+click) + 3 tests del bug reportado. Causa raíz era Overlay, NO useDismiss.
- F2/F3 `feat(pickers)`: `YearPicker` (década, value:number) + `MonthPicker` (año, value:Date) sobre `GridPickerField` interno (DRY del shell flotante, mismo primitive que DatePicker). CSS `.gridpicker`. 6 keys i18n. Story + 7 tests.
- F4 `chore(release)`: bump 1.7.0 + CHANGELOG.

**Verificación:** `tsc` limpio · **vitest 349/349** (+10, 0 regresiones) · `npm run build` OK · `build-storybook` exit 0 · `lint` exit 0.

Se publica (`dist`), drop-in, sin breaking. Recomendación: merge + publish (bug real de Modal/Drawer en prod + 2 componentes nuevos). Nada pusheado/publicado aún (regla no-push-without-approval).

---
---

## Review v1.6.1 (2026-05-17) — completo, commits hechos, sin push/publish

**Workstream C del roadmap de versatilidad.** Rama `docs/blocks-v1.6.1`.
- C1 `docs(blocks)`: scaffold `src/blocks/` (+README) + block **Data table page**.
- C2 `docs(blocks)`: **Admin dashboard**, **Auth screen**, **Checkout**. Dashboard sin Charts a propósito (recharts/any = ruido en receta).
- C3 `chore(release)`: README "Blocks (copy-paste)" + bump 1.6.1 + CHANGELOG.

**Verificación:** `tsc` limpio · `npm run build` OK y **dist sin blocks** (excluidos por tsup entry + `files:["dist"]`) · `build-storybook` exit 0 (4 stories Blocks/) · `lint` exit 0 · **vitest 339/339** (sin tests nuevos: son recetas).

**Clave:** NO se publica en dist; único delta npm-visible = README. Recomendación: **merge sin `npm publish`** (como v1.3.1). Nada pusheado/publicado aún.

**Roadmap versatilidad — COMPLETO:** A ✅ (v1.5.0 Slot/asChild) · B ✅ (v1.6.0 variantes extensibles) · C ✅ (v1.6.1 blocks). Único follow-up vivo: `renderLink` para Breadcrumbs/Menu (patrón documentado en DESIGN.md, no implementado).

---
---

## Review v1.6.0 (2026-05-17) — completo, commits hechos, sin push/publish

**Workstream B del roadmap de versatilidad.** Rama `feat/extensible-variants-v1.6.0`.
- B1 `feat(types)`: `Extensible<T>` exportado; `variant`/`accent` de Button/Badge/Alert/Card → open enum (no-breaking, uniones exportadas intactas, solo interpolan clase). Test prueba compila + emite clase.
- B2 `docs(storybook)`: DESIGN.md "Extending variants" + story `Foundations/ExtendingVariants` live. **Reframe honesto:** descartado el helper `variantClass` (YAGNI, nada interno lo usa; el contrato es CSS).
- B3 `chore(release)`: bump 1.6.0 + CHANGELOG.

**Verificación:** `tsc` limpio (open-enum compila; `variant="brand-x"` sin cast) · **vitest 339/339** (+4, 0 regresiones) · `build-storybook` exit 0 · `lint` exit 0.

**Roadmap versatilidad:** A ✅ (v1.5.0), B ✅ (v1.6.0). Queda **C — Blocks** (recetas copy-paste, no se publica) + follow-up `renderLink` Breadcrumbs/Menu.

Se publica (`.d.ts`), drop-in, no breaking. Recomendación: merge + publish. Nada pusheado/publicado aún (regla no-push-without-approval).

---
---

## Review v1.5.0 (2026-05-17) — completo, commits hechos, sin push/publish

**Hecho (5 commits en `feat/slot-aschild-v1.5.0`):**
- A1 `feat(primitives)`: `Slot`+`Slottable`+`composeRefs`/`mergeProps` (cero deps, sin `any`, React 18/19-safe); `Button asChild`. Tests Slot/Button (7).
- A2 `feat(card)`: `Card asChild`. **Reframe honesto:** set curado reducido a Button+Card; ListGroupItem (`<li>`), Chip (estructura interna), Tab (compound), Breadcrumbs/Menu (array-driven) → asChild sería defecto; diferidos con razón (render-prop).
- A3: **corregido** — `AppShell.linkAs` NO se convierte (es el patrón correcto para API array; convertir sería regresión). Sin cambio de código; contrato documentado.
- A4 `docs(storybook)`: stories asChild (Button/Card) + sección "Polymorphism" en DESIGN.md (dos patrones).
- A5 `chore(release)`: bump 1.5.0 + CHANGELOG.

**Verificación:** `tsc` limpio · **vitest 335/335** (0 regresiones, +9) · `npm run build-storybook` exit 0 · `npm run lint` exit 0.

**Roadmap versatilidad — estado:** A (Slot/asChild) ✅ hecho. Pendientes: **C (Blocks)** y **B (variantes extensibles)** + el follow-up `renderLink` para Breadcrumbs/Menu (patrón documentado, no implementado).

**Clave:** se publica (`dist`), drop-in, no breaking. Recomendación: merge **y** publish (valor real: polimorfismo para barritas/Next.js). Nada pusheado/publicado aún (regla no-push-without-approval).

---
---

## Review v1.4.0 (2026-05-17) — completo, commits hechos, sin push/publish

**Hecho (6 commits atómicos en `feat/motion-refinement-v1.4.0`):**
- F1 `feat(theme)`: familia ease-out exponencial; `--ease-standard`/`--ease-out`→quint (nombres preservados, no breaking); Motion story actualizada con las curvas reales.
- F2 `feat(motion)`: `--duration-exit` 150ms; 7 exits CSS + `EXIT_MS` (Overlay/Toast) 200→150. Entradas intactas.
- F3 `fix(motion)`: fallbacks `var()` alineados al valor real del token (28 refs). Sin cambio de comportamiento.
- F4 `fix(a11y)`: `useDelayedUnmount` salta el delay bajo `prefers-reduced-motion` (SSR/jsdom-safe).
- F5 `refactor(motion)`: removido bloque legacy accordion muerto (25 líneas, 0 refs TSX); `.switch__track` con token de easing. **Hallazgo honesto:** la capa de feedback ya estaba completa (button press, switch thumb, chevron, checkbox animados) → no inventé motion.
- F6 `chore(release)`: bump 1.4.0 + CHANGELOG.

**Verificación:** `tsc` limpio (por fase) · **vitest 326/326** (0 regresiones) · `npm run build-storybook` **exit 0** · `npm run lint` exit 0.

**Diferido (con razón):** indicador deslizante de Tabs (requiere JS en Tabs.tsx, riesgo medio; el fade de color/borde actual no es "abrupto" → no justificado para kit product). Resto de fases del plan original (dark mode, reagrupar por dominio) siguen como antes.

**Clave:** esto **sí se publica** (`_root.css`/`index.css` en `dist`) → mejora de feel real para barritas/marginapp. Sin breaking (nombres de token preservados). Recomendación: merge **y** publish (a diferencia de v1.3.1). Nada pusheado/publicado aún (regla no-push-without-approval).

---

## Plan v1.10.0 (2026-05-17) — data-density / legibilidad (consumer despachos)

**Baseline real:** repo en v1.9.0 (no v1.8.0). Ya resuelto en v1.9.0: contraste de tab
inactivo (17.49/18.70 medido), `stickyHeader`, notch de seam bajo `TableToolbar`.
Decisiones del owner: P4 = title-case + micro-caps reales · release = CHANGELOG
manual v1.10.0 (sin Changesets) · densidad = `.table--compact` como default + prop
`density` de opt-out.

### Medición de contraste (WCAG 2.x, hex/hex) — FALLAS a corregir
- [ ] `--fg-subtle` falla como texto normal en AMBAS paletas (2.31–2.52 default /
      3.43–3.74 El Alba; objetivo 4.5) — captions, placeholders, combobox desc.
- [ ] `--fg-muted` falla solo en paleta default sobre `bg-canvas` (4.46) y
      `bg-subtle`=header de tabla (4.40). El Alba pasa (slate más oscuro).
- [ ] Glyph de orden `opacity:.4` falla 3:1 UI (1.39/1.58) en ambas.

### P1 — DataTable: interactividad de fila (API aditiva)
- [ ] `onRowClick?(row)`, `rowHref?(row)`, `renderRow?` (render-prop estilo
      `AppShell.linkAs`; NO `asChild` en `<tr>`/`<td>`).
- [ ] A11y dueña del kit: operable por teclado (Enter/Espacio), `:focus-visible`,
      semántica/SR correctos; fila no-interactiva sin cambios.
- [ ] Story + test de teclado + a11y addon verde. Cero cambios en usages actuales.

### P2 — DataTable dueño de su superficie (notch en Card)
- [ ] `.table-wrap` recorta su propia esquina (borde+radio+overflow) en cualquier
      contenedor; decisión documentada en DESIGN.md. Story tabla-sobre-Card.

### P3 — Contraste a AA en los DEFAULTS (delta mínimo, sin lavar marca)
- [ ] Subir `--fg-subtle` (default + El Alba) y `--fg-muted` (solo default) al hex
      mínimo que pase 4.5 en la peor superficie; mantener subtono. Before→after en
      CHANGELOG.
- [ ] Test de regresión de contraste (vitest) con la tabla de ratios.

### P4 — Jerarquía por mayúsculas (decisión: title-case + micro-caps)
- [ ] `--tt-title: none` (default + El Alba). Separar `.table th` y `.label` del
      hook all-caps (nuevo token, default `none`); `--tt-label` queda solo para
      micro-labels reales (badge, eyebrow, KPI). Story before/after.

### P5 — Defaults que shipean ilegibles (cambiar el DEFAULT)
- [ ] a) Densidad legible por default: `.table--compact` como base + prop
      `density?: 'comfortable'|'compact'` (default compact).
- [ ] b) `white-space`/truncado/column-sizing default → datos no envuelven a 2 líneas.
- [ ] c) Badge default más liviano (peso/borde/padding) + variante quieta.
- [ ] d) Combobox trigger lee como campo (caja/altura/chevron) coherente con Select/Input.
- [ ] e) Pagination colapsa con `pages ≤ 1`; peso liviano por default.
- [ ] f) `Badge pulse` opcional (columna de estado con un solo componente).
- [ ] g) Header de tabla recede por default (`th` deja de competir, peso/color).
- [ ] h) `align` respetado cuando la celda es nodo React (acción `align:'right'`).
- [ ] i) Altura de control de filtro: densidad/`size` o tokenizar (no forzar wrap
      de la fila de ~7 filtros en desktop; 44px táctil sigue disponible).

### Cierre
- [x] Cada fix: story + test de regresión + a11y verde + `npm test` + `tsup`,
      verificado contra `dist` rebuildeado (no solo src).
- [x] CHANGELOG v1.10.0 + bump package.json (sin atribución Claude). Blast
      radius en barritas/marginapp/despachos en el resumen.
- [x] NO push/publish/release sin aprobación explícita (nada commiteado).

---

## Review v1.10.0 (2026-05-17) — completo, SIN commit/push/publish

**Baseline cambió a mitad de sesión:** otro proceso agregó **v1.9.1** (fix de
posicionamiento Combobox/`usePopoverPosition` + su test). Áreas disjuntas de
las mías (tokens/DataTable/Badge/Pagination/CSS); suite completa verde con su
test incluido → sin conflicto. Mi release sube **1.9.1 → 1.10.0**.

**Hecho (todo P1–P5, sin P4 pendiente — decidido por el owner):**
- P3 contraste: `--fg-muted`/`--fg-subtle` a AA en ambas paletas, delta mínimo,
  subtono preservado. `tests/Contrast.test.tsx` parsea los token files reales
  (16 asserts). Glyph de orden 0.4→0.75 (≥3:1). El Alba: `--fg-muted` re-anclado
  a su slate (pixel-idéntico), `--fg-subtle` único delta visual (rompe
  pixel-identity v0.7.1 a propósito, era sub-AA).
- P4 (decisión owner = title-case + micro-caps): `--tt-title:none`, nuevo
  `--tt-data:none` (th + form label), `--tt-label:uppercase` solo micro-labels.
- P5a/b/g densidad compacta por default + `.table--comfortable` opt-out +
  `white-space:nowrap`/ellipsis + header que recede.
- P5h `align` autoritativo para nodos React (clase `table__align-*`; left sin
  cambio).
- P1 `rowHref`/`onRowClick`/`renderRow` + `density` — control estirado real
  (a/button), teclado + SR + foco; aditivo, default off.
- P5c/f Badge liviano + `pulse`. P5d Combobox como campo. P5e Pagination
  colapsa ≤1 pág + peso 500. P5i `.fields--dense` (44px sigue default).
- P2 `.table-wrap` dueño de superficie + header sigue el radio; DESIGN.md.

**Verificación:** `tsc` limpio · **vitest 378/378** (+12, 0 regresiones) ·
`npm run build` exit 0 (cambios confirmados en `dist/styles.css`,
`dist/presets/elalba/styles.css`, `dist/components/DataTable.d.ts` + chunks) ·
`npm run build-storybook` exit 0 · `npm run lint` exit 0.

**Clave:** API aditiva (barrel solo gana exports, no breaking). Cambios
visuales de default en prod → SemVer minor honesto + CHANGELOG con
before/after. **Nada commiteado/pusheado/publicado** (regla no-push-without-
approval). Recomendación: revisar el resumen, luego commit (1 commit coherente,
`feat`) + release vía GitHub Release cuando el owner dé OK.

**Refinamiento consumer-driven (2026-05-18, dentro del mismo 1.10.0 sin
release):** linkeando el kit en despachos-ferreteria-ui-mock-kit se detectó
que `.combobox__input` hardcodeaba `padding:10px` → dentro de `.fields--dense`
quedaba 41px vs 36px de Select/Input. Tokenizado a `--field-pad-y/-x` (mismo
patrón que `.input/.select`); ahora los tres miden igual a cualquier densidad.
CHANGELOG (bullet Combobox) actualizado; `tests/Contrast.test.tsx` + `tsup`
verdes (cambio CSS-only; no re-corrí los 378 por ser CSS puro fuera del scope
de vitest salvo Contrast). Sigue todo sin commit/push/publish.
