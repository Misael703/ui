# Persistencia de colapso del AppShell — `persistKey` (2026-05-26)

## Problema

Al recargar la página, `AppShell` vuelve a `defaultCollapsed`. Es el
comportamiento esperado de React (`useState(defaultCollapsed)` se inicializa
una vez por montaje, `AppShell.tsx:192`), no un bug. Falta **persistencia**.
No se puso por defecto a propósito: barritas/despachos son Next.js App Router
(SSR), y leer `localStorage` en el render inicial provoca hydration mismatch
(server no tiene `localStorage`) + colisión de claves entre apps/instancias.

## Diseño: opt-in `persistKey`, SSR-safe

Prop nueva `persistKey?: string` en `AppShellBaseProps`. Si no se pasa, nada
cambia (default actual intacto). Si se pasa, el kit recuerda el colapso en
`localStorage[persistKey]`.

SSR-safe (patrón next-themes): el estado inicial sigue siendo `defaultCollapsed`
→ server y primer render del cliente coinciden (sin mismatch). Tras montar, un
`useEffect` lee `localStorage` y sincroniza. Trade-off aceptado: si el valor
guardado difiere del default hay un frame de flash en el sidebar (animable por
la transición existente); evitarlo requeriría un script inline bloqueante,
sobre-ingeniería para un sidebar.

Reglas:
- `persistKey` solo gobierna el modo **no-controlado**. Si se pasa `collapsed`
  (controlado), `persistKey` se ignora (el consumer ya es dueño de su estado y
  su persistencia). Documentar en el JSDoc.
- Lecturas/escrituras a `localStorage` envueltas en try/catch (Safari modo
  privado, storage deshabilitado lanzan). Fallback: `defaultCollapsed`.
- Valor almacenado: `'1'` / `'0'` (no `JSON`, no `'true'`).

## Pasos

- [x] `src/components/AppShell.tsx`: `persistKey?: string` en `AppShellBaseProps`
      con JSDoc (opt-in, SSR-safe, ignorado si controlado).
- [x] `AppShell.tsx`: `useEffect` de sync post-mount (guard: `persistKey` &&
      no-controlado) + escribir en `setCollapsed`. try/catch en ambos.
- [x] `tests/AppShellPersist.test.tsx` (nuevo, 6 casos): read `'1'`; stored
      `'0'` gana a `defaultCollapsed`; write en toggle; controlado ignora;
      sin key no toca storage; no-crash si lanza.
- [x] Story: descartado control en Playground (origen de storage compartido
      entre stories → bleed). Cubierto por tests + DESIGN.md.
- [x] CHANGELOG + DESIGN + package.json → 1.22.0 (feat minor).
- [x] Gate: tsc 0 · eslint 0 · vitest 486/486 · build exit 0.
- [ ] Esperar aprobación explícita antes de push/PR/release.

## Review

`persistKey` agregado como persistencia opt-in del colapso. Implementación en
3 puntos de `AppShell.tsx`: prop+JSDoc en la base, `useEffect` de sync
post-mount (SSR-safe, no-controlado, try/catch) y escritura guardada en
`setCollapsed`. Default 100% intacto: sin la prop el kit no toca `localStorage`
(test (d) lo pinea con spies). 486 tests verdes (+6), tsc/eslint/build limpios.
Consumo: `<AppShell persistKey="despachos.sidebar" … />`. Pendiente: aprobación
para release 1.22.0 (no se publica sin OK explícito).

## Adenda — quitar doble control en top+collapsedRail (Opción A)

Detectado: `top`+`collapsedRail` tenía dos affordances de colapso (hamburger en
`header.left` que cablea el consumer + chevron built-in abajo que renderizaba el
componente desde 1.21.0). Origen del choque: el chevron de abajo es idiom de
`side` (sin header), se filtró a `top` vía `collapsedRail`.

Fix (Opción A): el componente ya NO renderiza el toggle built-in en `top`. El
colapso en `top` lo maneja siempre el control del consumer en `header.left`,
uniforme en hide y rail. `collapsedRail` queda puramente visual. `side` intacto.

- [x] `AppShell.tsx`: removido el bloque `collapsedRail && <button .appshell__collapse>` del render `top` (queda solo `footer`).
- [x] `AppShellTop.test.tsx`: test invertido → en `top`+`collapsedRail` el toggle es `null`, el modifier `appshell--rail` sigue.
- [x] `AppShellPersist.test.tsx`: write-path y no-crash reapuntados al toggle de `side`.
- [x] DESIGN.md + CHANGELOG (`### Changed`) + comentario del story `TopbarRail`.
- [x] Gate: tsc 0 · eslint 0 · vitest 486/486 · build exit 0.
- [ ] Check visual en Storybook: browser MCP bloqueado por sesión previa; cubierto por la aserción de DOM del test (toggle null). Validar en despachos al consumir 1.22.0.

## Adenda 2 — header render-prop (1.23.0)

Gap medido por el consumer en 1.22.0: en `top`, `persistKey` (uncontrolled) no
podía convivir con un trigger en el header. El kit renderizaba `header.{left,
center,right}` como nodos estáticos sin handle al estado, y `top` no tiene
toggle built-in → un shell uncontrolled no tenía cómo colapsar desde el header
y `persistKey` era no-op ahí. (Mi propio test de persistencia usaba `side`, lo
que escondió la inconsistencia.)

