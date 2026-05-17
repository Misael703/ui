import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slot, Slottable } from '../src/components/Primitives';
import { Button } from '../src/components/Button';

describe('Slot', () => {
  it('renders the child element and merges className', () => {
    const { container } = render(
      <Slot className="kit-cls" data-x="1">
        <a href="/x" className="own">link</a>
      </Slot>,
    );
    const a = container.querySelector('a');
    expect(a).toBeInTheDocument();
    expect(a).toHaveAttribute('href', '/x');
    expect(a?.className).toContain('kit-cls');
    expect(a?.className).toContain('own');
    expect(a).toHaveAttribute('data-x', '1');
  });

  it('composes event handlers (child first, then slot)', () => {
    const calls: string[] = [];
    render(
      <Slot onClick={() => calls.push('slot')}>
        <button onClick={() => calls.push('child')}>go</button>
      </Slot>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(calls).toEqual(['child', 'slot']);
  });

  it('composes refs', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Slot ref={ref}>
        <a href="/y">y</a>
      </Slot>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe('Button asChild', () => {
  it('renders the provided element instead of <button>', () => {
    render(<Button asChild variant="primary"><a href="/go">Ir</a></Button>);
    const link = screen.getByRole('link', { name: 'Ir' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/go');
    expect(link.className).toContain('btn');
    expect(link.className).toContain('btn--primary');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('preserves iconLeft and children inside the slotted element', () => {
    render(
      <Button asChild iconLeft={<span data-testid="ico" />}>
        <a href="/x">Texto</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: /Texto/ });
    expect(link.querySelector('[data-testid="ico"]')).toBeInTheDocument();
    expect(link).toHaveTextContent('Texto');
  });

  it('merges onClick and exposes aria-disabled when disabled', () => {
    const onClick = vi.fn();
    render(<Button asChild disabled onClick={onClick}><a href="/x">X</a></Button>);
    const link = screen.getByRole('link', { name: 'X' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('still renders a <button> when asChild is not set (regression)', () => {
    render(<Button variant="danger">Borrar</Button>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.className).toContain('btn--danger');
  });
});
