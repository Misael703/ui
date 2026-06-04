import { test, expect } from '@playwright/test';

/**
 * Responsive horizontal-overflow sweep.
 *
 * The `/gallery` route SSRs every kit component, each wrapped in
 * `<section data-comp="Name">`, so a single page load at a given width lets
 * us pin WHICH component overflows — not just that the page does. A
 * component "overflows" when its `scrollWidth` exceeds its `clientWidth`:
 * its content is wider than the box and there is no internal scroll
 * container absorbing it. Components that scroll on purpose (e.g.
 * `DataTable`'s `.table-wrap` with `overflow-x: auto`) clip their own
 * overflow, so the section never trips.
 *
 * This is a layout gate, not a pixel-diff: it catches "a horizontal
 * scrollbar appeared" / "this component blows out the viewport at 375px",
 * which is the cheap 80% of responsive breakage. Visual regression
 * (pixel baselines) is a separate concern.
 */

const BREAKPOINTS = [
  { w: 375, h: 667 },   // small phone
  { w: 768, h: 1024 },  // tablet portrait
  { w: 1280, h: 800 },  // laptop
  { w: 1920, h: 1080 }, // desktop
];

// A component that legitimately exceeds its gallery container at a given
// width is allowlisted here with a justification, so the gate stays honest.
// Match by bare component name (applies at every breakpoint) — use the
// `Name@width` form if a case is width-specific.
const ALLOW_OVERFLOW = new Set<string>([
  // AppShell is a full-bleed page shell: `width: 100vw; margin-left:
  // calc(50% - 50vw)` (the 1.31.1 body-margin breakout) makes it span the
  // whole viewport on purpose, which overflows the padded gallery section
  // it's embedded in. No real consumer nests an AppShell inside a bordered
  // card — it lives at the page root, where 100vw is exactly correct.
  'AppShell',
]);

const TOLERANCE_PX = 1;

// The gallery `<main>` is a single-column grid: one non-shrinkable child
// (AppShell's 100vw breakout) stretches the shared column, so EVERY section
// — and the page — reads wider than the viewport. That makes page-level
// overflow a contaminated signal here. We gate per-component instead
// (`section[data-comp]` scrollWidth), which isolates each component's OWN
// content overflow and pinpoints the offender by name. Page-level overflow
// is gated on the real routes below, where there's no synthetic grid.
for (const { w, h } of BREAKPOINTS) {
  test(`gallery: no component overflows its box at ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    // Let fonts/effects settle so measured widths are final.
    await page.waitForTimeout(400);

    const offenders = await page.evaluate((tol) => {
      const out: string[] = [];
      for (const sec of Array.from(document.querySelectorAll<HTMLElement>('section[data-comp]'))) {
        if (sec.scrollWidth > sec.clientWidth + tol) {
          out.push(`${sec.dataset.comp} (${sec.scrollWidth} > ${sec.clientWidth})`);
        }
      }
      return out;
    }, TOLERANCE_PX);

    const flagged = offenders.filter((o) => {
      const name = o.split(' ')[0];
      return !ALLOW_OVERFLOW.has(name) && !ALLOW_OVERFLOW.has(`${name}@${w}`);
    });
    expect(
      flagged,
      `component horizontal overflow at ${w}px:\n${flagged.join('\n')}`,
    ).toEqual([]);
  });
}

/**
 * Real consumer-representative routes (`/` RSC, `/client`) at each
 * breakpoint: no page-level horizontal overflow AND no console errors /
 * pageerrors triggered by the layout at that width (a media-query handler
 * throwing, a ResizeObserver loop, etc). `/gallery` is excluded from the
 * console gate — it SSRs ~130 components and carries a tracked,
 * production-only hydration #418 (see smoke.spec.ts); its overflow is
 * gated above.
 */
const REAL_ROUTES = ['/', '/client'];

for (const route of REAL_ROUTES) {
  for (const { w, h } of BREAKPOINTS) {
    test(`${route} @ ${w}px: no overflow, no console error`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', (e) => pageErrors.push(e.message));

      await page.setViewportSize({ width: w, height: h });
      const res = await page.goto(route, { waitUntil: 'networkidle' });
      expect(res!.status(), `${route} returned ${res!.status()}`).toBe(200);
      await page.waitForTimeout(400);

      const pageOverflow = await page.evaluate((tol) => {
        const de = document.documentElement;
        return de.scrollWidth > de.clientWidth + tol
          ? `${de.scrollWidth} > ${de.clientWidth}`
          : null;
      }, TOLERANCE_PX);

      expect(pageOverflow, `horizontal page overflow on ${route} @ ${w}px: ${pageOverflow}`).toBeNull();
      expect(pageErrors, `pageerror on ${route} @ ${w}px:\n${pageErrors.join('\n')}`).toEqual([]);
      expect(consoleErrors, `console.error on ${route} @ ${w}px:\n${consoleErrors.join('\n')}`).toEqual([]);
    });
  }
}
