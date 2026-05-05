import { describe, it, expect, beforeEach } from 'vitest';
import {
  BRAND_DEFAULTS,
  configureBrand,
  getBrand,
  resetBrand,
} from '../src/brand';

describe('brand singleton', () => {
  beforeEach(() => resetBrand());

  it('returns BRAND_DEFAULTS without configure', () => {
    expect(getBrand()).toEqual(BRAND_DEFAULTS);
  });

  it('configureBrand merges overrides over defaults', () => {
    configureBrand({ locale: 'en-US', currency: 'USD' });
    expect(getBrand()).toEqual({
      ...BRAND_DEFAULTS,
      locale: 'en-US',
      currency: 'USD',
    });
  });

  it('configureBrand is idempotent — calling again replaces overrides, not merges', () => {
    configureBrand({ locale: 'en-US', currency: 'USD' });
    configureBrand({ locale: 'ja-JP' });
    expect(getBrand().locale).toBe('ja-JP');
    expect(getBrand().currency).toBe(BRAND_DEFAULTS.currency); // reverted to default
  });

  it('caches the merged dict — repeated getBrand() returns the same reference', () => {
    configureBrand({ locale: 'en-US' });
    expect(getBrand()).toBe(getBrand());
  });

  it('invalidates the cache after configureBrand', () => {
    const before = getBrand();
    configureBrand({ name: 'New Brand' });
    const after = getBrand();
    expect(after).not.toBe(before);
    expect(after.name).toBe('New Brand');
  });

  it('resetBrand reverts to defaults', () => {
    configureBrand({ name: 'Override' });
    resetBrand();
    expect(getBrand()).toEqual(BRAND_DEFAULTS);
  });

  it('without configure, getBrand returns the defaults reference (no spread)', () => {
    // This is the side-effect-free win: until configureBrand runs, no spread,
    // no allocation. The cached object IS BRAND_DEFAULTS.
    expect(getBrand()).toBe(BRAND_DEFAULTS);
  });
});
