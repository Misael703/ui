'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Check } from './Icons';
import { Portal } from './Portal';
import { usePopoverPosition } from '../hooks/usePopoverPosition';
import { Separator } from './Primitives';

// ---------- Tabs ---------------------------------------------------------
interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

// useLayoutEffect on the client, useEffect on the server — measures the
// indicator before paint without the SSR "useLayoutEffect does nothing" warning.
const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  /**
   * Visual style. `'underline'` (default) keeps the full-width baseline under
   * the tab row; `'plain'` drops it — for tabs sitting on open canvas where
   * the gray baseline floats. Both animate the active indicator between tabs.
   */
  variant?: 'underline' | 'plain';
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, defaultValue, onChange, variant = 'underline', children, className }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? '');
  const v = value ?? internal;
  const setV = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ value: v, setValue: setV }}>
      <div className={cx('tabs', variant === 'plain' && 'tabs--plain', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value;
  const listRef = React.useRef<HTMLDivElement>(null);
  // Shared sliding indicator: a single bar that translates to the active tab's
  // measured geometry, so switching tabs animates one element instead of
  // cross-fading a per-tab border.
  const [ind, setInd] = React.useState<{ left: number; width: number; ready: boolean } | null>(null);
  useIsoLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const tab = el.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      // No active tab → collapse the bar (hidden via opacity below).
      if (!tab) { setInd((p) => (p ? { ...p, width: 0 } : null)); return; }
      setInd((p) => ({ left: tab.offsetLeft, width: tab.offsetWidth, ready: p?.ready ?? false }));
    };
    measure();
    // Recalc on container resize and on web-font swap — both change tab widths.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    let cancelled = false;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => { if (!cancelled) measure(); });
    }
    return () => { cancelled = true; ro?.disconnect(); };
  }, [active, children]);
  // Enable the slide only AFTER the first measurement, so the bar appears in
  // place on mount rather than animating in from x=0.
  React.useEffect(() => {
    if (ind && !ind.ready) setInd((p) => (p ? { ...p, ready: true } : p));
  }, [ind]);
  return (
    <div ref={listRef} role="tablist" className={cx('tabs__list', className)}>
      {children}
      {ind && (
        <span
          aria-hidden="true"
          className={cx('tabs__indicator', ind.ready && 'is-ready')}
          style={{ transform: `translateX(${ind.left}px)`, width: ind.width, opacity: ind.width > 0 ? 1 : 0 }}
        />
      )}
    </div>
  );
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function Tab({ value, className, children, ...rest }: TabProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('<Tab> must be used inside <Tabs>');
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cx('tabs__tab', active && 'is-active', className)}
      onClick={() => ctx.setValue(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('<TabPanel> must be used inside <Tabs>');
  if (ctx.value !== value) return null;
  return <div role="tabpanel" className={cx('tabs__panel', className)}>{children}</div>;
}

// ---------- Table --------------------------------------------------------
export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  function Table({ className, ...rest }, ref) {
    return (
      <div className="table-wrap">
        <table ref={ref} className={cx('table', className)} {...rest} />
      </div>
    );
  }
);

// ---------- Tooltip (CSS hover) ------------------------------------------
export interface TooltipProps {
  label: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const bubbleRef = React.useRef<HTMLSpanElement>(null);
  const reactId = React.useId();
  const bubbleId = `${reactId}-tooltip`;
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const show = () => {
    clear();
    openTimer.current = setTimeout(() => setOpen(true), 150);
  };
  const hide = () => {
    clear();
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  };

