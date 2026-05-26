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

## Verificación

- Test de read-path: pre-seed `localStorage`, render con `persistKey`, assert
  `.appshell.is-collapsed`.
- Test de write-path: render top+`collapsedRail`, click `.appshell__collapse`,
  assert `localStorage[key] === '1'`.
- Manual en Storybook: togglear, recargar (F5), confirmar que recuerda — solo
  si agrego el control; si no, lo valido en despachos al consumir 1.22.0.
