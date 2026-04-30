'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { X } from './Icons';

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

export function Modal({
  open, onClose, title, children, footer, size = 'md',
  closeOnBackdrop = true, closeOnEsc = true, className,
}: OverlayProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useEscape(open, onClose, closeOnEsc);
  useFocusTrap(ref, open);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={() => closeOnBackdrop && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cx('modal', `modal--${size}`, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal__header">
            <div id="modal-title" className="modal__title">{title}</div>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
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
  useEscape(open, onClose, closeOnEsc);
  useFocusTrap(ref, open);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onClick={() => closeOnBackdrop && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cx('drawer', `drawer--${side}`, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="drawer__header">
            <div className="drawer__title">{title}</div>
            <button type="button" className="drawer__close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
          </div>
        )}
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </div>
  );
}
