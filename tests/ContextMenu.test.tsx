import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from '../src/components/ContextMenu';

describe('ContextMenu', () => {
  it('shows menu on right click and triggers item action', () => {
    const onCopy = vi.fn();
    render(
      <ContextMenu
        items={[
          { id: 'copy', label: 'Copiar', onSelect: onCopy },
          { id: 'sep', separator: true },
          { id: 'delete', label: 'Eliminar', danger: true },
        ]}
      >
        <div data-testid="target">Right-click me</div>
      </ContextMenu>
    );
    const target = screen.getByTestId('target');
    fireEvent.contextMenu(target);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copiar' }));
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it('closes on Escape and restores focus to the opener', () => {
    render(
      <ContextMenu items={[{ id: 'a', label: 'A' }]}>
        <button data-testid="target">x</button>
      </ContextMenu>
    );
    const target = screen.getByTestId('target');
    target.focus();
    fireEvent.contextMenu(target);
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    // Focus moved into the menu on open (menu keyboard contract).
    expect(document.activeElement).toHaveAttribute('role', 'menuitem');
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(target).toHaveFocus();
  });

  it('is keyboard navigable: ArrowDown skips disabled items, Enter selects', () => {
    const onA = vi.fn();
    const onC = vi.fn();
    render(
      <ContextMenu
        items={[
          { id: 'a', label: 'A', onSelect: onA },
          { id: 'b', label: 'B', disabled: true },
          { id: 'c', label: 'C', onSelect: onC },
        ]}
      >
        <div data-testid="target">x</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByTestId('target'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // A -> C (skips disabled B)
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(onC).toHaveBeenCalledOnce();
    expect(onA).not.toHaveBeenCalled();
  });

  it('opens via Shift+F10 from the focused child (keyboard opener)', () => {
    render(
      <ContextMenu items={[{ id: 'a', label: 'A' }]}>
        <button data-testid="target">x</button>
      </ContextMenu>
    );
    const target = screen.getByTestId('target');
    target.focus();
    fireEvent.keyDown(target, { key: 'F10', shiftKey: true });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
