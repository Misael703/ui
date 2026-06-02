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

  describe('inputLayout="inline"', () => {
    it('applies the inline modifier class and renders textarea + button as siblings', () => {
      const { container } = render(
        <CommentThread comments={[]} onAdd={() => {}} inputLayout="inline" />
      );
      const compose = container.querySelector('.comments__compose');
      expect(compose).not.toBeNull();
      expect(compose!.classList.contains('comments__compose--inline')).toBe(true);
      // Children: textarea then button.
      const kids = Array.from(compose!.children);
      expect(kids[0]?.tagName).toBe('TEXTAREA');
      expect(kids[1]?.tagName).toBe('BUTTON');
    });

    it('Enter (without Shift) submits in inline mode', () => {
      const onAdd = vi.fn();
      render(<CommentThread comments={[]} onAdd={onAdd} inputLayout="inline" />);
      const ta = screen.getByPlaceholderText(/comentario/) as HTMLTextAreaElement;
      fireEvent.change(ta, { target: { value: 'Hola' } });
      fireEvent.keyDown(ta, { key: 'Enter' });
      expect(onAdd).toHaveBeenCalledWith('Hola', false);
    });

    it('Shift+Enter does NOT submit in inline mode (newline)', () => {
      const onAdd = vi.fn();
      render(<CommentThread comments={[]} onAdd={onAdd} inputLayout="inline" />);
      const ta = screen.getByPlaceholderText(/comentario/) as HTMLTextAreaElement;
      fireEvent.change(ta, { target: { value: 'Hola' } });
      fireEvent.keyDown(ta, { key: 'Enter', shiftKey: true });
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('empty state does NOT carry the .is-grown modifier (button stays vertically centered)', () => {
      const { container } = render(
        <CommentThread comments={[]} onAdd={() => {}} inputLayout="inline" />
      );
      const compose = container.querySelector('.comments__compose')!;
      expect(compose.classList.contains('comments__compose--inline')).toBe(true);
      expect(compose.classList.contains('is-grown')).toBe(false);
    });

    it('multi-line draft flips the wrap into .is-grown', () => {
      // jsdom doesn't compute layout — scrollHeight is always 0. Stub
      // the getter so the auto-grow effect observes a growth past
      // baseline + epsilon. The stub is per-instance via _stub on the
      // node, restored to the prototype default after the test.
      const proto = HTMLTextAreaElement.prototype;
      const original = Object.getOwnPropertyDescriptor(proto, 'scrollHeight');
      Object.defineProperty(proto, 'scrollHeight', {
        configurable: true,
        get(this: HTMLTextAreaElement & { _stub?: number }) {
          return this._stub ?? 0;
        },
      });
      try {
        const { container } = render(
          <CommentThread comments={[]} onAdd={() => {}} inputLayout="inline" />
        );
        const ta = container.querySelector('textarea')! as HTMLTextAreaElement & { _stub?: number };
        // First paint with draft='' captured baseline at scrollHeight=0.
        const compose = container.querySelector('.comments__compose')!;
        expect(compose.classList.contains('is-grown')).toBe(false);
        // Simulate the textarea growing past the 1-line baseline by 96px.
        ta._stub = 96;
        fireEvent.change(ta, { target: { value: 'line one\nline two\nline three' } });
        expect(compose.classList.contains('is-grown')).toBe(true);
      } finally {
        if (original) Object.defineProperty(proto, 'scrollHeight', original);
        else delete (proto as unknown as Record<string, unknown>).scrollHeight;
      }
    });

    it('hides the allowInternal checkbox in inline mode even if allowInternal=true', () => {
      const { container } = render(
        <CommentThread comments={[]} onAdd={() => {}} allowInternal inputLayout="inline" />
      );
      expect(container.querySelector('.comments__internal-toggle')).toBeNull();
    });

    it('stacked (default) still fires onAdd via the Enviar button, not Enter', () => {
      const onAdd = vi.fn();
      render(<CommentThread comments={[]} onAdd={onAdd} />);
      const ta = screen.getByPlaceholderText(/comentario/) as HTMLTextAreaElement;
      fireEvent.change(ta, { target: { value: 'Hola' } });
      // Enter in stacked is a no-op for submit (default newline).
      fireEvent.keyDown(ta, { key: 'Enter' });
      expect(onAdd).not.toHaveBeenCalled();
      fireEvent.click(screen.getByText('Enviar'));
      expect(onAdd).toHaveBeenCalledWith('Hola', false);
    });
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
