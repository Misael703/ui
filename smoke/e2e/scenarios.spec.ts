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
 * Timeline milestone variant (v1.30.0). Each of the 5 tones must render the
 * milestone marker at 32×32 with a visible halo (box-shadow), and the fill
 * must read from the tone (i.e. not be the bg-surface / hollow look). Catches
 * a future drift where someone reverts the size or loses the halo.
 */
test.describe('Scenario · Timeline milestone variant', () => {
  test('all 5 tones render the milestone marker at 32×32 with a tone-tinted halo', async ({ page }) => {
    await page.goto('/scenarios/timeline-milestone', { waitUntil: 'networkidle' });

    const tones = ['neutral', 'success', 'info', 'warning', 'danger'];
    for (const t of tones) {
      const marker = page.locator(`[data-testid="tl-${t}"] .timeline__marker--milestone`);
      await expect(marker, `tone ${t} marker present`).toHaveCount(1);
      const measured = await marker.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { width: cs.width, height: cs.height, boxShadow: cs.boxShadow, background: cs.backgroundColor };
      });
      expect(measured.width,  `tone ${t} width`).toBe('32px');
      expect(measured.height, `tone ${t} height`).toBe('32px');
      // Halo present (not the default "none" string from no box-shadow).
      expect(measured.boxShadow, `tone ${t} halo missing — got "${measured.boxShadow}"`).not.toBe('none');
      // Filled (some non-transparent background — neutral uses --border-default
      // via --timeline-tone; the tone variants use their semantic color).
      expect(measured.background, `tone ${t} fill missing — got "${measured.background}"`).not.toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)/);
    }
  });

  test('milestone marker is center-aligned with the default marker below it (v1.30.1 regression)', async ({ page }) => {
    await page.goto('/scenarios/timeline-milestone', { waitUntil: 'networkidle' });
    // The 1.30.0 milestone shifted the centre 4px right of the 24px default
    // markers' centre because the flex parent aligns by left edge — and the
    // connector ran through the left side of the milestone, not its centre.
    // 1.30.1 pulls the milestone -4px so both centres land on the same axis.
    // Asserts CENTRE.X equality (within 1px tolerance for sub-pixel rounding)
    // for each of the 5 tones.
    const tones = ['neutral', 'success', 'info', 'warning', 'danger'];
    for (const t of tones) {
      const centres = await page.evaluate((tone) => {
        const root = document.querySelector(`[data-testid="tl-${tone}"]`)!;
        const m = (root.querySelector('.timeline__marker--milestone') as HTMLElement).getBoundingClientRect();
        // Scenario layout (v1.30.2): [default, milestone, default]. The default
        // BELOW the milestone is items[2]; items[0] is the default ABOVE.
        const items = Array.from(root.querySelectorAll('.timeline__item')) as HTMLElement[];
        const defaultMarker = items[2].querySelector('.timeline__marker') as HTMLElement;
        const d = defaultMarker.getBoundingClientRect();
        return { milestoneCx: m.left + m.width / 2, defaultCx: d.left + d.width / 2 };
      }, t);
      expect(
        Math.abs(centres.milestoneCx - centres.defaultCx),
        `tone ${t}: milestone centre (${centres.milestoneCx.toFixed(2)}) ≠ default centre (${centres.defaultCx.toFixed(2)})`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('compact: milestone marker centre aligns with connector + default markers (v1.30.6)', async ({ page }) => {
    // In compact, milestone shrinks to 16px (compact CSS wins on specificity)
    // but the 1.30.1 `margin-left: -4` (sized for the 32px milestone in default
    // density) was not overridden — it shifted the compact milestone 4px LEFT
    // of the connector. v1.30.6 resets margin-left to 0 in compact so the
    // 3 markers + connector all sit on the same x-axis.
    await page.goto('/scenarios/timeline-milestone-compact', { waitUntil: 'networkidle' });
    const tones = ['neutral', 'success', 'info', 'warning', 'danger'];
    for (const t of tones) {
      const centres = await page.evaluate((tone) => {
        const root = document.querySelector(`[data-testid="tlc-${tone}"]`)!;
        const items = Array.from(root.querySelectorAll('.timeline__item')) as HTMLElement[];
        // items[0] default, items[1] milestone, items[2] default
        const d0 = items[0].querySelector('.timeline__marker') as HTMLElement;
        const m  = items[1].querySelector('.timeline__marker--milestone') as HTMLElement;
        const d1 = items[2].querySelector('.timeline__marker') as HTMLElement;
        const beforeCS = getComputedStyle(items[0], '::before');
        const beforeLeft  = parseFloat(beforeCS.left);
        const beforeWidth = parseFloat(beforeCS.width);
        const prevRect = items[0].getBoundingClientRect();
        return {
          connectorCx: prevRect.left + beforeLeft + beforeWidth / 2,
          d0Cx: d0.getBoundingClientRect().left + d0.getBoundingClientRect().width / 2,
          mCx:  m.getBoundingClientRect().left  + m.getBoundingClientRect().width  / 2,
          d1Cx: d1.getBoundingClientRect().left + d1.getBoundingClientRect().width / 2,
        };
      }, t);
      expect(Math.abs(centres.connectorCx - centres.d0Cx), `tone ${t} compact: default[0] ≠ connector`).toBeLessThanOrEqual(1);
      expect(Math.abs(centres.connectorCx - centres.mCx),  `tone ${t} compact: milestone (${centres.mCx.toFixed(2)}) ≠ connector (${centres.connectorCx.toFixed(2)})`).toBeLessThanOrEqual(1);
      expect(Math.abs(centres.connectorCx - centres.d1Cx), `tone ${t} compact: default[2] ≠ connector`).toBeLessThanOrEqual(1);
    }
  });

  test('the connector vertical line is centered on the marker x-axis (v1.30.4)', async ({ page }) => {
    // Pre-1.30.4 the marker box-sizing was content-box (the kit ships no global
    // reset), so `width: 24px + border: 2px` rendered at 28px → centre x=14,
    // but the connector at `left: 11px, width: 2px` is centred at x=12. 2px
    // visible offset. v1.30.4 sets `box-sizing: border-box` on the marker so
    // its visual width matches its declared width. Asserts centre.x of the
    // marker and the connector are within 1px for default and milestone.
    await page.goto('/scenarios/timeline-milestone', { waitUntil: 'networkidle' });
    const tones = ['neutral', 'success', 'info', 'warning', 'danger'];
    for (const t of tones) {
      const measured = await page.evaluate((tone) => {
        const root = document.querySelector(`[data-testid="tl-${tone}"]`)!;
        const items = Array.from(root.querySelectorAll('.timeline__item')) as HTMLElement[];
        const defaultMarker = items[0].querySelector('.timeline__marker') as HTMLElement; // default 24×24
        const milestone   = items[1].querySelector('.timeline__marker--milestone') as HTMLElement; // 32×32
        // The connector ::before lives on items[0] and items[1] (both have a
        // sibling below them). Read its computed `left` + `width` to compute
        // its centre.x relative to its container's left edge.
        const beforeCS = getComputedStyle(items[0], '::before');
        const beforeLeft  = parseFloat(beforeCS.left);
        const beforeWidth = parseFloat(beforeCS.width);
        const prevRect = items[0].getBoundingClientRect();
        const connectorCx = prevRect.left + beforeLeft + beforeWidth / 2;
        const d = defaultMarker.getBoundingClientRect();
        const m = milestone.getBoundingClientRect();
        return {
          connectorCx,
          defaultCx:   d.left + d.width / 2,
          milestoneCx: m.left + m.width / 2,
        };
      }, t);
      expect(
        Math.abs(measured.connectorCx - measured.defaultCx),
        `tone ${t}: default marker centre (${measured.defaultCx.toFixed(2)}) ≠ connector centre (${measured.connectorCx.toFixed(2)})`,
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(measured.connectorCx - measured.milestoneCx),
        `tone ${t}: milestone marker centre (${measured.milestoneCx.toFixed(2)}) ≠ connector centre (${measured.connectorCx.toFixed(2)})`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('every connector REACHES the next marker top in both directions (v1.30.3 universal)', async ({ page }) => {
    await page.goto('/scenarios/timeline-milestone', { waitUntil: 'networkidle' });
    // The base connector rule's `bottom: -12px` left a 6px gap to every next
    // marker (the marker border top sits at H+18 from the previous item top,
    // but the line ended at H+12). v1.30.2 patched it for default → milestone
    // only via `:has(+ milestone)`; v1.30.3 fixes the BASE rule to `bottom:
    // -20px` so EVERY connector reaches the next marker — in all four
    // directions (default ↔ default, default ↔ milestone, milestone ↔ default,
    // milestone ↔ milestone). Asserted per tone for both default → milestone
    // (items[0] → items[1]) AND milestone → default (items[1] → items[2]).
    const reachOf = async (tone: string, prevIdx: 0 | 1, nextIdx: 1 | 2) =>
      page.evaluate(({ tone, prevIdx, nextIdx }) => {
        const root = document.querySelector(`[data-testid="tl-${tone}"]`)!;
        const items = Array.from(root.querySelectorAll('.timeline__item')) as HTMLElement[];
        const prev = items[prevIdx];
        // Pick whichever marker the next item has — `.timeline__marker--milestone`
        // (preferred) or the plain default marker. Both have the same border
        // top inside their item, but the milestone is larger.
        const nextMarker =
          (items[nextIdx].querySelector('.timeline__marker--milestone') as HTMLElement | null) ??
          (items[nextIdx].querySelector('.timeline__marker') as HTMLElement);
        // The previous item's OWN marker (the marker the connector emerges
        // FROM). v1.30.5 also asserts the connector start covers this marker's
        // bottom (no top gap), symmetric to the bottom-side reach.
        const prevMarker =
          (prev.querySelector('.timeline__marker--milestone') as HTMLElement | null) ??
          (prev.querySelector('.timeline__marker') as HTMLElement);
        const prevRect = prev.getBoundingClientRect();
        const prevMarkerRect = prevMarker.getBoundingClientRect();
        const markerRect = nextMarker.getBoundingClientRect();
        const beforeCS = getComputedStyle(prev, '::before');
        const beforeTop = parseFloat(beforeCS.top);
        const beforeBottom = parseFloat(beforeCS.bottom);
        const connectorStartY = prevRect.top + beforeTop;
        const connectorEndY = prevRect.bottom - beforeBottom;
        return {
          reach:    connectorEndY - markerRect.top,             // ≥0 → enters next marker
          attach:   prevMarkerRect.bottom - connectorStartY,    // ≥0 → emerges from source marker
        };
      }, { tone, prevIdx, nextIdx });

    const tones = ['neutral', 'success', 'info', 'warning', 'danger'];
    for (const t of tones) {
      const dToM = await reachOf(t, 0, 1); // default → milestone
      const mToD = await reachOf(t, 1, 2); // milestone → default
      // BOTTOM side: connector enters the next marker top.
      expect(dToM.reach, `tone ${t} · default→milestone: end hangs ${(-dToM.reach).toFixed(1)}px above next marker`).toBeGreaterThanOrEqual(0);
      expect(mToD.reach, `tone ${t} · milestone→default: end hangs ${(-mToD.reach).toFixed(1)}px above next marker`).toBeGreaterThanOrEqual(0);
      // TOP side (v1.30.5): connector starts inside the source marker, so it
      // emerges flush from the marker's bottom — no top gap.
      expect(dToM.attach, `tone ${t} · default→milestone: start is ${(-dToM.attach).toFixed(1)}px below source marker bottom (gap)`).toBeGreaterThanOrEqual(0);
      expect(mToD.attach, `tone ${t} · milestone→default: start is ${(-mToD.attach).toFixed(1)}px below source marker bottom (gap)`).toBeGreaterThanOrEqual(0);
    }
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

/**
 * Scenario 7 — AppShell `top` mobile drawer (v1.31.0). Until 1.31, under
 * 900px the `top` shell rendered the header + content but had NO way to
 * reach the nav (the legacy `@media (max-width: 900px)` block was written
 * for `side` and was a no-op on `top` because it recolumned `.appshell`
 * via grid-template-columns while `top` uses grid-template-rows).
 *
 * Geometry assertions: at 1024×768 the aside is in-flow (NOT fixed) and
 * visible; at 375×667 it is fixed-overlay translated off-screen; tapping
 * the consumer trigger slides it in; ESC closes it.
 */
test.describe('Scenario · AppShell top — mobile drawer', () => {
  test('desktop (≥901px): sidebar is in-flow and visible', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 720 });
    await page.goto('/scenarios/appshell-top-mobile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    const aside = page.locator('.appshell__sidebar');
    await expect(aside).toBeVisible();
    const pos = await aside.evaluate((el) => getComputedStyle(el).position);
    // Desktop: the aside is a grid item (default static / relative), NOT fixed.
    expect(pos, `desktop aside should not be fixed (was ${pos})`).not.toBe('fixed');
  });

  test('mobile (≤900px): sidebar starts as a translated-off fixed overlay', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    const m = await page.locator('.appshell__sidebar').evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { position: s.position, transform: s.transform, right: Math.round(r.right) };
    });
    expect(m.position, `mobile aside must be position:absolute (was ${m.position})`).toBe('absolute');
    // translateX(-100%) → transform matrix shows the X translation. Cheap
    // proof: the right edge of the (translated) aside is at ≤0 (offscreen).
    expect(m.right, `mobile aside must be offscreen when closed (right=${m.right}px)`).toBeLessThanOrEqual(0);

    // No scrim while closed.
    expect(await page.locator('.appshell__scrim').count()).toBe(0);
  });

  test('mobile: tapping the trigger opens the drawer; ESC closes it', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    await page.getByTestId('trigger').click();
    await page.waitForTimeout(300); // wait for the slide transition

    const openX = await page.locator('.appshell__sidebar').evaluate((el) => Math.round(el.getBoundingClientRect().left));
    expect(openX, `open aside should sit at left:0 (was ${openX}px)`).toBe(0);

    // Scrim is rendered + the root carries the state class.
    await expect(page.locator('.appshell__scrim')).toBeVisible();
    await expect(page.locator('.appshell')).toHaveClass(/is-mobile-open/);

    // ESC closes.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('.appshell')).not.toHaveClass(/is-mobile-open/);
    expect(await page.locator('.appshell__scrim').count()).toBe(0);
  });

  test('mobile: tapping the scrim also closes the drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    await page.getByTestId('trigger').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.appshell__scrim')).toBeVisible();

    // Click the scrim where the aside is NOT (right side of the viewport).
    await page.locator('.appshell__scrim').click({ position: { x: 350, y: 400 } });
    await page.waitForTimeout(300);
    await expect(page.locator('.appshell')).not.toHaveClass(/is-mobile-open/);
  });

  test('mobile: the aside matches .appshell__body height (anchored, not viewport math)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    await page.getByTestId('trigger').click();
    await page.waitForTimeout(300);

    // v1.31.1: the aside lives inside .appshell__body with `position:
    // absolute; top:0; bottom:0`. Its rendered height MATCHES the body's,
    // regardless of what `--appshell-header-height` (var) says — the
    // previous `calc(100dvh - header)` undershot or overshot whenever the
    // rendered header differed from the var (e.g. consumer padding).
    const m = await page.evaluate(() => {
      const body = document.querySelector('.appshell__body') as HTMLElement;
      const aside = document.querySelector('.appshell__sidebar') as HTMLElement;
      return {
        bodyH: Math.round(body.getBoundingClientRect().height),
        asideH: Math.round(aside.getBoundingClientRect().height),
      };
    });
    expect(m.asideH, `aside should match body height exactly (body=${m.bodyH}, aside=${m.asideH})`).toBe(m.bodyH);
  });
});

