import { getBrand } from '../brand';

/**
 * The kit's numeric formatters. Thin wrappers over Intl.NumberFormat that
 * read the `getBrand()` defaults (currency/locale), same as MoneyInput.
 * The core does not assume a country: CLP/es-CL are just the configurable default.
 *
 * Intl.NumberFormat instances are cached per resolved combination:
 * constructing one is expensive (~100x more than .format()) and the typical
 * use case is one cell per row in large tables. The real combos per app are
 * few, so the Map doesn't need eviction.
 */
const cache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = locale + JSON.stringify(options);
  let nf = cache.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(locale, options);
    cache.set(key, nf);
  }
  return nf;
}

export interface FormatCurrencyOptions {
  /** ISO 4217 code. Default: `getBrand().currency`. */
  currency?: string;
  /** BCP 47 locale. Default: `getBrand().locale`. */
  locale?: string;
  /**
   * By default Intl uses the currency's own decimal digits
   * (CLP → 0, USD → 2). Override only if you need to force them.
   */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** Formats an amount as currency: `formatCurrency(1234567)` → `"$1.234.567"` (CLP/es-CL). */
export function formatCurrency(value: number, opts: FormatCurrencyOptions = {}): string {
  const brand = getBrand();
  const { currency = brand.currency, locale = brand.locale, ...digits } = opts;
  return getFormatter(locale, { style: 'currency', currency, ...digits }).format(value);
}

export interface FormatNumberOptions {
  /** BCP 47 locale. Default: `getBrand().locale`. */
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** Formats a number with the locale's thousands separator: `formatNumber(1234567)` → `"1.234.567"` (es-CL). */
export function formatNumber(value: number, opts: FormatNumberOptions = {}): string {
  const brand = getBrand();
  const { locale = brand.locale, ...digits } = opts;
  return getFormatter(locale, digits).format(value);
}
