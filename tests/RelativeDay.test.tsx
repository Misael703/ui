import { describe, it, expect } from 'vitest';
import { formatRelativeDay, isToday, isTomorrow, isYesterday } from '../src/utils/dateFormat';

/**
 * Relative-day helpers. The key property is timezone-determinism: a
 * date-only ISO must map to the calendar day written in the string,
 * regardless of the runtime offset (no UTC-midnight off-by-one). All tests
 * pin `now` so they don't depend on the wall clock.
 */
const NOW = new Date(2026, 4, 22); // 2026-05-22 local

describe('isToday / isTomorrow / isYesterday', () => {
  it('isToday matches the same calendar day', () => {
    expect(isToday('2026-05-22', NOW)).toBe(true);
    expect(isToday('2026-05-23', NOW)).toBe(false);
  });
  it('isTomorrow matches the next day', () => {
    expect(isTomorrow('2026-05-23', NOW)).toBe(true);
    expect(isTomorrow('2026-05-22', NOW)).toBe(false);
  });
  it('isYesterday matches the previous day', () => {
    expect(isYesterday('2026-05-21', NOW)).toBe(true);
    expect(isYesterday('2026-05-22', NOW)).toBe(false);
  });
  it('crosses month boundaries', () => {
    const lastOfMonth = new Date(2026, 4, 31);
    expect(isTomorrow('2026-06-01', lastOfMonth)).toBe(true);
  });
});

describe('formatRelativeDay', () => {
  it('returns Hoy / Mañana / Ayer for ±1 day (es-CL, capitalized)', () => {
    expect(formatRelativeDay('2026-05-22', { now: NOW, locale: 'es-CL' })).toBe('Hoy');
    expect(formatRelativeDay('2026-05-23', { now: NOW, locale: 'es-CL' })).toBe('Mañana');
    expect(formatRelativeDay('2026-05-21', { now: NOW, locale: 'es-CL' })).toBe('Ayer');
  });

  it('falls back to weekday + day + month past ±1 day', () => {
    const out = formatRelativeDay('2026-05-26', { now: NOW, locale: 'es-CL' });
    expect(out).not.toMatch(/Hoy|Mañana|Ayer/);
    expect(out).toMatch(/26/); // includes the day number
  });

  it('is timezone-deterministic: a date-only ISO is the day written, not UTC-shifted', () => {
    // The bug this guards: `new Date('2026-05-22')` is UTC midnight, which is
    // 2026-05-21 in negative-offset zones. parseLocalDay keeps it on the 22nd,
    // so it reads as "Hoy" relative to a local 2026-05-22 regardless of offset.
    expect(formatRelativeDay('2026-05-22', { now: NOW, locale: 'es-CL' })).toBe('Hoy');
    expect(isToday('2026-05-22', NOW)).toBe(true);
  });
});
