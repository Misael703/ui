import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TableToolbar } from '../src/components/DataTable';
import { FilterBar } from '../src/components/Filters';
import { Button } from '../src/components/Button';

/**
 * `overflow` (v3.7.0): toolbar actions as DATA so the kit renders them inline
 * on a desk (ghost sm + icon) and behind a "⋯" menu on a phone. jsdom has no
 * matchMedia; stubbed per test.
 */
const stub = (matches: boolean) => Object.defineProperty(window, 'matchMedia', {
  configurable: true, writable: true,
  value: (media: string) => ({ matches, media, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }),
});
const actions = (onSelect = () => {}) => [{ label: 'Exportar', icon: <svg data-testid="ico" />, onSelect }];

describe('TableToolbar overflow', () => {
  it('wide: inline tertiary buttons after the children', () => {
    stub(false);
    const onSelect = vi.fn();
    render(<TableToolbar overflow={actions(onSelect)}><span>buscar</span></TableToolbar>);
    const btn = screen.getByRole('button', { name: 'Exportar' });
    expect(btn).toHaveClass('btn--ghost', 'btn--sm');
    expect(btn.querySelector('[data-testid="ico"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Más opciones' })).toBeNull();
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
  it('narrow: a "Más opciones" menu holds the actions', () => {
    stub(true);
    const onSelect = vi.fn();
    render(<TableToolbar overflow={actions(onSelect)}><span>buscar</span></TableToolbar>);
    expect(screen.queryByRole('button', { name: 'Exportar' })).toBeNull();
    const more = screen.getByRole('button', { name: 'Más opciones' });
    expect(more).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.click(more);
    fireEvent.click(screen.getByRole('menuitem', { name: /Exportar/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
  it('destructive actions render ghost-danger inline', () => {
    stub(false);
    render(<TableToolbar overflow={[{ label: 'Vaciar', destructive: true }]} />);
    expect(screen.getByRole('button', { name: 'Vaciar' })).toHaveClass('btn--ghost-danger');
  });
});

describe('FilterBar overflow', () => {
  it('wide: joins `actions` inside .filter-bar__actions', () => {
    stub(false);
    const { container } = render(<FilterBar actions={<button type="button">Limpiar</button>} overflow={actions()}><div /></FilterBar>);
    const box = container.querySelector('.filter-bar__actions')!;
    expect(box.textContent).toContain('Limpiar');
    expect(box.querySelector('.btn--ghost')).toHaveTextContent('Exportar');
  });
  it('narrow: Limpiar stays visible, Exportar goes behind the menu', () => {
    stub(true);
    render(<FilterBar actions={<button type="button">Limpiar</button>} overflow={actions()}><div /></FilterBar>);
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Exportar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Más opciones' })).toBeInTheDocument();
  });
});

describe('Button hideLabel="desktop" + ghost-danger (v3.7.0)', () => {
  it('desktop: mirror modifier, label still the accessible name', () => {
    render(<Button size="xs" variant="ghost-danger" hideLabel="desktop">Borrar</Button>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    expect(btn).toHaveClass('btn--hide-label-desktop', 'btn--ghost-danger', 'btn--xs');
  });
  it('CSS: desktop variant lives under min-width 601px; ghost-danger is neutral at rest, red on hover', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');
    expect(css).toMatch(/@media \(min-width: 601px\) \{\s*\.btn--hide-label-desktop \{[^}]*aspect-ratio:\s*1/);
    expect(css).toMatch(/\.btn--hide-label-desktop\.btn--xs \{[^}]*width:\s*28px/);
    expect(css).toMatch(/\.btn--ghost-danger \{[^}]*color:\s*var\(--fg-default\)/);
    expect(css).toMatch(/\.btn--ghost-danger:hover:not\(:disabled\),\s*\.btn--ghost-danger:focus-visible \{[^}]*color:\s*var\(--color-danger\)/);
    // the toolbar search shrinks its basis on a phone so search + funnel + ⋯ fit 320px
    expect(css).toMatch(/@media \(max-width: 600px\) \{\s*\.table-toolbar > \.grow,[\s\S]*?flex-basis:\s*120px/);
  });
});
