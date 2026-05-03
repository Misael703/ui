import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectFormatFromLocale,
  resolveDateFormat,
  formatDate,
  parseDate,
  dateFormatPlaceholder,
} from '../src/utils/dateFormat';
import { configureBrand, resetBrand } from '../src/brand';

describe('detectFormatFromLocale', () => {
  it('returns dmy for es-CL', () => {
    expect(detectFormatFromLocale('es-CL')).toBe('dmy');
  });
  it('returns dmy for en-GB', () => {
    expect(detectFormatFromLocale('en-GB')).toBe('dmy');
  });
  it('returns dmy for pt-BR', () => {
    expect(detectFormatFromLocale('pt-BR')).toBe('dmy');
  });
  it('returns mdy for en-US', () => {
    expect(detectFormatFromLocale('en-US')).toBe('mdy');
  });
  it('returns iso for ja-JP', () => {
    expect(detectFormatFromLocale('ja-JP')).toBe('iso');
  });
});

describe('resolveDateFormat', () => {
  beforeEach(() => resetBrand());

  it('returns the format unchanged when explicit', () => {
    expect(resolveDateFormat('iso')).toBe('iso');
    expect(resolveDateFormat('dmy')).toBe('dmy');
    expect(resolveDateFormat('mdy')).toBe('mdy');
  });

  it("derives from configureBrand() locale when 'auto'", () => {
    expect(resolveDateFormat('auto')).toBe('dmy'); // default brand is es-CL

    configureBrand({ locale: 'en-US' });
    expect(resolveDateFormat('auto')).toBe('mdy');

    configureBrand({ locale: 'ja-JP' });
    expect(resolveDateFormat('auto')).toBe('iso');
  });
});

describe('formatDate', () => {
  const d = new Date(2026, 4, 2); // 2 May 2026

  it('formats iso (yyyy-mm-dd)', () => {
    expect(formatDate(d, 'iso')).toBe('2026-05-02');
  });
  it('formats dmy (dd-mm-yyyy)', () => {
    expect(formatDate(d, 'dmy')).toBe('02-05-2026');
  });
  it('formats mdy (mm-dd-yyyy)', () => {
    expect(formatDate(d, 'mdy')).toBe('05-02-2026');
  });
  it('zero-pads single-digit days and months', () => {
    expect(formatDate(new Date(2026, 0, 3), 'dmy')).toBe('03-01-2026');
  });
});

describe('parseDate', () => {
  it('parses dmy format', () => {
    const d = parseDate('02-05-2026', 'dmy')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(2);
  });

  it('parses mdy format', () => {
    const d = parseDate('05-02-2026', 'mdy')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(2);
  });

  it('parses iso format', () => {
    const d = parseDate('2026-05-02', 'iso')!;
    expect(d.getMonth()).toBe(4);
  });

  it('always accepts ISO as wire fallback (regardless of format)', () => {
    expect(parseDate('2026-05-02', 'dmy')).not.toBeNull();
    expect(parseDate('2026-05-02', 'mdy')).not.toBeNull();
  });

  it('tolerates / and . separators', () => {
    expect(parseDate('02/05/2026', 'dmy')).not.toBeNull();
    expect(parseDate('02.05.2026', 'dmy')).not.toBeNull();
  });

  it('expands 2-digit year to 2000s', () => {
    const d = parseDate('02-05-26', 'dmy')!;
    expect(d.getFullYear()).toBe(2026);
  });

  it('rejects invalid dates (Feb 30)', () => {
    expect(parseDate('30-02-2026', 'dmy')).toBeNull();
  });

  it('rejects out-of-range months', () => {
    expect(parseDate('02-13-2026', 'dmy')).toBeNull();
  });

  it('rejects garbage input', () => {
    expect(parseDate('abc', 'dmy')).toBeNull();
    expect(parseDate('', 'dmy')).toBeNull();
    expect(parseDate('   ', 'dmy')).toBeNull();
  });
});

describe('dateFormatPlaceholder', () => {
  it('matches the format', () => {
    expect(dateFormatPlaceholder('iso')).toBe('aaaa-mm-dd');
    expect(dateFormatPlaceholder('dmy')).toBe('dd-mm-aaaa');
    expect(dateFormatPlaceholder('mdy')).toBe('mm-dd-aaaa');
  });
});
