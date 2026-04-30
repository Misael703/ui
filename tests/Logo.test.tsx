import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../src/components/Logo';

describe('Logo', () => {
  it('renders mark light by default', () => {
    render(<Logo />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/assets/logos/mark-light.svg');
  });

  it('renders horizontal variant with PNG when format=png', () => {
    render(<Logo variant="horizontal" bg="dark" format="png" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/assets/logos/logo-horizontal-dark.png');
  });

  it('uses preferred SVG when no format specified for horizontal', () => {
    render(<Logo variant="horizontal" />);
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
    const { container } = render(<Logo responsive variant="horizontal" />);
    expect(container.querySelector('picture')).toBeInTheDocument();
    expect(container.querySelector('source')).toBeInTheDocument();
  });

  it('respects custom basePath', () => {
    render(<Logo variant="mark" basePath="/static/brand" />);
    const img = screen.getByAltText('El Alba') as HTMLImageElement;
    expect(img.src).toContain('/static/brand/mark-light.svg');
  });

  it('uses custom alt over brandName', () => {
    render(<Logo alt="Volver al inicio" />);
    expect(screen.getByAltText('Volver al inicio')).toBeInTheDocument();
  });
});
