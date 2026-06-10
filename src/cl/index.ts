/**
 * @misael703/ui/cl — helpers específicos de Chile.
 *
 * Entry point separado a propósito: el core del kit no asume país (ver
 * `src/brand.ts`); lo país-específico vive en subpaths opt-in, mismo patrón
 * que `date-fns/locale`. Quien no importa `./cl` no carga nada de esto.
 */

/**
 * Normaliza un RUT a su forma canónica: solo dígitos + dígito verificador,
 * sin puntos ni guión, K en mayúscula. `"12.345.678-k"` → `"12345678K"`.
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Dígito verificador (módulo 11) para un cuerpo numérico de RUT. */
function computeDv(body: string): string {
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  return rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
}

/**
 * Valida un RUT chileno (módulo 11). Acepta cualquier formato de entrada
 * (con/sin puntos y guión): `validateRut('12.345.678-5')` → `true`.
 */
export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeDv(body) === dv;
}

/**
 * Formatea un RUT al estándar visual chileno: `formatRut('123456785')` →
 * `"12.345.678-5"`. No valida — formatea lo que recibe (útil para máscaras
 * en vivo mientras el usuario tipea). Entrada vacía o sin caracteres de RUT
 * devuelve `""`.
 */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (!clean) return '';
  if (clean.length === 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const grouped = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped}-${dv}`;
}
