import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
