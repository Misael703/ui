# v0.3.0 — Per-component tsup entries (Opción A: splitting interno)

## Objetivo

Hacer que `tsup` produzca un archivo por componente en `dist/` (con shared chunks para código común vía ESM splitting). La API pública NO cambia: consumers siguen importando desde el barrel `@misael703/elalba-ui`.

**Por qué ahora**: el brand cleanup recién hizo el módulo side-effect-free. Hasta ese punto el splitting era no-op porque cualquier import del barrel arrastraba `_brand` initialization. Ahora rinde de verdad.

## Diseño

### Estructura `dist/` actual

```
dist/
  index.{js,mjs}           # ~218KB ESM, ~237KB CJS — todo inlined
  index.d.ts
  styles.css
  fonts.css
  tokens.css
  fonts/
```

### Estructura `dist/` esperada

```
dist/
  index.{mjs,js}           # barrel — re-exports desde siblings
  index.d.{ts,mts}
  brand.{mjs,js,d.ts}
  locale/
    index.{mjs,js,d.ts}
  utils/
    cx.{mjs,js,d.ts}
    dateFormat.{mjs,js,d.ts}
  components/
    Button.{mjs,js,d.ts}
    Modal.{mjs,js,d.ts}     # Overlay.tsx → conserva nombre Overlay
    Overlay.{mjs,js,d.ts}
    ...
  chunks/                   # tsup ESM splitting: código compartido
    chunk-XXXX.mjs
  styles.css
  fonts.css
  tokens.css
  fonts/
```

### Cambio en `tsup.config.ts`

```ts
export default defineConfig({
  entry: [
    'src/index.ts',
    'src/brand.ts',
    'src/locale/index.ts',
    'src/utils/*.ts',
    'src/components/!(*.stories).tsx',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  clean: true,
  treeshake: true,
  splitting: true,
  sourcemap: true,
});
```

### `package.json` exports — sin cambios

Solo el barrel sigue siendo entry público:
```json
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" },
  "./styles.css": "./dist/styles.css",
  ...
}
```

Subpaths NO se exponen. Si alguien hace `import { Button } from '@misael703/elalba-ui/components/Button'` → no soportado oficialmente (aunque técnicamente el archivo existe).

## Riesgos identificados

### R1 — CJS bloat
`splitting: true` solo aplica a ESM. En CJS cada entry se bundlea independiente y self-contained. El tarball npm va a crecer porque cada `dist/components/Button.js` (CJS) tiene `cx`, `Icons`, etc. inlined.

**Mitigación**: medir el delta. Si crece más de 30%, considerar dual-config (multi-entry ESM, single-entry CJS). Si crece <20%, aceptar.

### R2 — TypeScript declarations cross-module
Cada componente exporta tipos. Ahora cada uno tendrá su propio `.d.ts` que importa de siblings. Ejemplo: `Display.tsx` usa tipos de `Icons`, ahora `dist/components/Display.d.ts` debe hacer `import { ... } from './Icons'`.

**Mitigación**: tsup + tsc resuelven esto bien por defecto. Verificar que `dist/index.d.ts` funciona end-to-end con un test de tipos.

### R3 — Subpath leak
Aunque no exponemos subpaths en `exports`, los archivos existen en `dist/`. Un consumer curioso puede hacer `import from '@misael703/elalba-ui/components/Button'` y funcionar (Node 18+ con `exports` map cierra esta puerta — bueno).

**Mitigación**: con el `exports` map actual (sin `"./*"`), Node bloquea imports que no están listados. Verificar.

### R4 — Bundle.css references
Las imports CSS de fuentes/tokens están a nivel CSS, no JS. No afectados por este cambio. Confirmar que `dist/styles.css` sigue saliendo correcto.

## Plan por commits

- [ ] **Commit 1**: `chore(build): per-component entries for ESM splitting`
  - Update `tsup.config.ts` con multi-entry
  - `npm run build` y verificar estructura `dist/`
  - Si CJS infla mucho: switch a dual-config
  - Documento delta de size en commit body
  - **No** cambia `package.json` exports

- [ ] **Commit 2** (solo si R3 falla): `chore(package): close subpath leak via exports map`
  - Si node permite imports a subpaths internos no documentados, cerrarlo en `exports`
  - Probable que NO sea necesario — Node 18+ con `exports` ya bloquea

## Verificación

- [ ] `npm test` → 280/280 verde (la API pública no cambió, no hay razón para que algo se rompa)
- [ ] `dist/index.mjs` queda chico (~10-20KB, solo re-exports, no logic)
- [ ] Total `dist/` ESM (sin CJS) baja o se mantiene
- [ ] CJS delta: medido y aceptable
- [ ] `npm pack --dry-run` muestra estructura esperada
- [ ] Type check end-to-end: `import { Button } from '../dist/index'` desde un archivo TS de test compila sin errores

## No incluido (deferred)

- **Subpaths públicos**: API surface deliberadamente NO ampliada. Si en el futuro un consumer real lo necesita, agregamos en otra release.
- **Per-component CSS**: el CSS sigue como un solo `styles.css`. Splitar el CSS por componente sería otro proyecto.

## Review

Pendiente.
