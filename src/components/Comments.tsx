'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Avatar } from './Display2';
import { FileText, Download, Trash } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

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
  /**
   * Compose layout. Default `'stacked'`: textarea on top, action row
   * below (form-style). `'inline'`: textarea and submit button share a
   * single row, the textarea auto-grows, and Enter submits while
   * Shift+Enter inserts a newline — chat convention (Slack/Linear).
   * `allowInternal` is ignored in `'inline'`; if you need the internal
   * toggle, use `'stacked'`.
   */
  inputLayout?: 'stacked' | 'inline';
}

// Inline mode auto-grow ceiling. ~5 lines at the kit's default
// textarea font/line-height; beyond this the textarea scrolls.
const INLINE_MAX_HEIGHT_PX = 140;

export function CommentThread({
  comments, onAdd, placeholder,
  allowInternal = false, inputLayout = 'stacked',
  className, ...rest
}: CommentThreadProps) {
  const [draft, setDraft] = React.useState('');
  const [internal, setInternal] = React.useState(false);
  const [grown, setGrown] = React.useState(false);
  const t = useLocale();
  const ph = placeholder ?? t['comments.placeholder'];
  const isInline = inputLayout === 'inline';
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  // Captures the 1-line scrollHeight on first paint with the empty
  // textarea. Anything taller than baseline + epsilon means the user
  // has typed a newline (or wrapped past one line). Cleared when
  // leaving inline mode so a re-entry re-measures.
  const baselineRef = React.useRef<number | null>(null);

  // Auto-grow in inline mode: reset to single-row, then size to
  // scrollHeight, capped at INLINE_MAX_HEIGHT_PX. Runs on every draft
  // change so deletes shrink the box too. Same pass detects whether the
  // textarea has grown past its 1-line baseline so the wrap can flip
  // alignment from `center` (steady state) to `flex-end` (multi-line).
  // Stacked mode keeps the static rows={3} height — no DOM measurement,
  // no observable side-effect.
  React.useEffect(() => {
    if (!isInline) {
      baselineRef.current = null;
      setGrown(false);
      return;
    }
    const el = textareaRef.current;
    if (!el) return;
    // Auto-grow runs once now (with whatever font metrics are in play)
    // and once more after web fonts settle. Without the second pass,
    // a cold load that swaps from fallback to custom font (Outfit/DM
    // Sans here) leaves the textarea's calculated height 2px short
    // of the post-swap content box — `overflow-y: auto` then shows a
    // phantom scrollbar at rest until the next draft change. This was
    // the root cause of the 1.36.x scrollbar bug; both the
    // `scrollHeight + border` and the `offsetHeight` reads were
    // honest, the metric *itself* was changing under our feet as the
    // font finished loading. `useEffect` (not `useLayoutEffect`) so
    // the first measurement runs after paint, never during reconcile.
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const node = textareaRef.current;
      if (!node) return;
      node.style.height = 'auto';
      // `offsetHeight` after `'auto'` is the textarea's natural
      // rendered box, border-box border included — no separate border
      // math, no `getComputedStyle` round-trip.
      const natural = node.offsetHeight;
      // `scrollHeight` here is used only for the grown-vs-baseline
      // delta: what matters is the *change*, not the absolute.
      const sh = node.scrollHeight;
      if (baselineRef.current == null) baselineRef.current = sh;
      node.style.height = `${Math.min(natural, INLINE_MAX_HEIGHT_PX)}px`;
      // 4px epsilon absorbs subpixel rounding / font-metrics noise on
      // the baseline measurement; without it the wrap flicker-toggles
      // between center and flex-end at the boundary.
      setGrown(sh > (baselineRef.current ?? sh) + 4);
    };
    measure();
    // `document.fonts.ready` resolves immediately when no fonts are
    // pending (the hot path in prod where the font is cached), so the
    // re-measure is essentially free; on a cold load it fires when the
    // swap completes and the textarea reflows to its real metric.
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => { /* fonts.ready can reject on aborted nav */ });
    }
    return () => { cancelled = true; };
  }, [draft, isInline]);

  const submit = () => {
    if (!draft.trim() || !onAdd) return;
    onAdd(draft, internal);
    setDraft('');
    setInternal(false);
  };

  // Enter submits in inline mode; Shift+Enter inserts a newline. In
  // stacked mode Enter keeps its default newline behaviour (form style).
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isInline) return;
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    submit();
  };

  return (
    <div className={cx('comments', className)} {...rest}>
      {comments.length > 0 && (
        // Skip the list element entirely when empty. `.comments` is a
        // flex column with `gap: var(--space-4)`; an empty `<ul>` would
        // still consume a gap slot, leaving a phantom 16px between
        // "nothing" and the compose row. The visual symptom: the
        // compose sits below the vertical center of the container in
        // empty state.
        <ul className="comments__list">
          {comments.map((c) => (
            <li key={c.id} className={cx('comment', c.internal && 'comment--internal')}>
              <Avatar name={c.author.name} src={c.author.avatarSrc} size={32} />
              <div className="comment__body">
                <div className="comment__head">
                  <span className="comment__author">{c.author.name}</span>
                  <span className="comment__time">{c.timestamp}</span>
                  {c.internal && <span className="comment__tag">{t['comments.internalTag']}</span>}
                </div>
                <div className="comment__text">{c.body}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {onAdd && (
        <div className={cx('comments__compose', isInline && 'comments__compose--inline', isInline && grown && 'is-grown')}>
          <textarea
            ref={textareaRef}
            className="textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={ph}
            rows={isInline ? 1 : 3}
          />
          {isInline ? (
            <button type="button" className="btn btn--primary btn--sm comments__compose-submit" disabled={!draft.trim()} onClick={submit}>
              {t['comments.send']}
            </button>
          ) : (
            <div className="comments__compose-actions">
              {allowInternal && (
                <label className="comments__internal-toggle">
                  <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                  <span>{t['comments.internalOnly']}</span>
                </label>
              )}
              <button type="button" className="btn btn--primary btn--sm" disabled={!draft.trim()} onClick={submit}>
                {t['comments.send']}
              </button>
            </div>
          )}
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

export function AttachmentList({ attachments, emptyMessage, className, ...rest }: AttachmentListProps) {
  const t = useLocale();
  const empty = emptyMessage ?? t['attachments.empty'];
  if (attachments.length === 0) {
    return <div className="attachments__empty">{empty}</div>;
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
              <a href={a.url} download className="attachment__action" aria-label={format(t['attachments.download'], { name: a.name })}>
                <Download size={16} />
              </a>
            )}
            {a.onRemove && (
              <button type="button" className="attachment__action attachment__action--danger" aria-label={format(t['attachments.remove'], { name: a.name })} onClick={a.onRemove}>
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
