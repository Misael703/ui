import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Carousel } from '../src/components/Carousel';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('Carousel', () => {
  it('dot is a 24×24 tap target with the visual dot in a ::before (WCAG 2.5.8)', () => {
    // The button is the hit area (24×24); the small visual lives in
    // `::before` so the tap target can meet the floor without enlarging
    // the dot. Caught by the smoke touch-target sweep at 375px.
    const dot = css.match(/\.carousel__dot\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(dot).toMatch(/width:\s*24px/);
    expect(dot).toMatch(/height:\s*24px/);
    const before = css.match(/\.carousel__dot::before\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(before).toMatch(/width:\s*8px/);
  });

  it('navigates with prev/next buttons', () => {
    const onChange = vi.fn();
    render(
      <Carousel onIndexChange={onChange}>
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </Carousel>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('disables prev at first and next at last when not loop', () => {
    render(
      <Carousel>
        <div>A</div>
        <div>B</div>
      </Carousel>
    );
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('navigates with dots', () => {
    const onChange = vi.fn();
    render(
      <Carousel onIndexChange={onChange}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </Carousel>
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Ir a la diapositiva 3' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('autoplay pauses while the pointer is inside (WCAG 2.2.2)', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { container } = render(
      <Carousel autoplay autoplayInterval={1000} loop onIndexChange={onChange}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </Carousel>
    );
    const region = container.querySelector('.carousel')!;
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onChange).toHaveBeenLastCalledWith(1);

    fireEvent.mouseEnter(region);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onChange).toHaveBeenLastCalledWith(1); // paused: no further advance

    fireEvent.mouseLeave(region);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onChange).toHaveBeenLastCalledWith(2);
    vi.useRealTimers();
  });
});
