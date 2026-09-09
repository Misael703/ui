import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const css = strip(readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8'));
const root = strip(readFileSync(resolve(__dirname, '../src/styles/_root.css'), 'utf8'));
const overlay = readFileSync(resolve(__dirname, '../src/components/Overlay.tsx'), 'utf8');

const rule = (sel: string) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'))?.[1] ?? '';
};
const keyframes = (name: string) => css.match(new RegExp('@keyframes ' + name + '\\s*\\{([\\s\\S]*?)\\}\\s*\\}'))?.[1] ?? '';

/**
 * Drawer motion (v3.9.3). The side panel used to nudge 20px while fading —
 * measured, the visible motion was over in 3–4 frames and read as a pop. Now
 * it travels its full width, opaque, decelerating in (`--ease-out-quint`) and
 * accelerating out (`--ease-in`); only the backdrop fades. Enter decelerates,
 * exit accelerates: the kit's own `--ease-in` is documented for exactly this
 * and the drawer was the surface not using it.
 */
describe('Drawer motion: full slide in, accelerate out', () => {
  it('declares the slide durations as tokens', () => {
    expect(root).toMatch(/--duration-slide:\s*260ms/);
    expect(root).toMatch(/--duration-slide-exit:\s*180ms/);
  });

  it.each(['right', 'left'])('.drawer--%s enters from 100% of its width, opaque, with --ease-out-quint', (side) => {
    const r = rule(`.drawer--${side}`);
    const name = r.match(/animation:\s*([\w-]+)/)?.[1] ?? '';
    expect(r).toMatch(/var\(--duration-slide\)\s+var\(--ease-out-quint\)/);
    const kf = keyframes(name);
    expect(kf).toMatch(side === 'right' ? /from\s*\{\s*transform:\s*translateX\(100%\)/ : /from\s*\{\s*transform:\s*translateX\(-100%\)/);
    expect(kf).not.toMatch(/opacity/);
  });

  it.each(['right', 'left'])('.drawer--%s.is-closing leaves to 100% with --ease-in and the exit duration', (side) => {
    const r = rule(`.drawer--${side}.is-closing`);
    const name = r.match(/animation:\s*([\w-]+)/)?.[1] ?? '';
    expect(r).toMatch(/var\(--duration-slide-exit\)\s+var\(--ease-in\)\s+forwards/);
    const kf = keyframes(name);
    expect(kf).toMatch(side === 'right' ? /to\s*\{\s*transform:\s*translateX\(100%\)/ : /to\s*\{\s*transform:\s*translateX\(-100%\)/);
    expect(kf).not.toMatch(/opacity/);
  });

  it('the base .drawer carries no animation of its own (the side decides)', () => {
    expect(rule('.drawer')).not.toMatch(/animation/);
  });

  it('the drawer backdrop fades out on the same clock and curve as the panel', () => {
    expect(rule('.drawer-backdrop.is-closing')).toMatch(/fadeOut var\(--duration-slide-exit\) var\(--ease-in\) forwards/);
  });

  it('the mobile bottom sheet follows the same rule (opaque, --ease-in out)', () => {
    expect(keyframes('slideInBottom')).not.toMatch(/opacity/);
    expect(keyframes('slideOutBottom')).not.toMatch(/opacity/);
    const mobile = css.match(/\.drawer\.is-closing,\s*\.drawer--right\.is-closing,\s*\.drawer--left\.is-closing\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(mobile).toMatch(/slideOutBottom var\(--duration-slide-exit\) var\(--ease-in\) forwards/);
  });

  it('reduced motion drops the drawer animations', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.drawer,\s*\.drawer-backdrop[^}]*animation:\s*none/);
  });

  it('Drawer waits --duration-slide-exit (180ms) before unmounting; Modal keeps 150ms', () => {
    expect(overlay).toMatch(/const DRAWER_EXIT_MS = 180;/);
    expect(overlay).toMatch(/const EXIT_MS = 150;/);
    expect(overlay).toMatch(/useDelayedUnmount\(open, DRAWER_EXIT_MS\)/);
  });
});
