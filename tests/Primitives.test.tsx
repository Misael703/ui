import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AspectRatio, Separator, ScrollArea } from '../src/components/Primitives';

describe('AspectRatio', () => {
  it('applies aspect-ratio style from ratio prop', () => {
    const { container } = render(<AspectRatio ratio={16 / 9}><img alt="x" src="/a.png" /></AspectRatio>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.aspectRatio).toBe(String(16 / 9));
    expect(el.style.position).toBe('relative');
  });
});

describe('Separator', () => {
  it('renders horizontal by default with role="none" when decorative', () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('separator--horizontal');
    expect(el).toHaveAttribute('role', 'none');
  });

  it('uses role="separator" when not decorative', () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});

describe('ScrollArea', () => {
  it('applies maxHeight and overflow', () => {
    const { container } = render(
      <ScrollArea maxHeight={200}>
        <div style={{ height: 1000 }}>tall</div>
      </ScrollArea>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.maxHeight).toBe('200px');
    expect(el.style.overflowY).toBe('auto');
  });
});
