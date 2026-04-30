import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown } from '../src/components/Filters';

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
