'use client';
import * as React from 'react';
import { cx } from '../utils/cx';

// ---------- AspectRatio ------------------------------------------------
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 16 / 9, style, className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx('aspect-ratio', className)}
      style={{ position: 'relative', width: '100%', aspectRatio: String(ratio), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

// ---------- Separator --------------------------------------------------
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = true, className, ...rest },
  ref
) {
  const a11y = decorative ? { role: 'none' } : { role: 'separator', 'aria-orientation': orientation };
  return (
    <div
      ref={ref}
      {...a11y}
      className={cx('separator', `separator--${orientation}`, className)}
      {...rest}
    />
  );
});

// ---------- ScrollArea -------------------------------------------------
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: number | string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { maxHeight, orientation = 'vertical', className, style, children, ...rest },
  ref
) {
  const overflow =
    orientation === 'horizontal'
      ? { overflowX: 'auto' as const, overflowY: 'hidden' as const }
      : orientation === 'both'
      ? { overflow: 'auto' as const }
      : { overflowY: 'auto' as const, overflowX: 'hidden' as const };
  return (
    <div
      ref={ref}
      className={cx('scroll-area', `scroll-area--${orientation}`, className)}
      style={{ ...overflow, maxHeight, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

// ---------- Slot (polymorphism: the `asChild` pattern) -----------------
// Dependency-free reimplementation of the well-known Slot/Slottable pattern.
// Lets a component render *as* a consumer-provided element (e.g. next/link's
// <a>) while still injecting its own className, handlers, ref and ARIA.

type AnyProps = Record<string, unknown>;

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref != null) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

function readRef(el: React.ReactElement): React.Ref<unknown> | undefined {
  // React 18 exposes ref on the element; React 19 moves it into props.
  const fromProps = (el.props as { ref?: React.Ref<unknown> }).ref;
  const fromEl = (el as { ref?: React.Ref<unknown> }).ref;
  return fromProps ?? fromEl;
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps };
  for (const key of Object.keys(childProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof slotValue === 'function' && typeof childValue === 'function') {
      // Child's own handler runs first, then the component's.
      merged[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => unknown)(...args);
        (slotValue as (...a: unknown[]) => unknown)(...args);
      };
    } else if (key === 'className') {
      merged[key] = cx(slotProps.className as string, childProps.className as string);
    } else if (key === 'style') {
      merged[key] = { ...(slotProps.style as object), ...(childProps.style as object) };
    } else {
      merged[key] = childValue !== undefined ? childValue : slotValue;
    }
  }
  return merged;
}

/**
 * Marks which child of an `asChild` component is the element to merge onto.
 * Siblings (icons, spinners) are preserved as the slotted element's children.
 */
export function Slottable({ children }: { children: React.ReactNode }): React.ReactElement {
  return <>{children}</>;
}

export interface SlotProps {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps & React.HTMLAttributes<HTMLElement>>(
  function Slot({ children, ...slotProps }, ref) {
    const childArray = React.Children.toArray(children);
    const slottable = childArray.find(
      (c) => React.isValidElement(c) && c.type === Slottable,
    ) as React.ReactElement | undefined;

    const target = slottable
      ? (slottable.props as { children?: React.ReactNode }).children
      : children;

    if (!React.isValidElement(target)) return null;
    const element = target as React.ReactElement<{ children?: React.ReactNode }>;

    const merged = mergeProps(slotProps as AnyProps, element.props as AnyProps);
    const composed = ref ? composeRefs(ref, readRef(element)) : readRef(element);
    (merged as { ref?: React.Ref<unknown> }).ref = composed;

    // With Slottable, the component's own siblings replace the marker and
    // become the slotted element's children (its original children last).
    const newChildren = slottable
      ? childArray.map((c) => (c === slottable ? element.props.children : c))
      : element.props.children;

    return React.cloneElement(element, merged, ...React.Children.toArray(newChildren));
  },
);
