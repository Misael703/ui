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
 */
let scrollLockCount = 0;
let originalOverflow = '';

export function useScrollLock(active: boolean) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!active) return;
    if (scrollLockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLockCount++;
    return () => {
      scrollLockCount--;
      if (scrollLockCount === 0) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [active]);
}
