/**
 * Defaults centralizados de marca.
 *
 * Todos los componentes que tienen valores brand-specific (nombre, logo paths,
 * moneda, locale, regiones, prefijo telefónico) leen sus defaults desde aquí.
 *
 * Para forkear el kit a otra marca/empresa, llama a `configureBrand()` una sola
 * vez al arranque de tu app:
 *
 * ```tsx
 * // app/layout.tsx (Next.js) o donde inicialices la app
 * import { configureBrand } from '@misael703/elalba-ui';
 *
 * configureBrand({
 *   name: 'Mi Marca',
 *   currency: 'USD',
 *   locale: 'en-US',
 *   phonePrefix: '+1',
 *   logoBasePath: '/static/brand',
 *   regions: ['Alabama', 'Alaska', ...],
 * });
 * ```
 *
 * Después de configurar, todos los componentes usan los nuevos defaults sin
 * necesidad de pasar props en cada llamada. Las props siguen funcionando como
 * override puntual.
 */

const CL_REGIONS: readonly string[] = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble',
  'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
] as const;

export interface BrandDefaults {
  /** Nombre legible de la marca. Usado como `alt` por defecto en `<Logo>`. */
  name: string;
  /** Path base donde están los assets de logos. Default: `/assets/logos`. */
  logoBasePath: string;
  /** Código ISO 4217 (CLP, USD, EUR, ...) para inputs monetarios. */
  currency: string;
  /** Locale BCP 47 para Intl.NumberFormat / DateTimeFormat. */
  locale: string;
  /** Prefijo telefónico de país. Ej: '+56' para Chile, '+1' para USA. */
  phonePrefix: string;
  /** Lista de regiones/estados para `<AddressForm>`. */
  regions: readonly string[];
}

export const BRAND_DEFAULTS: BrandDefaults = {
  name: 'El Alba',
  logoBasePath: '/assets/logos',
  currency: 'CLP',
  locale: 'es-CL',
  phonePrefix: '+56',
  regions: CL_REGIONS,
};

/** Estado mutable singleton — solo se modifica via configureBrand(). */
let _brand: BrandDefaults = { ...BRAND_DEFAULTS };

/**
 * Sobreescribe los defaults globales del kit. Llamar una sola vez al arranque
 * de la app. Las props siguen funcionando como override puntual.
 */
export function configureBrand(overrides: Partial<BrandDefaults>): void {
  _brand = { ...BRAND_DEFAULTS, ...overrides };
}

/** Lee los defaults actuales. Los componentes lo usan internamente. */
export function getBrand(): BrandDefaults {
  return _brand;
}

/** Resetea a los defaults originales. Útil en tests. */
export function resetBrand(): void {
  _brand = { ...BRAND_DEFAULTS };
}
