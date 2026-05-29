# AppShell `top` — Mobile drawer (2026-05-29)

## Problema

`headerLayout="top"` quedó sin tratamiento mobile cuando se shipeó en 1.15.0. La
media `@media (max-width: 900px)` (index.css:2844) está escrita para `side`:
recolumna `.appshell` con `grid-template-columns` (en `top` el root usa
`grid-template-rows` → no-op) y mueve el `<aside>` a `position: fixed; transform:
translateX(-100%)` — lo cual en `top` deja el sidebar **invisible incluso
expandido** y sin trigger built-in (el hamburger del `side` no se renderiza en
`top`). Resultado: bajo 900px el `top` muestra solo el header y el contenido,
sin acceso al nav.

Y el header `1fr auto 1fr` con `padding: 8px 16px` + `gap: 12px` no se reduce
en pantallas chicas; en 375px con logo en center + Bell+separator+Avatar en
right, los slots se chocan o desbordan.

## Diseño

Modelo overlay paralelo al `side` mobile, pero anclado **debajo** del header
(no a `top: 0`) y disparado por el render-prop, **sin built-in hamburger**
(consistencia con la decisión original del `top`: el consumer pone el trigger).

### API

El render-prop ya entrega `{ collapsed, toggle, setCollapsed }`. La semántica
de `toggle()` se extiende: detecta breakpoint vía `matchMedia('(max-width:
900px)')` y en mobile flippea `mobileOpen` en vez de `collapsed`. En desktop
(actual) sigue idéntica.

- Desktop: `toggle()` ⇒ flip `collapsed`.
- Mobile (≤900px): `toggle()` ⇒ flip `mobileOpen`. `collapsed` queda en su valor
  previo (no se mezcla; cuando vuelve a desktop el rail/hide queda como estaba).

Decisión: una sola API en vez de exponer `openMobile/closeMobile` separados.
Razón: el consumer NO sabe en qué breakpoint está sin volver a calcular
matchMedia él mismo; tener `toggle` "DWIM" deja el caller con un solo botón.

ESC cierra el drawer mobile. Click en scrim también.

### CSS

Nueva sección bajo el bloque `top` con:

```
@media (max-width: 900px) {
  .appshell--header-top .appshell__header {
    padding: 8px 12px; gap: 8px;
    grid-template-columns: auto 1fr auto;
  }
  .appshell--header-top .appshell__body { grid-template-columns: 1fr; }
  .appshell--header-top .appshell__sidebar {
    position: fixed; top: 56px; bottom: 0; left: 0;
    width: min(280px, 85vw);
    transform: translateX(-100%);
    transition: transform var(--duration-base) var(--ease-standard);
    z-index: 40; border-right: 1px solid var(--border-default);
    background: var(--bg-surface);
  }
  .appshell--header-top.is-mobile-open .appshell__sidebar { transform: translateX(0); }
  .appshell--header-top.is-mobile-open .appshell__scrim {
    display: block; position: fixed; top: 56px; left: 0; right: 0; bottom: 0;
    background: var(--backdrop); z-index: 30;
  }
}
```

Notas:
- `top: 56px` matchea el `min-height` del header (línea 2742). Exponemos
  también `--appshell-header-height: 56px` como var pública pasada a `:root` /
  `.appshell--header-top` para que consumers anclen sticky sub-headers sin
  hardcodear el 56.
- El header pasa de `1fr auto 1fr` a `auto 1fr auto` en mobile: el center
  estira (le da espacio al brand), left/right quedan compactos.
- `position: fixed; top: 56px` ancla el aside DEBAJO del header; el scrim
  también empieza desde 56 para que el header quede visible (afordance de
  cierre vía render-prop trigger).

### React

En el branch `top` de `AppShell()`:

1. Nuevo `useState(false)` para `topMobileOpen` (existe `mobileOpen` solo en
   side branch — no compartir state entre branches, conservar el aislamiento).
2. `useEffect` con `matchMedia('(max-width: 900px)')` setea ref `isMobileRef`
   que `toggle()` consulta. Listener para `change` → cuando se vuelve desktop,
   `setTopMobileOpen(false)` (cleanup).
3. `headerApi.toggle` decide según `isMobileRef.current`: mobile → flip
   `topMobileOpen`; desktop → flip `collapsed`.
4. ESC handler global vía `useEffect` mientras `topMobileOpen` esté true.
5. Render del `<div className="appshell__scrim">` cuando `topMobileOpen` (igual
   patrón que el side branch).
6. Class `is-mobile-open` se agrega al root cuando `topMobileOpen`.
7. `<aside>` recibe `aria-hidden={isMobile && !topMobileOpen}` (mejora a11y, el
   sidebar oculto no debe leerse).

