import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle, ToggleGroup, ToggleGroupItem } from '../src/components/Toggle';

describe('Toggle', () => {
  it('toggles pressed state', () => {
    const onChange = vi.fn();
    render(<Toggle onPressedChange={onChange}>Bold</Toggle>);
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('respects controlled pressed prop', () => {
    const { rerender } = render(<Toggle pressed={true}>Italic</Toggle>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    rerender(<Toggle pressed={false}>Italic</Toggle>);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ToggleGroup single', () => {
  it('selects only one item at a time', () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="a" onChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>
    );
    const a = screen.getByRole('button', { name: 'A' });
    const b = screen.getByRole('button', { name: 'B' });
    expect(a).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(b);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(b).toHaveAttribute('aria-pressed', 'true');
    expect(a).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ToggleGroup multiple', () => {
  it('toggles items independently', () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="multiple" defaultValue={['a']} onChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(onChange).toHaveBeenLastCalledWith(['b']);
  });
});
