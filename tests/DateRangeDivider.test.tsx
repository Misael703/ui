import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// An accent rule separates the two month panels of the DateRangePicker. It uses
// the brand secondary token (orange in the El Alba preset, sand in the core
// theme) and is centered in the gap via left:50%, so it's independent of the
// gap width. It collapses with the panels into a single column on small screens.
describe('DateRangePicker month divider', () => {
  it('the months container is a positioning context', () => {
    const months = css.match(/\.daterange__months\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(months).toMatch(/position:\s*relative/);
  });

  it('a ::before rule draws the divider in the secondary accent, centered', () => {
    const before = css.match(/\.daterange__months::before\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(before).toMatch(/content:\s*''/);
    expect(before).toMatch(/background:\s*var\(--color-secondary\)/);
    expect(before).toMatch(/left:\s*50%/);
    expect(before).toMatch(/width:\s*2px/);
  });

  it('the divider is hidden when the panels stack to one column', () => {
    // The unique hide rule lives in the same ≤600px block that collapses the
    // months to a single column (that media block also sets grid-template-columns:1fr).
    expect(css).toMatch(/\.daterange__months::before\s*\{\s*display:\s*none/);
    expect(css).toMatch(/@media\s*\(max-width:\s*600px\)\s*\{[\s\S]*?\.daterange__months\s*\{\s*grid-template-columns:\s*1fr/);
  });
});

// The day cells are a fixed 40px (not `1fr`) so a wide popover can't stretch the
// numbers into loose, far-apart cells — the calendar stays compact. The months
// container hugs its content (`max-content`) so the divider stays centred.
describe('DateRangePicker compact calendar', () => {
  it('the day grid uses fixed 40px columns, not stretchy 1fr', () => {
    const grid = css.match(/\.daterange__grid\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(grid).toMatch(/grid-template-columns:\s*repeat\(7,\s*40px\)/);
    expect(grid).not.toMatch(/repeat\(7,\s*1fr\)/);
  });

  it('the months container hugs its content so it never stretches wide', () => {
    const months = css.match(/\.daterange__months\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(months).toMatch(/width:\s*max-content/);
  });

  it('the compact (report) panes hugs the calendar so it forms a tight square', () => {
    const panes = css.match(/\.daterange__popover--compact\s+\.daterange__panes\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(panes).toMatch(/width:\s*max-content/);
    expect(panes).toMatch(/flex:\s*0 0 auto/);
  });
});
