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

    it('Clear empties the draft without firing onApply', () => {
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
      fireEvent.click(screen.getByText('Limpiar'));
      expect(onApply).not.toHaveBeenCalled();
      // Apply button is disabled when draft is empty
      const applyBtn = screen.getByText('Aplicar') as HTMLButtonElement;
      expect(applyBtn.disabled).toBe(true);
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
