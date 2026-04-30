import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hero, Testimonial, CategoryNav } from '../src/components/Marketing';

describe('Hero', () => {
  it('renders title, subtitle and actions', () => {
    render(
      <Hero
        title="Bienvenido"
        subtitle="Una descripción"
        actions={<button>Empezar</button>}
        eyebrow="Eyebrow"
      />
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bienvenido');
    expect(screen.getByText('Una descripción')).toBeInTheDocument();
    expect(screen.getByText('Empezar')).toBeInTheDocument();
    expect(screen.getByText('Eyebrow')).toBeInTheDocument();
  });

  it('applies image tone when image prop is set', () => {
    const { container } = render(<Hero title="x" image="/bg.jpg" />);
    expect(container.querySelector('.hero--image')).toBeInTheDocument();
  });
});

describe('Testimonial', () => {
  it('renders quote and author', () => {
    render(
      <Testimonial
        quote="Excelente servicio"
        author="Ana"
        role="Cliente"
        company="Acme"
      />
    );
    expect(screen.getByText(/Excelente servicio/)).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Cliente.*Acme/)).toBeInTheDocument();
  });

  it('renders rating when provided', () => {
    render(<Testimonial quote="x" author="A" rating={5} />);
    expect(screen.getByLabelText('5 de 5 estrellas')).toBeInTheDocument();
  });
});

describe('CategoryNav', () => {
  const cats = [
    { id: 'a', label: 'Cat A', href: '#' },
    {
      id: 'b', label: 'Cat B',
      groups: [{ title: 'Sub', items: [{ label: 'Sub1', href: '#' }] }],
    },
  ];

  it('renders simple links', () => {
    render(<CategoryNav categories={cats} />);
    expect(screen.getByText('Cat A')).toBeInTheDocument();
    expect(screen.getByText('Cat B')).toBeInTheDocument();
  });

  it('opens mega menu on click', () => {
    render(<CategoryNav categories={cats} />);
    fireEvent.click(screen.getByText('Cat B'));
    expect(screen.getByText('Sub1')).toBeInTheDocument();
  });
});
