import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, NumberInput, EmptyState, Kpi } from '../src/components/Inputs';

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
});

describe('NumberInput', () => {
  it('increments and clamps to max', () => {
    const onChange = vi.fn();
    render(<NumberInput value={4} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(5);
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
