'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils/cx';
import { X } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { useDelayedUnmount } from '../hooks/useDelayedUnmount';

// Exit animation duration in ms. Must match the `is-closing` keyframes
// in src/styles/index.css (`.modal-backdrop`, `.drawer-backdrop`).
const EXIT_MS = 200;

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

function useEscape(active: boolean, onClose: () => void, enabled: boolean) {
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

function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
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
      const f = list[0], l = list[list.length - 1];
      if (e.shiftKey && document.activeElement === f) {
        e.preventDefault(); l.focus();
      } else if (!e.shiftKey && document.activeElement === l) {
        e.preventDefault(); f.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previously?.focus?.();
    };
  }, [active, ref]);
}

// Lock body scroll while any overlay is open. Stacked overlays share a single
// counter so closing the inner one doesn't release the lock for the outer one.
let scrollLockCount = 0;
let originalOverflow = '';
function useScrollLock(active: boolean) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!active) return;
    if (scrollLockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLockCount++;
    return () => {
      scrollLockCount--;
      if (scrollLockCount === 0) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [active]);
}

export function Modal({
  open, onClose, title, children, footer, size = 'md',
  closeOnBackdrop = true, closeOnEsc = true, className,
}: OverlayProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const t = useLocale();
  // useDelayedUnmount keeps the DOM mounted during exit animation. The
  // a11y/scroll-lock hooks still consume `open` (the user's intent), not
  // `mounted` — we don't want to trap focus or block scroll while
  // animating out.
  const { mounted, closing } = useDelayedUnmount(open, EXIT_MS);
  useEscape(open, onClose, closeOnEsc);
  useFocusTrap(ref, open);
  useScrollLock(open);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={cx('modal-backdrop', closing && 'is-closing')}
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cx('modal', `modal--${size}`, closing && 'is-closing', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal__header">
            <div id={titleId} className="modal__title">{title}</div>
            <button type="button" className="modal__close" onClick={onClose} aria-label={t['modal.close']}><X size={18} /></button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export interface DrawerProps extends OverlayProps {
  side?: 'left' | 'right';
}

export function Drawer({
  open, onClose, title, children, footer, side = 'right',
  closeOnBackdrop = true, closeOnEsc = true, className,
}: DrawerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const t = useLocale();
  const { mounted, closing } = useDelayedUnmount(open, EXIT_MS);
  useEscape(open, onClose, closeOnEsc);
  useFocusTrap(ref, open);
  useScrollLock(open);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={cx('drawer-backdrop', closing && 'is-closing')}
      onClick={() => closeOnBackdrop && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cx('drawer', `drawer--${side}`, closing && 'is-closing', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="drawer__header">
            <div id={titleId} className="drawer__title">{title}</div>
            <button type="button" className="drawer__close" onClick={onClose} aria-label={t['drawer.close']}><X size={18} /></button>
          </div>
        )}
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
