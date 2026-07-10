import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppShell, PageHeader } from '../src/components/AppShell';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('AppShell', () => {
  it('renders sections and content', () => {
    render(
      <AppShell
        sections={[
          {
            label: 'Principal',
            items: [
              { id: 'home', label: 'Inicio', active: true },
              { id: 'orders', label: 'Pedidos' },
            ],
          },
        ]}
        header={{ center: 'ALBA' }}
      >
        <div>Contenido</div>
      </AppShell>
    );
    expect(screen.getByText('ALBA')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
  });
});

describe('AppShell — P1 nav at scale (v1.83.0)', () => {
  const shell = (sections: React.ComponentProps<typeof AppShell>['sections']) =>
    render(<AppShell sections={sections} header={{ center: 'X' }}><div>c</div></AppShell>);

  it('renders a skip-to-content link (first focusable) targeting main', () => {
    const { container } = shell([{ items: [{ id: 'a', label: 'Inicio' }] }]);
    const skip = container.querySelector('.appshell__skip-link') as HTMLAnchorElement;
    expect(skip).not.toBeNull();
    expect(skip.getAttribute('href')).toBe('#appshell-content');
    expect(container.querySelector('.appshell')!.firstElementChild).toBe(skip);
    const main = container.querySelector('main')!;
    expect(main.id).toBe('appshell-content');
    expect(main.getAttribute('tabindex')).toBe('-1');
  });

  it('a NavItem with children is a collapsible disclosure group', () => {
    shell([{ items: [{ id: 'g', label: 'Reportes', children: [
      { id: 'r1', label: 'Ventas' }, { id: 'r2', label: 'Stock' },
    ] }] }]);
    const btn = screen.getByRole('button', { name: /Reportes/ });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Ventas')).toBeNull(); // closed → children not in DOM
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(document.getElementById(btn.getAttribute('aria-controls')!)).not.toBeNull();
  });

  it('auto-opens the group holding the active item and marks it is-within', () => {
    shell([{ items: [{ id: 'g', label: 'Reportes', children: [
      { id: 'r1', label: 'Ventas', active: true },
    ] }] }]);
    const btn = screen.getByRole('button', { name: /Reportes/ });
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.className).toContain('is-within');
    expect(screen.getByText('Ventas')).toBeInTheDocument();
  });
});

describe('AppShell CSS guards', () => {
  it('CSS: rail (72px) is scoped to desktop (no rail gap in mobile)', () => {
    // Pre-fix the rail rule fired at every viewport. In mobile the aside is
    // a fixed overlay, so a 72px grid track on the left became a visible
    // empty margin next to the content. Must live inside
    // `@media (min-width: 901px)`.
    expect(css).toMatch(/@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.appshell--header-top\.appshell--rail\.is-collapsed\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*72px\s+1fr/);
  });
});

describe('PageHeader', () => {
  it('renders title, breadcrumbs and actions', () => {
    render(
      <PageHeader
        title="Pedidos"
        description="Administra los pedidos"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Pedidos' },
        ]}
        actions={<button>Nuevo</button>}
      />
    );
    expect(screen.getByText('Pedidos', { selector: 'h1' })).toBeInTheDocument();
    expect(screen.getByText('Administra los pedidos')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });
});
