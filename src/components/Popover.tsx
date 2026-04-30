'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

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

  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  React.useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const c = contentRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;
    if (placement === 'bottom') {
      top = t.bottom + offset;
      left = align === 'start' ? t.left : align === 'end' ? t.right - c.width : t.left + (t.width - c.width) / 2;
    } else if (placement === 'top') {
      top = t.top - c.height - offset;
      left = align === 'start' ? t.left : align === 'end' ? t.right - c.width : t.left + (t.width - c.width) / 2;
    } else if (placement === 'right') {
      left = t.right + offset;
      top = align === 'start' ? t.top : align === 'end' ? t.bottom - c.height : t.top + (t.height - c.height) / 2;
    } else {
      left = t.left - c.width - offset;
      top = align === 'start' ? t.top : align === 'end' ? t.bottom - c.height : t.top + (t.height - c.height) / 2;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(8, Math.min(left, vw - c.width - 8));
    top = Math.max(8, Math.min(top, vh - c.height - 8));

    setCoords({ top: top + window.scrollY, left: left + window.scrollX });
  }, [open, placement, align, offset]);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!closeOnOutsideClick) return;
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeOnOutsideClick, closeOnEscape]);

  return (
    <span className={cx('popover', className)}>
      <span
        ref={triggerRef as any}
        className="popover__trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {trigger}
      </span>
      {open && (
        <div
          ref={contentRef}
          role="dialog"
          aria-label={ariaLabel}
          className={cx('popover__content', contentClassName)}
          style={coords ? { position: 'absolute', top: coords.top, left: coords.left } : { position: 'absolute', visibility: 'hidden' }}
        >
          {children}
        </div>
      )}
    </span>
  );
}
