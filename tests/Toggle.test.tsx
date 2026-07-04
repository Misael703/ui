import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Toggle, ToggleGroup, ToggleGroupItem, SegmentedControl, SegmentedControlItem } from '../src/components/Toggle';
import { Rows3 } from '../src/components/Icons';

describe('Toggle focus ring (CSS)', () => {
  it('.toggle and .toggle-group__item show a focus-visible ring like every other control', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    const m = css.match(/\.toggle:focus-visible[^{]*\{([^}]*)\}/);
    expect(m, '.toggle:focus-visible rule must exist').toBeTruthy();
    expect(m![1]).toMatch(/box-shadow:\s*var\(--focus-ring-accent\)/);
    expect(css).toMatch(/\.toggle-group__item:focus-visible/);
  });
});

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

describe('ToggleGroupItem icon prop', () => {
  it('renders the icon before the label (icon + text segment)', () => {
    render(
      <SegmentedControl ariaLabel="Vista" defaultValue="table">
        <SegmentedControlItem value="table" icon={<Rows3 />}>Tabla</SegmentedControlItem>
      </SegmentedControl>
    );
    const btn = screen.getByRole('button', { name: 'Tabla' });
    const svg = btn.querySelector('svg');
    expect(svg).toBeTruthy();
    // icon precedes the text node
    expect(btn.firstElementChild?.tagName.toLowerCase()).toBe('svg');
    expect(btn).toHaveTextContent('Tabla');
  });

  it('supports an icon-only segment named via aria-label (no children)', () => {
    render(
      <SegmentedControl ariaLabel="Vista" defaultValue="table">
        <SegmentedControlItem value="table" icon={<Rows3 />} aria-label="Tabla" />
      </SegmentedControl>
    );
    // Accessible name comes from aria-label, not text.
    const btn = screen.getByRole('button', { name: 'Tabla' });
    expect(btn).toHaveTextContent('');
    expect(btn.querySelector('svg')).toBeTruthy();
  });

  it('children-only still works (icon prop is optional, back-compat)', () => {
    render(
      <ToggleGroup type="single" defaultValue="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
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
