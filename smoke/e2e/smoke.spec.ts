import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/client', '/gallery'];

// React hydration tells: explicit messages + minified codes (418 text/markup
// mismatch, 421 suspense, 423 recoverable, 425 text content).
const HYDRATION = /hydrat|did not match|Minified React error #(418|421|423|425)/i;

for (const route of ROUTES) {
  test(`route ${route} is clean (no console error / pageerror / hydration / non-200)`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const hydration: string[] = [];

    page.on('console', (m) => {
      const txt = m.text();
      if (HYDRATION.test(txt)) hydration.push(`console: ${txt}`);
      if (m.type() === 'error') consoleErrors.push(txt);
    });
    page.on('pageerror', (e) => {
      const txt = `${e.message}\n${e.stack ?? ''}`;
      if (HYDRATION.test(txt)) hydration.push(`pageerror: ${e.message}`);
      pageErrors.push(e.message);
    });

    const res = await page.goto(route, { waitUntil: 'networkidle' });
    expect(res, `no response for ${route}`).not.toBeNull();
    expect(res!.status(), `${route} returned ${res!.status()}`).toBe(200);

    // Let hydration + effects settle so mismatches/throws are captured.
    await page.waitForTimeout(800);

    expect(hydration, `hydration on ${route}:\n${hydration.join('\n')}`).toEqual([]);
    expect(pageErrors, `pageerror on ${route}:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(consoleErrors, `console.error on ${route}:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
}
