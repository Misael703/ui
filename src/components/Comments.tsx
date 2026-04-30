'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Avatar } from './Display2';
import { FileText, Download, Trash, X } from './Icons';

// ---------- CommentThread ----------------------------------------------
export interface CommentItem {
  id: string;
  author: { name: string; avatarSrc?: string };
  body: React.ReactNode;
  timestamp: React.ReactNode;
  internal?: boolean;
}

export interface CommentThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  comments: CommentItem[];
  onAdd?: (body: string, internal: boolean) => void;
  placeholder?: string;
  allowInternal?: boolean;
}

export function CommentThread({
  comments, onAdd, placeholder = 'Escribe un comentario…',
  allowInternal = false, className, ...rest
}: CommentThreadProps) {
  const [draft, setDraft] = React.useState('');
  const [internal, setInternal] = React.useState(false);

  const submit = () => {
    if (!draft.trim() || !onAdd) return;
    onAdd(draft, internal);
    setDraft('');
    setInternal(false);
  };

  return (
    <div className={cx('comments', className)} {...rest}>
      <ul className="comments__list">
        {comments.map((c) => (
          <li key={c.id} className={cx('comment', c.internal && 'comment--internal')}>
            <Avatar name={c.author.name} src={c.author.avatarSrc} size={32} />
            <div className="comment__body">
              <div className="comment__head">
                <span className="comment__author">{c.author.name}</span>
                <span className="comment__time">{c.timestamp}</span>
                {c.internal && <span className="comment__tag">Nota interna</span>}
              </div>
              <div className="comment__text">{c.body}</div>
            </div>
          </li>
        ))}
      </ul>
      {onAdd && (
        <div className="comments__compose">
          <textarea
            className="textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
          <div className="comments__compose-actions">
            {allowInternal && (
              <label className="comments__internal-toggle">
                <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                <span>Solo nota interna</span>
              </label>
            )}
            <button type="button" className="btn btn--primary btn--sm" disabled={!draft.trim()} onClick={submit}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- AttachmentList ---------------------------------------------
export interface AttachmentItem {
  id: string;
  name: string;
  size?: string;          // ya formateado: "245 KB"
  url?: string;
  uploadedBy?: string;
  uploadedAt?: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export interface AttachmentListProps extends React.HTMLAttributes<HTMLUListElement> {
  attachments: AttachmentItem[];
  emptyMessage?: React.ReactNode;
}

export function AttachmentList({ attachments, emptyMessage = 'Sin archivos adjuntos', className, ...rest }: AttachmentListProps) {
  if (attachments.length === 0) {
    return <div className="attachments__empty">{emptyMessage}</div>;
  }
  return (
    <ul className={cx('attachments', className)} {...rest}>
      {attachments.map((a) => (
        <li key={a.id} className="attachment">
          <span className="attachment__icon" aria-hidden="true">
            {a.icon ?? <FileText size={20} />}
          </span>
          <div className="attachment__body">
            <div className="attachment__name">{a.name}</div>
            <div className="attachment__meta">
              {a.size && <span>{a.size}</span>}
              {a.uploadedBy && <span>· {a.uploadedBy}</span>}
              {a.uploadedAt && <span>· {a.uploadedAt}</span>}
            </div>
          </div>
          <div className="attachment__actions">
            {a.url && (
              <a href={a.url} download className="attachment__action" aria-label={`Descargar ${a.name}`}>
                <Download size={16} />
              </a>
            )}
            {a.onRemove && (
              <button type="button" className="attachment__action attachment__action--danger" aria-label={`Eliminar ${a.name}`} onClick={a.onRemove}>
                <Trash size={16} />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// re-export para que el bundle no tenga dead imports
export const _internal = { X };
