/**
 * El Alba preset — brand defaults.
 *
 * Enshrines the El Alba locale / currency / name / logo path so they
 * survive the kit's generic-default change in v1.0.0.
 *
 * Consumer usage:
 *
 * ```ts
 * import { configureBrand } from "@misael703/ui";
 * import { elalbaDefaults } from "@misael703/ui/presets/elalba-defaults";
 *
 * configureBrand(elalbaDefaults);
 * ```
 *
 * Produces behavior identical to @misael703/elalba-ui@0.7.1, where these
 * were the hard-coded BRAND_DEFAULTS.
 */

import type { BrandDefaults } from '../../brand';

export const elalbaDefaults: BrandDefaults = {
  name: 'El Alba',
  logoBasePath: '/assets/logos',
  currency: 'CLP',
  locale: 'es-CL',
};
