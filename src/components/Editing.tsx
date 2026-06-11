'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Modal } from './Overlay';
import { ChevronLeft, ChevronRight, Edit as EditIcon } from './Icons';
import { Checkbox } from './Form';
import { useLocale } from '../locale/LocaleProvider';

// ---------- ConfirmDialog -----------------------------------------------
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** 'danger' usa botón rojo. */
  tone?: 'default' | 'danger';
  /** Si true, deshabilita el confirm mientras se ejecuta. */
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel, cancelLabel,
  tone = 'default', loading,
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);
  const isBusy = loading ?? busy;
  const t = useLocale();
  const confirmText = confirmLabel ?? t['common.confirm'];
  const cancelText = cancelLabel ?? t['common.cancel'];

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--md" onClick={onClose} disabled={isBusy}>
            {cancelText}
          </button>
          <button
            type="button"
            className={cx('btn', tone === 'danger' ? 'btn--danger' : 'btn--primary', 'btn--md')}
            onClick={handleConfirm}
            disabled={isBusy}
            aria-busy={isBusy || undefined}
          >
            {isBusy ? <span className="spinner spinner--inverse" aria-hidden="true" /> : null}
            {confirmText}
          </button>
        </>
      }
    >
      {description && <p className="confirm__desc">{description}</p>}
    </Modal>
  );
}

// ---------- DescriptionList (KeyValue editable) ------------------------
export interface DescriptionListItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Si se pasa, el valor se vuelve editable inline. */
  onEdit?: () => void;
  editable?: boolean;
}

export function DescriptionList({ children, className, ...rest }: React.HTMLAttributes<HTMLDListElement>) {
  return <dl className={cx('desc-list', className)} {...rest}>{children}</dl>;
}

export function DescriptionListItem({ label, value, onEdit, editable }: DescriptionListItemProps) {
  const t = useLocale();
  return (
    <>
      <dt className="desc-list__label">{label}</dt>
      <dd className="desc-list__value">
        <span>{value}</span>
        {editable && onEdit && (
          <button type="button" className="desc-list__edit" onClick={onEdit}>
            {t['descList.edit']}
          </button>
        )}
      </dd>
    </>
  );
}

// ---------- DiffViewer (before / after) --------------------------------
export interface DiffEntry {
  field: React.ReactNode;
  before: React.ReactNode;
  after: React.ReactNode;
}

export interface DiffViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  entries: DiffEntry[];
}

export function DiffViewer({ entries, className, ...rest }: DiffViewerProps) {
  const t = useLocale();
  // data-label feeds the mobile stacked layout's ::before pseudo-elements
  // so the "Antes" / "Después" labels remain i18n-able.
  const beforeLabel = typeof t['diff.before'] === 'string' ? t['diff.before'] : undefined;
  const afterLabel = typeof t['diff.after'] === 'string' ? t['diff.after'] : undefined;
  return (
    <div className={cx('diff', className)} role="table" aria-label={t['diff.label']} {...rest}>
      <div className="diff__head" role="row">
        <div role="columnheader">{t['diff.field']}</div>
        <div role="columnheader">{t['diff.before']}</div>
        <div role="columnheader">{t['diff.after']}</div>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="diff__row" role="row">
          <div className="diff__field" role="cell">{e.field}</div>
          <div className="diff__before" role="cell" data-label={beforeLabel}><del>{e.before}</del></div>
          <div className="diff__after" role="cell" data-label={afterLabel}><ins>{e.after}</ins></div>
        </div>
      ))}
    </div>
  );
}

