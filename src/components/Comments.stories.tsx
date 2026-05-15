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
