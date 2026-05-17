import * as React from 'react';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

/** Anything that can report its viewport rect: a DOM element or a virtual
 *  anchor (e.g. a point under the cursor for a context menu). */
export interface VirtualElement {
  getBoundingClientRect: () => DOMRect;
}

export interface UsePopoverPositionOptions {
  open: boolean;
  side?: PopoverSide;
  align?: PopoverAlign;
  offset?: number;
  /** Expose the anchor's width so the consumer can match it (comboboxes). */
  matchAnchorWidth?: boolean;
}

export interface PopoverPosition {
  /** Viewport-relative coords (use with `position: fixed` in a body portal).
   *  Fixed strategy stays correct inside transformed/fixed ancestors (e.g. a
   *  Modal) and scroll containers; the hook recomputes on scroll/resize. */
  top: number;
  left: number;
  /** Side actually used after flipping; useful for arrow/animation origin. */
  side: PopoverSide;
  /** False until the first measure. Keep content `visibility: hidden` until true. */
  ready: boolean;
  /** Anchor width, only when `matchAnchorWidth` is set. */
  width?: number;
}

const GUTTER = 8;

/**
 * Positions a floating panel relative to an anchor, for panels portaled to
 * `document.body`. Computes viewport-relative coords from
 * `getBoundingClientRect()` (use with `position: fixed`), flips to the
 * opposite side when the preferred
 * side doesn't fit the viewport, clamps into the viewport, and recomputes
 * on scroll of *any* ancestor (capture-phase) and on resize
 * (rAF-coalesced). Listeners are torn down on close/unmount.
 *
 * The content must be mounted (it can be visually hidden) so its size can
 * be measured — gate visibility on the returned `ready` flag.
 *
 * ```tsx
 * const pos = usePopoverPosition(triggerRef, contentRef, { open, side: 'bottom' });
 * <Portal><div ref={contentRef} style={{
 *   position: 'fixed', top: pos.top, left: pos.left,
 *   visibility: pos.ready ? 'visible' : 'hidden',
 * }} /></Portal>
 * ```
 */
export function usePopoverPosition(
  anchorRef: React.RefObject<HTMLElement | VirtualElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  { open, side = 'bottom', align = 'center', offset = 8, matchAnchorWidth = false }: UsePopoverPositionOptions,
): PopoverPosition {
  const [pos, setPos] = React.useState<PopoverPosition>({
    top: 0,
    left: 0,
    side,
    ready: false,
  });

  const compute = React.useCallback((): void => {
    const anchorEl = anchorRef.current;
    const contentEl = contentRef.current;
    if (!anchorEl || !contentEl || typeof window === 'undefined') return;

    const a = anchorEl.getBoundingClientRect();
    const c = contentEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let chosen: PopoverSide = side;
    if (side === 'bottom' && a.bottom + offset + c.height > vh && a.top - offset - c.height >= 0) {
      chosen = 'top';
    } else if (side === 'top' && a.top - offset - c.height < 0 && a.bottom + offset + c.height <= vh) {
      chosen = 'bottom';
    } else if (side === 'right' && a.right + offset + c.width > vw && a.left - offset - c.width >= 0) {
      chosen = 'left';
    } else if (side === 'left' && a.left - offset - c.width < 0 && a.right + offset + c.width <= vw) {
      chosen = 'right';
    }

    let top = 0;
    let left = 0;
    if (chosen === 'bottom' || chosen === 'top') {
      top = chosen === 'bottom' ? a.bottom + offset : a.top - c.height - offset;
      left =
        align === 'start' ? a.left
        : align === 'end' ? a.right - c.width
        : a.left + (a.width - c.width) / 2;
    } else {
      left = chosen === 'right' ? a.right + offset : a.left - c.width - offset;
      top =
        align === 'start' ? a.top
        : align === 'end' ? a.bottom - c.height
        : a.top + (a.height - c.height) / 2;
    }

    left = Math.max(GUTTER, Math.min(left, vw - c.width - GUTTER));
    top = Math.max(GUTTER, Math.min(top, vh - c.height - GUTTER));

    setPos({
      top,
      left,
      side: chosen,
      ready: true,
      width: matchAnchorWidth ? a.width : undefined,
    });
  }, [anchorRef, contentRef, side, align, offset, matchAnchorWidth]);

  React.useEffect(() => {
    if (!open) {
      setPos((p) => (p.ready ? { ...p, ready: false } : p));
      return;
    }
    // Portal is synchronous, so by the time this effect runs the content
    // node is committed and measurable — position immediately (no flicker,
    // and deterministic under test without a rAF dependency).
    compute();
    let raf = 0;
    const schedule = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    // Capture-phase: scroll doesn't bubble, so capture catches scrolling
    // from *any* ancestor (the table/card wrapper, not just window).
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [open, compute]);

  return pos;
}
