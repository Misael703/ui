import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, Drawer } from '../src/components/Overlay';
import { LocaleProvider } from '../src/locale';

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Hola">contenido</Modal>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders with title and closes on Escape', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Hola">contenido</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when a press starts AND ends on the backdrop', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="x">y</Modal>);
    // Modal is portal'd to document.body, so query the document — not container.
    const backdrop = document.querySelector('.modal-backdrop')!;
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT close when the press starts inside and ends on the backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="x">
        <input data-testid="field" defaultValue="texto" />
      </Modal>,
    );
    const backdrop = document.querySelector('.modal-backdrop')!;
    // Press inside (e.g. selecting text in the input), release over backdrop.
    fireEvent.mouseDown(screen.getByTestId('field'));
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does NOT close on a click that bubbles from inside the dialog', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="x">
        <button data-testid="inner">acción</button>
      </Modal>,
    );
    const inner = screen.getByTestId('inner');
    fireEvent.mouseDown(inner);
    fireEvent.click(inner);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Drawer: press starting inside released on backdrop does not close', () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="x">
        <input data-testid="dfield" defaultValue="t" />
      </Drawer>,
    );
    const backdrop = document.querySelector('.drawer-backdrop')!;
    fireEvent.mouseDown(screen.getByTestId('dfield'));
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses esMessages default for close aria-label', () => {
    render(<Modal open onClose={() => {}} title="Hola">x</Modal>);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('respects LocaleProvider override for close aria-label', () => {
    render(
      <LocaleProvider messages={{ 'modal.close': 'Close dialog' }}>
        <Modal open onClose={() => {}} title="Hi">x</Modal>
      </LocaleProvider>
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('Drawer respects LocaleProvider override for close aria-label', () => {
    render(
      <LocaleProvider messages={{ 'drawer.close': 'Close panel' }}>
        <Drawer open onClose={() => {}} title="Hi">x</Drawer>
      </LocaleProvider>
    );
    expect(screen.getByRole('button', { name: 'Close panel' })).toBeInTheDocument();
  });
});
