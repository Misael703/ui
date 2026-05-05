/**
 * Defaults centralizados de marca y locale para formateo UI.
 *
 * El kit no asume país. Solo guarda lo que necesita para renderizar:
 * la identidad visual (nombre, logos) y la configuración de formateo
 * (moneda, locale BCP 47 para Intl.NumberFormat / DateTimeFormat).
 *
 * Datos de país (regiones, prefijo telefónico, validaciones de RUT, etc.)
 * los pasa el consumer como props. Ver `<AddressForm fields={...}>` y
 * `<PhoneInput prefix="+56">`.
 *
 * Uso:
 *
 * ```tsx
 * import { configureBrand } from '@misael703/elalba-ui';
 *
 * configureBrand({
 *   name: 'Mi Marca',
 *   currency: 'USD',
 *   locale: 'en-US',
 *   logoBasePath: '/static/brand',
 * });
 * ```
 */

export interface BrandDefaults {
  /** Nombre legible de la marca. Usado como `alt` por defecto en `<Logo>`. */
  name: string;
  /** Path base donde están los assets de logos. Default: `/assets/logos`. */
  logoBasePath: string;
  /** Código ISO 4217 (CLP, USD, EUR, ...) para inputs monetarios. */
  currency: string;
  /** Locale BCP 47 para Intl.NumberFormat / DateTimeFormat. */
  locale: string;
}

export const BRAND_DEFAULTS: BrandDefaults = {
  name: 'El Alba',
  logoBasePath: '/assets/logos',
  currency: 'CLP',
  locale: 'es-CL',
};

// Lazy singleton: the merge into a concrete dict only happens on the first
// `getBrand()` call, so a tree-shaker can drop this whole module if no
// component in the consumer's bundle calls `getBrand()` or `configureBrand()`.
let _overrides: Partial<BrandDefaults> | null = null;
let _cached: BrandDefaults | null = null;

/**
 * Sobreescribe los defaults globales del kit. Llamar una sola vez al arranque
 * de la app. Las props siguen funcionando como override puntual.
 */
export function configureBrand(overrides: Partial<BrandDefaults>): void {
  _overrides = overrides;
  _cached = null;
}

/** Lee los defaults actuales. Los componentes lo usan internamente. */
export function getBrand(): BrandDefaults {
  if (!_cached) {
    _cached = _overrides ? { ...BRAND_DEFAULTS, ..._overrides } : BRAND_DEFAULTS;
  }
  return _cached;
}

/** Resetea a los defaults originales. Útil en tests. */
export function resetBrand(): void {
  _overrides = null;
  _cached = null;
}
