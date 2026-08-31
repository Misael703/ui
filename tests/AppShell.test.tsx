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
    // Children stay MOUNTED (the disclosure animates via grid-rows 0fr→1fr;
    // unmounting would kill the transition) but the closed viewport is
    // `inert` — out of the focus order and the a11y tree.
    const viewport = document.querySelector('.appshell__navchildren-viewport')!;
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(viewport.getAttribute('data-state')).toBe('closed');
    expect(viewport.hasAttribute('inert')).toBe(true);
    // Dual-runtime guard (2.0.1, `inertAttr` shim): under the test React
    // (18) the attribute renders as `inert=""`; `inert="false"` (inert-ON
    // for browsers) must never render in any runtime. React 19's opposite
    // path is guarded by the smoke e2e (its consumer app runs React 19).
    expect(viewport.getAttribute('inert')).not.toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(viewport.getAttribute('data-state')).toBe('open');
    expect(viewport.hasAttribute('inert')).toBe(false);
    expect(document.getElementById(btn.getAttribute('aria-controls')!)).not.toBeNull();
  });

  it('CSS: the disclosure animates like Collapsible (grid 0fr→1fr + reduced-motion off)', () => {
    expect(css).toMatch(/\.appshell__navchildren-viewport \{[^}]*grid-template-rows: 0fr/);
    expect(css).toMatch(/\.appshell__navchildren-viewport\[data-state="open"\] \{ grid-template-rows: 1fr/);
    expect(css).toMatch(/prefers-reduced-motion[\s\S]*?\.appshell__navchildren-viewport \{ transition: none/);
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

describe('AppShell — auto-active from currentPath (v1.84.0)', () => {
  const withPath = (
    currentPath: string,
    items: NonNullable<React.ComponentProps<typeof AppShell>['sections']>[number]['items'],
    extra: Partial<React.ComponentProps<typeof AppShell>> = {},
  ) => render(
    <AppShell sections={[{ items }]} currentPath={currentPath} header={{ center: 'X' }} {...extra}>
      <div>c</div>
    </AppShell>
  );
  const current = (name: string) => screen.getByRole('link', { name }).getAttribute('aria-current');

  it('marks the item whose href matches the current path', () => {
    withPath('/pedidos', [
      { id: 'h', label: 'Inicio', href: '/' },
      { id: 'p', label: 'Pedidos', href: '/pedidos' },
    ]);
    expect(current('Pedidos')).toBe('page');
    expect(current('Inicio')).toBeNull();
  });

  it('segment-prefix matches descendants; root / only matches exactly', () => {
    withPath('/pedidos/123', [
      { id: 'p', label: 'Pedidos', href: '/pedidos' },
      { id: 'h', label: 'Inicio', href: '/' },
    ]);
    expect(current('Pedidos')).toBe('page');  // /pedidos active on /pedidos/123
    expect(current('Inicio')).toBeNull();      // root does not prefix-match everything
  });

  it('exact opts out of the descendant match', () => {
    withPath('/pedidos/123', [{ id: 'p', label: 'Pedidos', href: '/pedidos', exact: true }]);
    expect(current('Pedidos')).toBeNull();
  });

  it('an explicit NavItem.active wins over the matcher (both directions)', () => {
    withPath('/pedidos', [
      { id: 'p', label: 'Pedidos', href: '/pedidos', active: false }, // matches path but forced off
      { id: 'x', label: 'Otro', href: '/otro', active: true },        // no match but forced on
    ]);
    expect(current('Pedidos')).toBeNull();
    expect(current('Otro')).toBe('page');
  });

  it('auto-opens the group whose child matches the current path', () => {
    render(
      <AppShell currentPath="/reportes/stock" header={{ center: 'X' }} sections={[{ items: [
        { id: 'g', label: 'Reportes', children: [{ id: 's', label: 'Stock', href: '/reportes/stock' }] },
      ] }]}><div>c</div></AppShell>
    );
    const btn = screen.getByRole('button', { name: /Reportes/ });
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.className).toContain('is-within');
  });

  it('isActive replaces the default matcher', () => {
    withPath('/anything', [{ id: 'p', label: 'Pedidos', href: '/pedidos' }], {
      isActive: (item) => item.id === 'p',
    });
    expect(current('Pedidos')).toBe('page');
  });
});

describe('AppShell CSS guards', () => {
  it('CSS: rail (72px) is scoped to desktop (no rail gap in mobile)', () => {
    // Pre-fix the rail rule fired at every viewport. In mobile the aside is
    // a fixed overlay, so a 72px grid track on the left became a visible
    // empty margin next to the content. Must live inside
    // `@media (min-width: 901px)`.
    expect(css).toMatch(/@media\s*\(min-width:\s*901px\)\s*\{[\s\S]*?\.appshell--header-top\.is-collapsed\s+\.appshell__body\s*\{[^}]*grid-template-columns:\s*72px\s+1fr/);
  });

  it('CSS: group disclosure <button> fills the row like the <a> items', () => {
    // A block-level <a> with width:auto fills the <li> minus margins, but a
    // <button> uses shrink-to-fit even as a flex container — pre-fix the
    // group's hover/hit area shrank to its content width. The calc mirrors
    // the navitem's `margin: 1px 4px` (8px horizontal).
    expect(css).toMatch(/\.appshell__navgroup \{[^}]*width: calc\(100% - 8px\)/);
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
