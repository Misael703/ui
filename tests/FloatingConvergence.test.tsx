import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { NavigationMenu } from '../src/components/NavigationMenu';
import { Menubar } from '../src/components/Menubar';
import { DatePicker } from '../src/components/Pickers';
import { DateRangePicker } from '../src/components/AdvancedPickers';
import { AppShell } from '../src/components/AppShell';

// v1.2.0 — NavigationMenu / Menubar / DatePicker / DateRangePicker now route
// through the shared floating primitive (Portal + usePopoverPosition +
// useDismiss). jsdom has no layout, so these assert structure/behaviour
// (portal target, dismiss, focus, keyboard) — pixels live in Storybook.

const navItems = [
  { id: 'home', label: 'Inicio', href: '/' },
  {
    id: 'prod',
    label: 'Productos',
    links: [
      { id: 'a', label: 'Catálogo', href: '/catalogo' },
      { id: 'b', label: 'Ofertas', href: '/ofertas' },
      { id: 'c', label: 'Novedades', href: '/novedades' },
    ],
  },
];

describe('NavigationMenu — floating primitive + keyboard', () => {
  it('portals the panel to document.body, escaping an overflow ancestor', () => {
    const { container } = render(
      <div data-testid="scroller" style={{ overflow: 'auto', height: 60 }}>
        <NavigationMenu items={navItems} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /Productos/ }));
    // Disclosure of links: the panel is a plain region (id'd), not role="menu".
    const panel = document.getElementById('nav-menu-panel-prod') as HTMLElement;
    const scroller = container.querySelector('[data-testid="scroller"]') as HTMLElement;
    expect(scroller.contains(panel)).toBe(false);
    expect(document.body.contains(panel)).toBe(true);
  });

  it('opens with ArrowDown and moves focus through the links', () => {
    render(<NavigationMenu items={navItems} />);
    const trigger = screen.getByRole('button', { name: /Productos/ });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const panel = document.getElementById('nav-menu-panel-prod') as HTMLElement;
    const links = within(panel).getAllByRole('link');
    expect(document.activeElement).toBe(links[0]);
    fireEvent.keyDown(panel, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(links[1]);
    fireEvent.keyDown(panel, { key: 'End' });
    expect(document.activeElement).toBe(links[2]);
    fireEvent.keyDown(panel, { key: 'Home' });
    expect(document.activeElement).toBe(links[0]);
  });

  it('Escape closes the panel and returns focus to the trigger', () => {
    render(<NavigationMenu items={navItems} />);
    const trigger = screen.getByRole('button', { name: /Productos/ });
    fireEvent.click(trigger);
    const panel = document.getElementById('nav-menu-panel-prod') as HTMLElement;
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(document.getElementById('nav-menu-panel-prod')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

const menubarMenus = [
  {
    id: 'file',
    label: 'Archivo',
    items: [
      { id: 'new', label: 'Nuevo' },
      { id: 'open', label: 'Abrir' },
    ],
  },
  {
    id: 'edit',
    label: 'Editar',
    items: [{ id: 'undo', label: 'Deshacer' }],
  },
];

describe('Menubar — floating primitive + roving', () => {
  it('portals the panel to document.body', () => {
    const { container } = render(
      <div data-testid="scroller" style={{ overflow: 'auto', height: 60 }}>
        <Menubar menus={menubarMenus} />
      </div>
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archivo' }));
    const panel = screen.getByRole('menu');
    const scroller = container.querySelector('[data-testid="scroller"]') as HTMLElement;
    expect(scroller.contains(panel)).toBe(false);
    expect(document.body.contains(panel)).toBe(true);
  });

  it('ArrowRight on an open menu switches to the sibling menu', () => {
    render(<Menubar menus={menubarMenus} />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archivo' }));
    expect(screen.getByRole('menuitem', { name: 'Abrir' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowRight' });
    expect(screen.getByRole('menuitem', { name: 'Deshacer' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Abrir' })).not.toBeInTheDocument();
  });

  it('Escape closes and returns focus to the trigger', () => {
    render(<Menubar menus={menubarMenus} />);
    const trigger = screen.getByRole('menuitem', { name: 'Archivo' });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('DatePicker / DateRangePicker — calendar via primitive', () => {
  it('DatePicker portals the calendar to body and selects a day', () => {
    const onChange = vi.fn();
    const { container } = render(
      <div data-testid="scroller" style={{ overflow: 'auto', height: 40 }}>
        <DatePicker value={null} onChange={onChange} />
      </div>
    );
    fireEvent.focus(container.querySelector('input') as HTMLInputElement);
    const dialog = screen.getByRole('dialog');
    const scroller = container.querySelector('[data-testid="scroller"]') as HTMLElement;
    expect(scroller.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '15' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(15);
  });

  it('DatePicker dismisses on outside pointer-down', () => {
    render(
      <>
        <DatePicker value={null} onChange={() => {}} />
        <button>outside</button>
      </>
    );
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('DateRangePicker portals the panel to body', () => {
    const { container } = render(
      <div data-testid="scroller" style={{ overflow: 'auto', height: 40 }}>
        <DateRangePicker value={{ from: null, to: null }} onChange={() => {}} />
      </div>
    );
    fireEvent.click(screen.getByRole('button'));
    const dialog = screen.getByRole('dialog');
    const scroller = container.querySelector('[data-testid="scroller"]') as HTMLElement;
    expect(scroller.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });
});

/* The `appshell__brand-text` convention was a `side`-only opt-in for the
   brand block to collapse with the rail. The `side` layout was removed in
   v1.31; the brand now lives in `header.center` and is not affected by
   collapse. No equivalent convention is needed in `top`. */
