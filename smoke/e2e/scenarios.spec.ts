import { test, expect } from '@playwright/test';

/**
 * Composition scenario: AppShell `headerLayout="top"` + a searchable Combobox
 * living low in the content. Reproduces — and gates — two integration bugs that
 * isolated component tests never caught and that shipped to a consumer first:
 *   A) 1.24.0 — `top` must use the internal-scroll model: the content scrolls,
 *      the header (and the page) stay put.
 *   B) 1.25.1 — a flipped-up popover must re-anchor to its trigger when its
 *      content resizes (combobox list shrinking as the query filters).
 *
 * These are the seams where bugs live; the assertions measure real geometry so
 * a regression fails here instead of in the consumer app.
 */
test.describe('Scenario · AppShell top + Combobox', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 720 });
    await page.goto('/scenarios', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300); // settle hydration
  });

  test('A · internal scroll: content scrolls, header does not move, page does not scroll', async ({ page }) => {
    const headerTop = () =>
      page.locator('.appshell__header').evaluate((el) => el.getBoundingClientRect().top);

    const before = await headerTop();

    // Scroll the inner content surface to the bottom.
    await page.locator('.appshell__content').evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(100);

    const after = await headerTop();
    const pageScrollY = await page.evaluate(() => window.scrollY);
    const contentScrolled = await page
      .locator('.appshell__content')
      .evaluate((el) => el.scrollTop > 0);

    expect(contentScrolled, 'the content container must be the scroll surface').toBe(true);
    expect(pageScrollY, 'the page itself must not scroll').toBe(0);
    expect(Math.abs(after - before), 'the header must stay pinned (not drift with content)').toBeLessThanOrEqual(1);
  });

  test('B · popover stays anchored to its trigger when the list shrinks on filter', async ({ page }) => {
    // Position the trigger low so the panel flips UP — the only case where a
    // content-resize drift is geometrically visible.
    await page.locator('.appshell__content').evaluate((el) => {
      const trigger = document.querySelector('.combobox') as HTMLElement;
      el.scrollTop += trigger.getBoundingClientRect().top - (window.innerHeight - 120);
    });
    await page.waitForTimeout(100);

    // Open via focus (the kit opens the listbox onFocus) — avoids Playwright's
    // click auto-scroll, which would move the trigger we just positioned.
    await page.locator('[role="combobox"]').evaluate((el) => (el as HTMLElement).focus());
    const list = page.locator('[role="listbox"].combobox__list');
    await expect(list).toBeVisible();
    await page.waitForTimeout(150);

    const measure = () =>
      page.evaluate(() => {
        const a = (document.querySelector('.combobox') as HTMLElement).getBoundingClientRect();
        const p = (document.querySelector('[role="listbox"].combobox__list') as HTMLElement).getBoundingClientRect();
        return { gap: Math.round(a.top - p.bottom), panelH: Math.round(p.height), flippedUp: p.bottom <= a.top + 1 };
      });

    const before = await measure();
    expect(before.flippedUp, 'precondition: panel must open upward').toBe(true);

    // Filter to a single comuna → the 240px-capped list shrinks to one row.
    await page.keyboard.type('provid');
    await page.waitForTimeout(250); // rAF + ResizeObserver recompute

    const after = await measure();

    expect(before.panelH - after.panelH, 'precondition: the list actually shrank').toBeGreaterThan(80);
    // The fix (1.25.1): the panel re-anchors after shrinking. Without it the
    // panel kept its tall `top` and the gap to the trigger grew by
    // (oldHeight − newHeight) ~150px+. Anchored == gap stays near the 8px offset.
    expect(after.gap, `panel drifted off its anchor on resize (gap ${before.gap}px → ${after.gap}px)`).toBeLessThan(24);
  });
});

/**
 * Modal + nested Combobox: stacked portals + focus trap + the kit's global
 * body scroll-lock. The lock must engage on open / release on close, and the
 * combobox's floating listbox must stack ABOVE the modal.
 */
test.describe('Scenario · Modal + nested Combobox', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 720 });
    await page.goto('/scenarios/modal', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
  });

  test('scroll-lock toggles with the modal; nested listbox stacks above it', async ({ page }) => {
    const bodyOverflow = () => page.evaluate(() => document.body.style.overflow);
    expect(await bodyOverflow(), 'no lock before opening').not.toBe('hidden');

    await page.getByTestId('open-modal').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    expect(await bodyOverflow(), 'scroll-lock engages on open').toBe('hidden');

    // Open the combobox inside the modal; its floating listbox must be the
    // element that actually paints at an option's center (i.e. above the modal).
    await page.locator('[role="combobox"]').evaluate((el) => (el as HTMLElement).focus());
    await expect(page.locator('[role="listbox"].combobox__list')).toBeVisible();
    await page.waitForTimeout(150);
    const listboxOnTop = await page.evaluate(() => {
      const ul = document.querySelector('[role="listbox"].combobox__list') as HTMLElement;
      const opt = ul.querySelector('[role="option"]') as HTMLElement;
      const r = opt.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return ul.contains(hit);
    });
    expect(listboxOnTop, 'the combobox listbox must stack above the modal').toBe(true);

    // Close the modal (X) → scroll-lock must release.
    await page.locator('.modal__close').click({ force: true });
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await page.waitForTimeout(300); // closing animation + effect cleanup
    expect(await bodyOverflow(), 'scroll-lock releases on close').not.toBe('hidden');
  });
});