/**
 * Scenario 7b — top mobile drawer over the BRAND theme. Variant guards:
 * (1) the brand sidebar surface stays themed in the drawer; (2) the white-α
 * `border-right-color` override fires so the right edge is visible against
 * the primary blue; (3) `data-tone="inverse"` is NOT on the brand sidebar
 * yet for `top` (intentional — `top`'s only branded band is the header,
 * which already carries inverse; the brand sidebar's contrast on a top shell
 * is the same as on a side shell, audited separately in P1 #4).
 */
test.describe('Scenario · AppShell top mobile drawer — brand variant', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile-brand', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
  });

  test('aside renders fixed overlay with brand surface + white-α right border', async ({ page }) => {
    await page.getByTestId('trigger').click();
    await page.waitForTimeout(300);

    const m = await page.locator('.appshell__sidebar').evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        position: s.position,
        bg: s.backgroundColor,
        borderRight: s.borderRightColor,
      };
    });
    expect(m.position).toBe('absolute');
    // Brand sidebar: the existing `.appshell--brand .appshell__sidebar`
    // paints `--color-primary` (blue) — non-zero, non-white background.
    // We don't pin a specific hex (preset-dependent), only that it's not
    // the default surface.
    const c = m.bg.match(/\d+/g)?.map(Number) ?? [];
    expect(c.length, `expected rgb background, got ${m.bg}`).toBeGreaterThanOrEqual(3);
    // Brand blue is dark — sum of channels well under white (765).
    expect(c[0] + c[1] + c[2], `brand sidebar should be dark (sum=${c[0] + c[1] + c[2]})`).toBeLessThan(500);

    // The white-α hairline on brand surfaces:
    const br = m.borderRight.match(/\d+/g)?.map(Number) ?? [];
    expect(br.slice(0, 3).every((v) => v === 255), `expected white-α border (got ${m.borderRight})`).toBe(true);
  });
});

