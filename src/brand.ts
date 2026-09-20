/**
 * Centralized brand and locale defaults for UI formatting.
 *
 * The kit does not assume a country. It only holds what it needs to render:
 * visual identity (name, logos) and formatting configuration
 * (currency, BCP 47 locale for Intl.NumberFormat / DateTimeFormat).
 *
 * Country-specific data (regions, phone prefix, RUT validation, etc.)
 * is passed by the consumer as props. See `<AddressForm fields={...}>` and
 * `<PhoneInput prefix="+56">`.
 *
 * Usage:
 *
 * ```tsx
 * import { configureBrand } from '@misael703/ui';
 *
 * configureBrand({
 *   name: 'My Brand',
 *   currency: 'USD',
 *   locale: 'en-US',
 *   logoBasePath: '/static/brand',
 * });
 * ```
 */

export interface BrandDefaults {
  /** Human-readable brand name. Used as the default `alt` in `<Logo>`. */
  name: string;
  /** Base path where the logo assets live. Default: `/assets/logos`. */
  logoBasePath: string;
  /** ISO 4217 code (CLP, USD, EUR, ...) for money inputs. */
  currency: string;
  /** BCP 47 locale for Intl.NumberFormat / DateTimeFormat. */
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
 * Overrides the kit's global defaults. Call once at app startup.
 * Props still work as a one-off override.
 */
export function configureBrand(overrides: Partial<BrandDefaults>): void {
  _overrides = overrides;
  _cached = null;
}

/** Reads the current defaults. Components use it internally. */
export function getBrand(): BrandDefaults {
  if (!_cached) {
    _cached = _overrides ? { ...BRAND_DEFAULTS, ..._overrides } : BRAND_DEFAULTS;
  }
  return _cached;
}

/** Resets to the original defaults. Useful in tests. */
export function resetBrand(): void {
  _overrides = null;
  _cached = null;
}
