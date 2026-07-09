import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, NumberInput, EmptyState, Kpi } from '../src/components/Inputs';
import { LocaleProvider } from '../src/locale';

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