/**
 * Brand surface cascade: `data-tone="inverse"` re-scopes tokens at runtime, so
 * the band-aware Avatar (v1.21.0) inside a brand top-header computes on-brand
 * colors, distinct from the same Avatar on a plain surface.
 */
test.describe('Scenario · brand surface cascade (data-tone)', () => {
  test('band-aware Avatar computes light on-brand text, distinct from a plain Avatar', async ({ page }) => {
    await page.goto('/scenarios/brand', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    const colorOf = (id: string) =>
      page.evaluate((testid) => {
        const el = document.querySelector(`[data-testid="${testid}"] .avatar`) as HTMLElement;
        const cs = getComputedStyle(el);
        const [r, g, b] = (cs.color.match(/\d+/g) ?? ['0', '0', '0']).map(Number);
        return { color: cs.color, lum: 0.2126 * r + 0.7152 * g + 0.0722 * b };
      }, id);

    const brand = await colorOf('brand-avatar');
    const plain = await colorOf('plain-avatar');
    expect(brand.color, 'the cascade must change the avatar color on the brand band').not.toBe(plain.color);
    expect(brand.lum, 'avatar text on the brand band must be light (on-brand)').toBeGreaterThan(180);
  });
});

/**
 * Responsive DataTable: `mobileLayout="cards"` collapses the table to stacked
 * cards below 600px (the thead is hidden). Asserted via computed `display`.
 */
test.describe('Scenario · responsive DataTable', () => {
  test('thead shows as a table header at desktop width and collapses under 600px', async ({ page }) => {
    await page.goto('/scenarios/table', { waitUntil: 'networkidle' });
    const theadDisplay = () =>
      page.locator('.table thead').evaluate((el) => getComputedStyle(el).display);

    await page.setViewportSize({ width: 1000, height: 720 });
    await page.waitForTimeout(120);
    expect(await theadDisplay(), 'table header visible at desktop width').not.toBe('none');

    await page.setViewportSize({ width: 380, height: 720 });
    await page.waitForTimeout(180);
    expect(await theadDisplay(), 'header collapses to cards under 600px').toBe('none');
  });
});

/**
 * Semantic Badge row coherence (v1.29.0). After tidying yellow → gold and
 * info → cyan-sky and aliasing warning to -600, a row of soft-register Badges
 * {success / warning / danger / info} must read with even weight: all four
 * backgrounds soft (high luminance), and the spread between them small enough
 * that no one chip jumps out. Catches a future drift in any semantic 50 stop.
 */
test.describe('Scenario · semantic Badge row coherence', () => {
  test('soft Badge backgrounds are uniformly light and within a tight luminance spread', async ({ page }) => {
    await page.goto('/scenarios/badges', { waitUntil: 'networkidle' });

    const luminanceOf = (testid: string) =>
      page.evaluate((id) => {
        const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
        const cs = getComputedStyle(el);
        const m = cs.backgroundColor.match(/\d+(\.\d+)?/g)!.map(Number);
        const [r, g, b] = m;
        const lin = (c: number) => {
          const s = c / 255;
          return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      }, testid);

    const success = await luminanceOf('badge-success');
    const warning = await luminanceOf('badge-warning');
    const danger  = await luminanceOf('badge-danger');
    const info    = await luminanceOf('badge-info');
    const all = { success, warning, danger, info };

    // (1) Soft register: every bg must read as "very light" (>0.85).
    for (const [name, L] of Object.entries(all)) {
      expect(L, `Badge ${name} bg should be soft (L>0.85), got ${L.toFixed(3)} (${JSON.stringify(all)})`).toBeGreaterThan(0.85);
    }
    // (2) Coherence: spread between brightest and darkest is small enough that
    // no one chip jumps in a row. 0.06 catches drift (e.g. yellow-50 leaning
    // amber-saturated again) without being so tight it triggers on rounding.
    const max = Math.max(success, warning, danger, info);
    const min = Math.min(success, warning, danger, info);
    expect(max - min, `semantic Badge bg spread too wide: ${(max - min).toFixed(3)} (${JSON.stringify(all)})`).toBeLessThan(0.06);
  });
});
