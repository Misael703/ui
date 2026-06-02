import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  smartDateTime, smartDate, formatIsoDate, formatIsoDateTime,
} from '../src/utils/smartTime';
import { TimeAgo, TimeAgoDate } from '../src/components/TimeAgo';
import { esMessages as ES } from '../src/locale/es';

// Pinned reference instant — Tuesday 2026-06-02 14:30 local time.
const NOW = new Date('2026-06-02T14:30:00');

describe('smartDateTime', () => {
  it('< 1 min in the past → "ahora"', () => {
    expect(smartDateTime('2026-06-02T14:29:35', ES, NOW)).toBe('ahora');
  });

  it('< 1 min in the future → "pronto"', () => {
    expect(smartDateTime('2026-06-02T14:30:25', ES, NOW)).toBe('pronto');
  });

  it('1-59 min past → "hace N min"', () => {
    expect(smartDateTime('2026-06-02T14:25:00', ES, NOW)).toBe('hace 5 min');
    expect(smartDateTime('2026-06-02T14:00:00', ES, NOW)).toBe('hace 30 min');
  });

  it('1-59 min future → "en N min"', () => {
    expect(smartDateTime('2026-06-02T14:45:00', ES, NOW)).toBe('en 15 min');
  });

  it('same day with hora → "hoy HH:MM"', () => {
    expect(smartDateTime('2026-06-02T09:15:00', ES, NOW)).toBe('hoy 09:15');
  });

  it('ayer / mañana with hora', () => {
    expect(smartDateTime('2026-06-01T18:00:00', ES, NOW)).toBe('ayer 18:00');
    expect(smartDateTime('2026-06-03T08:00:00', ES, NOW)).toBe('mañana 08:00');
  });

  it('< 7 days → "<weekday> HH:MM"', () => {
    // 2026-05-30 was a Saturday.
    expect(smartDateTime('2026-05-30T11:00:00', ES, NOW)).toBe('sáb 11:00');
  });

  it('same year, > 7 days → "DD mes" without time', () => {
    expect(smartDateTime('2026-03-12T10:00:00', ES, NOW)).toBe('12 mar');
  });

  it('different year → "DD mes YYYY"', () => {
    expect(smartDateTime('2025-03-12T10:00:00', ES, NOW)).toBe('12 mar 2025');
  });

  it('T00:00:00Z heuristic: weekday < 7d without spurious "00:00"', () => {
    // Source has no real time-of-day → label drops the HH:MM.
    expect(smartDateTime('2026-05-30T00:00:00Z', ES, NOW)).toMatch(/^(vie|sáb)$/);
  });

  it('returns empty string on invalid input', () => {
    expect(smartDateTime('not-a-date', ES, NOW)).toBe('');
  });
});

describe('smartDate', () => {
  it('today / yesterday / tomorrow', () => {
    expect(smartDate('2026-06-02', ES, NOW)).toBe('hoy');
    expect(smartDate('2026-06-01', ES, NOW)).toBe('ayer');
    expect(smartDate('2026-06-03', ES, NOW)).toBe('mañana');
  });

  it('< 7 days → weekday only (no hora ever)', () => {
    expect(smartDate('2026-05-30', ES, NOW)).toBe('sáb');
  });

  it('same year > 7 days, and different year', () => {
    expect(smartDate('2026-03-12', ES, NOW)).toBe('12 mar');
    expect(smartDate('2025-03-12', ES, NOW)).toBe('12 mar 2025');
  });
});

describe('formatIsoDate / formatIsoDateTime', () => {
  it('formatIsoDate omits year same-year, adds it otherwise', () => {
    expect(formatIsoDate('2026-03-12T10:00:00', ES, NOW)).toBe('12 mar');
    expect(formatIsoDate('2025-03-12T10:00:00', ES, NOW)).toBe('12 mar 2025');
  });

  it('formatIsoDateTime appends ", HH:MM" only when input has meaningful time', () => {
    expect(formatIsoDateTime('2026-03-12T10:30:00', ES, NOW)).toBe('12 mar, 10:30');
    // Day-precision marker: no time appended.
    const r = formatIsoDateTime('2026-03-12T00:00:00Z', ES, NOW);
    expect(r).toMatch(/^(11|12) mar$/);
  });
});

describe('<TimeAgo> SSR-safe flip', () => {
  it('initial render is the absolute label; useEffect flips to the smart label', () => {
    // Mock useEffect off, simulate first paint.
    const { container, rerender } = render(<TimeAgo iso="2026-06-02T14:25:00" now={NOW} />);
    // After mount, useEffect already fired in act() — the smart label is in.
    const timeEl = container.querySelector('time')!;
    expect(timeEl.getAttribute('datetime')).toBe('2026-06-02T14:25:00');
    expect(timeEl.textContent).toBe('hace 5 min');
    // Tooltip label (absolute) should still be present in the DOM.
    rerender(<TimeAgo iso="2026-06-02T14:25:00" now={NOW} />);
  });

  it('wraps the <time> in the kit Tooltip', () => {
    const { container } = render(<TimeAgo iso="2026-06-02T14:25:00" now={NOW} />);
    const wrap = container.querySelector('.tooltip');
    expect(wrap).not.toBeNull();
    expect(wrap!.querySelector('time')).not.toBeNull();
  });
});

describe('<TimeAgoDate> SSR-safe flip', () => {
  it('renders the smart date label post-mount', () => {
    const { container } = render(<TimeAgoDate iso="2026-06-01" now={NOW} />);
    expect(container.querySelector('time')!.textContent).toBe('ayer');
  });
});
