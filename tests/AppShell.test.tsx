import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppShell, PageHeader } from '../src/components/AppShell';

/**
 * Sidebar-layout header alignment guard. The brand header (top of the
 * sidebar) and the topbar (top of main) must keep the SAME height in both
 * expanded and collapsed states, so their bottom dividers stay colinear at
 * the sidebar/main corner. The regression: collapsing changed the brand's
 * VERTICAL padding (12px → 16px), making it 8px taller than the topbar.
 * Guard that the collapsed brand keeps a 12px vertical padding.
 */
describe('AppShell sidebar header alignment (CSS)', () => {
  const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  it('collapsed brand keeps the expanded 12px vertical padding (divider stays aligned with topbar)', () => {
    const m = css.match(/\.appshell\.is-collapsed\s+\.appshell__brand\s*\{([^}]*)\}/);
    expect(m, 'collapsed brand rule must exist').toBeTruthy();
    const padding = m![1].match(/padding:\s*([^;]+);/)?.[1].trim();
    // vertical token is the first value; must be 12px, never 16px.
    expect(padding?.startsWith('12px'), `collapsed brand padding = "${padding}", expected vertical 12px`).toBe(true);
  });
});

describe('AppShell', () => {
  it('renders sections, brand and content', () => {
    const select = vi.fn();
    render(
      <AppShell
        brand="ALBA"
        topbar={<span>Topbar</span>}
        sections={[
          {
            label: 'Principal',
            items: [
              { id: 'home', label: 'Inicio', active: true },
              { id: 'orders', label: 'Pedidos', onSelect: select },
            ],
          },
        ]}
      >
        <div>Contenido</div>
      </AppShell>
    );
    expect(screen.getByText('ALBA')).toBeInTheDocument();
    expect(screen.getByText('Topbar')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Pedidos'));
    expect(select).toHaveBeenCalled();
  });

  it('toggles collapsed', () => {
    render(
      <AppShell brand="A" sections={[]}>
        <div />
      </AppShell>
    );
    fireEvent.click(screen.getByLabelText(/Colapsar/i));
    expect(screen.getByLabelText(/Expandir/i)).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('renders title, breadcrumbs and actions', () => {
    render(
      <PageHeader
        title="Pedidos"
        description="Listado completo"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Pedidos' },
        ]}
        actions={<button type="button">Nuevo</button>}
      />
    );
    expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeInTheDocument();
    expect(screen.getByText('Listado completo')).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });
});
