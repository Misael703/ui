import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Menubar } from '../src/components/Menubar';

describe('Menubar', () => {
  it('opens a menu and triggers item action', () => {
    const onOpen = vi.fn();
    render(
      <Menubar
        menus={[
          {
            id: 'file',
            label: 'Archivo',
            items: [
              { id: 'open', label: 'Abrir', onSelect: onOpen, shortcut: '⌘O' },
              { id: 'sep', separator: true },
              { id: 'close', label: 'Cerrar', disabled: true },
            ],
          },
        ]}
      />
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archivo' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: /Abrir/ }));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
