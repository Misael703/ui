import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableCell } from '../src/components/Editing';

const enter = (el: Element) => fireEvent.keyDown(el, { key: 'Enter' });
const escape = (el: Element) => fireEvent.keyDown(el, { key: 'Escape' });

describe('EditableCell', () => {
  it('en reposo muestra el valor (formateado si hay formatDisplay) como botón', () => {
    render(<EditableCell value="45000" onCommit={() => {}} formatDisplay={(v) => `$${Number(v).toLocaleString('es-CL')}`} ariaLabel="Editar precio" />);
    const btn = screen.getByRole('button', { name: 'Editar precio' });
    expect(btn).toHaveTextContent('$45.000');
  });

  it('click entra a edición con el valor CRUDO, focus y selección', () => {
    render(<EditableCell value="45000" onCommit={() => {}} formatDisplay={(v) => `$${v}`} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('45000'); // crudo, no "$45000"
    expect(document.activeElement).toBe(input);
  });

  it('Enter comitea el draft y vuelve a reposo', async () => {
    const onCommit = vi.fn();
    render(<EditableCell value="a" onCommit={onCommit} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'b' } });
    enter(input);
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith('b'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('blur comitea (semántica Airtable/Notion)', async () => {
    const onCommit = vi.fn();
    render(<EditableCell value="a" onCommit={onCommit} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'c' } });
    fireEvent.blur(input);
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith('c'));
  });

  it('Escape cancela sin comitear, incluso con el blur posterior', () => {
    const onCommit = vi.fn();
    render(<EditableCell value="a" onCommit={onCommit} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'z' } });
    escape(input);
    fireEvent.blur(input); // el blur que sigue al Esc no debe comitear
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('a');
  });

  it('valor sin cambios: sale de edición sin llamar onCommit', () => {
    const onCommit = vi.fn();
    render(<EditableCell value="a" onCommit={onCommit} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    enter(screen.getByRole('textbox'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('validate bloquea el commit y marca is-invalid', () => {
    const onCommit = vi.fn();
    render(
      <EditableCell value="5" onCommit={onCommit} ariaLabel="Editar"
        validate={(v) => (Number(v) < 0 ? 'Debe ser positivo' : null)} />
    );
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '-1' } });
    enter(input);
    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('title', 'Debe ser positivo');
  });

  it('commit async rechazado: sigue editando con el draft intacto y error', async () => {
    const onCommit = vi.fn().mockRejectedValue(new Error('500'));
    render(<EditableCell value="a" onCommit={onCommit} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'b' } });
    enter(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input.value).toBe('b'); // el tipeo no se pierde
    expect(input.title).toMatch(/No se pudo guardar/);
  });

  it('commit async pendiente deshabilita el input', async () => {
    let resolve!: () => void;
    const onCommit = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    render(<EditableCell value="a" onCommit={onCommit} ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'b' } });
    enter(input);
    await waitFor(() => expect(input).toBeDisabled());
    resolve();
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('disabled: no entra a edición', () => {
    render(<EditableCell value="a" onCommit={() => {}} disabled ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('type number renderiza input numérico', () => {
    render(<EditableCell value="5" onCommit={() => {}} type="number" ariaLabel="Editar" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });
});
