# v0.3.0 — Brand cleanup (A + B3 + C)

## Objetivo

Sacar las dependencias country-specific (CL_REGIONS, phonePrefix de Chile) del UI kit, hacer `<AddressForm>` un compositor genérico de campos, y aplicar el lazy getter al singleton de brand. Resultado: kit honestamente neutro de país.

## Bloque A — Slim BrandDefaults

**Cambios**:
- `BrandDefaults` deja solo: `name`, `logoBasePath`, `currency`, `locale`. Salen `phonePrefix` y `regions`.
- Eliminar `CL_REGIONS` del archivo (constante de 16 strings que solo aplica a Chile).
- `<PhoneInput>` ya no toma default desde el brand. La prop `prefix` queda opcional con default `''` (vacío). Consumers que quieran `+56` pasan `prefix="+56"` explícitamente.

**Archivos**:
- `src/brand.ts` — borrar campos + constante.
- `src/components/InputsExtra.tsx` — `PhoneInput` línea 230 (`resolvedPrefix = prefix ?? getBrand().phonePrefix`) → `prefix ?? ''`.

## Bloque B3 — AddressForm como compositor genérico

**Diseño**: `<AddressForm>` deja de tener campos hardcoded chilenos (RUT, Comuna, Región). Pasa a consumir un array de `AddressField` que el consumer define.

```ts
export interface AddressField {
  /** Key del campo en el objeto value. */
  key: string;
  label: React.ReactNode;
  type?: 'text' | 'select' | 'textarea';
  placeholder?: string;
  /** Para `type: 'select'`. */
  options?: readonly { value: string; label: React.ReactNode }[];
  /** Layout: 'full' ocupa toda la fila, 'half' = 1/2, 'third' = 1/3. */
  width?: 'full' | 'half' | 'third';
  /** Para `type: 'textarea'`. */
  rows?: number;
}

export interface AddressFormProps {
  fields: AddressField[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  className?: string;
}
```

**Resultado en uso**:

```tsx
// Consumer Chile (marginapp / Factureo) define sus propios campos
const CL_REGIONS = [
  'Arica y Parinacota', 'Tarapacá', /* ... */
].map(r => ({ value: r, label: r }));

const chileFields: AddressField[] = [
  { key: 'fullName', label: 'Nombre completo', width: 'full' },
  { key: 'rut', label: 'RUT', placeholder: '12.345.678-9', width: 'full' },
  { key: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678', width: 'full' },
  { key: 'street', label: 'Calle', width: 'half' },
  { key: 'number', label: 'Número', width: 'third' },
  { key: 'apartment', label: 'Depto/Casa', width: 'third' },
  { key: 'region', label: 'Región', type: 'select', options: CL_REGIONS, width: 'half' },
  { key: 'comuna', label: 'Comuna', width: 'half' },
  { key: 'notes', label: 'Notas para el despacho', type: 'textarea', rows: 2, width: 'full' },
];

<AddressForm fields={chileFields} value={value} onChange={onChange} />
```

**Lo que muere**:
- Interface `Address` (con campos chilenos: rut, region, comuna, etc.).
- Prop `showRut` (cada consumer decide qué campos tiene).
- Prop `regions` (los pasa el consumer dentro del field).

**Lo que el kit conserva**: el layout grid responsive (`address-form__row`), el render de label/input/select/textarea, la accesibilidad (htmlFor + id auto-generado por field key).

**Migración**:
- CHANGELOG entry detallada con before/after.
- Storybook story actualizada con el set chileno como ejemplo.
- Si lo querés: helper export `addressPresets.chile` con el array listo (más adelante, no en este PR).

## Bloque C — Lazy getter en brand

**Cambio**: el singleton mutable `let _brand = { ...BRAND_DEFAULTS }` se reemplaza por:

```ts
let _overrides: Partial<BrandDefaults> | null = null;
let _cached: BrandDefaults | null = null;

export function configureBrand(overrides: Partial<BrandDefaults>): void {
  _overrides = overrides;
  _cached = null; // invalidar cache
}

export function getBrand(): BrandDefaults {
  if (!_cached) {
    _cached = _overrides ? { ...BRAND_DEFAULTS, ..._overrides } : BRAND_DEFAULTS;
  }
  return _cached;
}

export function resetBrand(): void {
  _overrides = null;
  _cached = null;
}
```

**Por qué importa**:
- El módulo deja de tener side effects al import time (solo declara dos `null` y una const).
- Combinado con `"sideEffects": false` en `package.json`, los bundlers pueden eliminar el módulo si nadie lo usa.
- `getBrand()` retorna la misma referencia mientras no haya configure (importante: si un consumer guardaba la ref, sigue funcionando — el cached object es estable).

**Cuidado**: `resetBrand` es lo único que cambia semánticamente — antes resetaba a `{ ...BRAND_DEFAULTS }` (copia nueva), ahora a `null` y la próxima `getBrand()` retorna `BRAND_DEFAULTS` (referencia compartida). Si algún test mutaba el resultado de `getBrand()` rompería. **Verificar tests**.

## Bloque D — Bundle hygiene

- Añadir `"sideEffects": ["**/*.css", "**/*.otf"]` en `package.json`. Marca el resto como side-effect-free para el tree-shaker.
- `npm run build` y verificar que el bundle ESM no creció (debería bajar mínimamente).

## Plan por commits

- [ ] **Commit 1**: `feat(brand)!: slim BrandDefaults — remove phonePrefix and regions`
  - Bloque A completo
  - Tests: ajustar si algún test referencia los campos eliminados

- [ ] **Commit 2**: `refactor(brand): lazy getter for tree-shaking`
  - Bloque C completo
  - Tests: confirmar que `resetBrand` + `configureBrand` siguen pasando

- [ ] **Commit 3**: `feat(commerce)!: AddressForm becomes a generic field composer`
  - Bloque B3 completo
  - Story actualizada con el preset chileno como ejemplo
  - Tests AddressForm: rewrites — al menos render con 3 fields (text, select, textarea) + onChange

- [ ] **Commit 4**: `chore(bundle): mark package as side-effect-free`
  - `package.json` `sideEffects` array
  - Build verification (size delta documentado en commit body)

- [ ] **Commit 5**: `docs: migration guide for v0.3.0 breaking changes`
  - CHANGELOG: bloque "Breaking changes" con before/after de PhoneInput, AddressForm, BrandDefaults
  - README: actualizar sección "Defaults de marca" — quitar referencias a regions/phonePrefix

## Verificación

- [ ] Tests existentes (270): los que tocan brand se actualizan, el resto pasa intacto.
- [ ] Tests nuevos: ~3-5 (AddressForm: render 3 tipos de field, onChange, layout grid).
- [ ] Build limpio sin warnings.
- [ ] Bundle ESM: documentar delta (esperable: ligera reducción).
- [ ] `dist/index.d.ts`: verificar que `AddressField` se exporta y que `Address` ya no aparece.

## Riesgos y notas

- **Breaking changes**: 3. Documentados en CHANGELOG con migración paso a paso. v0.3.0 lo cubre.
- **Blast radius**: chico. El kit nunca se ha consumido en prod (Task #8 abierto). Solo `marginapp` y `Factureo` son consumers potenciales y los ajustamos cuando los toquemos.
- **`addressPresets.chile`**: explícitamente fuera de scope para este PR. Si lo necesitamos, lo agregamos como un sub-export opt-in en otro release.
- **PhoneInput sin default `+56`**: visualmente no muestra prefijo si el consumer no lo pasa. Es lo correcto — el kit no debe asumir país.

## Review

Pendiente.
