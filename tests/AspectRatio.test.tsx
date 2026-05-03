import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AspectRatio } from '../src/components/Primitives';

describe('AspectRatio', () => {
  it('applies aspect-ratio inline style', () => {
    const { container } = render(<AspectRatio ratio={16 / 9}><img src="" alt="" /></AspectRatio>);
    const div = container.querySelector('.aspect-ratio') as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.style.aspectRatio).toBe(String(16 / 9));
  });

  it('defaults to widescreen 16/9 ratio', () => {
    const { container } = render(<AspectRatio><div /></AspectRatio>);
    const div = container.querySelector('.aspect-ratio') as HTMLElement;
    expect(div.style.aspectRatio).toBe(String(16 / 9));
  });

  it('forwards extra HTML props and className', () => {
    const { container } = render(
      <AspectRatio ratio={1} className="custom" data-testid="ar"><span /></AspectRatio>
    );
    const div = container.querySelector('.aspect-ratio') as HTMLElement;
    expect(div.className).toContain('custom');
    expect(div.getAttribute('data-testid')).toBe('ar');
  });
});
