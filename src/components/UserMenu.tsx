'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Popover, type PopoverPlacement, type PopoverAlign } from './Popover';
import { Avatar } from './Display2';
import { ChevronDown } from './Icons';

export interface UserMenuItem {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  href?: string;
  danger?: boolean;
}

export interface UserMenuProps {
  name: string;
  role?: string;
  /** Item list. Pass the string `'separator'` to render a divider. */
  items: Array<UserMenuItem | 'separator'>;
  /** Override the trigger avatar (default: initials from `name`). */
  avatar?: React.ReactNode;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  /** Render `href` items through a custom link (e.g. Next `<Link>`). */
  linkAs?: (props: { href: string; className: string; children: React.ReactNode }) => React.ReactNode;
  /**
   * Collapse the trigger to just the avatar at EVERY viewport (the same
   * treatment the <900px breakpoint applies automatically). Opt in when the
   * header slot has sibling actions (notifications, search) that the full
   * name + role would crowd out. The popover still shows the full identity,
   * so nothing is lost — only the trigger footprint changes.
   */
  compact?: boolean;
  className?: string;
  contentClassName?: string;
  ariaLabel?: string;
}

/**
 * Topbar user menu (Linear / Vercel / Notion pattern). The avatar is the only
 * always-visible control; name + role + chevron collapse to just the avatar
 * below 900px (same breakpoint as the AppShell mobile drawer), so it never
 * overflows a narrow header. A Popover mounts the details on click and closes
 * on ESC / outside-click. The breakpoint is fixed by design — the collapse is
 * the whole point of the component, not a per-consumer decision. `compact`
 * applies the same avatar-only collapse at every viewport (a size variant,
 * not a breakpoint override).
 */
export function UserMenu({
  name, role, items, avatar,
  placement = 'bottom', align = 'end',
  linkAs, compact = false, className, contentClassName, ariaLabel,
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false);

  const renderItem = (item: UserMenuItem, key: number) => {
    const klass = cx('usermenu__item', item.danger && 'usermenu__item--danger');
    const inner = (
      <>
        {item.icon ? <span className="usermenu__item-icon" aria-hidden="true">{item.icon}</span> : null}
        {item.label}
      </>
    );
    if (item.href) {
      const onClick = () => { item.onSelect?.(); setOpen(false); };
      if (linkAs) return <span key={key} onClick={onClick}>{linkAs({ href: item.href, className: klass, children: inner })}</span>;
      return <a key={key} href={item.href} className={klass} onClick={onClick}>{inner}</a>;
    }
    return (
      <button key={key} type="button" className={klass}
        onClick={() => { item.onSelect?.(); setOpen(false); }}>
        {inner}
      </button>
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      align={align}
      ariaLabel={ariaLabel ?? 'Menú de usuario'}
      className={className}
      contentClassName={cx('usermenu__panel', contentClassName)}
      trigger={
        <button type="button" className={cx('usermenu__trigger', compact && 'usermenu__trigger--compact')} aria-label={ariaLabel ?? 'Abrir menú de usuario'}>
          {avatar ?? <Avatar name={name} size={32} />}
          <span className="usermenu__text">
            <strong className="usermenu__name">{name}</strong>
            {role ? <span className="usermenu__role">{role}</span> : null}
          </span>
          <span className="usermenu__chevron" aria-hidden="true"><ChevronDown size={16} /></span>
        </button>
      }
    >
      <div className="usermenu__header">
        {avatar ?? <Avatar name={name} size={40} />}
        <div className="usermenu__header-text">
          <strong className="usermenu__header-name">{name}</strong>
          {role ? <span className="usermenu__header-role">{role}</span> : null}
        </div>
      </div>
      <div className="usermenu__divider" role="separator" />
      <div className="usermenu__items">
        {items.map((item, i) =>
          item === 'separator'
            ? <div key={i} className="usermenu__divider" role="separator" />
            : renderItem(item, i),
        )}
      </div>
    </Popover>
  );
}
