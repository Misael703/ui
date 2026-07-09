import { test, expect } from '@playwright/test';

/**
 * DataTable interactive-row activation under TOUCH (iOS/WebKit fix, v1.80.0).
 *
 * The bug: rows used a stretched `inset:0` control counting on `<tr>` as its
 * positioned containing block. WebKit/iOS ignores that, so every row's overlay
 * escaped to the viewport and stacked — any tap routed to the LAST row and
 * vertical scroll broke. The fix moves pointer activation to the `<tr>` onClick
 * (works everywhere) and demotes the control to a hidden keyboard/SR affordance.
 *
 * Chromium contains the old overlay, so it does not reproduce the misrouting;
 * but a touch context still exercises the real activation path (tap → tr click)
 * and the runtime geometry guard below fails in ANY engine if the full-bleed
 * overlay is ever reintroduced. The engine-specific misrouting is covered by
 * manual iOS verification + the CSS guard in tests/DataTableRowClick.test.tsx.
 */
test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 780 } });

test.describe('Scenario · DataTable row activation on touch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scenarios/rowclick', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200); // settle hydration
  });

  test('tapping a middle row activates THAT row, not the last', async ({ page }) => {
    const activated = page.getByTestId('activated');

    // Tap a middle row (Martillo = 'c') on its SKU cell.
    await page.getByText('MRT-3').tap();
    await expect(activated).toHaveText('c');

    // A different middle row (Sierra = 'b') — proves it is not always-last.
    await page.getByText('SRR-2').tap();
    await expect(activated).toHaveText('b');
  });

  test('tapping the nested action button does NOT activate the row', async ({ page }) => {
    // Prime a known activation first (last row).
    await page.getByText('CNT-5').tap();
    await expect(page.getByTestId('activated')).toHaveText('e');

    // Tap the "Editar" button on the first row.
    await page.getByTestId('edit-a').tap();
    await expect(page.getByTestId('edited')).toHaveText('a');
    // The row must NOT have activated (still 'e', the nested control owns its tap).
    await expect(page.getByTestId('activated')).toHaveText('e');
  });

  test('tapping the selection checkbox does NOT activate the row', async ({ page }) => {
    // The native input is visually hidden; the visible target is its wrapping
    // <label class="check">. Tapping it toggles the box and must not activate.
    const cb = page.getByRole('checkbox', { name: /Taladro/ });
    await page.locator('label.check').filter({ has: cb }).tap();
    await expect(cb).toBeChecked();
    await expect(page.getByTestId('activated')).toHaveText('—'); // never activated
  });

  test('the rowlink is not a full-bleed overlay (geometry guard, any engine)', async ({ page }) => {
    const notFullBleed = await page.evaluate(() => {
      const link = document.querySelector('.data-table__rowlink') as HTMLElement | null;
      const row = link?.closest('tr');
      if (!link || !row) return false;
      const lb = link.getBoundingClientRect();
      const rb = row.getBoundingClientRect();
      // A clipped sr-only control is ~1px; a regression overlay would span the row.
      return lb.width < rb.width * 0.5 && lb.height < rb.height;
    });
    expect(notFullBleed, 'rowlink must be clipped, not cover the row').toBe(true);
  });
});
