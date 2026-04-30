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

  it('closes on Escape', () => {
    render(
      <ContextMenu items={[{ id: 'a', label: 'A' }]}>
        <div data-testid="target">x</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByTestId('target'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
