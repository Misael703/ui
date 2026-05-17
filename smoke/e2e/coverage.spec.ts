import { test, expect } from '@playwright/test';
import * as K from '@misael703/ui';
import { ENTRIES } from '../gallery/registry';
import { ICON_NAMES } from '../gallery/icon-names';

// Runtime-derived: a "renderable component" is a Capitalized export that is a
// function OR a forwardRef/memo object. Anything not covered by the gallery
// (entry), the icon grid, a parent, or the non-visual allowlist FAILS — so a
// new public component cannot land without smoke coverage.
const FR = Symbol.for('react.forward_ref');
const MEMO = Symbol.for('react.memo');
function isComponent(v: unknown, name: string): boolean {
  if (!/^[A-Z]/.test(name)) return false;
  if (typeof v === 'function') return true;
  return !!v && typeof v === 'object'
    && ((v as { $$typeof?: symbol }).$$typeof === FR || (v as { $$typeof?: symbol }).$$typeof === MEMO);
}

// Sub-components exercised inside their parent's gallery entry.
const COVERED_BY_PARENT = new Set([
  'AccordionItem', 'CardHeader', 'CardBody', 'CardFooter', 'ChipGroup',
  'AvatarGroup', 'Tab', 'TabList', 'TabPanel', 'KeyValueRow', 'ListGroupItem',
  'InputGroupAddon', 'CollapsibleTrigger', 'CollapsibleContent',
  'DescriptionListItem', 'ResizablePanel', 'ResizableHandle',
  'ToggleGroupItem', 'TimelineItem', 'Lightbox', 'PageHeader', 'FilterSection',
]);
// Providers (wrap the gallery) + render helpers (no standalone visual).
const NON_VISUAL = new Set(['LocaleProvider', 'ToastProvider', 'Slottable']);

test('every public component has smoke coverage (anti-rot)', () => {
  const entryNames = new Set(ENTRIES.map((e) => e.name));
  const icons = new Set<string>(ICON_NAMES);

  // Icons declared in the kit must match the reviewed list (catches added/removed icons).
  for (const n of ICON_NAMES) expect(K, `icon ${n} missing from kit`).toHaveProperty(n);
  // Registry entries must be real exports (no typos / removed components).
  for (const n of entryNames) expect(K, `entry ${n} not exported by kit`).toHaveProperty(n);

  const uncovered: string[] = [];
  for (const [name, val] of Object.entries(K)) {
    if (!isComponent(val, name)) continue;
    if (icons.has(name) || entryNames.has(name) || COVERED_BY_PARENT.has(name) || NON_VISUAL.has(name)) continue;
    uncovered.push(name);
  }
  expect(uncovered, `Public components without smoke coverage: ${uncovered.join(', ')}`).toEqual([]);
});
