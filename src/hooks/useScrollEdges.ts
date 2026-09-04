'use client';
import * as React from 'react';

/**
 * Which edges of a scroll container still hide content: `left` / `right`
 * (horizontal overflow beyond the current scroll position) and `down`
 * (rows below a bounded box). `up` is deliberately absent — a sticky header
 * already carries that cue (`is-stuck` elevation) and an opaque header band
 * would hide a top shadow anyway.
 */
export interface ScrollEdges {
  left: boolean;
  right: boolean;
  down: boolean;
}

const NONE: ScrollEdges = { left: false, right: false, down: false };
/* Sub-pixel scroll remainders (zoom, fractional widths) must not keep a hint
   on at the very end of the track. */
const TOLERANCE_PX = 1;

const same = (a: ScrollEdges, b: ScrollEdges) =>
  a.left === b.left && a.right === b.right && a.down === b.down;

/**
 * Measures a scroller's hidden-content edges as STATE, so a parent can paint
 * "more content this way" hints wherever it wants (v3.2.0, DataTable).
 *
 * Why state and not the classic CSS-only scroll-shadow trick (background
 * layers with `background-attachment: local`): that trick only works when the
 * element painting the shadow is the one that scrolls. DataTable splits the
 * rounded wrap from its inner scroller in bounded and overlay modes, so the
 * masks never moved and the shadow never showed; and with two scroll axes the
 * local masks scroll away vertically and reveal a horizontal shadow that
 * lies. Measuring the real scroller has none of those coupling problems.
 *
 * Cost: six property reads per `scroll` event (the browser already coalesces
 * those per frame) plus a `ResizeObserver` on the scroller and its table for
 * layout changes without scrolling (rows loaded, columns toggled, container
 * resized). `setState` bails when nothing changed, so idle scrolling inside
 * the middle of a wide table re-renders nothing.
 *
 * `structureKey` names the DOM shape the ref currently points at; changing
 * it re-subscribes (the ref can move between the wrap and an inner div as
 * DataTable switches modes — a `ref.current` dependency would be flaky).
 */
export function useScrollEdges(
  ref: React.RefObject<HTMLElement | null>,
  structureKey: string,
): ScrollEdges {
  const [edges, setEdges] = React.useState<ScrollEdges>(NONE);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) { setEdges(NONE); return; }

    const measure = () => {
      const next: ScrollEdges = {
        left: el.scrollLeft > TOLERANCE_PX,
        right: el.scrollWidth - el.clientWidth - el.scrollLeft > TOLERANCE_PX,
        down: el.scrollHeight - el.clientHeight - el.scrollTop > TOLERANCE_PX,
      };
      setEdges((prev) => (same(prev, next) ? prev : next));
    };

    measure();
    el.addEventListener('scroll', measure, { passive: true });
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(el);
      const table = el.querySelector('table');
      if (table) ro.observe(table);
    }
    return () => {
      el.removeEventListener('scroll', measure);
      ro?.disconnect();
    };
  }, [ref, structureKey]);

  return edges;
}
