import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDelayedUnmount } from '../src/hooks/useDelayedUnmount';

describe('useDelayedUnmount', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('mounts immediately when initial open is true', () => {
    const { result } = renderHook(() => useDelayedUnmount(true, 200));
    expect(result.current.mounted).toBe(true);
    expect(result.current.closing).toBe(false);
  });

  it('does not mount when initial open is false', () => {
    const { result } = renderHook(() => useDelayedUnmount(false, 200));
    expect(result.current.mounted).toBe(false);
    expect(result.current.closing).toBe(false);
  });

  it('keeps mounted=true and sets closing=true during exit window', () => {
    const { result, rerender } = renderHook(({ open }) => useDelayedUnmount(open, 200), {
      initialProps: { open: true },
    });
    expect(result.current.mounted).toBe(true);

    rerender({ open: false });
    expect(result.current.mounted).toBe(true);
    expect(result.current.closing).toBe(true);
  });

  it('unmounts after duration elapses', () => {
    const { result, rerender } = renderHook(({ open }) => useDelayedUnmount(open, 200), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current.mounted).toBe(true);

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.mounted).toBe(false);
    expect(result.current.closing).toBe(false);
  });

  it('cancels closing if reopened during exit window', () => {
    const { result, rerender } = renderHook(({ open }) => useDelayedUnmount(open, 200), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current.closing).toBe(true);

    // Reopen mid-animation: closing flips back to false, mounted stays true.
    rerender({ open: true });
    expect(result.current.mounted).toBe(true);
    expect(result.current.closing).toBe(false);

    // The original timeout shouldn't fire — advancing past it leaves us mounted.
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.mounted).toBe(true);
  });

  it('does nothing when open is false and was already unmounted', () => {
    const { result, rerender } = renderHook(({ open }) => useDelayedUnmount(open, 200), {
      initialProps: { open: false },
    });
    rerender({ open: false });
    expect(result.current.mounted).toBe(false);
    expect(result.current.closing).toBe(false);
  });
});
