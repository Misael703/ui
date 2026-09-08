'use client';
import * as React from 'react';
import { Button, IconButton } from './Button';
import { Menu } from './Display2';
import { MoreVertical } from './Icons';
import { useLocale } from '../locale/LocaleProvider';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * A toolbar action described as DATA (v3.7.0), so the kit can render it two
 * ways: inline as a tertiary button on a desk, and as a row of a "⋯" menu on
 * a phone. Nodes cannot be re-rendered like that — a ready-made button is
 * already one form. Used by `TableToolbar overflow` and `FilterBar overflow`.
 */
export interface ToolbarAction {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** Destructive: `ghost-danger` inline, destructive row in the menu. */
  destructive?: boolean;
}

const MOBILE_QUERY = '(max-width: 600px)';

/**
 * Internal. Renders `actions` inline (ghost `sm` with icon) above 600px and
 * collapses them into a `Menu` behind a "Más opciones" icon button below —
 * the priority+ / overflow-menu pattern of toolbars. Contextual actions that
 * must stay visible (Limpiar) do not belong here; give them to `actions`.
 */
export function ToolbarActions({ actions, className }: { actions: ToolbarAction[]; className?: string }): React.JSX.Element | null {
  const t = useLocale();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  if (actions.length === 0) return null;
  if (isMobile) {
    return (
      <Menu
        align="end"
        className={className}
        trigger={<IconButton variant="ghost" size="sm" icon={<MoreVertical size={18} />} aria-label={t['toolbar.more']} />}
        items={actions.map((a) => ({ label: a.label, icon: a.icon, onSelect: a.onSelect, disabled: a.disabled, destructive: a.destructive }))}
      />
    );
  }
  return (
    <>
      {actions.map((a) => (
        <Button
          key={a.label}
          type="button"
          variant={a.destructive ? 'ghost-danger' : 'ghost'}
          size="sm"
          iconLeft={a.icon}
          onClick={a.onSelect}
          disabled={a.disabled}
          className={className}
        >
          {a.label}
        </Button>
      ))}
    </>
  );
}
