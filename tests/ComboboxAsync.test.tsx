import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Combobox } from '../src/components/Pickers';

const OPTS = [
  { value: 'a', label: 'Martillo' },
  { value: 'b', label: 'Taladro' },
  { value: 'c', label: 'Sierra' },
];

const open = () => fireEvent.focus(screen.getByRole('combobox'));
const type = (text: string) =>
  fireEvent.change(screen.getByRole('combobox'), { target: { value: text } });

describe('Combobox async (onQueryChange + loading)', () => {
  it('onQueryChange recibe cada query tipeada', () => {
    const onQueryChange = vi.fn();
    render(<Combobox value={null} onChange={() => {}} options={OPTS} onQueryChange={onQueryChange} />);
    open();
    type('tal');
    expect(onQueryChange).toHaveBeenCalledWith('tal');
  });

  it('en modo async NO filtra en el cliente: muestra las options tal cual llegan', () => {
    // El "server" devolvió un match fuzzy que el substring local ocultaría.
    render(
      <Combobox value={null} onChange={() => {}} options={OPTS} onQueryChange={() => {}} />
    );
    open();
    type('zzz');
    // Sin async, 'zzz' no matchea nada; con async las 3 siguen visibles.
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('un filter explícito vuelve a filtrar encima del modo async', () => {
    render(
      <Combobox
        value={null}
        onChange={() => {}}
        options={OPTS}
        onQueryChange={() => {}}
        filter={(o, q) => o.label.toLowerCase().startsWith(q.toLowerCase())}
      />
    );
    open();
    type('ta');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Taladro')).toBeInTheDocument();
  });

  it('sin onQueryChange el filtro substring por defecto sigue activo (no breaking)', () => {
    render(<Combobox value={null} onChange={() => {}} options={OPTS} />);
    open();
    type('sie');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Sierra')).toBeInTheDocument();
  });

  it('loading sin options muestra la fila "Cargando" en vez del empty', () => {
    render(
      <Combobox value={null} onChange={() => {}} options={[]} onQueryChange={() => {}} loading />
    );
    open();
    expect(screen.getByText(/Cargando/)).toBeInTheDocument();
    expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  });

  it('loading con options visibles las mantiene (stale-while-revalidate)', () => {
    render(
      <Combobox value={null} onChange={() => {}} options={OPTS} onQueryChange={() => {}} loading />
    );
    open();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
  });

  it('seleccionar resetea la query y notifica onQueryChange("")', () => {
    const onChange = vi.fn();
    const onQueryChange = vi.fn();
    render(
      <Combobox value={null} onChange={onChange} options={OPTS} onQueryChange={onQueryChange} />
    );
    open();
    type('tal');
    fireEvent.mouseDown(screen.getByText('Taladro'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(onQueryChange).toHaveBeenLastCalledWith('');
  });

  it('sin loading y sin matches el empty sigue apareciendo', () => {
    render(<Combobox value={null} onChange={() => {}} options={[]} onQueryChange={() => {}} />);
    open();
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });
});
