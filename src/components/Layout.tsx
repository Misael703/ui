'use client';
import * as React from 'react';
import { cx } from '../utils/cx';
import { Check } from './Icons';

// ---------- Tabs ---------------------------------------------------------
interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, defaultValue, onChange, children, className }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? '');
  const v = value ?? internal;
  const setV = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ value: v, setValue: setV }}>
      <div className={cx('tabs', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div role="tablist" className={cx('tabs__list', className)}>{children}</div>;
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
  return (
    <span className={cx('tooltip', `tooltip--${side}`)} data-tooltip={typeof label === 'string' ? label : undefined}>
      {children}
      <span className="tooltip__bubble" role="tooltip">{label}</span>
    </span>
  );
}

// ---------- Divider ------------------------------------------------------
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ orientation = 'horizontal', className, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx('divider', orientation === 'vertical' && 'divider--vertical', className)}
      {...rest}
    />
  );
}

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
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number | string;
  gap?: SpaceToken;
  minColWidth?: number | string;
}

export function Grid({ columns, gap = 4, minColWidth, className, style, ...rest }: GridProps) {
  const tpl = minColWidth
    ? `repeat(auto-fit, minmax(${typeof minColWidth === 'number' ? `${minColWidth}px` : minColWidth}, 1fr))`
    : typeof columns === 'number'
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns ?? 'repeat(12, minmax(0, 1fr))';
  return (
    <div
      className={cx('grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: tpl,
        gap: `var(--space-${gap})`,
        ...style,
      }}
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
