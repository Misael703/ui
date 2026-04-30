import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  MultiCombobox, DateRangePicker, CommandPalette,
} from '../src/components/AdvancedPickers';

describe('MultiCombobox', () => {
  it('toggles selection and renders chips', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MultiCombobox
        value={[]}
        onChange={onChange}
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Bravo' },
        ]}
      />
    );
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.mouseDown(screen.getByText('Alpha'));
    expect(onChange).toHaveBeenCalledWith(['a']);
    rerender(
      <MultiCombobox
        value={['a']}
        onChange={onChange}
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Bravo' },
        ]}
      />
    );
    // "Alpha" aparece tanto en el chip seleccionado como en la opción del listbox
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
  });
});

describe('DateRangePicker', () => {
  it('opens popover on trigger click', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker value={{ from: null, to: null }} onChange={onChange} />
    );
    const trigger = screen.getByRole('button', { name: /Seleccionar rango/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
  });
});

describe('CommandPalette', () => {
  it('filters items and runs on Enter', () => {
    const a = vi.fn();
    const b = vi.fn();
    const onClose = vi.fn();
    render(
      <CommandPalette
        open
        onClose={onClose}
        items={[
          { id: '1', label: 'Crear pedido', group: 'Acciones', onRun: a },
          { id: '2', label: 'Buscar cliente', group: 'Acciones', onRun: b },
        ]}
      />
    );
    const input = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(input, { target: { value: 'cliente' } });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(b).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} items={[]} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