/**
 * Scenario 7e — Desktop hide-mode collapsed without rail (1.31.0 bug guard).
 * Pre-fix, the absolute aside vacated grid col 1 and auto-placement put the
 * <main> into col 1 (0 width) instead of col 2 (1fr). Visible artifact:
 * a 48px main strip + a phantom scrollbar at the viewport's right edge.
 * Fix: explicit `grid-column: 2` on `.appshell__content` in the desktop
 * media. This test pins the geometry: at 1440px viewport, main should fill
 * the entire body width (~1440px), not 48px.
 */
test.describe('Scenario · AppShell top desktop hide-collapsed — main placement', () => {
  test('main fills the full body width (not 48px from padding-only)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/scenarios/appshell-top-hide-collapsed', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    const m = await page.evaluate(() => {
      const body = document.querySelector('.appshell__body') as HTMLElement;
      const main = document.querySelector('.appshell__content') as HTMLElement;
      return {
        bodyRect: body.getBoundingClientRect(),
        mainRect: main.getBoundingClientRect(),
        gridCol: getComputedStyle(main).gridColumnStart,
      };
    });
    expect(m.gridCol, `main should be pinned to grid-column 2 (got ${m.gridCol})`).toBe('2');
    expect(m.mainRect.width, `main should span the full body (~${m.bodyRect.width}px), not 48px`).toBeGreaterThan(m.bodyRect.width - 5);
  });
});

