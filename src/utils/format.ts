import { getBrand } from '../brand';

/**
 * Formatters numéricos del kit. Wrappers finos sobre Intl.NumberFormat que
 * leen los defaults de `getBrand()` (currency/locale), igual que MoneyInput.
 * El core no asume país: CLP/es-CL son solo el default configurable.
 *
 * Las instancias de Intl.NumberFormat se cachean por combinación resuelta:
 * construirlas es caro (~100x más que .format()) y el caso de uso típico es
 * una celda por fila en tablas grandes. Las combos reales por app son pocas,
 * así que el Map no necesita evicción.
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
  /** Código ISO 4217. Default: `getBrand().currency`. */
  currency?: string;
  /** Locale BCP 47. Default: `getBrand().locale`. */
  locale?: string;
  /**
   * Por defecto Intl usa los decimales propios de la moneda
   * (CLP → 0, USD → 2). Override solo si necesitas forzarlos.
   */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** Formatea un monto como moneda: `formatCurrency(1234567)` → `"$1.234.567"` (CLP/es-CL). */
export function formatCurrency(value: number, opts: FormatCurrencyOptions = {}): string {
  const brand = getBrand();
  const { currency = brand.currency, locale = brand.locale, ...digits } = opts;
  return getFormatter(locale, { style: 'currency', currency, ...digits }).format(value);
}

export interface FormatNumberOptions {
  /** Locale BCP 47. Default: `getBrand().locale`. */
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** Formatea un número con separador de miles del locale: `formatNumber(1234567)` → `"1.234.567"` (es-CL). */
export function formatNumber(value: number, opts: FormatNumberOptions = {}): string {
  const brand = getBrand();
  const { locale = brand.locale, ...digits } = opts;
  return getFormatter(locale, digits).format(value);
}
