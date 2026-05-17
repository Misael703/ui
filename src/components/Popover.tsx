'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { useDismiss } from '../hooks/useDismiss';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  offset?: number;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  ariaLabel?: string;
}

export function Popover({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  trigger,
  children,
  placement = 'bottom',
  align = 'center',
  offset = 8,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  ariaLabel,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const pos = usePopoverPosition(triggerRef, contentRef, {
    open,
    side: placement,
    align,
    offset,
  });

  useDismiss({
    open,
    onDismiss: () => setOpen(false),
    refs: [triggerRef, contentRef],
    closeOnEscape,
    closeOnOutsideClick,
  });

  return (
    <span className={cx('popover', className)}>
      <span
        ref={triggerRef}
        className="popover__trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {trigger}
      </span>
      {/* Portaled to document.body so absolute coords (document-relative)
          match the positioning origin and overflow:hidden / transformed
          ancestors don't clip the panel. */}
      {open && (
        <Portal>
          <div
            ref={contentRef}
            role="dialog"
            aria-label={ariaLabel}
            className={cx('popover__content', contentClassName)}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
          >
            {children}
          </div>
        </Portal>
      )}
    </span>
  );
}
