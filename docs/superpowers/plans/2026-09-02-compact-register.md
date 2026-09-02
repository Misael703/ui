# Compact Register (v3.0.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El registro compact (validado en la exploración de densidad) pasa a ser el único default del kit, con las medidas tokenizadas como size sets.

**Architecture:** Tokens nuevos `--control-*` + `--text-data` en `_root.css`; barrida de `index.css` para que cada size set consuma tokens y baje un registro; guard `@media (pointer: coarse)` restaura el touch target 44px. Tests de guardia estilo GoldStandard (leen el CSS como string) pinnean el registro nuevo.

**Tech Stack:** CSS puro (tokens custom properties), vitest para guards, Storybook para verificación visual.

**Spec:** `docs/superpowers/specs/2026-09-02-compact-register-design.md`

## Global Constraints

- NO correr `prettier --write` (el kit usa estilo compacto a mano).
- Commits conventional en minúscula, SIN atribución a Claude.
- NO push / release / publish sin OK explícito del usuario.
- Sin exports nuevos del barrel → el smoke gate NO se toca (tokens son CSS-only).
- AppShell (header/nav/rail) NO cambia — decisión del usuario.
- `--text-*` existentes (rem) NO cambian de valor.
- Branch de trabajo: `feat/compact-register` (ya creada, spec commiteado).

---

### Task 1: Tokens del registro + test de guardia

**Files:**
- Create: `tests/ControlRegister.test.tsx`
- Modify: `src/styles/_root.css` (~línea 277 el stop `--text-data`; ~línea 330 el bloque `--control-*`; al final el guard táctil)

**Interfaces:**
- Produces: tokens `--control-h-{sm,md,lg}` (28/38/44px), `--control-font-{sm,md}` (text-xs/text-sm), `--control-pad-x-md` (12px), `--control-radius-md` (6px), `--field-min-h`/`--field-pad-y`/`--field-pad-x` en `:root`, `--text-data` (0.8125rem). Tasks 2–8 consumen estos nombres EXACTOS.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ControlRegister.test.tsx
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guard del registro compact (v3.0.0): los size sets viven en tokens y el
 * default del kit es el registro denso. Un control escala TODAS sus medidas
 * juntas (altura+font+pad+radio); pointer:coarse restaura el touch target.
 */
