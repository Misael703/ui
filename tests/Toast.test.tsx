import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../src/components/Toast';
import { LocaleProvider } from '../src/locale';

function Pusher({ duration = 1000 }: { duration?: number }) {
  const { push } = useToast();
  return (
    <button
      type="button"
      onClick={() => push({ title: 'Hola', description: 'mundo', duration })}
    >
      push
    </button>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // EXIT_MS in Toast.tsx — kept in sync with the toast.is-closing CSS animation.
  const EXIT_MS = 200;

  it('auto-dismisses after the configured duration (plus exit window)', () => {
    render(
      <ToastProvider>
        <Pusher duration={1000} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('push'));
    expect(screen.getByText('Hola')).toBeInTheDocument();

    // After duration, toast enters the closing window — still mounted, but
    // marked is-closing.
    act(() => { vi.advanceTimersByTime(1000); });
    const toast = screen.getByText('Hola').closest('.toast')!;
    expect(toast.classList.contains('is-closing')).toBe(true);

    // After the exit window, it's actually unmounted.
    act(() => { vi.advanceTimersByTime(EXIT_MS); });
    expect(screen.queryByText('Hola')).toBeNull();
  });

  it('pauses the dismiss timer while the pointer is over the toast', () => {
    render(
      <ToastProvider>
        <Pusher duration={1000} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('push'));
    const toast = screen.getByText('Hola').closest('.toast')!;

    // Advance partway then hover — toast should not dismiss while hovered.
    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.mouseEnter(toast);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('Hola')).toBeInTheDocument();

    // Resume on mouse leave; remaining was ~500ms then exit window.
    fireEvent.mouseLeave(toast);
    act(() => { vi.advanceTimersByTime(500 + EXIT_MS + 50); });
    expect(screen.queryByText('Hola')).toBeNull();
  });

  it('plays exit animation when manually dismissed via close button', () => {
    render(
      <ToastProvider>
        <Pusher duration={0} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('push'));
    const toast = screen.getByText('Hola').closest('.toast')!;
    expect(toast.classList.contains('is-closing')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(toast.classList.contains('is-closing')).toBe(true);

    // Still mounted during exit window.
    expect(screen.getByText('Hola')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(EXIT_MS); });
    expect(screen.queryByText('Hola')).toBeNull();
  });

  it('renders the stack with aria-live="polite" and no aria-atomic', () => {
    const { baseElement } = render(
      <ToastProvider>
        <Pusher />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('push'));
    const stack = baseElement.querySelector('.toast-stack')!;
    expect(stack.getAttribute('aria-live')).toBe('polite');
    expect(stack.hasAttribute('aria-atomic')).toBe(false);
  });

  it('respects LocaleProvider override for close aria-label', () => {
    render(
      <LocaleProvider messages={{ 'toast.close': 'Dismiss' }}>
        <ToastProvider>
          <Pusher />
        </ToastProvider>
      </LocaleProvider>
    );
    fireEvent.click(screen.getByText('push'));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });
});
