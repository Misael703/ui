import { format, type UiKitMessages } from '../locale/messages';

// Smart time helpers — deterministic, Intl-free. SSR-safe because no
// Intl.DateTimeFormat is involved; the only environment-dependent input
// is `now`, which the consumer can inject for testing or for
// hydration-safe rendering (TimeAgo flips from absolute to relative
// post-mount). TZ follows the runtime — pass `now` from a known TZ if
// you need cross-TZ consistency.

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

// Day-precision inputs ("YYYY-MM-DD" with no time, or "YYYY-MM-DDT00:00:00Z"
// from APIs that don't carry a real time-of-day) parse as UTC midnight by
// the JS spec. In a negative TZ that lands on the previous calendar day
// — the user expects the day they typed, not a TZ shift. We normalise
// both forms to LOCAL midnight of the same calendar day. Timestamps with
// a real time-of-day fall through to the standard parser.
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_UTC_RE = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.0+)?Z$/;

function parseIso(iso: string): Date | null {
  const dateOnly = DATE_ONLY_RE.exec(iso) ?? DAY_UTC_RE.exec(iso);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// Day-precision markers (T00:00:00Z from Bsale/APIs that don't carry a
// real time) parse as midnight in local TZ — checking local h/m matches
// what the user sees. Without this, the smart formatter would render
// "mié 00:00" for every day-precision value, which is noise.
function hasMeaningfulTime(d: Date): boolean {
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dayDiff(target: Date, ref: Date): number {
  return Math.round((startOfDay(target) - startOfDay(ref)) / DAY_MS);
}

function timeOfDay(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function dateOnlyText(d: Date, ref: Date, locale: UiKitMessages): string {
  const months = locale['timeAgo.monthsShort'];
  const base = `${d.getDate()} ${months[d.getMonth()]}`;
  return d.getFullYear() === ref.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/**
 * Absolute date in compact form. Same-year omits the year ("12 mar");
 * different year appends it ("12 mar 2025"). Ignores time-of-day.
 */
export function formatIsoDate(iso: string, locale: UiKitMessages, now?: Date): string {
  const d = parseIso(iso);
  if (!d) return '';
  return dateOnlyText(d, now ?? new Date(), locale);
}

/**
 * Absolute date-time in compact form. Adds ", HH:MM" only when the
 * input carries a meaningful time-of-day (see {@link hasMeaningfulTime}).
 */
export function formatIsoDateTime(iso: string, locale: UiKitMessages, now?: Date): string {
  const d = parseIso(iso);
  if (!d) return '';
  const base = dateOnlyText(d, now ?? new Date(), locale);
  return hasMeaningfulTime(d) ? `${base}, ${timeOfDay(d)}` : base;
}

/**
 * Adaptive date-time. Renders the most informative compact label given
 * the distance between `iso` and `now` (default: `new Date()`):
 * `<1 min` → "ahora" / "pronto"; `<60 min` → "hace N min" / "en N min";
 * same day → "hoy HH:MM"; ±1 day → "ayer HH:MM" / "mañana HH:MM";
 * `<7 days` → "lun HH:MM"; same year → "12 mar"; else "12 mar 2025".
 * The time-of-day portion is dropped when the input lacks one.
 */
export function smartDateTime(iso: string, locale: UiKitMessages, now?: Date): string {
  const d = parseIso(iso);
  if (!d) return '';
  const ref = now ?? new Date();
  const deltaMs = d.getTime() - ref.getTime();
  const deltaMin = Math.round(deltaMs / MINUTE_MS);
  const absMin = Math.abs(deltaMin);
  if (absMin < 1) return deltaMs < 0 ? locale['timeAgo.now'] : locale['timeAgo.soon'];
  if (absMin < 60) {
    return deltaMs < 0
      ? format(locale['timeAgo.minAgo'], { n: absMin })
      : format(locale['timeAgo.minIn'], { n: absMin });
  }
  const meaningful = hasMeaningfulTime(d);
  const dd = dayDiff(d, ref);
  const tod = meaningful ? ` ${timeOfDay(d)}` : '';
  if (dd === 0) return meaningful ? `${locale['timeAgo.today']} ${timeOfDay(d)}` : locale['timeAgo.today'];
  if (dd === -1) return meaningful ? `${locale['timeAgo.yesterday']} ${timeOfDay(d)}` : locale['timeAgo.yesterday'];
  if (dd === 1) return meaningful ? `${locale['timeAgo.tomorrow']} ${timeOfDay(d)}` : locale['timeAgo.tomorrow'];
  if (Math.abs(dd) < 7) {
    const weekdays = locale['timeAgo.weekdaysShort'];
    return `${weekdays[d.getDay()]}${tod}`;
  }
  return dateOnlyText(d, ref, locale);
}

/**
 * Adaptive date (date-only). Same scale as {@link smartDateTime} but
 * without the HH:MM portion — useful when the consumer wants
 * coarse-grained labels like "hoy" / "lun" / "12 mar" regardless of
 * whether the input carries a time-of-day.
 */
export function smartDate(iso: string, locale: UiKitMessages, now?: Date): string {
  const d = parseIso(iso);
  if (!d) return '';
  const ref = now ?? new Date();
  const dd = dayDiff(d, ref);
  if (dd === 0) return locale['timeAgo.today'];
  if (dd === -1) return locale['timeAgo.yesterday'];
  if (dd === 1) return locale['timeAgo.tomorrow'];
  if (Math.abs(dd) < 7) return locale['timeAgo.weekdaysShort'][d.getDay()];
  return dateOnlyText(d, ref, locale);
}
