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

  it('auto-dismisses after the configured duration', () => {
    render(
      <ToastProvider>
        <Pusher duration={1000} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('push'));
    expect(screen.getByText('Hola')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1100);
    });
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

    // Resume on mouse leave; remaining was ~500ms.
    fireEvent.mouseLeave(toast);
    act(() => { vi.advanceTimersByTime(600); });
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
