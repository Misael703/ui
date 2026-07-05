import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationMenu } from '../src/components/NavigationMenu';

describe('NavigationMenu', () => {
  it('renders simple links and expandable submenus', () => {
    render(
      <NavigationMenu
        items={[
          { id: 'home', label: 'Inicio', href: '/' },
          {
            id: 'productos',
            label: 'Productos',
            links: [
              { id: 'a', label: 'Catálogo', href: '/catalogo', description: 'Todos los productos' },
              { id: 'b', label: 'Ofertas', href: '/ofertas' },
            ],
          },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: /Productos/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Disclosure of links, not a menu: the revealed items are real links, not
    // role="menuitem" (site nav shouldn't emit menu semantics).
    expect(screen.getByRole('link', { name: /Catálogo/ })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).toBeNull();
    expect(trigger).toHaveAttribute('aria-controls', 'nav-menu-panel-productos');
  });
});
