import { describe, it, expect } from 'vitest';
import { cleanRut, validateRut, formatRut } from '../src/cl';

// RUTs de prueba con DV calculado por módulo 11:
// cuerpo 12345678 → DV 5; cuerpo 11111111 → DV 1; cuerpo 11111112 → DV K.

describe('cleanRut', () => {
  it('quita puntos, guión y espacios', () => {
    expect(cleanRut('12.345.678-5')).toBe('123456785');
    expect(cleanRut(' 12345678 - 5 ')).toBe('123456785');
  });

  it('normaliza k minúscula a mayúscula', () => {
    expect(cleanRut('7.775.777-k')).toBe('7775777K');
  });

  it('descarta cualquier caracter ajeno al RUT', () => {
    expect(cleanRut('abc12#34')).toBe('1234');
    expect(cleanRut('')).toBe('');
  });
});

describe('validateRut (módulo 11)', () => {
  it('acepta RUTs válidos en cualquier formato', () => {
    expect(validateRut('12.345.678-5')).toBe(true);
    expect(validateRut('123456785')).toBe(true);
    expect(validateRut('11.111.111-1')).toBe(true);
  });

  it('acepta DV K en ambas cajas', () => {
    expect(validateRut('11.111.112-K')).toBe(true);
    expect(validateRut('11111112k')).toBe(true);
  });

  it('rechaza DV incorrecto', () => {
    expect(validateRut('12.345.678-9')).toBe(false);
    expect(validateRut('11.111.111-2')).toBe(false);
  });

  it('rechaza entradas demasiado cortas o vacías', () => {
    expect(validateRut('')).toBe(false);
    expect(validateRut('5')).toBe(false);
    expect(validateRut('-')).toBe(false);
  });

  it('rechaza K dentro del cuerpo (solo es válida como DV)', () => {
    expect(validateRut('12K45678-5')).toBe(false);
  });
});

describe('formatRut', () => {
  it('formatea al estándar visual con puntos y guión', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5');
    expect(formatRut('7775777K')).toBe('7.775.777-K');
  });

  it('es idempotente sobre un RUT ya formateado', () => {
    expect(formatRut('12.345.678-5')).toBe('12.345.678-5');
  });

  it('cuerpos cortos no llevan puntos', () => {
    expect(formatRut('15')).toBe('1-5');
    expect(formatRut('1234')).toBe('123-4');
  });

  it('no valida: formatea lo que recibe (uso como máscara en vivo)', () => {
    expect(formatRut('123456789')).toBe('12.345.678-9');
  });

  it('entrada vacía o sin caracteres de RUT → ""', () => {
    expect(formatRut('')).toBe('');
    expect(formatRut('abc')).toBe('');
  });

  it('un solo caracter se devuelve tal cual (aún no hay DV)', () => {
    expect(formatRut('1')).toBe('1');
  });
});
