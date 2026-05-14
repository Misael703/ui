'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { cx } from '../utils/cx';

const VARIANT_ICON = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
} as const;

// Exit animation duration. Must match `.toast.is-closing` keyframes
// (`toastSlideOut`) in src/styles/index.css.
const EXIT_MS = 200;

export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

interface ToastTimerState {
  handle: ReturnType<typeof setTimeout>;
  startedAt: number;
  remaining: number;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  // Toasts in the closing window: still rendered with `is-closing` class so
  // CSS can play the exit animation, but already removed from new-toast
  // accounting (auto-dismiss timer cancelled, can't be paused/resumed).
  const [closingIds, setClosingIds] = React.useState<Set<string>>(new Set());
  // SSR-safe portal gating. Without this, the first client render emits a
  // `toast-stack` div into document.body via createPortal, while the
  // server-rendered HTML doesn't — Next.js App Router flags it as a
  // hydration mismatch. Starting `mounted=false` keeps the first client
  // render identical to the server; the effect flips it true after
  // hydration and the portal mounts on the next pass.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const timers = React.useRef<Map<string, ToastTimerState>>(new Map());
  const exitTimers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const locale = useLocale();

  const dismiss = React.useCallback((id: string) => {
    const state = timers.current.get(id);
    if (state) {
      clearTimeout(state.handle);
      timers.current.delete(id);
    }
    // Already in the closing window? skip (idempotent).
    if (exitTimers.current.has(id)) return;
    setClosingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const handle = setTimeout(() => {
      exitTimers.current.delete(id);
      setToasts((list) => list.filter((toast) => toast.id !== id));
      setClosingIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, EXIT_MS);
    exitTimers.current.set(id, handle);
  }, []);

  const push = React.useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, duration: 4000, variant: 'info', ...t };
      setToasts((list) => [...list, item]);
      if (item.duration && item.duration > 0) {
        const handle = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, { handle, startedAt: Date.now(), remaining: item.duration });
      }
      return id;
    },
    [dismiss]
  );

  // Pause auto-dismiss while pointer is over the toast — users reading a
  // multi-line message shouldn't have it disappear mid-read.
  const pause = React.useCallback((id: string) => {
    const state = timers.current.get(id);
    if (!state) return;
    clearTimeout(state.handle);
    const elapsed = Date.now() - state.startedAt;
    const remaining = Math.max(0, state.remaining - elapsed);
    timers.current.set(id, { ...state, remaining });
  }, []);

  const resume = React.useCallback((id: string) => {
    const state = timers.current.get(id);
    if (!state) return;
    const handle = setTimeout(() => dismiss(id), state.remaining);
    timers.current.set(id, { handle, startedAt: Date.now(), remaining: state.remaining });
  }, [dismiss]);

  React.useEffect(() => {
    const map = timers.current;
    const exits = exitTimers.current;
    return () => {
      map.forEach((state) => clearTimeout(state.handle));
      map.clear();
      exits.forEach((handle) => clearTimeout(handle));
      exits.clear();
    };
  }, []);

  // Portal the stack to body so it isn't clipped by ancestor stacking contexts
  // (overflow:hidden, transform, filter on app shell layouts).
  // aria-atomic intentionally omitted: with `false` (default), screen readers
  // announce only newly added toasts instead of re-reading the entire stack.
  const stack = (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => {
        const variant = t.variant ?? 'info';
        const Icon = VARIANT_ICON[variant];
        return (
          <div
            key={t.id}
            className={cx('toast', `toast--${variant}`, closingIds.has(t.id) && 'is-closing')}
            role="status"
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id)}
            onFocus={() => pause(t.id)}
            onBlur={() => resume(t.id)}
          >
            <span className="toast__icon" aria-hidden="true"><Icon size={20} /></span>
            <div className="toast__body">
              {t.title && <div className="toast__title">{t.title}</div>}
              {t.description && <div className="toast__desc">{t.description}</div>}
            </div>
            <button type="button" className="toast__close" aria-label={locale['toast.close']} onClick={() => dismiss(t.id)}><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );

  // Memoize the provider value so consumers calling useToast() to access
  // only `push`/`dismiss` (the common case) don't re-render on every state
  // change. Without this, every toast push churned every consumer.
  const ctx = React.useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {mounted && typeof document !== 'undefined' && createPortal(stack, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
