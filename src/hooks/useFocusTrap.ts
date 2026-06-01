import * as React from 'react';

/**
 * Trap keyboard focus inside `ref` while `active` is true.
 *
 * On activation: focuses the first tabbable descendant; while active, cycles
 * Tab/Shift+Tab inside the node; on deactivation, restores focus to whatever
 * was focused before activation (the trigger, in practice).
 *
 * Internal to the kit — used by Modal/Drawer (Overlay.tsx) and the AppShell
 * top mobile drawer. Not part of the public hook surface yet (would need a
 * doc page + name stability), see hooks/index.ts.
 *
 * Tabbable query intentionally simple: covers anchors/buttons/inputs/select/
 * textarea plus anything carrying a non-negative `tabindex`. Mirrors WAI-ARIA
 * authoring practices, not jQuery `:tabbable` exhaustive list. If a future
 * widget needs more, we extend the query — not the contract.
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!active || !ref.current) return;
    const node = ref.current;
    const previously = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    const first = focusables()[0];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const f = list[0];
      const l = list[list.length - 1];
      if (e.shiftKey && document.activeElement === f) {
        e.preventDefault();
        l.focus();
      } else if (!e.shiftKey && document.activeElement === l) {
        e.preventDefault();
        f.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previously?.focus?.();
    };
  }, [active, ref]);
}
