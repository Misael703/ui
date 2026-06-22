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

// ---------- Calendar helpers (shared by the date pickers) ----------------
// Previously duplicated verbatim in Pickers.tsx, AdvancedPickers.tsx and
// Display3.tsx. Single source now; behavior is unchanged.

/** First day of `d`'s month at local midnight. */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** `d` shifted by `n` months, normalized to the first of that month. */
export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** True when `a` and `b` are the same calendar day (local time). */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Compact month grid used by the date pickers: leading `null`s pad the days
 * before the 1st of a Monday-first week, followed by one `Date` per day of the
 * month (no adjacent-month spillover). The full-month `Calendar` uses a
 * different fixed 42-cell model on purpose, so it does not consume this.
 *
 * @param view   Any date within the reference month.
 * @param offset Months to add to `view` (0 = same month, 1 = next, ...).
 */
export function buildMonthGrid(
  view: Date,
  offset = 0
): { month: Date; cells: (Date | null)[] } {
  const month = addMonths(view, offset);
  const startDow = (month.getDay() + 6) % 7; // Monday = 0
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  return { month, cells };
}

export interface MonthGridCell {
  date: Date;
  /** True for the leading/trailing days that belong to the adjacent month. */
  outside: boolean;
}

/**
 * Fixed 6-row (42-cell) month grid: leading days from the previous month and
 * trailing days from the next month fill every cell, each tagged `outside`. The
 * row count is constant, so the picker's height never jumps between months with
 * 4, 5 or 6 weeks. Monday-first. Used by the DatePicker/DateRangePicker; the
 * legacy `buildMonthGrid` (ragged, `null`-padded) stays for back-compat.
 */
export function buildMonthGrid6(view: Date, offset = 0): { month: Date; cells: MonthGridCell[] } {
  const month = addMonths(view, offset);
  const y = month.getFullYear();
  const mo = month.getMonth();
  const startDow = (new Date(y, mo, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells: MonthGridCell[] = [];
  // Leading days from the previous month (ascending).
  for (let i = startDow; i > 0; i--) cells.push({ date: new Date(y, mo, 1 - i), outside: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(y, mo, d), outside: false });
  // Trailing days from the next month until the grid is 6 full weeks.
  let next = 1;
  while (cells.length < 42) cells.push({ date: new Date(y, mo + 1, next++), outside: true });
  return { month, cells };
}

// ---------- Relative day helpers ----------------------------------------

/**
 * Parse a date-only ISO (`YYYY-MM-DD`, optionally with a time suffix) to a
 * Date at **local midnight**. `new Date('2026-05-22')` parses as UTC
 * midnight, which lands on the 21st in negative-offset timezones — a classic
 * off-by-one-day SSR bug. Reading the Y-M-D parts and constructing a local
 * Date avoids it: the calendar day is always the one written in the string.
 */
function parseLocalDay(iso: string | Date): Date {
  if (iso instanceof Date) return new Date(iso.getFullYear(), iso.getMonth(), iso.getDate());
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** True if `iso` is the same calendar day as `now` (default today, local). */
export function isToday(iso: string | Date, now: Date = new Date()): boolean {
  return isSameDay(parseLocalDay(iso), now);
}

/** True if `iso` is the calendar day after `now` (default today, local). */
export function isTomorrow(iso: string | Date, now: Date = new Date()): boolean {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return isSameDay(parseLocalDay(iso), t);
}

/** True if `iso` is the calendar day before `now` (default today, local). */
export function isYesterday(iso: string | Date, now: Date = new Date()): boolean {
  const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return isSameDay(parseLocalDay(iso), y);
}

export interface RelativeDayOptions {
  /** BCP-47 locale. Defaults to the configured brand locale (es-CL). */
  locale?: string;
  /** Reference "today". Pass a fixed value for deterministic SSR / tests. */
  now?: Date;
}

/**
 * Human day label: "Hoy" / "Mañana" / "Ayer" for ±1 day, otherwise the
 * localized weekday + day + month ("mar 26 may"). The ±1 words come from
 * `Intl.RelativeTimeFormat(..., { numeric: 'auto' })` so they're correct in
 * any locale; capitalized for use as a standalone label.
 *
 * Deterministic across timezones: the day delta is computed from local
 * calendar parts (via `parseLocalDay`), never from UTC timestamps, so an
 * ISO date never renders as the wrong day. Pass `now` to pin it for SSR.
 */
export function formatRelativeDay(iso: string | Date, opts: RelativeDayOptions = {}): string {
  const locale = opts.locale ?? getBrand().locale ?? 'es-CL';
  const now = opts.now ?? new Date();
  const target = parseLocalDay(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (Math.abs(diffDays) <= 1) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const s = rtf.format(diffDays, 'day');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(target);
}
