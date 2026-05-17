import * as React from 'react';

export interface UseDismissOptions {
  open: boolean;
  onDismiss: () => void;
  /** Refs whose subtree should NOT count as "outside" (trigger + panel). */
  refs: Array<React.RefObject<HTMLElement | null>>;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  /** Focus returns here when the panel closes (usually the trigger). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Shared dismiss behaviour for floating panels: closes on outside
 * pointer-down and on Escape, and restores focus to the trigger when the
 * panel closes (focus hygiene for keyboard/AT users).
 *
 * `onDismiss` and `refs` are read through refs internally, so callers
 * don't need to memoize them to avoid re-subscribing listeners.
 */
export function useDismiss({
  open,
  onDismiss,
  refs,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  returnFocusRef,
}: UseDismissOptions): void {
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const refsRef = React.useRef(refs);
  refsRef.current = refs;

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent): void => {
      if (!closeOnOutsideClick) return;
      const target = e.target as Node;
      if (refsRef.current.some((r) => r.current?.contains(target))) return;
      onDismissRef.current();
    };
    const onKey = (e: KeyboardEvent): void => {
      if (closeOnEscape && e.key === 'Escape') onDismissRef.current();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeOnEscape, closeOnOutsideClick]);

  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (wasOpen.current && !open) {
      returnFocusRef?.current?.focus();
    }
    wasOpen.current = open;
  }, [open, returnFocusRef]);
}
