'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Modal } from './Overlay';
import { ChevronLeft, ChevronRight } from './Icons';
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
          <div className="diff__before" role="cell"><del>{e.before}</del></div>
          <div className="diff__after" role="cell"><ins>{e.after}</ins></div>
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
