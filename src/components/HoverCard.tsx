'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';

export type HoverCardPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: HoverCardPlacement;
  openDelay?: number;
  closeDelay?: number;
  offset?: number;
  className?: string;
  contentClassName?: string;
}

export function HoverCard({
  trigger,
  children,
  placement = 'bottom',
  openDelay = 250,
  closeDelay = 150,
  offset = 8,
  className,
  contentClassName,
}: HoverCardProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const onEnter = () => {
    clear();
    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  };
  const onLeave = () => {
    clear();
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  React.useEffect(() => () => clear(), []);

  const pos = usePopoverPosition(triggerRef, contentRef, {
    open,
    side: placement,
    align: 'center',
    offset,
  });

  return (
    <span
      className={cx('hover-card', className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <span ref={triggerRef} className="hover-card__trigger">{trigger}</span>
      {open && (
        <Portal>
          <div
            ref={contentRef}
            role="tooltip"
            className={cx('hover-card__content', 'is-floating', contentClassName)}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {children}
          </div>
        </Portal>
      )}
    </span>
  );
}
