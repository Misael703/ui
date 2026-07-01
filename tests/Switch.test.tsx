import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Switch } from '../src/components/Form';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');

describe('Switch — containing block (hidden input cannot escape the label)', () => {
  // The hidden <input> is position:absolute. If its own label (.switch) is not
  // a containing block (position:relative), the input escapes to the consumer's
  // nearest positioned ancestor (e.g. a scroll container), inflating its height
  // and stealing the layout. Guard the label-is-relative invariant at the source.
  it('.switch establishes a positioned containing block for its absolute input', () => {
    expect(css).toMatch(/\.switch \{[^}]*position:\s*relative[^}]*\}/);
    expect(css).toMatch(/\.switch input \{[^}]*position:\s*absolute/);
  });
});

describe('Switch — exactly one change per user interaction', () => {
  it('fires onChange once when the track is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<Switch onChange={onChange}>Activar</Switch>);
    fireEvent.click(container.querySelector('.switch__track') as HTMLElement);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('fires onChange once when the label is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<Switch onChange={onChange}>Activar</Switch>);
    fireEvent.click(container.querySelector('.switch') as HTMLElement);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('nets exactly one state toggle per click when controlled', () => {
    function Ctl() {
      const [on, setOn] = React.useState(false);
      return <Switch checked={on} onChange={(e) => setOn(e.target.checked)} />;
    }
    const { container } = render(<Ctl />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
    fireEvent.click(container.querySelector('.switch__track') as HTMLElement);
    expect(input.checked).toBe(true);
  });

  it('fires onChange once when activated through the input (keyboard Space path)', () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
