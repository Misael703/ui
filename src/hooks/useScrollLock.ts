import * as React from 'react';

/**
 * Lock `document.body` scroll while `active` is true.
 *
 * Stacked overlays (Modal over Drawer over mobile AppShell drawer) share a
 * single module-level counter so closing the inner overlay does NOT release
 * the lock for the outer one — a per-call boolean approach would silently
 * unlock on the first cleanup, breaking nesting.
 *
 * Body's original `overflow` is captured on first lock and restored on the
 * last unlock (counter reaches 0). If the consumer set a custom overflow
 * for design reasons, it survives the round trip.
 *
 * Scrollbar-width compensation: setting `overflow: hidden` on the body
 * removes the page's vertical scrollbar (when present). Without
 * compensation the visible viewport widens by the scrollbar width
 * (~15px on Mac, more on Windows) and any layout that was sized to "viewport
 * minus scrollbar" — including the AppShell header — looks ~15px narrower
 * than fixed-position overlays (scrim, drawer) that always span the full
 * viewport. Reserving the gutter via `padding-right` keeps the page width
 * stable across the lock/unlock cycle.
 */
let scrollLockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export function useScrollLock(active: boolean) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!active) return;
    if (scrollLockCount === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    scrollLockCount++;
    return () => {
      scrollLockCount--;
      if (scrollLockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [active]);
}
