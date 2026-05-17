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
