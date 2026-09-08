import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Button, IconButton } from '../src/components/Button';

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

  it('exposes xs..xl sizes that reach the CSS (was sm|md|lg only)', () => {
    (['xs', 'sm', 'md', 'lg', 'xl'] as const).forEach((s) => {
      const { unmount } = render(<Button size={s}>x</Button>);
      expect(screen.getByRole('button').className).toContain(`btn--${s}`);
      unmount();
    });
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

describe('IconButton', () => {
  it('renders an icon-only button with its required accessible name', () => {
    render(<IconButton icon={<svg data-testid="ic" />} aria-label="Cerrar" />);
    const btn = screen.getByRole('button', { name: 'Cerrar' });
    expect(btn.className).toContain('btn--icon');
    expect(btn.className).toContain('btn--ghost'); // default variant
    expect(btn.querySelector('[data-testid="ic"]')).toBeTruthy();
  });

  it('shows the currentColor spinner and disables while loading', () => {
    render(<IconButton icon={<svg />} aria-label="Guardar" loading />);
    const btn = screen.getByRole('button', { name: 'Guardar' });
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.spinner--current')).toBeTruthy();
  });
});

describe('Button hideLabel (v3.7.0)', () => {
  it('true: wraps the label in .btn__label and squares the button (btn--hide-label)', () => {
    render(<Button iconLeft={<svg data-testid="ico" />} hideLabel>Exportar</Button>);
    const btn = screen.getByRole('button', { name: 'Exportar' });
    expect(btn).toHaveClass('btn--hide-label');
    expect(btn.querySelector('.btn__label')).toHaveTextContent('Exportar');
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });
  it('"mobile": only the mobile modifier, label wrapped', () => {
    render(<Button hideLabel="mobile">Exportar</Button>);
    const btn = screen.getByRole('button', { name: 'Exportar' });
    expect(btn).toHaveClass('btn--hide-label-mobile');
    expect(btn).not.toHaveClass('btn--hide-label');
  });
  it('default: children render bare (byte-identical to before)', () => {
    render(<Button>Exportar</Button>);
    expect(screen.getByRole('button').querySelector('.btn__label')).toBeNull();
  });
  it('CSS: the clipped label keeps the accessible name; the mobile variant lives under the 600px query', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');
    expect(css).toMatch(/\.btn--hide-label \.btn__label \{[^}]*clip-path:\s*inset\(50%\)/);
    expect(css).toMatch(/@media \(max-width: 600px\) \{\s*\.btn--hide-label-mobile \{[^}]*aspect-ratio:\s*1/);
    expect(css).toMatch(/\.btn--hide-label\.btn--sm \{[^}]*width:\s*36px/);
  });
});
