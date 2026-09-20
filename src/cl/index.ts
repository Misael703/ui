/**
 * @misael703/ui/cl — Chile-specific helpers.
 *
 * Separate entry point on purpose: the kit's core does not assume a country
 * (see `src/brand.ts`); country-specific code lives in opt-in subpaths, same
 * pattern as `date-fns/locale`. Whoever doesn't import `./cl` loads none of this.
 */

/**
 * Normalizes a RUT (Chilean tax id) to its canonical form: digits plus check
 * digit only, no dots or dash, uppercase K. `"12.345.678-k"` → `"12345678K"`.
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Check digit (modulo 11) for a numeric RUT body. */
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
 * Validates a Chilean RUT (modulo 11). Accepts any input format
 * (with/without dots and dash): `validateRut('12.345.678-5')` → `true`.
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
 * Formats a RUT to the standard Chilean visual style: `formatRut('123456785')` →
 * `"12.345.678-5"`. Does not validate — formats whatever it receives (useful
 * for live masks while the user types). Empty input or input with no RUT
 * characters returns `""`.
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