### Tests

`tests/AppShellTop.test.tsx`:

- [ ] CSS: hay `@media (max-width: 900px)` con `.appshell--header-top
      .appshell__sidebar { position: fixed }`.
- [ ] CSS: el header en mobile pasa a `grid-template-columns: auto 1fr auto`.
- [ ] CSS: `is-mobile-open .appshell__sidebar` aplica `translateX(0)`.
- [ ] CSS: scrim mobile usa `top: 56px` (no cubre el header).
- [ ] CSS: `--appshell-header-height: 56px` definido como var pública.
- [ ] React: render-prop `toggle()` en jsdom con `matchMedia` mockeado a mobile
      flippea `is-mobile-open` y NO toca `is-collapsed`.
- [ ] React: ESC cierra el drawer mobile.

### Smoke (Playwright real)

`smoke/gallery/scenarios.tsx`:

- [ ] `ScenarioAppShellTopMobile` — `top` uncontrolled con render-prop,
      sections, sin persistKey. Trigger en `header.left`.

`smoke/app/scenarios/appshell-top-mobile/page.tsx` y entry en e2e:

- [ ] `resize(375)` → aside cerrado (translateX(-100%)) → click trigger → aside
      abierto + scrim visible → ESC → cerrado.
- [ ] `resize(1280)` → aside visible siempre, sin scrim.

### Bump

`1.30.6 → 1.31.0` minor (feature, sin breaking).

## Checklist

- [x] CSS: nueva media + var `--appshell-header-height`
- [x] AppShell.tsx: subcomponente `AppShellTopBranch`, `topMobileOpen` state,
      matchMedia ref con cleanup en resize-back, ESC handler, `toggle()` DWIM,
      `is-mobile-open` class, scrim render, aria-hidden en aside cerrado
- [x] Story `Topbar · Mobile drawer (≤900px)` con viewport mobile1
- [x] Tests CSS (8 nuevos) + React (4 nuevos: toggle mobile, toggle desktop,
      ESC, scrim) — 521 verdes (+11)
- [x] Smoke scenario `appshell-top-mobile` + page + spec (4 e2e) — 25 verdes
- [x] CHANGELOG entrada `## [1.31.0] — 2026-05-29`
- [x] `package.json` 1.30.6 → 1.31.0
- [x] `npm test` verde (521/521)
- [x] `npm run smoke:ci` verde (25/26, 1 skip pre-existente)
- [ ] Commit en rama, PR a main, **esperar aprobación** antes de merge/release

## Review

### Qué cambió

1. **CSS — `src/styles/index.css`** (2 cambios):
   - `--appshell-header-height: 56px` expuesto como var pública en
     `.appshell.appshell--header-top`; el `min-height` del header lee de ahí.
   - Las reglas desktop hide/rail overlay
     (`.appshell--header-top:not(.appshell--rail).is-collapsed ...`) ahora
     viven dentro de `@media (min-width: 901px)` para no competir contra el
     bloque mobile por specificity.
   - Nueva `@media (max-width: 900px) { .appshell--header-top ... }` con
     header compacto (`auto 1fr auto`), body 1col, aside `position: fixed`
     anclado en `top: var(--appshell-header-height)` con
     `width: min(280px, 85vw)`, scrim debajo del header.

2. **React — `src/components/AppShell.tsx`**:
   - Extraído `AppShellTopBranch` (subcomponente interno) para que los hooks
     del drawer corran solo cuando se renderiza el `top` (no se cuelan en el
     `side`). Mismo árbol JSX que antes, más:
     - `useState(false)` para `mobileOpen`
     - `useRef(false)` + `useEffect(matchMedia)` para detectar breakpoint
       con cleanup al resize-back a desktop
     - `useEffect` con listener `Escape` global solo mientras drawer abierto
     - `headerApi.toggle()` DWIM: mobile flip `mobileOpen`, desktop flip
       `collapsed`. `collapsed` queda intacto en mobile.
     - `aside aria-hidden={isMobileRef.current && !mobileOpen}`
     - Scrim renderizado solo cuando `mobileOpen`

3. **Stories**: `Topbar · Mobile drawer (≤900px)` con viewport mobile1.

4. **Tests** (`tests/AppShellTop.test.tsx`): 11 nuevos (8 CSS guards + 4
   React behaviours con `matchMedia` mock). Todos verdes.

5. **Smoke** (`smoke/gallery/scenarios.tsx`, `smoke/app/scenarios/
   appshell-top-mobile/page.tsx`, `smoke/e2e/scenarios.spec.ts`): 4 e2e
   con resize real, click trigger, ESC, scrim-tap. Todos verdes.

