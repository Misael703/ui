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

  // Requisito duro (EL-75): un value seleccionado que NO está en options debe
  // renderizar chip igual, para no perderse en silencio al guardar.
  it('renders a removable chip for a value outside options via resolveLabel', () => {
    render(
      <MultiCombobox
        value={['ghost', 'a']}
        onChange={vi.fn()}
        options={[{ value: 'a', label: 'Alpha' }]}
        resolveLabel={(v) => (v === 'ghost' ? 'Pedro (inactivo)' : undefined)}
      />
    );
    // El chip del value fuera de options se muestra con el label resuelto...
    expect(screen.getByText('Pedro (inactivo)')).toBeInTheDocument();
    // ...y es removible (tiene su botón X con aria-label).
    expect(screen.getByRole('button', { name: /Pedro \(inactivo\)/ })).toBeInTheDocument();
  });

  it('falls back to the raw value when the label is unresolvable (never omits)', () => {
    render(
      <MultiCombobox value={['ghost']} onChange={vi.fn()} options={[{ value: 'a', label: 'Alpha' }]} />
    );
    expect(screen.getByText('ghost')).toBeInTheDocument();
  });

  it('removing an out-of-options chip targets exactly that value', () => {
    const onChange = vi.fn();
    render(
      <MultiCombobox
        value={['ghost', 'a']}
        onChange={onChange}
        options={[{ value: 'a', label: 'Alpha' }]}
        resolveLabel={() => 'Fantasma'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Fantasma/ }));
    expect(onChange).toHaveBeenCalledWith(['a']);
  });

  it('deselecting an in-options value preserves an out-of-options value (no silent loss)', () => {
    const onChange = vi.fn();
    render(
      <MultiCombobox
        value={['ghost', 'a']}
        onChange={onChange}
        options={[{ value: 'a', label: 'Alpha' }]}
        resolveLabel={() => 'Fantasma'}
      />
    );
    fireEvent.focus(screen.getByRole('combobox'));
    // Toggle the known option OFF from the listbox; the unknown value must stay.
    fireEvent.mouseDown(screen.getByRole('option', { name: /Alpha/ }));
    expect(onChange).toHaveBeenCalledWith(['ghost']);
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

  describe('apply mode (uncontrolled)', () => {
    // Picks two day buttons inside the popover. Avoids button names from the
    // trigger/nav/actions by filtering to numeric labels (1–31).
    const pickTwoDays = (dialog: HTMLElement) => {
      const dayBtns = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button.daterange__day'))
        .filter((b) => !b.disabled);
      expect(dayBtns.length).toBeGreaterThanOrEqual(2);
      fireEvent.click(dayBtns[0]);
      fireEvent.click(dayBtns[1]);
      return [dayBtns[0], dayBtns[1]] as const;
    };

    it('day clicks do not fire onApply; the Apply button commits once', () => {
      const onApply = vi.fn();
      render(
        <DateRangePicker
          defaultValue={{ from: null, to: null }}
          onApply={onApply}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Seleccionar rango/i }));
      const dialog = screen.getByRole('dialog');
      pickTwoDays(dialog);
      expect(onApply).not.toHaveBeenCalled();
      fireEvent.click(screen.getByText('Aplicar'));
      expect(onApply).toHaveBeenCalledTimes(1);
      const arg = onApply.mock.calls[0][0];
      expect(arg.from).toBeInstanceOf(Date);
      expect(arg.to).toBeInstanceOf(Date);
    });

    it('Clear commits the empty range (fires onApply) and closes — the filter can be reset', () => {
      // Regression: Clear used to only reset the draft, never firing onApply.
      // Since Apply requires from+to, the empty state could never be applied —
      // an apply-mode filter got stuck forever. Clear must reset the filter.
      const onApply = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <DateRangePicker
          defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 0, 10) }}
          onApply={onApply}
          onOpenChange={onOpenChange}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /2026/ }));
      fireEvent.click(screen.getByText('Limpiar'));
      // onApply fired with the empty range → consumer clears its filter.
      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply.mock.calls[0][0]).toEqual({ from: null, to: null });
      // Popover closed (standard filter-clear pattern).
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      // Trigger label fell back to the empty placeholder.
      expect(screen.getByRole('button', { name: /Seleccionar rango/i })).toBeInTheDocument();
    });

    it('Clear in legacy mode (onChange, no onApply) propagates the empty range', () => {
      const onChange = vi.fn();
      render(<DateRangePicker value={{ from: new Date(2026, 0, 1), to: new Date(2026, 0, 10) }} onChange={onChange} />);
      fireEvent.click(screen.getByRole('button', { name: /2026/ }));
      fireEvent.click(screen.getByText('Limpiar'));
      expect(onChange).toHaveBeenLastCalledWith({ from: null, to: null });
    });

    it('Escape dismisses without firing onApply and reverts the draft', () => {
      const onApply = vi.fn();
      const initial = { from: new Date(2026, 0, 1), to: new Date(2026, 0, 10) };
      render(<DateRangePicker defaultValue={initial} onApply={onApply} />);
      const trigger = screen.getByRole('button', { name: /2026/ });
      fireEvent.click(trigger);
      const dialog = screen.getByRole('dialog');
      pickTwoDays(dialog);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onApply).not.toHaveBeenCalled();
      // Reopen — trigger label still shows the original applied range.
      const triggerAfter = screen.getByRole('button', { name: /2026-01-01|01-01-2026|1\/1\/2026/ });
      expect(triggerAfter).toBeInTheDocument();
    });

    it('preset commits and closes the popover', () => {
      const onApply = vi.fn();
      const range = { from: new Date(2026, 5, 1), to: new Date(2026, 5, 7) };
      render(
        <DateRangePicker
          defaultValue={{ from: null, to: null }}
          onApply={onApply}
          presets={[{ label: 'Semana fija', range: () => range }]}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Seleccionar rango/i }));
      fireEvent.click(screen.getByText('Semana fija'));
      expect(onApply).toHaveBeenCalledTimes(1);
      expect(onApply.mock.calls[0][0]).toEqual(range);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('onOpenChange fires on open and close transitions', () => {
      const onOpenChange = vi.fn();
      render(
        <DateRangePicker
          defaultValue={{ from: null, to: null }}
          onApply={() => {}}
          onOpenChange={onOpenChange}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Seleccionar rango/i }));
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
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
