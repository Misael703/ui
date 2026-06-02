'use client';
import * as React from 'react';
import { useLocale } from '../locale/LocaleProvider';
import { Tooltip } from './Layout';
import { formatIsoDate, formatIsoDateTime, smartDate, smartDateTime } from '../utils/smartTime';

export interface TimeAgoProps {
  /** ISO 8601 timestamp. */
  iso: string;
  /** Tooltip position. Defaults to `'top'`. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Reference instant for relative formatting. Defaults to `new Date()`
   * at mount. Provide a stable value when you need predictable output
   * across renders (testing, fixed report timestamps).
   */
  now?: Date;
}

/**
 * Adaptive datetime label with absolute tooltip and semantic `<time>` markup.
 *
 * SSR-safe: the first render (server + first client paint) emits the
 * **absolute** label so server HTML matches the client's first paint
 * byte-for-byte. A `useEffect` then swaps to the smart relative label —
 * any divergence (clock skew, NTP drift, TZ between server and client)
 * is contained to a post-mount transition, never a hydration mismatch.
 *
 * The tooltip always shows the full absolute datetime, independent of
 * the relative label.
 */
export function TimeAgo({ iso, side = 'top', now }: TimeAgoProps) {
  const locale = useLocale();
  const absolute = formatIsoDateTime(iso, locale, now);
  const [text, setText] = React.useState(absolute);
  React.useEffect(() => {
    setText(smartDateTime(iso, locale, now));
  }, [iso, locale, now]);
  return (
    <Tooltip label={absolute} side={side}>
      <time dateTime={iso}>{text}</time>
    </Tooltip>
  );
}

/**
 * Same SSR-safe contract as {@link TimeAgo} but date-only (no time-of-day).
 * Use for date stamps where the hour is irrelevant: delivery dates,
 * day-precision history entries, etc.
 */
export function TimeAgoDate({ iso, side = 'top', now }: TimeAgoProps) {
  const locale = useLocale();
  const absolute = formatIsoDate(iso, locale, now);
  const [text, setText] = React.useState(absolute);
  React.useEffect(() => {
    setText(smartDate(iso, locale, now));
  }, [iso, locale, now]);
  return (
    <Tooltip label={absolute} side={side}>
      <time dateTime={iso}>{text}</time>
    </Tooltip>
  );
}
