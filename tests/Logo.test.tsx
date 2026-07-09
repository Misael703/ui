import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Logo } from '../src/components/Logo';

describe('Logo', () => {
  it('renders horizontal variant with PNG when format=png', () => {
    render(<Logo variant="horizontal" bg="dark" format="png" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/assets/logos/logo-horizontal-dark.png');
  });

  it('uses preferred SVG when no format specified for horizontal', () => {
    render(<Logo variant="horizontal" bg="light" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/assets/logos/logo-horizontal-light.svg');
  });

  it('uses preferred SVG for vertical', () => {
    render(<Logo variant="vertical" bg="dark" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/assets/logos/logo-vertical-dark.svg');
  });

  it('respects explicit PNG format override for vertical', () => {
    render(<Logo variant="vertical" bg="light" format="png" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/assets/logos/logo-vertical-light.png');
  });

  it('renders <picture> with mobile + desktop sources when responsive', () => {
    const { container } = render(<Logo responsive variant="horizontal" bg="light" />);
    expect(container.querySelector('picture')).toBeInTheDocument();
    expect(container.querySelector('source')).toBeInTheDocument();
  });

  it('respects custom basePath', () => {
    render(<Logo variant="mark" bg="light" basePath="/static/brand" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/static/brand/mark-light.svg');
  });

  it('uses custom alt over brandName', () => {
    render(<Logo alt="Volver al inicio" bg="light" />);
    expect(screen.getByAltText('Volver al inicio')).toBeInTheDocument();
  });

  // Surface-aware default (v1.81.0): bg defaults to "auto", rendering BOTH
  // surface variants so CSS can show the one matching the surface (light by
  // default; the dark-surface variant under data-theme="dark" / an inverse band).
  describe('bg="auto" (default)', () => {
    it('renders both surface variants by default, tagged for the CSS toggle', () => {
      const { container } = render(<Logo variant="horizontal" />);
      expect(container.querySelector('.logo-auto')).toBeInTheDocument();
      const light = container.querySelector('.logo__v--light') as HTMLImageElement;
      const dark = container.querySelector('.logo__v--dark') as HTMLImageElement;
      expect(light.src).toContain('/assets/logos/logo-horizontal-light.svg');
      expect(dark.src).toContain('/assets/logos/logo-horizontal-dark.svg');
    });

    it('an explicit bg opts out of auto (single image, fixed surface)', () => {
      const { container } = render(<Logo variant="mark" bg="light" />);
      expect(container.querySelector('.logo-auto')).toBeNull();
      expect(container.querySelectorAll('img')).toHaveLength(1);
    });
  });

  // The toggle is CSS: hidden dark variant by default, swapped in under the dark
  // theme or an inverse band. Guard the rules so the switch can't silently drop.
  it('CSS toggles the variant by surface (dark theme / inverse band)', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.logo__v--dark\s*\{\s*display:\s*none/);
    expect(css).toMatch(/:root\[data-theme="dark"\]\s*\.logo__v--dark[\s\S]{0,80}display:\s*revert/);
    expect(css).toMatch(/\[data-tone="inverse"\]\s*\.logo__v--dark/);
  });
});
