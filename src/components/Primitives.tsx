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
