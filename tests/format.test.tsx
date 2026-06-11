import { describe, it, expect, afterEach } from 'vitest';
import { formatCurrency, formatNumber } from '../src/utils/format';
import { configureBrand, resetBrand } from '../src/brand';

// Intl emite espacios no separables (U+00A0 / U+202F) según locale; se
// normalizan para que las aserciones no dependan del ICU de la máquina.
const norm = (s: string) => s.replace(/[\u00A0\u202F]/g, ' ');

afterEach(() => resetBrand());

describe('formatCurrency', () => {
  it('usa los defaults del brand (CLP/es-CL): sin decimales, miles con punto', () => {
    expect(norm(formatCurrency(1234567))).toBe('$1.234.567');
  });

  it('CLP redondea a 0 decimales (minor units de la moneda)', () => {
    expect(norm(formatCurrency(1500.7))).toBe('$1.501');
  });

  it('USD usa 2 decimales por defecto sin override manual', () => {
    expect(norm(formatCurrency(1234.5, { currency: 'USD', locale: 'en-US' }))).toBe('$1,234.50');
  });

  it('respeta configureBrand como nuevo default', () => {
    configureBrand({ currency: 'EUR', locale: 'de-DE' });
    expect(norm(formatCurrency(1234.5))).toBe('1.234,50 €');
  });

  it('las opciones por llamada ganan sobre el brand', () => {
    configureBrand({ currency: 'EUR', locale: 'de-DE' });
    expect(norm(formatCurrency(1000, { currency: 'CLP', locale: 'es-CL' }))).toBe('$1.000');
  });

  it('permite forzar decimales en CLP', () => {
    expect(norm(formatCurrency(1500, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))).toBe('$1.500,00');
  });

  it('negativos (patrón es-CL de ICU: signo tras el símbolo)', () => {
    expect(norm(formatCurrency(-5000))).toBe('$-5.000');
  });
});

describe('formatNumber', () => {
  it('separador de miles del locale por defecto (es-CL)', () => {
    expect(norm(formatNumber(1234567))).toBe('1.234.567');
  });

  it('decimales con coma en es-CL', () => {
    expect(norm(formatNumber(1234.56))).toBe('1.234,56');
  });

  it('override de locale por llamada', () => {
    expect(norm(formatNumber(1234567.89, { locale: 'en-US' }))).toBe('1,234,567.89');
  });

  it('límite de decimales', () => {
    expect(norm(formatNumber(3.14159, { maximumFractionDigits: 2 }))).toBe('3,14');
  });
});
