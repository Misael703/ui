import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommentThread, type CommentItem } from './Comments';

const meta = {
  title: 'Components/CommentThread',
  component: CommentThread,
  tags: ['autodocs'],
  args: { comments: [] },
  argTypes: {
    inputLayout: { control: 'inline-radio', options: ['stacked', 'inline'] },
  },
} satisfies Meta<typeof CommentThread>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [comments, setComments] = React.useState<CommentItem[]>([
      { id: '1', author: { name: 'Patricia Rojas' }, body: 'Cliente pidió adelantar la entrega a mañana 8 AM.', timestamp: 'hace 2 días', internal: false },
      { id: '2', author: { name: 'Satoru Gojo' }, body: 'Confirmé con bodega, va con el comprobante actualizado.', timestamp: 'ayer', internal: true },
    ]);
    return (
      <div style={{ maxWidth: 600 }}>
        <CommentThread
          comments={comments}
          allowInternal
          onAdd={(body, internal) => {
            setComments((c) => [...c, { id: String(c.length + 1), author: { name: 'Tú' }, body, timestamp: 'ahora', internal }]);
          }}
        />
      </div>
    );
  },
};

/**
 * **Inline (chat-style) compose** — `inputLayout="inline"` makes the
 * textarea + submit share a single row, the textarea auto-grows up to ~5
 * lines, and Enter submits while Shift+Enter inserts a newline. Use it for
 * short, chat-like coordination (Linear/Slack pattern). `allowInternal` is
 * ignored in this mode by design — if you need the internal toggle, stay on
 * the default `stacked` layout.
 *
 * **Behaviour to verify in the docs preview:** the empty / 1-line state
 * shows no scrollbar and the "Enviar" button is vertically centered with
 * the placeholder. Type `Shift+Enter` to wrap to multiple lines: the wrap
 * class flips to `.is-grown`, the textarea anchors the button to the
 * bottom-right, and the scrollbar appears only past ~5 lines.
 */
export const Inline: Story = {
  name: 'Inline (chat-style)',
  render: () => {
    const [empty, setEmpty] = React.useState<CommentItem[]>([]);
    const [withHistory, setWithHistory] = React.useState<CommentItem[]>([
      { id: '1', author: { name: 'Patricia Rojas' }, body: 'Cliente llamó, va a pasar a buscar el pedido a las 11:00.', timestamp: 'hace 10 min' },
      { id: '2', author: { name: 'Satoru Gojo' }, body: 'Listo, dejo el comprobante firmado arriba del mostrador.', timestamp: 'hace 3 min' },
    ]);
    const append = (set: typeof setEmpty) => (body: string) =>
      set((c) => [...c, { id: String(c.length + 1), author: { name: 'Tú' }, body, timestamp: 'ahora' }]);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 960 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 12 }}>Empty state (no comments)</div>
          <CommentThread comments={empty} onAdd={append(setEmpty)} inputLayout="inline" />
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 12 }}>Con historial</div>
          <CommentThread comments={withHistory} onAdd={append(setWithHistory)} inputLayout="inline" />
        </div>
      </div>
    );
  },
};