/**
 * Scenario 7c-controlled — top + collapsedRail + a CONTROLLED static
 * button. The bug the user reported: a button that calls setCollapsed
 * directly (no render-prop, no headerApi.toggle) read as dead in mobile
 * because flipping `collapsed` had no visual effect (aside was a fixed
 * overlay independent of collapsed). Fix mirrors `collapsed` to
 * `mobileOpen` in mobile.
 */
test.describe('Scenario · AppShell top mobile drawer — controlled static button', () => {
  test('controlled: static button that flips `collapsed` opens the drawer in mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile-rail-controlled', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    const root = page.locator('.appshell');
    await expect(root).not.toHaveClass(/is-mobile-open/);
    // Scenario boots with collapsed=true; drawer closed.

    // Click the consumer-placed static button (which only calls setCollapsed).
    await page.getByTestId('static-trigger').click();
    await page.waitForTimeout(300);
    await expect(root).toHaveClass(/is-mobile-open/);

    // Click again: drawer closes.
    await page.getByTestId('static-trigger').click();
    await page.waitForTimeout(300);
    await expect(root).not.toHaveClass(/is-mobile-open/);
  });
});

/**
 * Scenario 7c — top mobile drawer with `collapsedRail=true`. The desktop
 * rail rule (`.appshell--header-top.appshell--rail.is-collapsed
 * .appshell__body { grid-template-columns: 72px 1fr }`) is the highest-
 * specificity desktop body rule. Our mobile block overrides it via source
 * order at the same `@media (max-width: 900px)`. Pin that the aside still
 * becomes a fixed overlay regardless of `rail`.
 */
