import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/Button';

describe('Button', () => {
  it('renders children and variant class', () => {
    render(<Button variant="primary">Guardar</Button>);
    const btn = screen.getByRole('button', { name: /guardar/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('btn--primary');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows spinner and disables when loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders all variants without crashing', () => {
    const variants = [
      'primary', 'secondary', 'outline', 'ghost', 'subtle',
      'danger', 'success', 'warning', 'link',
    ] as const;
    variants.forEach((v) => {
      const { unmount, container } = render(<Button variant={v}>x</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain(`btn--${v}`);
      unmount();
    });
  });
});
