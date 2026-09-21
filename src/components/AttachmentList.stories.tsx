import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentList } from './Comments';

const INITIAL_FILES = [
  { id: '1', name: 'cotizacion-1042.pdf', size: '245 KB', uploadedBy: 'Satoru Gojo', uploadedAt: 'hace 2h', url: '#' },
  { id: '2', name: 'foto-entrega.jpg', size: '1.2 MB', uploadedBy: 'Bodega Norte', uploadedAt: 'hace 30min', url: '#' },
  { id: '3', name: 'comprobante-1042.pdf', size: '89 KB', uploadedBy: 'Satoru Gojo', uploadedAt: 'hace 5min', url: '#' },
];

const meta = {
  title: 'Components/AttachmentList',
  component: AttachmentList,
  tags: ['autodocs'],
  args: { attachments: INITIAL_FILES },
} satisfies Meta<typeof AttachmentList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Removable list: each item's `onRemove` drops it from local state. */
export const Examples: Story = {
  render: () => {
    const [files, setFiles] = React.useState(INITIAL_FILES);
    return (
      <div style={{ maxWidth: 480 }}>
        <AttachmentList attachments={files.map((f) => ({ ...f, onRemove: () => setFiles((curr) => curr.filter((x) => x.id !== f.id)) }))} />
      </div>
    );
  },
};

export const Empty: Story = {
  args: { attachments: [] },
};
