import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollArea } from '../src/components/Primitives';

describe('ScrollArea', () => {
  it('applies vertical orientation class by default', () => {
    const { container } = render(<ScrollArea><div /></ScrollArea>);
    const el = container.querySelector('.scroll-area');
    expect(el).not.toBeNull();
    expect(el!.classList.contains('scroll-area--vertical')).toBe(true);
  });

  it('honors orientation prop', () => {
    const { container } = render(<ScrollArea orientation="horizontal"><div /></ScrollArea>);
    expect(container.querySelector('.scroll-area--horizontal')).not.toBeNull();
  });

  it('applies maxHeight inline style', () => {
    const { container } = render(<ScrollArea maxHeight={240}><div /></ScrollArea>);
    const el = container.querySelector('.scroll-area') as HTMLElement;
    expect(el.style.maxHeight).toBe('240px');
  });

  it('supports both directions', () => {
    const { container } = render(<ScrollArea orientation="both"><div /></ScrollArea>);
    expect(container.querySelector('.scroll-area--both')).not.toBeNull();
  });
});