// ---------- TransferList (dual list select) ----------------------------
export interface TransferItem {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface TransferListProps {
  source: TransferItem[];
  selected: TransferItem[];
  onChange: (selected: TransferItem[]) => void;
  sourceTitle?: React.ReactNode;
  selectedTitle?: React.ReactNode;
  className?: string;
}

export function TransferList({
  source, selected, onChange,
  sourceTitle, selectedTitle,
  className,
}: TransferListProps) {
  const [leftChecked, setLeftChecked] = React.useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = React.useState<Set<string>>(new Set());
  const t = useLocale();
  const srcTitle = sourceTitle ?? t['transfer.available'];
  const selTitle = selectedTitle ?? t['transfer.assigned'];

  // Without memo, every checkbox click rebuilt selectedIds and re-filtered
  // `source` to compute `left`. At ~500 source items that's a measurable
  // O(n) hit per click.
  const selectedIds = React.useMemo(
    () => new Set(selected.map((s) => s.id)),
    [selected]
  );
  const left = React.useMemo(
    () => source.filter((s) => !selectedIds.has(s.id)),
    [source, selectedIds]
  );
  const right = selected;

  const moveRight = () => {
    const toMove = left.filter((i) => leftChecked.has(i.id));
    onChange([...right, ...toMove]);
    setLeftChecked(new Set());
  };
  const moveLeft = () => {
    onChange(right.filter((i) => !rightChecked.has(i.id)));
    setRightChecked(new Set());
  };

  const toggleCheck = (set: Set<string>, setSet: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSet(next);
  };

  const renderColumn = (title: React.ReactNode, items: TransferItem[], checked: Set<string>, setChecked: (s: Set<string>) => void) => (
    <div className="transfer__col">
      <div className="transfer__col-head">
        <span className="transfer__col-title">{title}</span>
        <span className="transfer__col-count">{items.length}</span>
      </div>
      <ul className="transfer__list" role="listbox" aria-label={typeof title === 'string' ? title : undefined}>
        {items.length === 0 ? (
          <li className="transfer__empty">{t['transfer.empty']}</li>
        ) : items.map((it) => (
          <li
            key={it.id}
            className={cx('transfer__item', checked.has(it.id) && 'is-checked', it.disabled && 'is-disabled')}
            role="option"
            aria-selected={checked.has(it.id)}
            onClick={() => !it.disabled && toggleCheck(checked, setChecked, it.id)}
          >
            <span onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={checked.has(it.id)}
                disabled={it.disabled}
                onChange={() => toggleCheck(checked, setChecked, it.id)}
              />
            </span>
            <div className="transfer__item-body">
              <div>{it.label}</div>
              {it.description && <div className="transfer__item-desc">{it.description}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={cx('transfer', className)}>
      {renderColumn(srcTitle, left, leftChecked, setLeftChecked)}
      <div className="transfer__controls">
        <button type="button" className="btn btn--outline btn--sm" disabled={leftChecked.size === 0} onClick={moveRight} aria-label={t['transfer.assignSelected']}>
          <ChevronRight size={16} />
        </button>
        <button type="button" className="btn btn--outline btn--sm" disabled={rightChecked.size === 0} onClick={moveLeft} aria-label={t['transfer.removeSelected']}>
          <ChevronLeft size={16} />
        </button>
      </div>
      {renderColumn(selTitle, right, rightChecked, setRightChecked)}
    </div>
  );
}

// ---------- EditableCell ---------------------------------------------------
export interface EditableCellProps {
  /** Committed value (controlled — the consumer owns it). */
  value: string;
  /**
   * Called on commit (Enter or blur) with the edited raw value. May return
   * a promise: while it's pending the input is disabled; on rejection the
   * cell STAYS in edit mode with the invalid style, so the user's typing
   * is never lost to a failed PATCH. Not called when the value is
   * unchanged.
   */
  onCommit: (next: string) => void | Promise<void>;
  /** Input mode. `'number'` renders a numeric input. */
  type?: 'text' | 'number';
  /**
   * Display-mode formatter (e.g. `formatCurrency`) — editing always works
   * on the RAW `value`; only the resting presentation is formatted.
   */
  formatDisplay?: (value: string) => React.ReactNode;
  /**
   * Sync validation before commit. Return an error message to block the
   * commit (cell stays editing, invalid style, message via title/aria);
   * return `null` to allow it.
   */
  validate?: (next: string) => string | null;
  disabled?: boolean;
  placeholder?: string;
  /** Accessible name of the edit affordance (e.g. "Editar precio de Taladro"). */
  ariaLabel?: string;
  className?: string;
}

/**
 * Click-to-edit primitive for inline editing (Airtable/Notion semantics):
 * click or Enter to edit, Enter/blur commits, Escape cancels. Composable
 * anywhere — typically inside a `DataTable` cell via `accessor`. The kit
 * deliberately ships the CELL, not an editable-table subsystem: commit
 * orchestration (optimistic update, refetch, toast) stays in the consumer,
 * where the data layer lives.
 */
export function EditableCell({
  value, onCommit, type = 'text', formatDisplay, validate,
  disabled, placeholder, ariaLabel, className,
}: EditableCellProps) {
  const t = useLocale();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Distinguishes Escape-initiated blur from a committing blur.
  const cancelledRef = React.useRef(false);

  const startEdit = () => {
    if (disabled) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = async () => {
    if (pending) return;
    if (draft === value) { setEditing(false); setError(null); return; }
    const invalid = validate?.(draft) ?? null;
    if (invalid) {
      setError(invalid);
      inputRef.current?.focus();
      return;
    }
    try {
      setPending(true);
      await onCommit(draft);
      setEditing(false);
      setError(null);
    } catch {
      // Keep the draft and the edit mode — the user decides to retry or Esc.
      setError(t['editable.commitError']);
      inputRef.current?.focus();
    } finally {
      setPending(false);
    }
  };

  const cancel = () => {
    cancelledRef.current = true;
    setEditing(false);
    setError(null);
  };

  if (!editing) {
    return (
      <button
        type="button"
        className={cx('editable-cell', disabled && 'is-disabled', className)}
        onClick={startEdit}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <span className="editable-cell__value">
          {formatDisplay ? formatDisplay(value) : (value || placeholder)}
        </span>
        <EditIcon size={12} className="editable-cell__icon" aria-hidden="true" />
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type}
      className={cx('input', 'editable-cell__input', error != null && 'is-invalid', className)}
      value={draft}
      disabled={pending}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={error != null || undefined}
      title={error ?? undefined}
      onChange={(e) => { setDraft(e.target.value); setError(null); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); void commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
      }}
      onBlur={() => {
        if (cancelledRef.current) { cancelledRef.current = false; return; }
        void commit();
      }}
    />
  );
}
