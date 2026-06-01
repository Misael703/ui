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

  // Regression — Finding D (v1.9.x). On the first open the matchAnchorWidth
  // panel is measured before its `width: a.width` constraint applies, so its
  // getBoundingClientRect().width is the inflated natural width. The viewport
  // clamp must use the width the panel *will* have (the anchor width), not the
  // measured one, or `left` gets yanked to the gutter for a near-edge anchor.
  it('matchAnchorWidth: clamps with the anchor width, not the inflated measured width', () => {
    const rect = (r: Partial<DOMRect>): DOMRect => r as DOMRect;
    const anchorEl = document.createElement('div');
    const contentEl = document.createElement('ul');
    // Anchor near the right edge of the 1024px jsdom viewport.
    anchorEl.getBoundingClientRect = () =>
      rect({ left: 800, right: 1000, top: 100, bottom: 130, width: 200, height: 30 });
    // Unconstrained <ul>: long labels don't wrap → inflated natural width.
    contentEl.getBoundingClientRect = () =>
      rect({ left: 0, right: 900, top: 0, bottom: 200, width: 900, height: 200 });
    const anchor = { current: anchorEl } as React.RefObject<HTMLElement>;
    const content = { current: contentEl } as React.RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      usePopoverPosition(anchor, content, {
        open: true,
        side: 'bottom',
        align: 'start',
        offset: 4,
        matchAnchorWidth: true,
      })
    );

    // Bug would clamp to vw - 900 - 8 = 116; the fix keeps it at the anchor's
    // left (816 still fits 200px wide in a 1024 viewport).
    expect(result.current.left).toBe(800);
    expect(result.current.width).toBe(200);
    expect(result.current.ready).toBe(true);
  });
});

/* Bug 2 (legacy): the side-only built-in chevron collapse toggle was
   removed in v1.31 along with the `side` layout. The collapse is now
   driven exclusively by the consumer's `header.left` render-prop trigger;
   the kit no longer renders a built-in toggle. */