  React.useEffect(() => () => clear(), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const pos = usePopoverPosition(wrapRef, bubbleRef, {
    open,
    side,
    align: 'center',
    offset: 8,
  });

  const child = React.cloneElement(children, {
    'aria-describedby': open ? bubbleId : children.props['aria-describedby'],
  });

  return (
    <span
      ref={wrapRef}
      className={cx('tooltip', `tooltip--${side}`)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {child}
      {open && (
        <Portal>
          <span
            ref={bubbleRef}
            id={bubbleId}
            role="tooltip"
            className={cx('tooltip__bubble', 'is-floating')}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              opacity: pos.ready ? 1 : 0,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
          >
            {label}
          </span>
        </Portal>
      )}
    </span>
  );
}

// ---------- Divider ------------------------------------------------------
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

/**
 * @deprecated Use `Separator` instead. `Divider` is a non-breaking alias kept
 * for existing consumers: it delegates to `Separator` with `decorative={false}`
 * (preserving the original `role="separator"` semantics) and keeps emitting the
 * legacy `divider` / `divider--vertical` classes so styling is unchanged. New
 * code should import `Separator`.
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = 'horizontal', className, ...rest },
  ref
) {
  return (
    <Separator
      ref={ref}
      orientation={orientation}
      decorative={false}
      className={cx('divider', orientation === 'vertical' && 'divider--vertical', className)}
      {...rest}
    />
  );
});

// ---------- Stack / HStack / VStack -------------------------------------
type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: SpaceToken;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: boolean;
  inline?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = 'column', gap = 4, align, justify, wrap, inline, className, style, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx('stack', className)}
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: direction,
        gap: `var(--space-${gap})`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
      {...rest}
    />
  );
});

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  function HStack(props, ref) {
    return <Stack ref={ref} direction="row" align={props.align ?? 'center'} {...props} />;
  }
);

export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  function VStack(props, ref) {
    return <Stack ref={ref} direction="column" {...props} />;
  }
);

// ---------- Container ----------------------------------------------------
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const CONTAINER_MAX = { sm: 640, md: 768, lg: 1024, xl: 1280, full: '100%' };

export function Container({ size = 'lg', className, style, ...rest }: ContainerProps) {
  return (
    <div
      className={cx('container', `container--${size}`, className)}
      style={{
        // border-box so `width: 100%` includes the inline gutter. Without
        // it (content-box default) the padding adds OUTSIDE the 100%, so
        // the container renders 2×var(--space-4) wider than its parent and
        // overflows any width-constrained context (a column, a card, a
        // narrow viewport). Masked on a full-viewport page by the body's
        // own margins, but a real bug elsewhere.
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: CONTAINER_MAX[size],
        marginInline: 'auto',
        paddingInline: 'var(--space-4)',
        ...style,
      }}
      {...rest}
    />
  );
}

// ---------- Grid ---------------------------------------------------------
/**
 * Column count. A number/string is fixed; an object is responsive per
 * breakpoint (each breakpoint inherits the previous one if omitted).
 * Breakpoints match the kit tokens: sm 480 · md 768 · lg 1024 · xl 1280.
 */
export type ResponsiveColumns =
  | number
  | string
  | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: ResponsiveColumns;
  gap?: SpaceToken;
  /** Intrinsically responsive auto-fit columns; takes precedence over `columns`. */
  minColWidth?: number | string;
}

export function Grid({ columns, gap = 4, minColWidth, className, style, ...rest }: GridProps) {
  const gapVar = `var(--space-${gap})`;

  // auto-fit: intrinsic responsiveness, no breakpoints needed.
  if (minColWidth) {
    const w = typeof minColWidth === 'number' ? `${minColWidth}px` : minColWidth;
    return (
      <div
        className={cx('grid', className)}
        style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${w}, 1fr))`, gap: gapVar, ...style }}
        {...rest}
      />
    );
  }

  // Responsive object: emit per-breakpoint custom props; `.grid--responsive`
  // (in index.css) reads them through media queries with an inherit chain.
  if (columns && typeof columns === 'object') {
    const vars: Record<string, string> = {};
    if (columns.base != null) vars['--grid-cols'] = String(columns.base);
    if (columns.sm != null) vars['--grid-cols-sm'] = String(columns.sm);
    if (columns.md != null) vars['--grid-cols-md'] = String(columns.md);
    if (columns.lg != null) vars['--grid-cols-lg'] = String(columns.lg);
    if (columns.xl != null) vars['--grid-cols-xl'] = String(columns.xl);
    return (
      <div
        className={cx('grid', 'grid--responsive', className)}
        style={{ gap: gapVar, ...vars, ...style } as React.CSSProperties}
        {...rest}
      />
    );
  }

  const tpl = typeof columns === 'number'
    ? `repeat(${columns}, minmax(0, 1fr))`
    : columns ?? 'repeat(12, minmax(0, 1fr))';
  return (
    <div
      className={cx('grid', className)}
      style={{ display: 'grid', gridTemplateColumns: tpl, gap: gapVar, ...style }}
      {...rest}
    />
  );
}

// ---------- Cluster / Spacer --------------------------------------------
/**
 * Horizontal group that wraps — the "cluster" layout primitive (Braid /
 * Every Layout). Sugar for `<Stack direction="row" wrap>`. Use for tag
 * lists, button rows, filter chips: items flow and wrap, gap stays even.
 */
export const Cluster = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction' | 'wrap'>>(
  function Cluster(props, ref) {
    return <Stack ref={ref} direction="row" wrap align={props.align ?? 'center'} {...props} />;
  }
);

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed size on a space token. Omit for a flexible spacer (`flex: 1`). */
  size?: SpaceToken;
}

/**
 * Spacing element. With `size`, a fixed gap on the space scale. Without it,
 * a flexible spacer that eats remaining space in a flex container (pushes
 * siblings apart) — e.g. a toolbar with left items + `<Spacer />` + right
 * items.
 */
export function Spacer({ size, style, ...rest }: SpacerProps) {
  return (
    <div
      aria-hidden="true"
      style={
        size != null
          ? { flex: '0 0 auto', width: `var(--space-${size})`, height: `var(--space-${size})`, ...style }
          : { flex: '1 1 auto', ...style }
      }
      {...rest}
    />
  );
}

// ---------- KeyValue ----------------------------------------------------
export interface KeyValueProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Override del ancho de la columna de keys (default 200px) */
  keyWidth?: number | string;
}

export function KeyValue({ keyWidth, className, style, ...rest }: KeyValueProps) {
  return (
    <dl
      className={cx('kv', className)}
      style={keyWidth ? { gridTemplateColumns: `${typeof keyWidth === 'number' ? `${keyWidth}px` : keyWidth} 1fr`, ...style } : style}
      {...rest}
    />
  );
}

export interface KeyValueRowProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

export function KeyValueRow({ label, children }: KeyValueRowProps) {
  return (
    <>
      <dt className="kv__k">{label}</dt>
      <dd className="kv__v">{children}</dd>
    </>
  );
}

// ---------- ListGroup ---------------------------------------------------
export const ListGroup = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  function ListGroup({ className, ...rest }, ref) {
    return <ul ref={ref} className={cx('list-group', className)} {...rest} />;
  }
);

export interface ListGroupItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  interactive?: boolean;
}

export const ListGroupItem = React.forwardRef<HTMLLIElement, ListGroupItemProps>(
  function ListGroupItem({ interactive, className, ...rest }, ref) {
    return (
      <li
        ref={ref}
        className={cx('list-group__item', interactive && 'list-group__item--interactive', className)}
        {...rest}
      />
    );
  }
);

// ---------- Stepper ------------------------------------------------------
export interface StepperProps {
  steps: Array<{ label: string; description?: string }>;
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cx('stepper', className)}>
      {steps.map((s, i) => {
        const state = i < current ? 'is-done' : i === current ? 'is-current' : '';
        return (
          <li key={i} className={cx('stepper__item', state)}>
            <span className="stepper__circle">{i < current ? <Check size={16} /> : i + 1}</span>
            <div>
              <div className="stepper__label">{s.label}</div>
              {s.description && <div className="stepper__desc">{s.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
