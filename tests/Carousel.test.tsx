import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel } from '../src/components/Carousel';

describe('Carousel', () => {
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
});
