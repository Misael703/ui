import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AppShell } from '../src/components/AppShell';

/**
 * `persistKey` (v1.22.0) — opt-in collapse persistence in localStorage.
 *
 * Contract:
 * - Without `persistKey`: never touches localStorage (back-compat).
 * - With `persistKey` (uncontrolled): reads the stored value after mount and
 *   writes on every toggle. SSR-safe — initial render is `defaultCollapsed`.
 * - Ignored in controlled mode (`collapsed` provided): the host owns state.
 * - Resilient: a throwing localStorage must not crash the shell.
 */
const sections = [{ items: [{ id: 'home', label: 'Inicio', href: '#' }] }];

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('AppShell persistKey', () => {
  it('reads the stored "1" after mount → mounts collapsed', () => {
    window.localStorage.setItem('test.shell', '1');
    const { container } = render(
      <AppShell persistKey="test.shell" header={{ center: 'ALBA' }} sections={sections}>x</AppShell>,
    );
    // The post-mount effect flips internal state; act() flushing via render.
    expect(container.querySelector('.appshell')).toHaveClass('is-collapsed');
  });

  it('stored "0" keeps it expanded even if defaultCollapsed is true', () => {
    window.localStorage.setItem('test.shell', '0');
    const { container } = render(
      <AppShell persistKey="test.shell" defaultCollapsed header={{ center: 'ALBA' }} sections={sections}>x</AppShell>,
    );
    expect(container.querySelector('.appshell')).not.toHaveClass('is-collapsed');
  });

  it('uncontrolled + persistKey + header render-prop toggle persists', () => {
    // Regression for the gap a consumer measured: `persistKey` is
    // uncontrolled-only, and the shell has no built-in toggle, so before the
    // header render-prop the hamburger could not drive an uncontrolled shell
    // and `persistKey` was a no-op. Now the render-prop API toggles the
    // uncontrolled state AND the change is persisted.
    const { container } = render(
      <AppShell persistKey="test.shell" header={{
        left: ({ toggle }) => <button data-testid="burger" onClick={toggle}>m</button>,
        center: 'brand',
      }} sections={sections}>x</AppShell>,
    );
    expect(container.querySelector('.appshell')).not.toHaveClass('is-collapsed');
    fireEvent.click(container.querySelector('[data-testid="burger"]')!);
    expect(container.querySelector('.appshell')).toHaveClass('is-collapsed');
    expect(window.localStorage.getItem('test.shell')).toBe('1');
  });

  it('reads the stored value after mount (uncontrolled, via persistKey)', () => {
    window.localStorage.setItem('test.shell', '1');
    const { container } = render(
      <AppShell persistKey="test.shell" header={{ center: 'b' }} sections={sections}>x</AppShell>,
    );
    expect(container.querySelector('.appshell')).toHaveClass('is-collapsed');
  });

  it('controlled mode ignores persistKey (host owns state)', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    window.localStorage.setItem('test.shell', '1');
    setItem.mockClear();
    const { container } = render(
      <AppShell collapsed={false} persistKey="test.shell" header={{ center: 'ALBA' }} sections={sections}>x</AppShell>,
    );
    // Stored "1" must NOT override the controlled `collapsed={false}`.
    expect(container.querySelector('.appshell')).not.toHaveClass('is-collapsed');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('without persistKey never touches localStorage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(
      <AppShell collapsedRail header={{ center: 'b' }} sections={sections}>x</AppShell>,
    );
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('does not crash when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: localStorage is not available');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError: localStorage is not available');
    });
    const { container } = render(
      <AppShell persistKey="test.shell" header={{
        left: ({ toggle }) => <button data-testid="t" onClick={toggle}>m</button>,
        center: 'ALBA',
      }} sections={sections}>x</AppShell>,
    );
    expect(container.querySelector('.appshell')).toBeTruthy();
    // toggling still works (write swallowed)
    fireEvent.click(container.querySelector('[data-testid="t"]')!);
    expect(container.querySelector('.appshell')).toHaveClass('is-collapsed');
  });
});
