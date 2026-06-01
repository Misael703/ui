'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils/cx';
import { X } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { useDelayedUnmount } from '../hooks/useDelayedUnmount';
import { useFocusTrap, useEscape, useScrollLock } from '../hooks';

// Exit animation duration in ms. Must match `--duration-exit` and the
// `is-closing` keyframes in src/styles/index.css (`.modal-backdrop`,
// `.drawer-backdrop`).
const EXIT_MS = 150;

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

export function Modal({
  open, onClose, title, children, footer, size = 'md',
  closeOnBackdrop = true, closeOnEsc = true, className,
}: OverlayProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  // True only when the press both started AND ended on the backdrop itself.
  // Fixes: press inside (e.g. text-selecting in an input) released over the
  // backdrop must NOT dismiss.
  const downOnBackdrop = React.useRef(false);
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
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => {
        if (closeOnBackdrop && downOnBackdrop.current && e.target === e.currentTarget) onClose();
        downOnBackdrop.current = false;
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cx('modal', `modal--${size}`, closing && 'is-closing', className)}
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
  // True only when the press both started AND ended on the backdrop itself.
  // Fixes: press inside (e.g. text-selecting in an input) released over the
  // backdrop must NOT dismiss.
  const downOnBackdrop = React.useRef(false);
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
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => {
        if (closeOnBackdrop && downOnBackdrop.current && e.target === e.currentTarget) onClose();
        downOnBackdrop.current = false;
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cx('drawer', `drawer--${side}`, closing && 'is-closing', className)}
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
