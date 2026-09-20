'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

export type ToggleSize = 'sm' | 'md' | 'lg';
export type ToggleVariant = 'default' | 'outline';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  variant?: ToggleVariant;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed, onPressedChange, size = 'md', variant = 'default', className, children, onClick, ...rest },
  ref
) {
  const [internal, setInternal] = React.useState(defaultPressed ?? false);
  const isControlled = pressed !== undefined;
  const value = isControlled ? pressed : internal;

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={value}
      data-state={value ? 'on' : 'off'}
      className={cx('toggle', `toggle--${size}`, `toggle--${variant}`, value && 'is-pressed', className)}
      onClick={(e) => {
        const next = !value;
        if (!isControlled) setInternal(next);
        onPressedChange?.(next);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  value: string | string[];
  setValue: (next: string | string[]) => void;
  size: ToggleSize;
  variant: ToggleVariant;
  disabled: boolean;
}
const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

interface ToggleGroupBaseProps {
  size?: ToggleSize;
  variant?: ToggleVariant;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  /**
   * Sliding active indicator: a single pill that animates between segments
   * instead of the active item lighting up in place. Only meaningful for
   * `type="single"`. On by default for `SegmentedControl`, off otherwise.
   */
  indicator?: boolean;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type: 'single';
  value?: string | null;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  rovingFocus?: boolean;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning;
// the kit is 'use client' but still gets rendered on Next's server).
const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export function ToggleGroup(props: ToggleGroupProps) {
  const { type, size = 'md', variant = 'default', disabled = false, className, ariaLabel, children, indicator = false } = props;

  const initial: string | string[] =
    type === 'single' ? (props.defaultValue ?? '') : (props.defaultValue ?? []);
  const [internal, setInternal] = React.useState<string | string[]>(initial);

  const isControlled = props.value !== undefined && props.value !== null;
  const current: string | string[] = isControlled
    ? type === 'single'
      ? (props.value ?? '')
      : (props.value ?? [])
    : internal;

  const setValue = (next: string | string[]) => {
    if (!isControlled) setInternal(next);
    if (type === 'single') {
      const v = (next as string) || null;
      (props as ToggleGroupSingleProps).onChange?.(v);
    } else {
      (props as ToggleGroupMultipleProps).onChange?.(next as string[]);
    }
  };

  // Sliding indicator (single only): a single absolute pill that moves to match
  // the active item's geometry, instead of turning each item's background on/off.
  const wantIndicator = indicator && type === 'single';
  const groupRef = React.useRef<HTMLDivElement>(null);
  const [ind, setInd] = React.useState<{ left: number; width: number; ready: boolean } | null>(null);

  useIsoLayoutEffect(() => {
    if (!wantIndicator) return;
    const el = groupRef.current;
    if (!el) return;
    const measure = () => {
      const active = el.querySelector<HTMLElement>('[data-state="on"]');
      if (!active) {
        setInd((prev) => (prev ? { ...prev, width: 0 } : null)); // nothing active → hide the pill
        return;
      }
      const g = el.getBoundingClientRect();
      const b = active.getBoundingClientRect();
      // left relative to the group's padding-box (containing block of the absolute).
      setInd((prev) => ({ left: b.left - g.left - el.clientLeft, width: b.width, ready: prev?.ready ?? false }));
    };
    measure();
    // typeof-guard: jsdom/SSR don't ship ResizeObserver (same pattern as the
    // DataTable elevation and useVirtualRows); measure() has already run once.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [wantIndicator, current, children]);

  // The transition is enabled only after the first measurement → the pill appears
  // in place on mount (it doesn't slide from 0); from then on, changes animate.
  React.useEffect(() => {
    if (ind && !ind.ready) setInd((prev) => (prev ? { ...prev, ready: true } : prev));
  }, [ind]);

  return (
    <ToggleGroupContext.Provider value={{ type, value: current, setValue, size, variant, disabled }}>
      <div
        ref={groupRef}
        role="group"
        aria-label={ariaLabel}
        className={cx('toggle-group', wantIndicator && 'toggle-group--has-indicator', className)}
      >
        {wantIndicator && ind && (
          <span
            aria-hidden="true"
            className={cx('toggle-group__indicator', ind.ready && 'is-ready')}
            style={{ transform: `translateX(${ind.left}px)`, width: ind.width, opacity: ind.width > 0 ? 1 : 0 }}
          />
        )}
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

/**
 * `SegmentedControl` — a single-select `ToggleGroup` with equal-width
 * segments. The common case (view switcher, filter mode, on/off pair) is
 * `type="single"`; this drops the discriminant so you can't trip the
 * cryptic union error from forgetting `type`. Use `SegmentedControlItem`
 * (alias of `ToggleGroupItem`) for the options.
 *
 *   <SegmentedControl value={view} onChange={setView} ariaLabel="Vista">
 *     <SegmentedControlItem value="list">Lista</SegmentedControlItem>
 *     <SegmentedControlItem value="grid">Tarjetas</SegmentedControlItem>
 *   </SegmentedControl>
 */
export type SegmentedControlProps = Omit<ToggleGroupSingleProps, 'type'>;

export function SegmentedControl({ className, indicator = true, ...rest }: SegmentedControlProps) {
  return (
    <ToggleGroup type="single" indicator={indicator} className={cx('toggle-group--segmented', className)} {...rest} />
  );
}

export interface ToggleGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  /**
   * Optional leading icon, rendered before `children` and aligned via the
   * toggle's built-in flex gap. Convenience for view switchers / segmented
   * controls: `<SegmentedControlItem value="table" icon={<Table />}>Tabla</…>`.
   * For an **icon-only** segment, pass `icon` with no children and give the
   * button an accessible name via `aria-label` (icons are decorative).
   */
  icon?: React.ReactNode;
}

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, className, children, icon, disabled: itemDisabled, ...rest },
  ref
) {
  const ctx = React.useContext(ToggleGroupContext);
  if (!ctx) throw new Error('ToggleGroupItem must be used inside ToggleGroup');
  const isPressed =
    ctx.type === 'single'
      ? ctx.value === value
      : Array.isArray(ctx.value) && ctx.value.includes(value);

  const onClick = () => {
    if (ctx.type === 'single') {
      ctx.setValue(isPressed ? '' : value);
    } else {
      const arr = (ctx.value as string[]) ?? [];
      ctx.setValue(isPressed ? arr.filter((v) => v !== value) : [...arr, value]);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      disabled={ctx.disabled || itemDisabled}
      className={cx('toggle', `toggle--${ctx.size}`, `toggle--${ctx.variant}`, 'toggle-group__item', isPressed && 'is-pressed', className)}
      onClick={onClick}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

/** Alias of `ToggleGroupItem` for use inside `SegmentedControl`. */
export const SegmentedControlItem = ToggleGroupItem;
