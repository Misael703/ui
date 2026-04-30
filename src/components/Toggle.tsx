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

export function ToggleGroup(props: ToggleGroupProps) {
  const { type, size = 'md', variant = 'default', disabled = false, className, ariaLabel, children } = props;

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

  return (
    <ToggleGroupContext.Provider value={{ type, value: current, setValue, size, variant, disabled }}>
      <div role="group" aria-label={ariaLabel} className={cx('toggle-group', className)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
}

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, className, children, disabled: itemDisabled, ...rest },
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
      {children}
    </button>
  );
});
