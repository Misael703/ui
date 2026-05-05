'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Bell } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { format } from '../locale/messages';

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: NotificationTone;
  timestamp?: React.ReactNode;
  read?: boolean;
  onClick?: () => void;
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  emptyMessage?: React.ReactNode;
  /** Custom trigger element. Si se pasa, reemplaza el botón con bell. */
  trigger?: React.ReactElement;
  className?: string;
}

export function NotificationCenter({
  notifications, onMarkAllRead, onClearAll,
  emptyMessage,
  trigger, className,
}: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const t = useLocale();
  const unread = notifications.filter((n) => !n.read).length;
  const empty = emptyMessage ?? t['notifications.empty'];

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerEl = trigger ? React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen((o) => !o);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
  }) : (
    <button
      type="button"
      className="notif__trigger"
      aria-label={`${t['notifications.button']}${unread > 0 ? format(t['notifications.unreadSuffix'], { n: unread }) : ''}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
    >
      <Bell size={20} />
      {unread > 0 && <span className="notif__badge" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
    </button>
  );

  return (
    <div ref={ref} className={cx('notif', className)}>
      {triggerEl}
      {open && (
        <div className="notif__panel" role="dialog" aria-label={t['notifications.panel']}>
          <div className="notif__head">
            <span className="notif__title">{t['notifications.title']}</span>
            {notifications.length > 0 && (
              <div className="notif__head-actions">
                {onMarkAllRead && unread > 0 && (
                  <button type="button" className="notif__action" onClick={onMarkAllRead}>
                    {t['notifications.markAllRead']}
                  </button>
                )}
                {onClearAll && (
                  <button type="button" className="notif__action" onClick={onClearAll}>
                    {t['notifications.clear']}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="notif__list">
            {notifications.length === 0 ? (
              <div className="notif__empty">{empty}</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={cx('notif__item', !n.read && 'is-unread')}
                  onClick={() => { n.onClick?.(); setOpen(false); }}
                >
                  <span className={cx('notif__dot', `notif__dot--${n.tone ?? 'info'}`)} aria-hidden="true" />
                  <div className="notif__body">
                    <div className="notif__item-title">{n.title}</div>
                    {n.description && <div className="notif__item-desc">{n.description}</div>}
                    {n.timestamp && <div className="notif__time">{n.timestamp}</div>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
