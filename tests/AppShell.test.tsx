import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell, PageHeader } from '../src/components/AppShell';

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
