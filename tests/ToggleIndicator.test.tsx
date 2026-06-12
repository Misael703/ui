import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ToggleGroup, ToggleGroupItem, SegmentedControl, SegmentedControlItem } from '../src/components/Toggle';

const seg = (props: Partial<React.ComponentProps<typeof SegmentedControl>> = {}) =>
  render(
    <SegmentedControl defaultValue="a" ariaLabel="Vista" {...props}>
      <SegmentedControlItem value="a">Tabla</SegmentedControlItem>
      <SegmentedControlItem value="b">Tarjetas</SegmentedControlItem>
    </SegmentedControl>
  );

describe('ToggleGroup sliding indicator', () => {
  it('SegmentedControl lo trae por defecto: pill aria-hidden detrás de los items', () => {
    const { container } = seg();
    const pill = container.querySelector('.toggle-group__indicator');
    expect(pill).not.toBeNull();
    expect(pill).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.toggle-group')!.className).toContain('toggle-group--has-indicator');
  });

  it('indicator={false} lo apaga en SegmentedControl', () => {
    const { container } = seg({ indicator: false });
    expect(container.querySelector('.toggle-group__indicator')).toBeNull();
    expect(container.querySelector('.toggle-group')!.className).not.toContain('has-indicator');
  });

  it('ToggleGroup single NO lo trae por defecto (opt-in)', () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="a" ariaLabel="g">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(container.querySelector('.toggle-group__indicator')).toBeNull();
  });

  it('type="multiple" lo ignora aunque se pida (un pill no puede ser dos)', () => {
    const { container } = render(
      <ToggleGroup type="multiple" indicator defaultValue={['a']} ariaLabel="g">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(container.querySelector('.toggle-group__indicator')).toBeNull();
  });

  it('la selección sigue funcionando con el indicador presente', () => {
    const { container, getByRole } = seg();
    fireEvent.click(getByRole('button', { name: 'Tarjetas' }));
    const items = container.querySelectorAll('.toggle-group__item');
    expect(items[1]).toHaveAttribute('data-state', 'on');
    expect(items[0]).toHaveAttribute('data-state', 'off');
  });

  it('jsdom sin ResizeObserver: renderiza sin crashear (typeof guard)', () => {
    // Este test ES la regresión: la versión sin guard tiraba
    // "ResizeObserver is not defined" en el layout effect.
    expect(() => seg()).not.toThrow();
  });
});
