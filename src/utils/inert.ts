import * as React from 'react';

/**
 * Dual-runtime `inert` spread for the peer range (>=18.2 <20). The two
 * runtimes need OPPOSITE values:
 *
 * - React 19 types `inert` as a native boolean: `true` renders the bare
 *   attribute, `false`/absent removes it — but the React-18 workaround `''`
 *   is treated as FALSE there, silently dropping the gate (+ a dev warning).
 * - React 18 doesn't know the attribute: it only forwards UNKNOWN attributes
 *   with string/number values — `''` renders the bare attribute (present =
 *   ON), while a boolean `true` is DROPPED (+ "non-boolean attribute" dev
 *   warning). And `inert="false"` would still read ON to browsers, so the
 *   inactive state must spread NOTHING rather than a falsy value.
 *
 * One value cannot satisfy both, so branch on the runtime version once.
 */
const react19 = Number(React.version.split('.')[0]) >= 19;

/** `{...inertAttr(shouldBeInert)}` — `{}` when inactive (never `inert="false"`). */
export function inertAttr(active: boolean): Record<string, unknown> {
  if (!active) return {};
  return { inert: react19 ? true : '' };
}
