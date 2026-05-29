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

  /* Side mobile drawer (v1.31.0) — iOS Safari URL-bar safety + binary
     drawer (no collapsed-rail intermediate state in mobile). */
  it('CSS: side mobile aside uses 100vh + 100dvh fallback (no `bottom: 0`)', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.appshell__sidebar\s*\{[^}]*height:\s*100vh[^}]*height:\s*100dvh/);
  });

  it('CSS: side mobile-open neutralizes is-collapsed label hide effects', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.appshell\.is-collapsed\.is-mobile-open\s+\.appshell__navlabel[^{]*\{[^}]*opacity:\s*1/);
    expect(css).toMatch(/\.appshell\.is-collapsed\.is-mobile-open\s+\.appshell__navlabel-section\s*\{[^}]*visibility:\s*visible/);
    expect(css).toMatch(/\.appshell\.is-collapsed\.is-mobile-open\s+\.appshell__brand\s*\{[^}]*padding:\s*12px\s+20px/);
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

  /* Audit P1 #4 fix (v1.31.0): the side brand sidebar must carry
     `data-tone="inverse"` so descendants (Avatar / Badge / inline icons /
     links) re-scope their foreground tokens. Pre-fix, only the `top` brand
     HEADER carried inverse — the `side` brand sidebar surface was the only
     band where descendants kept default foreground colors (potential AA
     contrast failure on text against the brand-primary surface). */
  it('side brand sidebar carries data-tone="inverse" (band-aware descendants)', () => {
    const { container } = render(
      <AppShell theme="brand" brand="A" sections={[]}>
        <div />
      </AppShell>
    );
    const aside = container.querySelector('aside.appshell__sidebar');
    expect(aside?.getAttribute('data-tone')).toBe('inverse');
  });

  it('side default sidebar does NOT carry data-tone (no re-scoping in light theme)', () => {
    const { container } = render(
      <AppShell brand="A" sections={[]}>
        <div />
      </AppShell>
    );
    const aside = container.querySelector('aside.appshell__sidebar');
    expect(aside?.hasAttribute('data-tone')).toBe(false);
  });

  /* Side mobile drawer UX (v1.31.0): pre-fix the chevron button inside the
     drawer kept toggling `collapsed` even when the drawer was open in mobile
     — a UX dead-end where the drawer stayed 280px wide but lost all labels
     (CSS hid them via `.is-collapsed`). Plus: no ESC, no focus trap, no
     scroll lock. These tests pin the fix. */
  function withMatchMedia(matches: boolean, fn: () => void) {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try { fn(); } finally { window.matchMedia = original; }
  }

  it('side mobile open: chevron click closes the drawer (not toggles collapse)', () => {
    withMatchMedia(true, () => {
      const sidebarSections = [
        { label: 'Op', items: [
          { id: 'a', label: 'Inicio', href: '/a' },
          { id: 'b', label: 'Pedidos', href: '/b' },
        ] },
      ];
      const { container, getByLabelText } = render(
        <AppShell brand="A" sections={sidebarSections}>
          <div />
        </AppShell>
      );
      // Open the drawer via the hamburger.
      fireEvent.click(getByLabelText(/Abrir menú/i));
      expect(container.querySelector('.appshell')).toHaveClass('is-mobile-open');
      expect(container.querySelector('.appshell')).not.toHaveClass('is-collapsed');
      // The chevron now reads "Cerrar menú", not "Colapsar menú".
      const chevron = container.querySelector('.appshell__collapse') as HTMLButtonElement;
      expect(chevron?.getAttribute('aria-label')).toBe('Cerrar menú');
      fireEvent.click(chevron);
      // Drawer closes; `collapsed` left untouched.
      expect(container.querySelector('.appshell')).not.toHaveClass('is-mobile-open');
      expect(container.querySelector('.appshell')).not.toHaveClass('is-collapsed');
    });
  });

  it('side desktop: chevron click still toggles collapsed (original behaviour)', () => {
    withMatchMedia(false, () => {
      const { container, getByLabelText } = render(
        <AppShell brand="A" sections={[]}>
          <div />
        </AppShell>
      );
      const chevron = getByLabelText(/Colapsar menú/i);
      fireEvent.click(chevron);
      expect(container.querySelector('.appshell')).toHaveClass('is-collapsed');
      expect(container.querySelector('.appshell')).not.toHaveClass('is-mobile-open');
    });
  });

  it('side mobile open: ESC closes the drawer', () => {
    withMatchMedia(true, () => {
      const { container, getByLabelText } = render(
        <AppShell brand="A" sections={[]}>
          <div />
        </AppShell>
      );
      fireEvent.click(getByLabelText(/Abrir menú/i));
      expect(container.querySelector('.appshell')).toHaveClass('is-mobile-open');
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(container.querySelector('.appshell')).not.toHaveClass('is-mobile-open');
    });
  });

  it('side mobile open: body scroll is locked while open, released on close', () => {
    withMatchMedia(true, () => {
      document.body.style.overflow = '';
      const { getByLabelText } = render(
        <AppShell brand="A" sections={[]}>
          <div />
        </AppShell>
      );
      const hamburger = getByLabelText(/Abrir menú/i);
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.click(hamburger);
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  it('side mobile closed: aria-hidden lands on the aside (state, not ref)', async () => {
    await new Promise<void>((resolve) => {
      withMatchMedia(true, () => {
        const { container } = render(
          <AppShell brand="A" sections={[]}>
            <div />
          </AppShell>
        );
        setTimeout(() => {
          const aside = container.querySelector('aside.appshell__sidebar');
          expect(aside?.getAttribute('aria-hidden')).toBe('true');
          resolve();
        }, 0);
      });
    });
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
