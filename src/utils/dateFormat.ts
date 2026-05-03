import { getBrand } from '../brand';

/**
 * Date display formats supported by the kit's date pickers.
 *
 * - `iso`  → `2026-05-02` (ISO 8601, year-month-day)
 * - `dmy`  → `02-05-2026` (day-month-year, common in es-CL, es-ES, en-GB, pt-BR)
 * - `mdy`  → `05-02-2026` (month-day-year, en-US)
 * - `auto` → derived from `configureBrand().locale` via Intl.DateTimeFormat
 */
export type DateFormat = 'iso' | 'dmy' | 'mdy' | 'auto';

/** A concrete (non-`auto`) format. */
export type ResolvedDateFormat = Exclude<DateFormat, 'auto'>;

/**
 * Inspects the locale's date-part order using `Intl.DateTimeFormat.formatToParts`.
 * No hardcoded country lists — uses the runtime's CLDR data.
 */
export function detectFormatFromLocale(locale: string): ResolvedDateFormat {
  try {
    const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2024, 0, 2));
    const order: string[] = [];
    for (const p of parts) {
      if (p.type === 'year') order.push('y');
      else if (p.type === 'month') order.push('m');
      else if (p.type === 'day') order.push('d');
    }
    const key = order.join('');
    if (key === 'ymd') return 'iso';
    if (key === 'mdy') return 'mdy';
    return 'dmy';
  } catch {
    return 'dmy';
  }
}

/** Resolves `'auto'` against the current `configureBrand().locale`. */
export function resolveDateFormat(format: DateFormat): ResolvedDateFormat {
  if (format === 'auto') return detectFormatFromLocale(getBrand().locale);
  return format;
}

const PLACEHOLDERS: Record<ResolvedDateFormat, string> = {
  iso: 'aaaa-mm-dd',
  dmy: 'dd-mm-aaaa',
  mdy: 'mm-dd-aaaa',
};

/** Localized placeholder for the given resolved format. */
export function dateFormatPlaceholder(format: ResolvedDateFormat): string {
  return PLACEHOLDERS[format];
}

/** Format a Date as a string in the given resolved format. Always uses `-` as separator. */
export function formatDate(d: Date, format: ResolvedDateFormat): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  if (format === 'iso') return `${yyyy}-${mm}-${dd}`;
  if (format === 'dmy') return `${dd}-${mm}-${yyyy}`;
  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Parse a user-typed date string. Tolerant of `-`, `/`, `.` separators.
 *
 * Always accepts ISO `aaaa-mm-dd` regardless of `format` (it's the canonical
 * wire format, used by APIs and `<input type="date">`). Otherwise, interprets
 * the parts according to the provided format.
 *
 * Returns `null` for invalid dates (out of range, non-existent days like Feb 30,
 * unparseable strings).
 */
export function parseDate(s: string, format: ResolvedDateFormat): Date | null {
  const trimmed = s.trim();
  if (!trimmed) return null;

  // Always accept ISO as a fallback (wire format).
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return safeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const m = trimmed.match(/^(\d{1,4})[\-\/.](\d{1,2})[\-\/.](\d{1,4})$/);
  if (!m) return null;

  let y: number, mo: number, d: number;
  if (format === 'iso') {
    y = Number(m[1]); mo = Number(m[2]); d = Number(m[3]);
  } else if (format === 'dmy') {
    d = Number(m[1]); mo = Number(m[2]); y = Number(m[3]);
  } else {
    mo = Number(m[1]); d = Number(m[2]); y = Number(m[3]);
  }

  // 2-digit years: assume 2000s.
  if (y < 100) y += 2000;

  return safeDate(y, mo, d);
}

function safeDate(y: number, mo: number, d: number): Date | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (
    isNaN(dt.getTime()) ||
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}
