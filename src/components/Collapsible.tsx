'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  contentId: string;
  triggerId: string;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { open: openProp, defaultOpen = false, onOpenChange, className, children, ...rest },
  ref
) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internal;
  const reactId = React.useId();
  const ids = React.useMemo(
    () => ({ contentId: `collapsible-content-${reactId}`, triggerId: `collapsible-trigger-${reactId}` }),
    [reactId]
  );

  const toggle = () => {
    const next = !open;
    if (!isControlled) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <CollapsibleContext.Provider value={{ open, toggle, ...ids }}>
      <div
        ref={ref}
        className={cx('collapsible', open && 'is-open', className)}
        data-state={open ? 'open' : 'closed'}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
});

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CollapsibleTrigger({ className, children, onClick, ...rest }, ref) {
    const ctx = React.useContext(CollapsibleContext);
    if (!ctx) throw new Error('<CollapsibleTrigger> must be used inside <Collapsible>');
    return (
      <button
        ref={ref}
        type="button"
        id={ctx.triggerId}
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        data-state={ctx.open ? 'open' : 'closed'}
        className={cx('collapsible__trigger', className)}
        onClick={(e) => {
          ctx.toggle();
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CollapsibleContent({ className, children, ...rest }, ref) {
    const ctx = React.useContext(CollapsibleContext);
    if (!ctx) throw new Error('<CollapsibleContent> must be used inside <Collapsible>');
    return (
      <div
        ref={ref}
        id={ctx.contentId}
        role="region"
        aria-labelledby={ctx.triggerId}
        data-state={ctx.open ? 'open' : 'closed'}
        hidden={!ctx.open || undefined}
        className={cx('collapsible__content', className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
