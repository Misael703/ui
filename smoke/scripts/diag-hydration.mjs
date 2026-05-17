// One-off: load /gallery in a real browser against the dev server (React not
// minified) and print every console/pageerror message so the React #418
// hydration mismatch names the offending element/component.
import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:3100/gallery';
const browser = await chromium.launch();
const page = await browser.newPage();
const out = [];
page.on('console', (m) => out.push(`[console:${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => out.push(`[pageerror] ${e.message}\n${e.stack ?? ''}`));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await browser.close();
const hits = out.filter((l) => /hydrat|did not match|server|client|#41[0-9]|#42[0-9]/i.test(l));
console.log('--- hydration-relevant messages ---');
console.log(hits.length ? hits.join('\n\n') : '(none captured)');
console.log('\n--- all messages (first 12) ---');
console.log(out.slice(0, 12).join('\n'));
