'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

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
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
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

  React.useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const c = contentRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    if (placement === 'bottom') { top = t.bottom + offset; left = t.left + (t.width - c.width) / 2; }
    else if (placement === 'top') { top = t.top - c.height - offset; left = t.left + (t.width - c.width) / 2; }
    else if (placement === 'right') { left = t.right + offset; top = t.top + (t.height - c.height) / 2; }
    else { left = t.left - c.width - offset; top = t.top + (t.height - c.height) / 2; }
    left = Math.max(8, Math.min(left, window.innerWidth - c.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - c.height - 8));
    setCoords({ top: top + window.scrollY, left: left + window.scrollX });
  }, [open, placement, offset]);

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
        <div
          ref={contentRef}
          role="tooltip"
          className={cx('hover-card__content', contentClassName)}
          style={coords ? { position: 'absolute', top: coords.top, left: coords.left } : { position: 'absolute', visibility: 'hidden' }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {children}
        </div>
      )}
    </span>
  );
}
