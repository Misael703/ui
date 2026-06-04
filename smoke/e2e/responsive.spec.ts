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
 * Touch-target floor (WCAG 2.5.8, 24×24) at the mobile breakpoint.
 *
 * Scope is deliberately narrow to stay signal-rich:
 * - Native form controls (`<input>` checkbox/radio/switch) are excluded —
 *   their size is the user agent's, which WCAG exempts.
 * - Only controls that are below 24px in BOTH dimensions are flagged. A
 *   wide-but-short control (a 76×16 table sort button, a full-width
 *   collapsible header, an inline breadcrumb link) has ample hit area along
 *   its long axis, so it isn't a tap hazard.
 *
 * Components whose control is intentionally compact (and not a genuine
 * hazard) are allowlisted with a reason. Anything else under 24×24 is a
 * gate failure — that's how this caught the 8×8 Carousel dots.
 */
const TOUCH_MIN = 24;
const TOUCH_SELECTOR = 'button, a[href], [role="button"], [role="tab"], [role="menuitem"], summary';
const ALLOW_SMALL_TARGET = new Set<string>([
  // Rating: 20×20 star buttons — a deliberately compact, inline rating
  // affordance; enlarging them would distort the star row.
  'Rating',
  // TagInput: the 18×18 "×" remove button sits on a chip; the chip itself
  // is the primary target, the × is a secondary affordance.
  'TagInput',
  // JsonViewer: 11×19 expand/collapse toggles in a dense tree — a code
  // inspector, not a touch-first surface.
  'JsonViewer',
]);

test('gallery: interactive targets meet the 24×24 floor at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/gallery', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const offenders = await page.evaluate(
    ({ min, selector }) => {
      const out: Record<string, string> = {};
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue; // not rendered
        if (r.width < min - 0.5 && r.height < min - 0.5) {
          const comp = el.closest<HTMLElement>('section[data-comp]')?.dataset.comp ?? '(outside)';
          // Keep the smallest sample per component for the message.
          out[comp] = out[comp] ?? `${Math.round(r.width)}x${Math.round(r.height)}`;
        }
      }
      return Object.entries(out).map(([c, size]) => `${c} (${size})`);
    },
    { min: TOUCH_MIN, selector: TOUCH_SELECTOR },
  );

  const flagged = offenders.filter((o) => !ALLOW_SMALL_TARGET.has(o.split(' ')[0]));
  expect(
    flagged,
    `interactive targets under ${TOUCH_MIN}×${TOUCH_MIN} at 375px:\n${flagged.join('\n')}`,
  ).toEqual([]);
});

/**
 * Real consumer-representative routes (`/` RSC, `/client`) at each
 * breakpoint: no page-level horizontal overflow AND no console errors /
 * pageerrors triggered by the layout at that width (a media-query handler
 * throwing, a ResizeObserver loop, etc). `/gallery` is excluded from the
 * console gate — it SSRs ~130 components and carries a tracked,
 * production-only hydration #418 (see smoke.spec.ts); its overflow is
 * gated above.
 */
// `/` and `/client` are the consumer-representative routes; the scenario
// routes below are real composed layouts (modal, brand surface, table,
// badges) that should also hold up across breakpoints. The two
// `timeline-milestone*` scenarios are intentionally excluded: they lay 5
// timeline variants in a fixed `repeat(5, 1fr)` comparison grid (a desktop
// geometry harness, asserted by scenarios.spec.ts) that does not shrink to
// 375px — a harness artifact, not a component bug. AppShell scenario routes
// are likewise out (their 100vw full-bleed breakout, see ALLOW_OVERFLOW).
const REAL_ROUTES = [
  '/', '/client',
  '/scenarios', '/scenarios/modal', '/scenarios/brand',
  '/scenarios/table', '/scenarios/badges',
];

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
