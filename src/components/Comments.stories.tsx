import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommentThread, AttachmentList } from './Comments';

export default { title: 'Patterns/Comments', tags: ['autodocs'] } as Meta;

export const CommentThreadDemo: StoryObj = {
  render: () => {
    const [comments, setComments] = React.useState([
      { id: '1', author: { name: 'Patricia Rojas' }, body: 'Cliente pidió adelantar el despacho a mañana 8 AM.', timestamp: 'hace 2 días', internal: false },
      { id: '2', author: { name: 'Misael Ocas' }, body: 'Confirmé con bodega, va incluida la guía de despacho actualizada.', timestamp: 'ayer', internal: true },
    ]);
    return (
      <div style={{ maxWidth: 600 }}>
        <CommentThread
          comments={comments}
          allowInternal
          onAdd={(body, internal) => {
            setComments((c) => [...c, {
              id: String(c.length + 1),
              author: { name: 'Tú' },
              body,
              timestamp: 'ahora',
              internal,
            }]);
          }}
        />
      </div>
    );
  },
};

/**
 * **Inline (chat-style) compose** (v1.35.0, refined in 1.36.1) —
 * `inputLayout="inline"` makes the textarea + submit share a single row,
 * the textarea auto-grows up to ~5 lines, and Enter submits while
 * Shift+Enter inserts a newline. Use it for short, chat-like coordination
 * (Linear/Slack pattern). `allowInternal` is ignored in this mode by
 * design — if you need the internal toggle, stay on the default `stacked`
 * layout.
 *
 * **Behaviour to verify in the docs preview:** the empty / 1-line state
 * shows no scrollbar and the "Enviar" button is vertically centered with
 * the placeholder. Type `Shift+Enter` to wrap to multiple lines: the
 * wrap class flips to `.is-grown`, the textarea anchors the button to
 * the bottom-right, and the scrollbar appears only past ~5 lines.
 */
export const CommentThreadInline: StoryObj = {
  name: 'CommentThread · Inline (chat-style)',
  render: () => {
    const [empty, setEmpty] = React.useState<Array<{ id: string; author: { name: string }; body: React.ReactNode; timestamp: React.ReactNode; internal?: boolean }>>([]);
    const [withHistory, setWithHistory] = React.useState([
      { id: '1', author: { name: 'Patricia Rojas' }, body: 'Cliente llamó, va a pasar a buscar el despacho a las 11:00.', timestamp: 'hace 10 min' },
      { id: '2', author: { name: 'Misael Ocas' }, body: 'Listo, dejo la guía firmada arriba del mostrador.', timestamp: 'hace 3 min' },
    ]);
    const append = (set: typeof setEmpty) => (body: string) =>
      set((c) => [...c, { id: String(c.length + 1), author: { name: 'Tú' }, body, timestamp: 'ahora' }]);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 960 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Empty state</div>
          <CommentThread comments={empty} onAdd={append(setEmpty)} inputLayout="inline" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>Con historial</div>
          <CommentThread comments={withHistory} onAdd={append(setWithHistory)} inputLayout="inline" />
        </div>
      </div>
    );
  },
};

export const AttachmentListDemo: StoryObj = {
  render: () => {
    const [files, setFiles] = React.useState([
      { id: '1', name: 'cotizacion-1042.pdf', size: '245 KB', uploadedBy: 'Misael Ocas', uploadedAt: 'hace 2h', url: '#' },
      { id: '2', name: 'foto-despacho.jpg', size: '1.2 MB', uploadedBy: 'Bodega Norte', uploadedAt: 'hace 30min', url: '#' },
      { id: '3', name: 'guia-despacho.pdf', size: '89 KB', uploadedBy: 'Patricia Rojas', uploadedAt: 'hace 5min', url: '#' },
    ]);
    return (
      <div style={{ maxWidth: 480 }}>
        <AttachmentList
          attachments={files.map((f) => ({ ...f, onRemove: () => setFiles((curr) => curr.filter((x) => x.id !== f.id)) }))}
        />
      </div>
    );
  },
};

export const AttachmentVacio: StoryObj = {
  render: () => <AttachmentList attachments={[]} />,
};