6. **CHANGELOG**: entrada 1.31.0 documentando Added / Changed / Smoke.

### Decisiones que conviene anotar

- **Un solo `toggle()` DWIM** en lugar de `openMobile/closeMobile` aparte.
  Razón: el consumer no sabe en qué breakpoint está sin recalcular
  matchMedia él mismo; tener `toggle` "smart" deja un solo botón en su lado.
  Linear y Vercel hacen lo mismo.
- **Sin built-in hamburger en `top`**. El kit no tiene posición sobre
  cómo se ve el trigger; el `top` siempre fue "consumer-driven slot".
  Romper esa decisión por mobile sería incoherente.
- **Desktop rules scoped a `min-width: 901px`** en vez de pelear specificity
  con `:not()` o repetir clases. Es la solución limpia y comentada para
  futuros lectores ("por esto el bloque mobile abajo no necesita doble
  clase").
- **`isMobileRef` ref vs state**: no es state porque el render no depende
  del breakpoint (el CSS hace ese trabajo). El único consumidor del valor
  es el closure de `toggle()`. Ref evita renders innecesarios de cualquier
  consumer-trigger que reciba `headerApi`.
- **`aria-hidden` best-effort**: el primer render usa
  `isMobileRef.current = false` (no se puede leer matchMedia en SSR), así
  que en SSR el aside no está hidden incluso en mobile. El listener lo
  corrige en cuanto hidrata. Aceptable — no hay flash visible (el CSS oculta
  el aside) y un screen reader que justo hidrate antes del effect es un
  caso de borde irreal.

### Sin push aún

Branch `feat/appshell-top-mobile` con todo commiteado local. No pusheo ni
abro PR sin tu OK explícito (memory: feedback-no-push-without-approval).

---

## Post-review hardening (commit 2)

Tras el primer push + PR #47, hice self-review honesto y encontré 3 gaps
que YO había introducido en este mismo PR:

### A) `aria-hidden` era código muerto
Mi primer commit usó `useRef` para `isMobile`. El listener actualizaba el
ref pero **no disparaba re-render** — el atributo nunca llegaba al DOM.
El comentario que escribí en este mismo archivo decía "el listener lo
corrige en cuanto hidrata", falso. **Fix:** `useRef` → `useState`. Paga
1 re-render post-mount, normal. Ahora el screen reader sí ve el drawer
cerrado como hidden.

### B) Sin focus trap en el drawer
Tab se salía al header. Incoherencia total: el primer mensaje de la
auditoría listó "P1 #6 Focus trap mobile no existe" como bug del `side`,
y yo estaba a punto de shipear un nuevo case del mismo bug en `top`.
**Fix:** extraje `useFocusTrap` de Overlay.tsx (Modal/Drawer lo usan
hace tiempo) a `src/hooks/useFocusTrap.ts`. AppShell lo consume. Open
foca primer link, Tab cycla, close vuelve foco al trigger.

### C) Sin body scroll lock
Content scrolleaba bajo el scrim al swipe. **Fix:** extraje
`useScrollLock` también, mismo contador global que Modal/Drawer (nesting-
safe). Lo mismo con `useEscape` para no dejar un patrón duplicado.

### Refactor colateral

- 3 hooks (`useFocusTrap`, `useEscape`, `useScrollLock`) movidos de
  `Overlay.tsx` a `src/hooks/`. Re-exportados desde `hooks/index.ts`
  (interno). **NO** agregados al barrel público `src/index.ts` — son
  internos hasta que tengan docs + nombres estables.
- Overlay.tsx ahora importa de ahí. Modal/Drawer behaviour byte-idéntico
  (9/9 tests verdes confirma).

### Tests adicionales (+5)

- `aria-hidden` lands cuando mobile + cerrado
- `aria-hidden` ausente cuando mobile + abierto
- `aria-hidden` ausente cuando desktop
- `body.style.overflow=hidden` cuando drawer abierto
- Focus va al primer link al abrir, vuelve al trigger al cerrar (ESC)

Final: **526 unit + 25 smoke verdes**. CI corriendo sobre `feat/appshell-
top-mobile` (commit 2 pushed).

### Lo que sigue pendiente (próximos PRs, no este)

- iOS Safari `100dvh` con fallback `100vh` (P1 #3 audit)
- `data-tone="inverse"` en sidebar brand del `side` mobile (P1 #4 audit)
- Smoke scenarios para brand/rail/no-nav en mobile (matriz de variantes)
- Validación visual humana (mock1 viewport, Storybook abierto)

---

## Commit 4 (mismo PR) — Cerrado el "siguen pendientes"

Usuario pidió hacer **todo en el mismo PR**. Ejecutado:

### iOS Safari URL-bar safety
- `.appshell.appshell--header-top { height: 100vh; height: 100dvh }`.
  Los browsers viejos ignoran la segunda; los nuevos (Chrome 108+, Safari
  16.4+) usan el viewport dinámico.
- Mobile aside + scrim pasaron de `bottom: 0` a `calc(100vh - header)`
  con el mismo dvh override. iOS antes clipa `bottom: 0` por la barra de
  URL.

### Side brand band-aware (audit P1 #4)
- `<aside class="appshell__sidebar" data-tone={theme==='brand' ? 'inverse'
  : undefined}>` en el `side`. Antes, Avatar/Badge/iconos en sidebar brand
  no se re-tokenizaban. Espejo del header brand del `top`.

### 3 smoke variants (brand / rail / no-nav)
- Nuevos scenarios + páginas + 4 e2e asserts. La brand cazó un BUG REAL
  que tenía oculto: mi regla mobile original restateaba `background:
  var(--bg-surface)`, empataba en specificity con
  `.appshell--brand .appshell__sidebar` y ganaba por source order →
  brand sidebar quedaba **blanca** en mobile. Fix: saqué las propiedades
  redundantes (`background` y `border-right` ya viven en la base).
  Comentario en el CSS para que un futuro contributor no lo reintroduzca.

### Visual pass (Playwright MCP)
- Levanté el smoke server local (port 3100, `next start`), navegué con
  el MCP a las 4 rutas mobile a 375×667 + desktop 1280×800. Screenshots
  visuales confirmaron:
  - **Default mobile cerrado**: header compacto, sin aside, sin scrim
  - **Default mobile abierto**: aside 280px, scrim debajo del header,
    Inicio activo con bar oro
  - **Brand mobile abierto**: aside dark con texto white, hairline
    white-α en el right border, active item con bg white-α 0.16
  - **Rail mobile abierto**: el `collapsedRail` NO interfiere
    (verifica que mis reglas mobile dominan sobre el rail desktop)
  - **No-nav mobile**: sin aside, header con auto/1fr/auto, center
    stretch
  - **Desktop 1280**: sidebar 240px en grid, header centered, sin
    overlay, byte-identical al pre-1.31

### Tests resultantes

| | Before commit 4 | After commit 4 |
|---|---|---|
| Unit | 526 | **530** (+4: 2 side brand data-tone + 2 CSS dvh) |
| Smoke | 25 | **29** (+4: brand surface, rail overlay, no-nav header, aside dvh) |

Visual pass humano (vía MCP) no cuenta como test automatizado pero
confirma que las geometrías matemáticas se traducen a píxeles correctos.

### Bug encontrado por mí ANTES de pedir merge

Aplicando la regla nueva ("self-review antes de merge"):
- ✅ ¿Qué bugs introduje en este PR? → El `background: var(--bg-surface)`
  redundante. Cazado por el smoke brand, fixed antes de push.
- ✅ ¿Qué cases de la auditoría perpetuaba? → P1 #4 cerrado.
- ✅ ¿Qué combinaciones no estaban cubiertas? → brand/rail/no-nav,
  ahora con smoke.
- ✅ ¿Visual humano? → 4 mobile scenarios + 1 desktop con MCP.

### Lo que sigue pendiente (próximos PRs, no este)

- P1 #5 audit: contraste de `.appshell--brand .appshell__collapse`
  (rgba(255,255,255,0.7) — verificar AA en preset)
- P1 #6 audit (cerrado en commit 2 para `top`): focus trap en sidebar
  mobile del `side` también — separate PR
- P1 #7 audit: NavItem `<a href="#">` → `<button>` cuando no hay href
- P2 #8-13: modernización del `side` layout (render-prop, BrandText
  componente tipado, slot breadcrumbs, header-height var en `side`)
- P3 + P4: roving tabindex, Cmd+\\ shortcut, CommandPalette integration

### Lección que se va a `tasks/lessons.md`

Patrón a fijar: **siempre auditar mi propio output ANTES de pedir
aprobación de merge**. La pregunta "qué hiciste para revisarlo" debería
ser implícita, no que tenga que preguntármela el usuario. Tres tipos de
gaps a buscar siempre:
- Bugs introducidos por mí en este mismo PR (refs vs state, listeners
  sin re-render, etc.)
- Casos en la auditoría reciente que el PR perpetúa
- Combinaciones de props no testeadas (matriz)
