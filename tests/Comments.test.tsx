import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentThread, AttachmentList } from '../src/components/Comments';

const baseComments = [
  { id: '1', author: { name: 'Patricia' }, body: 'Confirmé el despacho', timestamp: 'hace 2h', internal: false },
  { id: '2', author: { name: 'Misael' }, body: 'Nota privada', timestamp: 'hace 1h', internal: true },
];

describe('CommentThread', () => {
  it('renders all comments', () => {
    render(<CommentThread comments={baseComments} />);
    expect(screen.getByText('Patricia')).toBeInTheDocument();
    expect(screen.getByText('Confirmé el despacho')).toBeInTheDocument();
    expect(screen.getByText('Misael')).toBeInTheDocument();
  });

  it('marks internal comments with "Nota interna" tag', () => {
    render(<CommentThread comments={baseComments} />);
    expect(screen.getByText('Nota interna')).toBeInTheDocument();
  });

  it('triggers onAdd on submit', () => {
    const onAdd = vi.fn();
    render(<CommentThread comments={[]} onAdd={onAdd} />);
    fireEvent.change(screen.getByPlaceholderText(/comentario/), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByText('Enviar'));
    expect(onAdd).toHaveBeenCalledWith('Hola', false);
  });

  it('disables submit when textarea is empty', () => {
    render(<CommentThread comments={[]} onAdd={() => {}} />);
    expect(screen.getByText('Enviar')).toBeDisabled();
  });
});

describe('AttachmentList', () => {
  it('renders empty message when no attachments', () => {
    render(<AttachmentList attachments={[]} />);
    expect(screen.getByText(/Sin archivos/)).toBeInTheDocument();
  });

  it('renders attachments and handles remove', () => {
    const onRemove = vi.fn();
    render(<AttachmentList attachments={[
      { id: '1', name: 'doc.pdf', size: '120 KB', onRemove, url: '#' },
    ]} />);
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Eliminar doc.pdf/));
    expect(onRemove).toHaveBeenCalled();
  });
});