Fix: los slots del header aceptan render-prop `(api) => ReactNode` con
`{ collapsed, toggle, setCollapsed }`. Tipos nuevos exportados:
`AppShellHeaderApi`, `AppShellHeaderSlot`. Nodos estáticos sin cambio.

- [x] `AppShell.tsx`: tipos `AppShellHeaderApi`/`AppShellHeaderSlot`; slots con render-prop; `slot()` resolver + `headerApi` en el render `top`.
- [x] Tests: `AppShellTop` (render-prop togglea uncontrolled + nodo estático intacto); `AppShellPersist` (TOP uncontrolled + persistKey + render-prop persiste; TOP lee stored).
- [x] Story `Topbar · Uncontrolled (header render-prop)`.
- [x] DESIGN.md (snippet canónico → render-prop) + CHANGELOG 1.23.0 + package.json.
- [x] Gate: tsc 0 · eslint 0 · vitest 490/490 · build 0 · smoke OK.
- [ ] Pendiente: confirmación explícita para push/PR/release 1.23.0.

## Adenda 3 — scroll interno en top (1.24.0)

Bug del consumidor: en `top`, contenido largo scrollea la página entera y se
lleva el header + desincroniza el sidebar. Causa: `.appshell { min-height:100vh }`
sin scroll container interno. El `side` no sufre (modelo sticky).

Fix (spec del consumidor, corregida con el override del sidebar que me había
saltado): modelo app-shell de scroll interno en `top`. Header (fila 1) + sidebar
(fila 2) estáticos; scrollea solo `.appshell__content`. Default, scopeado a
`--header-top` (no toca `side`), sin tocar el padding del content.

- [x] `index.css`: `.appshell.appshell--header-top { height: 100vh }`; `.appshell--header-top .appshell__sidebar { height: auto }` (evita 2º scrollbar vs base `height:100vh`); `.appshell--header-top .appshell__content { min-height:0; overflow-y:auto }`. (`body { min-height:0 }` ya estaba.)
- [x] Stories: wrappers `top` → `100vh`; contenido alto (8×200) + sub-header sticky para demostrar scroll y anclaje.
- [x] Tests: 4 guards de CSS en `AppShellTop` (height 100vh, sidebar auto, content overflow-y+min-height, global padding intacto).
- [x] DESIGN.md (sección "two scroll models") + CHANGELOG 1.24.0 + package.json.
- [x] Gate: tsc 0 · eslint 0 · vitest 494/494 · build 0 · smoke OK.
- [ ] Check visual Playwright: browser MCP con lock de sesión previa (no liberable por MCP). Cubierto por 4 guards de CSS + smoke (Next app real buildea/renderiza). Validar en despachos al bump.
- [ ] Pendiente: confirmación explícita para release 1.24.0.

## Adenda 4 — iconos de view switcher + icon prop (1.25.0)

Pedido despachos: switcher de 5 layouts con iconos; el kit no los tenía.

- [x] Icons.tsx: 5 iconos. `Rows3` (NO `Table` — colisiona con el wrapper `<table>` de Layout.tsx; `Rows3` es el nombre lucide estándar), `CalendarDays`, `Map`, `LayoutGrid`, `Columns3`. `MapPin` ya existía.
- [x] Toggle.tsx: `icon?` prop en `ToggleGroupItem`/`SegmentedControlItem` (renderiza antes de children; layout vía flex gap ya existente). Children sigue funcionando (back-compat). Hallazgo: los iconos YA funcionaban vía children; el prop es la API explícita.
- [x] smoke `ICON_NAMES`: +5 (el gate exige cubrir cada export Capitalizado).
- [x] Tests: Toggle (icon+label, icon-only via aria-label, children-only back-compat).
- [x] Story `SegmentedControl · view switcher (iconos)` (icon+label y icon-only).
- [x] CHANGELOG 1.25.0 + package.json.
- [x] Gate: tsc 0 · eslint 0 · vitest 497/497 · build 0 · smoke OK.
- [ ] Pendiente: confirmación explícita para release 1.25.0 (parado antes de publicar por protocolo).

## Verificación

- Test de read-path: pre-seed `localStorage`, render con `persistKey`, assert
  `.appshell.is-collapsed`.
- Test de write-path: render top+`collapsedRail`, click `.appshell__collapse`,
  assert `localStorage[key] === '1'`.
- Manual en Storybook: togglear, recargar (F5), confirmar que recuerda — solo
  si agrego el control; si no, lo valido en despachos al consumir 1.22.0.

## /frontend-qa — auditoría kit-wide (2026-05-27)

Scope: kit completo (no una ruta). Adaptado a librería. Stack React (no Angular).

- [ ] Gate A — review estático: web-design-guidelines + design-taste-frontend + convenciones (sin browser)
- [ ] Gate B — runtime Playwright en Storybook (superficies representativas) — NECESITA `npm run storybook` levantado
- [ ] Gate C — polish (impeccable) + i18n/locale (español neutro, tú, sin tildes en imperativos)
- [ ] Gate D — visual regression (baselines) — N/A primer run
- [ ] Sign-off + informe de gaps/mejoras