const root = readFileSync(resolve(__dirname, '../src/styles/_root.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const token = (css: string, name: string) =>
  css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1].trim();

describe('compact register — size-set tokens', () => {
  it('define los sets de control', () => {
    expect(token(root, '--control-h-sm')).toBe('28px');
    expect(token(root, '--control-h-md')).toBe('38px');
    expect(token(root, '--control-h-lg')).toBe('44px');
    expect(token(root, '--control-font-sm')).toBe('var(--text-xs)');
    expect(token(root, '--control-font-md')).toBe('var(--text-sm)');
    expect(token(root, '--control-pad-x-md')).toBe('12px');
    expect(token(root, '--control-radius-md')).toBe('6px');
  });
  it('define el stop de datos 13px', () => {
    expect(token(root, '--text-data')).toBe('0.8125rem');
  });
  it('los field metrics leen de los tokens de control', () => {
    expect(token(root, '--field-min-h')).toBe('var(--control-h-md)');
    expect(token(root, '--field-pad-y')).toBe('7px');
    expect(token(root, '--field-pad-x')).toBe('var(--control-pad-x-md)');
  });
  it('pointer:coarse restaura el touch target 44px', () => {
    const coarse = root.match(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\}\s*\}/)?.[1] ?? '';
    expect(coarse).toMatch(/--control-h-md:\s*44px/);
    expect(coarse).toMatch(/--field-pad-y:\s*10px/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ControlRegister.test.tsx`
Expected: FAIL (tokens no existen aún).

- [ ] **Step 3: Implement — tokens en `_root.css`**

Junto a `--text-xs` (~línea 277) agregar:

```css
  --text-data: 0.8125rem; /* 13 — celdas de tabla y datos densos (entre xs y sm) */
```

Después del bloque `--space-*` (~línea 330) agregar:

```css
  /* Control size sets (v3.0.0 compact register). Un control escala TODAS
     sus medidas juntas — altura, font, pad, radio — nunca una altura
     suelta (relación interna ~3:1 altura:font). */
  --control-h-sm: 28px;
  --control-h-md: 38px;
  --control-h-lg: 44px;
  --control-font-sm: var(--text-xs);
  --control-font-md: var(--text-sm);
  --control-pad-x-sm: 10px;
  --control-pad-x-md: 12px;
  --control-radius-sm: 4px;
  --control-radius-md: 6px;
  /* Field metrics (seam v1.10.0, ahora token-fed): .input/.select/.textarea
     y la familia combobox los consumen. */
  --field-min-h: var(--control-h-md);
  --field-pad-y: 7px;
  --field-pad-x: var(--control-pad-x-md);
```

Al FINAL de `_root.css` (fuera del `:root`, después del bloque dark):

```css
/* Touch guard (WCAG 2.5.5): en puntero grueso los controles interactivos
   restauran el target de 44px. Solo crece el área táctil; el font queda. */
@media (pointer: coarse) {
  :root {
    --control-h-md: 44px;
    --field-pad-y: 10px;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ControlRegister.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/ControlRegister.test.tsx src/styles/_root.css
git commit -m "feat: control size-set tokens + --text-data + touch guard"
```

---

### Task 2: Campos (input/select/textarea/combobox) + labels

**Files:**
- Modify: `src/styles/index.css:228-255` (bloque `.input,.select,.textarea` + `.fields--dense`), `:202` (`.field__label`), `:5240-5249` (bloque font de pickers)
- Modify: `tests/DatePickerDisabled.test.tsx:186,196` (pineaba `--text-md`)
- Test: `tests/ControlRegister.test.tsx` (extender)

**Interfaces:**
- Consumes: tokens de Task 1.
- Produces: campos a 38px/14px por default; `.fields--dense` intacto (36px).

- [ ] **Step 1: Extend the guard test (failing)**

Agregar a `tests/ControlRegister.test.tsx` (leer también `index.css` con el mismo patrón `readFileSync` + strip de comentarios; copiar el helper `ruleBody` de `tests/GoldStandard.test.tsx:32-39`):

```tsx
describe('compact register — fields', () => {
  it('los campos consumen el set md (38px/14px)', () => {
    const f = ruleBody(index, '.input, .select, .textarea');
    expect(f).toMatch(/font-size:\s*var\(--control-font-md\)/);
    expect(f).toMatch(/min-height:\s*var\(--field-min-h, 38px\)/);
    expect(f).toMatch(/padding:\s*var\(--field-pad-y, 7px\) var\(--field-pad-x, 12px\)/);
  });
  it('los labels bajan a 12px', () => {
    expect(ruleBody(index, '.field__label')).toMatch(/font-size:\s*var\(--text-xs\)/);
  });
  it('los inputs de picker consumen el font de control', () => {
    // el bloque agrupado termina en .daterange__field-input — matchear ahí
    expect(index).toMatch(/\.daterange__field-input\s*\{[^}]*font-size:\s*var\(--control-font-md\)/);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/ControlRegister.test.tsx`

- [ ] **Step 3: Implement**

En `.input, .select, .textarea` (línea 228): `font-size: var(--text-md)` → `font-size: var(--control-font-md)`; fallbacks del padding/min-height: `var(--field-pad-y, 7px) var(--field-pad-x, 12px)` y `var(--field-min-h, 38px)`.
En `.field__label` (202): `font-size: var(--text-sm)` → `var(--text-xs)`.
En el bloque 5240-5249 (`.datepicker__input, .gridpicker__input, …`): `font-size: var(--text-md)` → `var(--control-font-md)`. Actualizar el comentario que lo precede.
`.fields--dense` (247-255) NO se toca.
En `tests/DatePickerDisabled.test.tsx` líneas 186 y 196: `var\(--text-md\)` → `var\(--control-font-md\)`.

- [ ] **Step 4: Run** — `npx vitest run tests/ControlRegister.test.tsx tests/DatePickerDisabled.test.tsx` → PASS

- [ ] **Step 5: Commit** — `git commit -m "feat!: fields consume the compact md control set (38px/14px)"`

---

### Task 3: Button md/lg/xl + btn--icon

**Files:**
- Modify: `src/styles/index.css:102-110`
- Test: `tests/ControlRegister.test.tsx` (extender)

**Interfaces:**
- Consumes: `--control-h-md/lg`, `--control-radius-md`, `--text-data`.
- Produces: Button md = 38/13/radio 6/pad 0·16 (aprobado visualmente).

- [ ] **Step 1: Extend the guard test (failing)**

```tsx
describe('compact register — buttons', () => {
  it('md: 38px, 13px uppercase, radio 6, centrado por flex', () => {
    const md = ruleBody(index, '.btn--md');
    expect(md).toMatch(/min-height:\s*var\(--control-h-md\)/);
    expect(md).toMatch(/font-size:\s*var\(--text-data\)/);
    expect(md).toMatch(/padding:\s*0 16px/);
    expect(md).toMatch(/border-radius:\s*var\(--control-radius-md\)/);
  });
  it('lg baja a 44/14', () => {
    const lg = ruleBody(index, '.btn--lg');
    expect(lg).toMatch(/min-height:\s*var\(--control-h-lg\)/);
    expect(lg).toMatch(/font-size:\s*var\(--text-sm\)/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

- [ ] **Step 3: Implement** (líneas 102-110)

```css
.btn--xs { padding: 6px 10px; font-size: var(--text-2xs); min-height: 28px; }
.btn--sm { padding: 8px 14px; font-size: var(--text-xs); min-height: 36px; }
.btn--md { padding: 0 16px; font-size: var(--text-data); min-height: var(--control-h-md); border-radius: var(--control-radius-md); }
.btn--lg { padding: 0 20px; font-size: var(--text-sm); min-height: var(--control-h-lg); }
.btn--xl { padding: 14px 28px; font-size: var(--text-md); min-height: 52px; }
.btn--icon { padding: 0; aspect-ratio: 1; }
.btn--icon.btn--sm { width: 36px; }
.btn--icon.btn--md { width: 38px; }
.btn--icon.btn--lg { width: 44px; }
```

(xs/sm sin cambio, según spec. El radio 6 solo en md: xs/sm/lg/xl conservan `--radius-md` del `.btn` base.)

- [ ] **Step 4: Run** → PASS. Además `npx vitest run tests/Button.test.tsx` (no pinea tamaños, debe seguir verde).

- [ ] **Step 5: Commit** — `git commit -m "feat!: button md/lg/xl rescaled to the compact register"`

---

### Task 4: Toggle / SegmentedControl

**Files:**
- Modify: `src/styles/index.css:4752-4754`
- Test: `tests/ControlRegister.test.tsx` (extender)

- [ ] **Step 1: Extend test (failing)** — `ruleBody(index, '.toggle--md')` debe matchear `height:\s*32px` y `font-size:\s*var\(--text-xs\)`.

- [ ] **Step 2: Run to fail**

- [ ] **Step 3: Implement**

```css
.toggle--sm { padding: 4px var(--space-2); font-size: var(--text-xs); height: var(--control-h-sm); }
.toggle--md { padding: 5px var(--space-2); font-size: var(--text-xs); height: 32px; }
.toggle--lg { padding: 8px var(--space-4); font-size: var(--text-sm); height: var(--control-h-md); }
```

- [ ] **Step 4: Run** → PASS (+ `npx vitest run tests/Toggle.test.tsx` si existe; si pinea valores viejos, actualizarlos al set de arriba).

- [ ] **Step 5: Commit** — `git commit -m "feat!: toggle/segmented md 32px, lg follows control set"`

---

### Task 5: Tabla a --text-data

**Files:**
- Modify: `src/styles/index.css:1241-1256` (`.table td`), `:1267` (`.table--compact`)
- Modify: `tests/GoldStandard.test.tsx` (P3)

- [ ] **Step 1: Update GoldStandard P3 (failing)**

```tsx
describe('P3 — compact register cell text by default (v3.0.0)', () => {
  it('default cell text is --text-data (13px)', () => {
    expect(decl(ruleBody(index, '.table td'), 'font-size')).toBe('var(--text-data)');
  });
  it('padding drops to 7px 10px', () => {
    expect(decl(ruleBody(index, '.table td'), 'padding')).toBe('7px 10px');
  });
});
```

- [ ] **Step 2: Run to fail** — `npx vitest run tests/GoldStandard.test.tsx`

- [ ] **Step 3: Implement**

`.table td` (1241): `padding: 8px 12px` → `7px 10px`; `font-size: var(--text-sm)` → `var(--text-data)`. Actualizar el comentario histórico del bloque (v1.14.0) con una línea v3.0.0.
`.table th` (966): `padding: 8px 12px` → `7px 10px` (el th ya es text-xs, queda).
`.table--compact` (1267): igualar al base (`padding: 7px 10px; font-size: var(--text-data);`) — mantiene la promesa "idempotente".
`.table--comfortable` NO se toca (opt-out aireado).

- [ ] **Step 4: Run** — GoldStandard + `npx vitest run tests/DataTable.test.tsx` → PASS

- [ ] **Step 5: Commit** — `git commit -m "feat!: table cells to --text-data 13px, pad 7x10"`

---

### Task 6: PageHeader + Card

**Files:**
- Modify: `src/styles/index.css:3561` (título), `:590-592` (card)
- Test: `tests/ControlRegister.test.tsx` (extender)

- [ ] **Step 1: Extend test (failing)** — `.page-header__title` matchea `clamp\(var\(--text-lg\), 2vw \+ 0\.5rem, var\(--text-2xl\)\)`; `.card__body` matchea `padding:\s*16px 20px`.

- [ ] **Step 2: Run to fail**

- [ ] **Step 3: Implement**

`.page-header__title` (3561): `font-size: clamp(var(--text-xl), 3vw + 0.75rem, var(--text-3xl))` → `clamp(var(--text-lg), 2vw + 0.5rem, var(--text-2xl))`.
Card (590-592): body `20px 24px` → `16px 20px`; header `20px 24px` → `16px 20px`; footer `16px 24px` → `12px 20px`.

- [ ] **Step 4: Run** → PASS (+ `npx vitest run tests/CardElevation.test.tsx` sigue verde).

- [ ] **Step 5: Commit** — `git commit -m "feat!: page-header title to 24px cap, card padding 16x20"`

---

### Task 7: Controles de picker/combobox/tag/phone al set md

**Files:**
- Modify: `src/styles/index.css` — sitios: `.gridpicker__input:2175` (40→`var(--control-h-md)`), `.gridpicker__nav button:2187` (40×40→38×38 vía token), `.gridpicker__cell:2217` (44→`var(--control-h-md)`), `.tag-input:2376` (44→`var(--field-min-h)`), `.phone-input:2415` (44→`var(--field-min-h)`), `.multicombo__chips:2568` (44→`var(--field-min-h)`), `.daterange__trigger:2652` (44→`var(--field-min-h)`)
- Test: `tests/ControlRegister.test.tsx` (extender)

- [ ] **Step 1: Extend test (failing)**

```tsx
describe('compact register — picker family consumes tokens', () => {
  for (const sel of ['.tag-input', '.multicombo__chips']) {
    it(`${sel} usa var(--field-min-h)`, () => {
      expect(ruleBody(index, sel)).toMatch(/min-height:\s*var\(--field-min-h/);
    });
  }
  it('.daterange__trigger usa var(--field-min-h)', () => {
    expect(ruleBody(index, '.daterange__trigger')).toMatch(/height:\s*var\(--field-min-h/);
  });
  it('.gridpicker__cell usa var(--control-h-md)', () => {
    expect(ruleBody(index, '.gridpicker__cell')).toMatch(/min-height:\s*var\(--control-h-md\)/);
  });
});
```

- [ ] **Step 2: Run to fail**

- [ ] **Step 3: Implement** — reemplazos 1:1 en cada sitio listado (alturas → token; el resto del bloque queda). En `.phone-input` es `height`, no `min-height` — mantener la propiedad, cambiar el valor a `var(--field-min-h)`.

- [ ] **Step 4: Run** — ControlRegister + `npx vitest run tests/AdvancedPickers.test.tsx tests/DatePickerDisabled.test.tsx` → PASS

- [ ] **Step 5: Commit** — `git commit -m "feat!: picker/tag/phone/combobox controls consume the md set"`

---

### Task 8: Barrida de auditoría (sitios restantes 40/44px + text-md)

**Files:**
- Modify: `src/styles/index.css` (solo sitios que la auditoría clasifique como CONTROL de contenido)

- [ ] **Step 1: Generar la lista**

```bash
grep -n -e 'height: 44px' -e 'height: 40px' -e 'min-height: 44px' -e 'min-height: 40px' src/styles/index.css
grep -n -e 'font-size: var(--text-md)' src/styles/index.css
```

- [ ] **Step 2: Clasificar cada hit con esta regla**

- **Chrome del AppShell / topbar** (appshell, usermenu trigger del header) → NO tocar.
- **Control interactivo de contenido** (menús dropdown, command palette, items de lista clickeables) → set md (38 / `--control-font-md`).
- **Contenido no-control** (avatares, testimonial, price display, order-summary, calendar title, product-card title) → NO tocar.
- Duda → NO tocar y anotar en el commit body.

Hits ya triados como NO-tocar: `.avatar--lg:573`, `.testimonial__avatar:4635`, `.usermenu` trigger (chrome), `.calendar__title:3852` (16px título de widget, no control), `.product-card__title:676`, `.price--sm:4377`, `.cart__totals:4484`, `.order-summary__*:4488,4493`.
Hits a cambiar detectados: `.usermenu__name:5264` (16→`var(--text-sm)`, es contenido de popover denso) y cualquier item de menú/command-palette de 44px que aparezca en el grep.

- [ ] **Step 3: Aplicar + correr suite completa** — `npx vitest run` → arreglar cualquier test que pinee valores viejos actualizándolo al registro nuevo (mismo patrón que Tasks 2-7; NUNCA aflojar un assert a regex vaga).

- [ ] **Step 4: Commit** — `git commit -m "feat!: register sweep — remaining content controls to the md set"`

---

### Task 9: Verificación integral + docs + bump

**Files:**
- Modify: `CHANGELOG.md`, `DESIGN.md`, `package.json`

- [ ] **Step 1: Suite + build + smoke**

```bash
npx vitest run          # todo verde
npm run build           # tsup + css verde
SMOKE_PORT=3105 npm run smoke:ci   # e2e consumer Next verde
```

- [ ] **Step 2: Barrido visual headless** — Storybook ya corre en :6006. Con Playwright, screenshot 1440×900 de: `blocks-genéricos-data-data-table-page--default`, `explorations-densidad-desechable--densidad-actual` (ahora debe verse compact — la story A consume el default), stories de Form/Pickers/Toggle, y AppShell playground (debe verse IGUAL que antes, chrome intacto). Comparar contra `~/projects/densidad-*.png`. En la toolbar, repetir spot-check con preset El Alba y theme dark.

- [ ] **Step 3: CHANGELOG** — entrada nueva:

```markdown
## [3.0.0] — 2026-09-02

**Major. Registro compact por default — el contenido baja un paso; el chrome no se mueve.**

### Changed (BREAKING — visual only, no API)
- Todo size set de control consume los nuevos tokens `--control-*`:
  campos 44→38px (font 16→14), Button md 44→38 (13px uppercase, radio 6),
  lg 52→44, toggle/segmented md 36→32, celdas de tabla 14px/8·12→13px/7·10
  (nuevo stop `--text-data`), título de PageHeader cap 30→24, Card 20·24→16·20,
  familia picker/tag/phone/combobox al set md.
- `@media (pointer: coarse)` restaura el touch target de 44px en táctil
  (WCAG 2.5.5) — solo crece el área, el font queda.
- AppShell NO cambia. `--text-*` (rem) NO cambian. `.fields--dense` y
  `density="comfortable"` siguen funcionando como desvíos.

### Added
- Tokens `--control-h-{sm,md,lg}`, `--control-font-{sm,md}`,
  `--control-pad-x-{sm,md}`, `--control-radius-{sm,md}`, `--text-data`.
```

- [ ] **Step 4: DESIGN.md** — sección nueva "Registro compact (v3.0.0)": la regla 3:1, los tokens, la excepción del Button md (13px por uppercase+bold), el touch guard, y el criterio control-vs-contenido de la Task 8.

- [ ] **Step 5: package.json** — `"version": "3.0.0"`.

- [ ] **Step 6: Commit** — `git commit -m "docs: changelog + design notes + bump 3.0.0"`

---

### Task 10: Limpieza

**Files:**
- Delete: `src/components/DensityCompare.stories.tsx`
- Create: `tasks/archive/2026-07-audit-todo.md` (contenido actual de `tasks/todo.md`)
- Modify: `tasks/todo.md` (reemplazar por el estado de ESTA feature + review)

- [ ] **Step 1:** `git rm src/components/DensityCompare.stories.tsx` (cumplió su rol de decisión).
- [ ] **Step 2:** mover el contenido histórico de `tasks/todo.md` a `tasks/archive/2026-07-audit-todo.md`; el nuevo `tasks/todo.md` lista las tasks de este plan con sus checks y una sección Review (qué se verificó, screenshots comparados).
- [ ] **Step 3:** `npx vitest run` final (el smoke de stories no debe referenciar la story borrada — no está en ENTRIES, es scratch).
- [ ] **Step 4: Commit** — `git commit -m "chore: drop density scratch story, archive audit todo"`
- [ ] **Step 5:** PARAR. Push + PR + release SOLO con OK explícito del usuario.
