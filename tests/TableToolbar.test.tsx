import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableToolbar } from '../src/components/DataTable';

describe('TableToolbar', () => {
  it('renders children', () => {
    render(<TableToolbar><span>filtros</span></TableToolbar>);
    expect(screen.getByText('filtros')).toBeInTheDocument();
  });

  it('applies table-toolbar class', () => {
    const { container } = render(<TableToolbar>x</TableToolbar>);
    expect(container.querySelector('.table-toolbar')).toBeInTheDocument();
  });
});
