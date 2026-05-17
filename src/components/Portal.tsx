'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
  /** Mount target. Defaults to `document.body`. */
  container?: Element | null;
}

/**
 * SSR-safe portal.
 *
 * Renders nothing during server rendering (`document` undefined), and
 * portals `children` into `container` (default `document.body`) on the
 * client. Floating panels are only mounted while open — i.e. driven by a
 * client interaction, never during the SSR/hydration pass — so there is no
 * hydration mismatch and we can portal synchronously (a deferred
 * `mounted` flag would delay measurement by a commit and make the panel
 * briefly unmeasurable). The body portal lets panels escape any ancestor
 * with `overflow: hidden|auto|scroll`, a transform, or a filter.
 *
 * ```tsx
 * {open && (
 *   <Portal>
 *     <div role="menu" style={{ position: 'fixed', top, left }} />
 *   </Portal>
 * )}
 * ```
 */
export function Portal({ children, container }: PortalProps): React.ReactPortal | null {
  if (typeof document === 'undefined') return null;
  return createPortal(children, container ?? document.body);
}
