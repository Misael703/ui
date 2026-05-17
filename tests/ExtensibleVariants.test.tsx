import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../src/components/Button';
import { Badge, Card } from '../src/components/Display';

// These would be type errors before v1.6.0 (closed unions). The point of the
// test is partly that it *compiles* (consumer-defined variants), and that the
// kit still emits the BEM class the consumer styles against.
describe('Extensible variants', () => {
  it('Button accepts and emits a consumer-defined variant', () => {
    render(<Button variant="brand-x">Custom</Button>);
    const btn = screen.getByRole('button', { name: 'Custom' });
    expect(btn.className).toContain('btn--brand-x');
  });

  it('Badge accepts a consumer-defined variant', () => {
    render(<Badge variant="brand-x">Tag</Badge>);
    expect(screen.getByText('Tag').className).toContain('badge--brand-x');
  });

  it('Card accepts a consumer-defined accent', () => {
    const { container } = render(<Card accent="brand-x">c</Card>);
    expect(container.querySelector('.card--accent-brand-x')).toBeInTheDocument();
  });

  it('known variants still autocomplete and work (regression)', () => {
    render(<Button variant="danger">Borrar</Button>);
    expect(screen.getByRole('button', { name: 'Borrar' }).className).toContain('btn--danger');
  });
});