test.describe('Scenario · AppShell top mobile drawer — collapsedRail variant', () => {
  test('aside is still a fixed overlay even with collapsedRail=true', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile-rail', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    const pos = await page.locator('.appshell__sidebar').evaluate((el) => getComputedStyle(el).position);
    expect(pos, `rail mobile aside must be position:absolute (was ${pos})`).toBe('absolute');

    await page.getByTestId('trigger').click();
    await page.waitForTimeout(300);
    const left = await page.locator('.appshell__sidebar').evaluate((el) => Math.round(el.getBoundingClientRect().left));
    expect(left, `open rail aside should sit at left:0 (was ${left}px)`).toBe(0);
  });
});

/**
 * Scenario 7d — top-bar-only (`sections=[]`) in mobile. No aside is rendered,
 * the drawer concept does not apply — but the mobile header rule
 * (`grid-template-columns: auto 1fr auto`) must still compact so a long
 * brand + right zone don't choke at 375px.
 */
test.describe('Scenario · AppShell top mobile — top-bar-only variant', () => {
  test('no aside, header still compacts to auto/1fr/auto', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/scenarios/appshell-top-mobile-nonav', { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    expect(await page.locator('.appshell').getAttribute('class')).toContain('appshell--no-nav');
    expect(await page.locator('.appshell__sidebar').count()).toBe(0);
    expect(await page.locator('.appshell__scrim').count()).toBe(0);

    const cols = await page.locator('.appshell__header').evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // The compact `auto 1fr auto` resolves to "<small> <big> <small>" with
    // the middle column taking the stretch. Verify the 3 columns and that
    // the middle is the largest (stretches via 1fr).
    const widths = cols.split(/\s+/).map((w) => parseFloat(w));
    expect(widths.length, `expected 3 columns, got ${cols}`).toBe(3);
    expect(widths[1], `the center column should be the largest (1fr): ${cols}`).toBeGreaterThan(widths[0]);
    expect(widths[1]).toBeGreaterThan(widths[2]);
  });
});
