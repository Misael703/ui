import * as React from 'react';

/**
 * Delays unmounting of a component so an exit animation can play.
 *
 * When `open` flips to false, the hook keeps `mounted` true for `durationMs`
 * (giving CSS time to play `is-closing` keyframes) and then flips it to
 * false. The `closing` flag toggles during that window so the consumer can
 * apply a class like `is-closing` for the CSS animation.
 *
 * Usage:
 *
 * ```tsx
 * const { mounted, closing } = useDelayedUnmount(open, 200);
 * if (!mounted) return null;
 * return <div className={cx('modal', closing && 'is-closing')} />
 * ```
 */
export function useDelayedUnmount(open: boolean, durationMs: number) {
  const [mounted, setMounted] = React.useState(open);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const handle = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, durationMs);
    return () => clearTimeout(handle);
  }, [open, durationMs, mounted]);

  return { mounted, closing };
}
