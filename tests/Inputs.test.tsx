import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, NumberInput, EmptyState, Kpi } from '../src/components/Inputs';
import { LocaleProvider } from '../src/locale';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Pagination', () => {
  it('renders info and navigates', () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={55} onPageChange={onChange} />);
    expect(screen.getByText(/11–20 de 55/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Página siguiente'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('disables prev on first page', () => {
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
  });

  it('collapses (renders nothing) when everything fits one page', () => {
    const { container } = render(
      <Pagination page={1} pageSize={10} total={7} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('collapses when the list is empty', () => {
    const { container } = render(
      <Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('still renders when there is more than one page', () => {
    render(<Pagination page={1} pageSize={10} total={11} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument();
  });

  it('respects LocaleProvider override for prev/next/range', () => {
    render(
      <LocaleProvider
        messages={{
          'pagination.prev': 'Previous page',
          'pagination.next': 'Next page',
          'pagination.range': '{from}–{to} of {total}',
        }}
      >
        <Pagination page={2} pageSize={10} total={55} onPageChange={() => {}} />
      </LocaleProvider>
    );
    expect(screen.getByText('11–20 of 55')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });
});

describe('NumberInput', () => {
  it('increments and clamps to max', () => {
    const onChange = vi.fn();
    render(<NumberInput value={4} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('adds the block modifier when fullWidth', () => {
    const { container } = render(<NumberInput value={1} onChange={() => {}} fullWidth />);
    expect(container.querySelector('.number-input--block')).toBeInTheDocument();
  });

  it('omits the block modifier by default', () => {
    const { container } = render(<NumberInput value={1} onChange={() => {}} />);
    expect(container.querySelector('.number-input--block')).toBeNull();
  });

  it('blurs on wheel so scrolling over a focused field cannot native-step the value', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput value={3} onChange={onChange} />);
    const input = container.querySelector('.number-input__field') as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);
    fireEvent.wheel(input);
    // Native ±step only fires while focused; blurring on wheel removes the path.
    expect(document.activeElement).not.toBe(input);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Vacío" description="Nada acá" />);
    expect(screen.getByText('Vacío')).toBeInTheDocument();
    expect(screen.getByText('Nada acá')).toBeInTheDocument();
  });
});

describe('Kpi', () => {
  it('shows value and delta', () => {
    render(<Kpi label="Ventas" value="$1.2M" delta={{ value: '12%', trend: 'up' }} />);
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('$1.2M')).toBeInTheDocument();
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });
});

/**
 * `size` (v3.5.0). NumberInput had ONE size — `--control-h-md`, 36px buttons,
 * an 80px field — about 150px per row, out of proportion in a numeric table
 * cell. The consumer (despachos picking table) overrode it app-side and left
 * a "follow-up: NumberInput size=sm" note; the sibling QuantitySelector already
 * had sm/md. Pinned: `sm` on --control-h-sm with 28px buttons, `md` default
 * unchanged except the field floor (80 → 64px).
 */
describe('NumberInput size (v3.5.0)', () => {
  const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  it('size="sm" adds the modifier; default md adds none (byte-identical class list)', () => {
    const { container, rerender } = render(<NumberInput value={1} onChange={() => {}} size="sm" />);
    expect(container.firstElementChild).toHaveClass('number-input--sm');
    rerender(<NumberInput value={1} onChange={() => {}} />);
    expect(container.firstElementChild!.className).toBe('number-input');
  });
  it('CSS: sm sits on --control-h-sm with 28px buttons and a 48px field floor', () => {
    const root = css.match(/\.number-input--sm\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(root).toMatch(/height:\s*var\(--control-h-sm\)/);
    const btn = css.match(/\.number-input--sm\s+\.number-input__btn\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(btn).toMatch(/width:\s*28px/);
    const field = css.match(/\.number-input--sm\s+\.number-input__field\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(field).toMatch(/min-width:\s*48px/);
  });
  it('CSS: md field floor is 64px (was 80px — too wide for a unit counter)', () => {
    const field = css.match(/(^|\})\s*\.number-input__field\s*\{([^}]*)\}/)?.[2] ?? '';
    expect(field).toMatch(/min-width:\s*64px/);
  });
});

describe('Pagination page list keeps a fixed number of slots (v3.7.0)', () => {
  const labels = () => screen.getAllByRole('button').map((b) => b.textContent?.trim()).filter((t) => t && /^\d+$/.test(t));
  const ellipses = () => document.querySelectorAll('.pagination__ellipsis').length;
  it('page 1 of 11: 1 2 3 4 5 … 11', () => {
    render(<Pagination page={1} pageSize={10} total={110} onPageChange={() => {}} />);
    expect(labels()).toEqual(['1', '2', '3', '4', '5', '11']);
    expect(ellipses()).toBe(1);
  });
  it('page 6 of 11: 1 … 5 6 7 … 11', () => {
    render(<Pagination page={6} pageSize={10} total={110} onPageChange={() => {}} />);
    expect(labels()).toEqual(['1', '5', '6', '7', '11']);
    expect(ellipses()).toBe(2);
  });
  it('page 11 of 11: 1 … 7 8 9 10 11', () => {
    render(<Pagination page={11} pageSize={10} total={110} onPageChange={() => {}} />);
    expect(labels()).toEqual(['1', '7', '8', '9', '10', '11']);
    expect(ellipses()).toBe(1);
  });
  it('7 pages or fewer: every page, no ellipsis', () => {
    render(<Pagination page={3} pageSize={10} total={70} onPageChange={() => {}} />);
    expect(labels()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    expect(ellipses()).toBe(0);
  });
});

