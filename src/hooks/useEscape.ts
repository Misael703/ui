import * as React from 'react';

/**
 * Call `onClose` when the user presses Escape, while `active` AND `enabled`
 * are both true. Listener attaches at `document` level so it works regardless
 * of where focus lives at the moment of the press (the affordance for
 * "global dismiss" is the whole document).
 *
 * Two flags so a consumer can opt out per-call (`enabled=false`) without
 * losing the open/closed semantics that `active` carries.
 */
export function useEscape(active: boolean, onClose: () => void, enabled: boolean = true) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!active || !enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, enabled, onClose]);
}
