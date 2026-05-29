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
