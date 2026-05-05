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

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="x">y</Modal>);
    // Modal is portal'd to document.body, so query the document — not container.
    const backdrop = document.querySelector('.modal-backdrop')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
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
