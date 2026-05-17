import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { Menu } from '../src/components/Display2';
import { AppShell } from '../src/components/AppShell';
import { usePopoverPosition } from '../src/hooks/usePopoverPosition';

describe('Bug 1 — floating panels escape overflow via body portal', () => {
  it('renders the Menu panel in document.body, not inside the scroll container', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <div data-testid="scroller" style={{ overflow: 'auto', height: 80 }}>
        <Menu
          trigger={<button>Open</button>}
          items={[{ label: 'Uno', onSelect }, { label: 'Dos' }]}
        />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    const panel = screen.getByRole('menu');
    expect(panel).toBeInTheDocument();
    // The panel is portaled to <body>, so the overflow:auto wrapper is NOT
    // an ancestor — that's what stops the clipping in tables/cards.
    const scroller = container.querySelector('[data-testid="scroller"]') as HTMLElement;
    expect(scroller.contains(panel)).toBe(false);
    expect(document.body.contains(panel)).toBe(true);
  });

  it('Menu closes on Escape and returns focus to the trigger', () => {
    render(
      <Menu trigger={<button>Open</button>} items={[{ label: 'Uno' }]} />
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(trigger);
    const panel = screen.getByRole('menu');
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('Menu arrow keys move the active item', () => {
    render(
      <Menu
        trigger={<button>Open</button>}
        items={[{ label: 'Uno' }, { label: 'Dos' }, { label: 'Tres' }]}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveClass('is-active');
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitem')[1]).toHaveClass('is-active');
  });
});

describe('usePopoverPosition — reposition listeners', () => {
  it('subscribes to capture-phase scroll + resize while open and cleans up', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const anchor = React.createRef<HTMLDivElement>();
    const content = React.createRef<HTMLDivElement>();
    const { unmount, rerender } = renderHook(
      ({ open }: { open: boolean }) => usePopoverPosition(anchor, content, { open }),
      { initialProps: { open: true } }
    );
    const scrollAdd = add.mock.calls.find(
      (c) => c[0] === 'scroll' && typeof c[2] === 'object' && (c[2] as AddEventListenerOptions).capture
    );
    expect(scrollAdd).toBeTruthy();
    expect(add.mock.calls.some((c) => c[0] === 'resize')).toBe(true);
    rerender({ open: false });
    unmount();
    expect(remove.mock.calls.some((c) => c[0] === 'scroll')).toBe(true);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe('Bug 2 — AppShell collapsed control', () => {
  const sections = [{ items: [{ id: 'h', label: 'Home', href: '#' }] }];

  it('exposes aria-expanded reflecting the collapsed state and stays clickable', () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(
      <AppShell theme="brand" sections={sections} collapsed={false} onCollapsedChange={onCollapsedChange}>
        x
      </AppShell>
    );
    const toggle = screen.getByRole('button', { name: 'Colapsar menú' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);

    rerender(
      <AppShell theme="brand" sections={sections} collapsed onCollapsedChange={onCollapsedChange}>
        x
      </AppShell>
    );
    const collapsedToggle = screen.getByRole('button', { name: 'Expandir menú' });
    expect(collapsedToggle).toHaveAttribute('aria-expanded', 'false');
    // Still in the DOM and clickable while collapsed (re-expand path exists).
    fireEvent.click(collapsedToggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
  });

  it('does not crash when collapsed without a brandCollapsed slot', () => {
    expect(() =>
      render(
        <AppShell sections={sections} brand={<span>BIG BRAND NAME</span>} collapsed>
          x
        </AppShell>
      )
    ).not.toThrow();
  });
});
