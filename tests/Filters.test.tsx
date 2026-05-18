import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown, FilterBar, FilterField } from '../src/components/Filters';

describe('FilterPanel', () => {
  it('shows count badge and clear button when active', () => {
    const onClearAll = vi.fn();
    render(<FilterPanel activeCount={3} onClearAll={onClearAll}>filtros aquí</FilterPanel>);
    expect(screen.getByText('3')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Limpiar'));
    expect(onClearAll).toHaveBeenCalled();
  });

  it('hides clear button when count is 0', () => {
    render(<FilterPanel activeCount={0} onClearAll={() => {}}>x</FilterPanel>);
    expect(screen.queryByText('Limpiar')).toBeNull();
  });
});

describe('FilterSection', () => {
  it('toggles open/close', () => {
    render(<FilterSection title="Estado">contenido</FilterSection>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Estado'));
    expect(screen.queryByText('contenido')).toBeNull();
  });
});

describe('BulkActionBar', () => {
  it('does not render when selectedCount is 0', () => {
    const { container } = render(<BulkActionBar selectedCount={0}>x</BulkActionBar>);
    expect(container.firstChild).toBeNull();
  });

  it('renders count and actions', () => {
    render(<BulkActionBar selectedCount={5}><button>Eliminar</button></BulkActionBar>);
    expect(screen.getByText(/5 seleccionados/)).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('uses singular for selectedCount=1', () => {
    render(<BulkActionBar selectedCount={1}>x</BulkActionBar>);
    expect(screen.getByText(/1 seleccionado$/)).toBeInTheDocument();
  });

  it('triggers onClear', () => {
    const onClear = vi.fn();
    render(<BulkActionBar selectedCount={2} onClear={onClear}>x</BulkActionBar>);
    fireEvent.click(screen.getByLabelText('Deseleccionar todo'));
    expect(onClear).toHaveBeenCalled();
  });
});

describe('SortDropdown', () => {
  it('changes value on select', () => {
    const onChange = vi.fn();
    render(
      <SortDropdown
        value="recent"
        onChange={onChange}
        options={[
          { value: 'recent', label: 'Recientes' },
          { value: 'old', label: 'Antiguos' },
        ]}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'old' } });
    expect(onChange).toHaveBeenCalledWith('old');
  });
});

describe('FilterField', () => {
  it('wires the label to the control so it is reachable by accessible name', () => {
    render(
      <FilterField label="Camión">
        <input type="text" />
      </FilterField>
    );
    // The real a11y guarantee: getByLabelText resolves the control.
    expect(screen.getByLabelText('Camión')).toBe(screen.getByRole('textbox'));
  });

  it('respects a consumer-set id instead of overwriting it', () => {
    render(
      <FilterField label="Chofer">
        <input type="text" id="mine" />
      </FilterField>
    );
    const input = screen.getByRole('textbox');
    expect(input.id).toBe('mine');
    expect(screen.getByText('Chofer')).toHaveAttribute('for', 'mine');
  });
});

describe('FilterBar', () => {
  it('applies the kit-owned dense register and grids the fields', () => {
    const { container } = render(
      <FilterBar>
        <FilterField label="Estado"><input /></FilterField>
      </FilterBar>
    );
    const bar = container.querySelector('.filter-bar');
    expect(bar).toHaveClass('fields--dense');
    expect(container.querySelector('.filter-bar__fields .filter-field')).toBeInTheDocument();
  });

  it('renders the actions slot only when provided', () => {
    const { container, rerender } = render(
      <FilterBar><span>f</span></FilterBar>
    );
    expect(container.querySelector('.filter-bar__actions')).toBeNull();
    rerender(
      <FilterBar actions={<button>Limpiar</button>}><span>f</span></FilterBar>
    );
    expect(screen.getByText('Limpiar').closest('.filter-bar__actions')).toBeInTheDocument();
  });

  it('switches to fixed columns when `columns` is set', () => {
    const { container } = render(
      <FilterBar columns={4}><span>f</span></FilterBar>
    );
    const bar = container.querySelector('.filter-bar') as HTMLElement;
    expect(bar).toHaveClass('filter-bar--fixed-cols');
    expect(bar.style.getPropertyValue('--filter-cols')).toBe('4');
  });
});
