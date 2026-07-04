import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Button } from '../src/components/Button';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel: string) =>
  css.match(new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';

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

  it('loading spinner inherits currentColor so it stays visible on light variants', () => {
    // A hardcoded white ring (spinner--inverse) was invisible on
    // outline/ghost/subtle/link/warning. It must ride on currentColor now.
    const { container } = render(<Button variant="outline" loading>x</Button>);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeTruthy();
    expect(spinner!.className).toContain('spinner--current');
    expect(spinner!.className).not.toContain('spinner--inverse');
    const spin = rule('.spinner--current');
    expect(spin).toMatch(/border-top-color:\s*currentColor/i);
  });

  it('asChild + disabled actually blocks the slotted element', () => {
    render(
      <Button asChild disabled>
        <a href="/x">Ir</a>
      </Button>,
    );
    const link = screen.getByText('Ir');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    // and the CSS neutralises pointer interaction on aria-disabled
    const blocked = rule('.btn[aria-disabled="true"]');
    expect(blocked).toMatch(/pointer-events:\s*none/);
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

  describe('CSS: variant="link" cancels the press animation', () => {
    it('the global press still scales + shadows (other variants keep it)', () => {
      const press = rule('.btn:active:not(:disabled)');
      expect(press).toMatch(/transform:\s*scale\(0?\.98\)/);
      expect(press).toMatch(/box-shadow:\s*var\(--shadow-xs\)/);
    });

    it('.btn--link:active resets transform + box-shadow (no press for a text link)', () => {
      const linkActive = rule('.btn--link:active:not(:disabled)');
      expect(linkActive).toMatch(/transform:\s*none/);
      expect(linkActive).toMatch(/box-shadow:\s*none/);
    });
  });
});
